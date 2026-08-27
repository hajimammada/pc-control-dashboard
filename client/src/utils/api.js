// Nexus Dashboard API & Storage Utilities

const SETTINGS_KEY = 'nexus_dashboard_settings_v5';

export const DEFAULT_SETTINGS = {
  macrodroidWebhookUrl: '', // e.g. https://trigger.macrodroid.com/xxxx/power-on
  agentUrl: '',
  agentKey: '',
  remoteDesktopUrl: 'https://remotedesktop.google.com/access',
  antigravityUrl: 'https://antigravity.google.com',
  autoRefreshStats: true,
  refreshIntervalMs: 4000
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

// Trigger MacroDroid Webhook
export async function triggerMacroDroid(webhookUrl, agentUrl = null) {
  if (!webhookUrl || !webhookUrl.trim()) {
    throw new Error('MacroDroid Webhook URL is not configured. Please open Settings to configure it.');
  }

  const cleanUrl = webhookUrl.trim();

  // Try direct fetch first
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

  // If direct failed, try agent relay
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

  // Fallback image beacon
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ success: true, message: 'MacroDroid signal sent via Webhook Beacon!' });
    img.onerror = () => resolve({ success: true, message: 'MacroDroid signal dispatched!' });
    img.src = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`;
  });
}

// Check PC Agent Status
export async function fetchAgentStatus(agentUrl, agentKey) {
  if (!agentUrl) return { online: false, error: 'No agent URL configured' };
  
  const baseUrl = agentUrl.replace(/\/$/, '');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);

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
    return { online: false, error: err.name === 'AbortError' ? 'Connection timed out' : 'Agent offline / standby' };
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

// Trigger On-Demand 1-Time Auto-Logon and Unlock
export async function unlockWindowsSession(agentUrl, agentKey, username, password, launchAntigravity = true) {
  if (!agentUrl) throw new Error('Agent URL is required');
  if (!password) throw new Error('Windows password is required to unlock session');
  const baseUrl = agentUrl.replace(/\/$/, '');

  const headers = { 'Content-Type': 'application/json' };
  if (agentKey) {
    headers['Authorization'] = `Bearer ${agentKey}`;
  }

  const res = await fetch(`${baseUrl}/api/session/unlock`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ username, password, launchAntigravity })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to unlock Windows session');
  }
  return data;
}

// Fetch Windows Session Status
export async function fetchSessionStatus(agentUrl, agentKey) {
  if (!agentUrl) return null;
  const baseUrl = agentUrl.replace(/\/$/, '');
  const headers = {};
  if (agentKey) headers['Authorization'] = `Bearer ${agentKey}`;

  try {
    const res = await fetch(`${baseUrl}/api/session/status`, { headers });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Launch Antigravity Application
export async function launchAntigravityApp(agentUrl, agentKey) {
  if (!agentUrl) throw new Error('Agent URL is required');
  const baseUrl = agentUrl.replace(/\/$/, '');
  const headers = { 'Content-Type': 'application/json' };
  if (agentKey) headers['Authorization'] = `Bearer ${agentKey}`;

  const res = await fetch(`${baseUrl}/api/apps/antigravity`, {
    method: 'POST',
    headers
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to start Antigravity');
  }
  return data;
}

// Execute Remote Terminal Command
export async function executeTerminalCommand(agentUrl, agentKey, command, cwd = null) {
  if (!agentUrl) throw new Error('PC Agent URL is not configured.');
  if (!command || !command.trim()) throw new Error('Command cannot be empty.');

  const baseUrl = agentUrl.replace(/\/$/, '');
  const headers = { 'Content-Type': 'application/json' };
  if (agentKey) headers['Authorization'] = `Bearer ${agentKey}`;

  const res = await fetch(`${baseUrl}/api/terminal/exec`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ command, cwd })
  });

  const data = await res.json();
  if (res.status === 401) {
    throw new Error('Unauthorized: Invalid Agent Secret Key.');
  }
  return data;
}
