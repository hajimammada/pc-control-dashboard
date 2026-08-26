// Nexus Dashboard API & Storage Utilities

const SETTINGS_KEY = 'nexus_dashboard_settings_v1';
const APPS_KEY = 'nexus_dashboard_apps_v1';

export const DEFAULT_SETTINGS = {
  macrodroidWebhookUrl: '', // e.g. https://trigger.macrodroid.com/xxxx/power-on
  agentUrl: 'http://localhost:49880',
  agentKey: 'nexus-secret-key-2026',
  remoteDesktopUrl: 'https://remotedesktop.google.com/access',
  antigravityUrl: 'http://localhost:49880',
  searchEngine: 'google', // 'google' | 'duckduckgo' | 'bing' | 'youtube' | 'github'
  theme: 'cyber-dark', // 'cyber-dark' | 'obsidian' | 'matrix' | 'aurora'
  autoRefreshStats: true,
  refreshIntervalMs: 5000
};

// Load settings from localStorage
export function getStoredSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return DEFAULT_SETTINGS;
}

// Save settings to localStorage
export function saveStoredSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

// Load apps from localStorage
export function getStoredApps(defaultApps) {
  try {
    const saved = localStorage.getItem(APPS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading apps:', e);
  }
  return defaultApps;
}

// Save apps to localStorage
export function saveStoredApps(apps) {
  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(apps));
  } catch (e) {
    console.error('Error saving apps:', e);
  }
}

// Trigger MacroDroid Webhook
export async function triggerMacroDroid(webhookUrl, agentUrl = null) {
  if (!webhookUrl || !webhookUrl.trim()) {
    throw new Error('MacroDroid Webhook URL is not configured. Please open Settings to configure it.');
  }

  const cleanUrl = webhookUrl.trim();

  // Try direct fetch first (no-cors mode to bypass CORS restriction in browser if needed)
  try {
    await fetch(cleanUrl, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return { success: true, message: 'MacroDroid Power-ON signal dispatched successfully!' };
  } catch (err) {
    console.warn('Direct fetch failed, attempting relay via PC Agent...', err);
  }

  // If direct failed or agent available, try agent relay
  if (agentUrl) {
    try {
      const res = await fetch(`${agentUrl.replace(/\/$/, '')}/api/trigger-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl, method: 'GET' })
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, message: 'MacroDroid signal sent via Agent Relay!' };
      }
    } catch (relayErr) {
      console.warn('Agent relay failed:', relayErr);
    }
  }

  // Fallback: create invisible img beacon
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ success: true, message: 'MacroDroid signal sent via Webhook Beacon!' });
    img.onerror = () => resolve({ success: true, message: 'MacroDroid signal sent (Request Dispatched)!' });
    img.src = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`;
  });
}

// Check PC Agent Status
export async function fetchAgentStatus(agentUrl, agentKey) {
  if (!agentUrl) return { online: false, error: 'No agent URL configured' };
  
  const baseUrl = agentUrl.replace(/\/$/, '');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (agentKey) {
      headers['Authorization'] = `Bearer ${agentKey}`;
    }

    const res = await fetch(`${baseUrl}/api/status`, {
      method: 'GET',
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { online: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }

    const data = await res.json();
    if (data.success) {
      return { online: true, ...data.data };
    }
    return { online: false, error: data.error || 'Agent returned error' };
  } catch (err) {
    clearTimeout(timeoutId);
    return { online: false, error: err.name === 'AbortError' ? 'Connection timed out' : 'Agent offline' };
  }
}

// Execute Power Action on PC Agent
export async function executePowerAction(action, agentUrl, agentKey, options = {}) {
  if (!agentUrl) throw new Error('Agent URL is required');
  const baseUrl = agentUrl.replace(/\/$/, '');

  const validActions = ['sleep', 'restart', 'shutdown', 'abort', 'lock'];
  if (!validActions.includes(action)) {
    throw new Error(`Invalid action: ${action}`);
  }

  const headers = { 'Content-Type': 'application/json' };
  if (agentKey) {
    headers['Authorization'] = `Bearer ${agentKey}`;
  }

  const res = await fetch(`${baseUrl}/api/power/${action}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(options)
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || `Failed to execute ${action}`);
  }
  return data;
}
