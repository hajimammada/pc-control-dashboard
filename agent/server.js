const express = require('express');
const cors = require('cors');
const os = require('os');
const { exec, execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 48880;
const AGENT_KEY = process.env.AGENT_KEY || 'nexus-secret-key-2026';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-agent-key']
}));
app.use(express.json());

// Auth verification middleware
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const customHeader = req.headers['x-agent-key'];
  const token = (authHeader && authHeader.startsWith('Bearer ')) 
    ? authHeader.slice(7) 
    : customHeader;

  // If user configured a key, enforce it (query param 'key' also allowed for quick links)
  const reqKey = token || req.query.key;
  if (AGENT_KEY && reqKey !== AGENT_KEY) {
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized: Invalid or missing API key.' 
    });
  }
  next();
}

// System CPU utilization calculation helper
let lastCpuInfo = null;
function getCpuUsage() {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;

  cpus.forEach(cpu => {
    for (let type in cpu.times) {
      total += cpu.times[type];
    }
    idle += cpu.times.idle;
  });

  if (!lastCpuInfo) {
    lastCpuInfo = { idle, total };
    return 0;
  }

  const idleDiff = idle - lastCpuInfo.idle;
  const totalDiff = total - lastCpuInfo.total;
  lastCpuInfo = { idle, total };

  if (totalDiff === 0) return 0;
  return Math.max(0, Math.min(100, Math.round((1 - (idleDiff / totalDiff)) * 100)));
}

// Ping / Discovery Endpoint
app.get('/api/ping', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Nexus PC Companion Agent',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// System Status & Telemetry Endpoint
app.get('/api/status', authenticate, (req, res) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ramUsagePercent = Math.round((usedMem / totalMem) * 100);
    const cpuUsage = getCpuUsage();

    res.json({
      success: true,
      data: {
        hostname: os.hostname(),
        platform: os.platform(),
        release: os.release(),
        arch: os.arch(),
        uptimeSeconds: os.uptime(),
        uptimeFormatted: formatUptime(os.uptime()),
        cpuModel: os.cpus()[0]?.model || 'Unknown CPU',
        cpuCores: os.cpus().length,
        cpuUsagePercent: cpuUsage,
        totalRamGB: (totalMem / (1024 ** 3)).toFixed(1),
        usedRamGB: (usedMem / (1024 ** 3)).toFixed(1),
        freeRamGB: (freeMem / (1024 ** 3)).toFixed(1),
        ramUsagePercent: ramUsagePercent,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Power: Sleep PC
app.post('/api/power/sleep', authenticate, (req, res) => {
  console.log(`[POWER] Sleep command received from ${req.ip} at ${new Date().toISOString()}`);
  
  // Return response immediately before putting PC to sleep
  res.json({ success: true, message: 'Initiating PC sleep mode...' });

  setTimeout(() => {
    // Windows Sleep command via PowerShell / rundll32
    const cmd = 'powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Application]::SetSuspendState([System.Windows.Forms.PowerState]::Suspend, $false, $false)"';
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error('[POWER] Sleep failed via PowerShell, trying fallback...', err);
        exec('rundll32.exe powrprof.dll,SetSuspendState 0,1,0');
      }
    });
  }, 1000);
});

// Power: Restart PC
app.post('/api/power/restart', authenticate, (req, res) => {
  console.log(`[POWER] Restart command received from ${req.ip}`);
  const delaySeconds = typeof req.body.delaySeconds === 'number' ? req.body.delaySeconds : 2;

  // Send response first so client gets confirmation before network closes
  res.json({ 
    success: true, 
    message: `System will restart in ${delaySeconds} seconds (forced).`,
    abortAvailable: true
  });

  setTimeout(() => {
    exec(`shutdown.exe /r /f /t ${delaySeconds} /c "Restart initiated via Nexus Dashboard"`, (err) => {
      if (err) {
        console.error('[POWER] shutdown.exe restart failed, trying PowerShell...', err);
        exec('powershell.exe -Command "Restart-Computer -Force"');
      }
    });
  }, 300);
});

// Power: Shutdown PC
app.post('/api/power/shutdown', authenticate, (req, res) => {
  console.log(`[POWER] Shutdown command received from ${req.ip}`);
  const delaySeconds = typeof req.body.delaySeconds === 'number' ? req.body.delaySeconds : 2;

  // Send response first so client gets confirmation before network closes
  res.json({ 
    success: true, 
    message: `System will shut down in ${delaySeconds} seconds (forced).`,
    abortAvailable: true
  });

  setTimeout(() => {
    exec(`shutdown.exe /s /f /t ${delaySeconds} /c "Shutdown initiated via Nexus Dashboard"`, (err) => {
      if (err) {
        console.error('[POWER] shutdown.exe failed, trying PowerShell Stop-Computer...', err);
        exec('powershell.exe -Command "Stop-Computer -Force"');
      }
    });
  }, 300);
});

// Power: Abort pending shutdown or restart
app.post('/api/power/abort', authenticate, (req, res) => {
  console.log(`[POWER] Abort command received`);
  exec('shutdown /a', (err, stdout, stderr) => {
    if (err) {
      return res.status(400).json({ success: false, error: stderr || err.message });
    }
    res.json({ success: true, message: 'Scheduled shutdown/restart has been cancelled.' });
  });
});

// Power: Lock Workstation
app.post('/api/power/lock', authenticate, (req, res) => {
  exec('rundll32.exe user32.dll,LockWorkStation', (err) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, message: 'Workstation locked successfully.' });
  });
});

// Webhook Relay (Allows triggering MacroDroid or other webhooks without browser CORS issues)
app.post('/api/trigger-webhook', async (req, res) => {
  const { url, method = 'GET', body = null } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: 'URL is required' });
  }

  try {
    const fetchOptions = {
      method: method.toUpperCase(),
      headers: { 'Content-Type': 'application/json' }
    };
    if (body && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const text = await response.text();
    res.json({ 
      success: response.ok, 
      status: response.status, 
      response: text.slice(0, 500) 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// Root API info endpoint (pcagent is pure API, pc.hajimammad.com is the website)
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Nexus PC Companion API',
    version: '1.0.0',
    website: 'https://pc.hajimammad.com'
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 Nexus PC Companion Agent is running on port ${PORT}`);
  console.log(`Local Access:   http://localhost:${PORT}`);
  console.log(`Network Access: http://${getLanIp()}:${PORT}`);
  console.log(`API Key:        ${AGENT_KEY}`);
  console.log(`=======================================================`);
});

function getLanIp() {
  const ifaces = os.networkInterfaces();
  for (let dev in ifaces) {
    for (let details of ifaces[dev]) {
      if (details.family === 'IPv4' && !details.internal) {
        return details.address;
      }
    }
  }
  return '127.0.0.1';
}
