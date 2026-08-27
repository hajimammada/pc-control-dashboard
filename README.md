# 🪐 Nexus Command Center — Universal Chrome New Tab & Remote PC Hub

A futuristic, high-performance personal command center and startpage designed to serve as the default **Chrome New Tab page** across all your PCs. It unifies all your workspace applications, provides one-click remote PC power controls (MacroDroid Power-ON, remote Sleep, Restart, Shutdown, Lock), real-time hardware telemetry, and one-click remote desktop access (Chrome Remote Desktop & Google Antigravity).

---

## ⚡ Key Capabilities

1. **All Your Apps in One Place**:
   - Pre-loaded with all your active workspace projects (BTC Trend Discount Trader, Telegram Signals Bot, HTF Confluence Bot, LuxeCraft, KaryeraHub, hajimammad.com, WhatsApp Bot, etc.).
   - Productivity hubs (TradingView, GitHub, Cloudflare, ChatGPT, Claude, Telegram Web, Gmail, YouTube, Notion).
   - In-dashboard "+ Add App" button with custom URLs, icons, colors, tags, and categories stored in persistent storage.

2. **⚡ Power-ON PC via MacroDroid Webhook**:
   - Dedicated glowing action card to trigger your MacroDroid webhook URL instantly.
   - Wakes up your PC, triggers smart plugs, or starts automated wake sequences.

3. **🔒 Remote Sleep, Restart, Shut Down, Lock from Anywhere**:
   - Powered by a lightweight background PC companion agent (`nexus-agent`).
   - Supports local network and **Cloudflare Quick Tunnels** (`start-agent-remote.bat`) so you can safely sleep or restart your PC from your phone or laptop anywhere in the world.
   - Safety dialogs with 5-second countdowns and instant **Abort** protection to prevent accidental triggers.

4. **🖥️ Instant Remote Access Hub**:
   - **Chrome Remote Desktop**: One-click connection to stream and control your PC.
   - **Google Antigravity Web Access**: One-click launch to your agentic IDE & workspace terminal.

5. **🚀 Zero-Latency Chrome New Tab Extension (Manifest V3)**:
   - Packaged as a native Chrome extension. Opening a new tab on Chrome loads the dashboard instantly with zero network delay.

---

## 🛠️ Step 1: Install as Chrome New Tab (Across All PCs)

To make this dashboard your default New Tab page on Chrome:

1. Open **Google Chrome** on your PC.
2. Navigate to `chrome://extensions` in the address bar.
3. In the top-right corner, turn on **"Developer mode"**.
4. Click the **"Load unpacked"** button in the top-left corner.
5. Select the folder:
   ```text
   C:\Users\aliye\Projects\AntigravityWorkspace\nexus-dashboard\extension
   ```
6. Open a new tab in Chrome (`Ctrl + T`) — Your **Nexus Command Center** is now your active new tab page!

---

## 🔌 Step 2: Configure MacroDroid Power-ON Webhook

1. On your phone, set up a **MacroDroid** macro with a **Webhook Trigger** (e.g. `Wake / Power ON PC`).
2. Copy the webhook URL provided by MacroDroid (e.g. `https://trigger.macrodroid.com/YOUR_DEVICE_ID/power-on`).
3. In your Nexus Dashboard, click the **Settings (⚙️)** button in the top-right corner.
4. Paste the URL into **"MacroDroid Power-ON Webhook URL"** and click **"Test Signal"**.
5. Click **"Save Settings"**. You can now turn on your PC with 1 click on the dashboard!

---

## 💻 Step 3: Run the PC Companion Agent (For Sleep, Restart, Shutdown)

To enable remote Sleep, Restart, Shutdown, and live CPU/RAM telemetry:

### Option A: Local Network (Same WiFi / LAN)
Double-click:
```text
start-agent.bat
```
*(Runs on `http://localhost:48880` with your configured `AGENT_KEY` in `agent/.env`)*

### Option B: Remote Access From Anywhere (Mobile, Cellular, Remote Laptop)
Double-click:
```text
start-agent-remote.bat
```
*(Automatically creates a free, secure Cloudflare Tunnel HTTPS URL, e.g. `https://xxxx.trycloudflare.com`). Paste that HTTPS URL into your dashboard settings on your phone or remote device to control your PC from anywhere in the world!*

---

## 📂 Project Architecture

```text
nexus-dashboard/
├── agent/                         # PC Background Companion Daemon
│   ├── server.js                  # Power APIs (Sleep/Restart/Shutdown/Lock) & Telemetry
│   ├── tunnel.js                  # Automated Cloudflare Quick Tunnel provider
│   ├── start-agent.bat            # Local start script
│   └── start-agent-remote.bat     # Remote tunnel start script
│
├── client/                        # React + Vite + Tailwind Dashboard Source
│   ├── src/
│   │   ├── components/            # Header, PowerControlHub, RemoteAccessHub, AppGrid, Modals
│   │   ├── data/defaultApps.js    # Pre-configured workspace apps & tools
│   │   ├── utils/api.js           # MacroDroid & Agent API client
│   │   └── App.jsx                # Main layout & state manager
│   └── vite.config.js             # Vite build configuration (outputs to ../extension)
│
├── extension/                     # Packed Chrome Manifest V3 Extension
│   ├── manifest.json              # Chrome New Tab override manifest
│   ├── index.html                 # Bundled startpage
│   ├── assets/                    # Compiled styles & JS bundles
│   └── icons/                     # Chrome extension icons (16, 48, 128)
│
├── start-dashboard-dev.bat        # Dev mode launcher
├── start-agent.bat                # Agent local launcher
├── start-agent-remote.bat         # Agent remote tunnel launcher
└── build-extension.bat            # Extension re-build script
```

---

## 🎨 Adding & Customizing Apps

- Click the **"+ Add App"** button anywhere on the dashboard.
- Enter the app name, port or URL (e.g. `http://localhost:3000` or `https://github.com`), pick an icon and accent color.
- Apps are automatically saved in local browser storage and can be exported as a JSON backup in Settings to sync across your PCs.
