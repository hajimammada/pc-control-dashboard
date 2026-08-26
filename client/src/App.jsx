import React, { useState, useEffect, useCallback } from 'react';
import { 
  Power, 
  Moon, 
  RotateCcw, 
  Lock, 
  Server, 
  Zap, 
  Monitor, 
  Bot, 
  Settings, 
  Clock, 
  Cpu, 
  HardDrive, 
  ArrowUpRight, 
  ExternalLink,
  Shield, 
  CheckCircle2, 
  AlertCircle,
  Wifi,
  Sparkles,
  Terminal,
  Activity
} from 'lucide-react';

import ConfirmPowerModal from './components/ConfirmPowerModal';
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';

import { 
  getStoredSettings, 
  saveStoredSettings, 
  fetchAgentStatus, 
  triggerMacroDroid, 
  executePowerAction 
} from './utils/api';

export default function App() {
  const [settings, setSettings] = useState(() => getStoredSettings());
  const [telemetry, setTelemetry] = useState(null);
  const [isAgentOnline, setIsAgentOnline] = useState(false);
  const [isTriggeringMacroDroid, setIsTriggeringMacroDroid] = useState(false);
  const [time, setTime] = useState(new Date());

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [powerActionModal, setPowerActionModal] = useState({ isOpen: false, action: null });

  // Toasts state
  const [toasts, setToasts] = useState([]);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Poll PC Companion Agent
  const checkAgent = useCallback(async () => {
    if (!settings.agentUrl) return;
    try {
      const res = await fetchAgentStatus(settings.agentUrl, settings.agentKey);
      if (res.online) {
        setIsAgentOnline(true);
        setTelemetry(res);
      } else {
        setIsAgentOnline(false);
      }
    } catch {
      setIsAgentOnline(false);
    }
  }, [settings.agentUrl, settings.agentKey]);

  useEffect(() => {
    checkAgent();
    if (settings.autoRefreshStats) {
      const interval = setInterval(checkAgent, settings.refreshIntervalMs || 4000);
      return () => clearInterval(interval);
    }
  }, [checkAgent, settings.autoRefreshStats, settings.refreshIntervalMs]);

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // Trigger MacroDroid Webhook to Power On PC
  const handleTriggerMacroDroid = async () => {
    if (!settings.macrodroidWebhookUrl) {
      addToast('Please configure your MacroDroid Webhook URL in Settings first.', 'error');
      setIsSettingsOpen(true);
      return;
    }

    setIsTriggeringMacroDroid(true);
    addToast('Dispatching MacroDroid Power-ON signal...', 'info');

    try {
      const res = await triggerMacroDroid(settings.macrodroidWebhookUrl, settings.agentUrl);
      addToast(res.message || 'MacroDroid Power-ON triggered successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to dispatch MacroDroid signal', 'error');
    } finally {
      setIsTriggeringMacroDroid(false);
    }
  };

  // Request Power Action
  const handleRequestPowerAction = (action) => {
    setPowerActionModal({ isOpen: true, action });
  };

  const handleConfirmPowerAction = async (action) => {
    try {
      addToast(`Executing ${action.toUpperCase()} on PC...`, 'info');
      const res = await executePowerAction(action, settings.agentUrl, settings.agentKey);
      addToast(res.message || `${action.toUpperCase()} executed successfully!`, 'success');
      setTimeout(checkAgent, 2000);
    } catch (err) {
      addToast(err.message || `Failed to execute ${action}`, 'error');
    }
  };

  const handleAbortPowerAction = async () => {
    try {
      const res = await executePowerAction('abort', settings.agentUrl, settings.agentKey);
      addToast(res.message || 'Shutdown/Restart cancelled!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to abort action', 'error');
    }
  };

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const formattedDate = time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  const cpuPercent = telemetry?.cpuUsagePercent || 0;
  const ramPercent = telemetry?.ramUsagePercent || 0;

  const remoteDesktopUrl = settings.remoteDesktopUrl || 'https://remotedesktop.google.com/access';
  const antigravityUrl = settings.antigravityUrl || 'http://localhost:48880';

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col justify-center">
        
        {/* Top Header & Live Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800/80">
          
          {/* Left: Brand & Status */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 flex items-center justify-center p-0.5 shadow-xl shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
                <div className="w-full h-full bg-[#0d1322] rounded-[14px] flex items-center justify-center">
                  <Power className="w-7 h-7 text-cyan-400" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAgentOnline ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-4 w-4 border-2 border-[#0d1322] ${isAgentOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  PC COMMAND CENTER
                </h1>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isAgentOnline 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {isAgentOnline ? 'PC ONLINE' : 'PC OFFLINE / STANDBY'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Target: <span className="text-slate-200 font-mono font-semibold">{telemetry?.hostname || 'hajimaPC'}</span>
                {telemetry?.uptimeFormatted && (
                  <> • Uptime: <span className="text-cyan-300 font-mono">{telemetry.uptimeFormatted}</span></>
                )}
              </p>
            </div>
          </div>

          {/* Right: Clock & Settings */}
          <div className="flex items-center gap-5">
            <div className="text-right">
              <div className="font-mono text-3xl font-bold tracking-wider text-slate-100 drop-shadow">
                {formattedTime}
              </div>
              <div className="text-[11px] font-medium text-slate-400">
                {formattedDate}
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-3.5 rounded-2xl bg-[#111726] hover:bg-[#19233a] text-slate-300 hover:text-cyan-400 border border-slate-700/80 hover:border-cyan-500/40 transition-all duration-200 shadow-lg group"
              title="Configure Webhooks & Remote Access"
            >
              <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
            </button>
          </div>

        </div>

        {/* SECTION 1: POWER CONTROLS GRID */}
        <div className="mb-8">
          
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Power Management (From Anywhere)
            </h2>
            <span className="text-xs text-slate-500">
              MacroDroid Webhook & Remote Daemon
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* MacroDroid Power ON Card (5 cols) */}
            <div className="md:col-span-5 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#101728] via-[#141e33] to-[#0d1424] border border-cyan-500/30 hover:border-cyan-500/60 p-6 shadow-2xl flex flex-col justify-between group transition-all duration-300">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/25 transition-all duration-500"></div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Power ON PC</h3>
                      <p className="text-xs text-slate-400">MacroDroid Webhook Trigger</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    settings.macrodroidWebhookUrl 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {settings.macrodroidWebhookUrl ? 'Ready' : 'Setup Required'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Wakes up your PC remotely by dispatching your custom MacroDroid webhook signal to your automation phone / smart plug.
                </p>
              </div>

              <div>
                <button
                  onClick={handleTriggerMacroDroid}
                  disabled={isTriggeringMacroDroid}
                  className="relative w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 overflow-hidden group/btn disabled:opacity-75"
                >
                  <Power className={`w-5 h-5 ${isTriggeringMacroDroid ? 'animate-spin' : 'animate-pulse'}`} />
                  <span>{isTriggeringMacroDroid ? 'Triggering Webhook...' : '⚡ Turn PC ON'}</span>
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 px-1">
                  <span>Direct Webhook Dispatch</span>
                  <button onClick={() => setIsSettingsOpen(true)} className="text-cyan-400 hover:underline">
                    Edit URL
                  </button>
                </div>
              </div>

            </div>

            {/* Remote Power Actions Grid (7 cols) */}
            <div className="md:col-span-7 grid grid-cols-2 gap-3.5">
              
              {/* Sleep Button */}
              <button
                onClick={() => handleRequestPowerAction('sleep')}
                disabled={!isAgentOnline}
                className="relative p-5 rounded-3xl bg-[#111728]/90 hover:bg-indigo-950/60 border border-indigo-500/20 hover:border-indigo-500/50 shadow-lg text-left transition-all duration-200 group flex flex-col justify-between disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                    <Moon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                    Suspend
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                    Sleep PC
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Put Windows PC into low-power sleep state
                  </p>
                </div>
              </button>

              {/* Restart Button */}
              <button
                onClick={() => handleRequestPowerAction('restart')}
                disabled={!isAgentOnline}
                className="relative p-5 rounded-3xl bg-[#111728]/90 hover:bg-amber-950/60 border border-amber-500/20 hover:border-amber-500/50 shadow-lg text-left transition-all duration-200 group flex flex-col justify-between disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 group-hover:rotate-180 transition-transform duration-500">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    Reboot
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                    Restart PC
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Safe restart with countdown protection
                  </p>
                </div>
              </button>

              {/* Shut Down Button */}
              <button
                onClick={() => handleRequestPowerAction('shutdown')}
                disabled={!isAgentOnline}
                className="relative p-5 rounded-3xl bg-[#111728]/90 hover:bg-rose-950/60 border border-rose-500/20 hover:border-rose-500/50 shadow-lg text-left transition-all duration-200 group flex flex-col justify-between disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
                    <Power className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                    Power Off
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-base group-hover:text-rose-300 transition-colors">
                    Shut Down PC
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Completely power off your workstation
                  </p>
                </div>
              </button>

              {/* Lock Workstation Button */}
              <button
                onClick={() => handleRequestPowerAction('lock')}
                disabled={!isAgentOnline}
                className="relative p-5 rounded-3xl bg-[#111728]/90 hover:bg-cyan-950/60 border border-cyan-500/20 hover:border-cyan-500/50 shadow-lg text-left transition-all duration-200 group flex flex-col justify-between disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                    <Lock className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                    Security
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                    Lock Workstation
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Lock active Windows user desktop
                  </p>
                </div>
              </button>

            </div>

          </div>

        </div>

        {/* SECTION 2: REMOTE PC ACCESS GATEWAY */}
        <div className="mb-8">
          
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-cyan-400" />
              Remote PC Access & Antigravity
            </h2>
            <span className="text-xs text-slate-500">
              One-Click Remote Connection
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* 1. Chrome Remote Desktop Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12192b]/95 to-[#0e1424]/95 border border-blue-500/30 hover:border-blue-500/60 p-6 shadow-xl group transition-all duration-300 flex flex-col justify-between">
              
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 group-hover:bg-blue-500/20 transition-all duration-300 shrink-0">
                  <Monitor className="w-7 h-7" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-lg group-hover:text-blue-300 transition-colors">
                      Chrome Remote Desktop
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Google
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Access and control your PC's desktop, files, and multi-monitor screen directly from Chrome.
                  </p>
                </div>
              </div>

              <a
                href={remoteDesktopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-200"
              >
                <span>Connect to PC via Chrome Remote</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

            </div>

            {/* 2. Google Antigravity Web Interface Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12192b]/95 to-[#0e1424]/95 border border-cyan-500/30 hover:border-cyan-500/60 p-6 shadow-xl group transition-all duration-300 flex flex-col justify-between">
              
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-500/20 transition-all duration-300 shrink-0">
                  <Bot className="w-7 h-7" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-lg group-hover:text-cyan-300 transition-colors">
                      Google Antigravity Web Access
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Agentic IDE
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Launch your Antigravity agentic workspace, coding tools, and terminal session on this PC.
                  </p>
                </div>
              </div>

              <a
                href={antigravityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-200"
              >
                <Terminal className="w-4 h-4" />
                <span>Launch Google Antigravity Web</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

            </div>

          </div>

        </div>

        {/* SECTION 3: PC HARDWARE TELEMETRY & STATUS */}
        <div className="p-6 rounded-3xl bg-[#101726]/80 border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Live Hardware Performance
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {telemetry?.cpuModel ? `${telemetry.cpuModel.trim()} (${telemetry.cpuCores} Cores)` : 'PC Telemetry'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* CPU Bar */}
            <div className="p-4 rounded-2xl bg-[#0c111d] border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="flex items-center gap-2 font-semibold text-slate-300">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  CPU Utilization
                </span>
                <span className="font-mono font-bold text-cyan-400">
                  {isAgentOnline ? `${cpuPercent}%` : 'Offline'}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full"
                  style={{ width: `${isAgentOnline ? cpuPercent : 0}%` }}
                ></div>
              </div>
            </div>

            {/* RAM Bar */}
            <div className="p-4 rounded-2xl bg-[#0c111d] border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="flex items-center gap-2 font-semibold text-slate-300">
                  <HardDrive className="w-4 h-4 text-purple-400" />
                  Memory Usage {telemetry?.usedRamGB ? `(${telemetry.usedRamGB} / ${telemetry.totalRamGB} GB)` : ''}
                </span>
                <span className="font-mono font-bold text-purple-400">
                  {isAgentOnline ? `${ramPercent}%` : 'Offline'}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 rounded-full"
                  style={{ width: `${isAgentOnline ? ramPercent : 0}%` }}
                ></div>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#090d16]/90 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="font-semibold text-slate-300">Nexus PC Controller</span>
            <span>• Universal Chrome New Tab</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <button onClick={() => setIsSettingsOpen(true)} className="hover:text-cyan-300 transition-colors">
              Settings & Remote Tunnels
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ConfirmPowerModal
        isOpen={powerActionModal.isOpen}
        action={powerActionModal.action}
        onClose={() => setPowerActionModal({ isOpen: false, action: null })}
        onConfirm={handleConfirmPowerAction}
        onAbort={handleAbortPowerAction}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        apps={[]}
        onRestoreDefaultApps={() => {}}
        onImportData={() => {}}
        onShowToast={addToast}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}
