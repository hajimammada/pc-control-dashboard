import React, { useState } from 'react';
import { 
  Power, 
  Moon, 
  RotateCcw, 
  Square, 
  Lock, 
  Cpu, 
  HardDrive, 
  Clock, 
  Server, 
  Zap, 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function PowerControlHub({ 
  telemetry, 
  isAgentOnline, 
  settings, 
  onTriggerMacroDroid, 
  onRequestPowerAction,
  onOpenSettings,
  isTriggeringMacroDroid
}) {
  const [activeTab, setActiveTab] = useState('power');

  const cpuPercent = telemetry?.cpuUsagePercent || 0;
  const ramPercent = telemetry?.ramUsagePercent || 0;

  return (
    <div className="w-full mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: MacroDroid Power ON Card (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#101728] via-[#141e33] to-[#0d1424] border border-cyan-500/20 p-6 shadow-xl flex-1 flex flex-col justify-between group hover:border-cyan-500/40 transition-all duration-300">
            
            {/* Background ambient lighting */}
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500"></div>
            <div className="absolute -left-12 -top-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-wide">
                      Wake & Power ON
                    </h2>
                    <p className="text-[11px] text-slate-400">MacroDroid Automation</p>
                  </div>
                </div>

                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${
                  settings.macrodroidWebhookUrl 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30 cursor-pointer'
                }`}
                onClick={!settings.macrodroidWebhookUrl ? onOpenSettings : undefined}
                >
                  {settings.macrodroidWebhookUrl ? 'Webhook Ready' : 'Setup Required'}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Fire your configured MacroDroid webhook URL to wake up, turn on smart plug, or power on your PC from anywhere.
              </p>
            </div>

            {/* Main Power ON Action Button */}
            <div>
              <button
                onClick={onTriggerMacroDroid}
                disabled={isTriggeringMacroDroid}
                className="relative w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wider uppercase shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 overflow-hidden group/btn disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {/* Glow ripple on hover */}
                <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>

                <Power className={`w-5 h-5 text-slate-950 ${isTriggeringMacroDroid ? 'animate-spin' : 'animate-pulse'}`} />
                <span>
                  {isTriggeringMacroDroid ? 'Triggering Signal...' : '⚡ Power ON PC'}
                </span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 px-1">
                <span>Triggers MacroDroid Webhook</span>
                <button 
                  onClick={onOpenSettings}
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  Configure URL
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Center/Right: Remote PC Power Controls & Live Telemetry (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="relative overflow-hidden rounded-3xl bg-[#111728]/80 border border-slate-800 p-6 shadow-xl flex-1 flex flex-col justify-between backdrop-blur-md">
            
            {/* Header & Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                  <Server className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white tracking-wide">
                      PC Companion & Power Controls
                    </h2>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isAgentOnline 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {isAgentOnline ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          PC AGENT ONLINE
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          PC OFFLINE / STANDBY
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Host: <span className="text-slate-300 font-mono">{telemetry?.hostname || 'Target PC'}</span> • Agent Port: <span className="text-slate-300 font-mono">49880</span>
                  </p>
                </div>
              </div>

              {/* Uptime Tag */}
              {isAgentOnline && telemetry?.uptimeFormatted && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono text-cyan-300">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Uptime: {telemetry.uptimeFormatted}</span>
                </div>
              )}
            </div>

            {/* Power Action Buttons Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              
              {/* Sleep Button */}
              <button
                onClick={() => onRequestPowerAction('sleep')}
                disabled={!isAgentOnline}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#162035]/70 hover:bg-indigo-950/50 border border-indigo-500/20 hover:border-indigo-500/50 text-slate-200 transition-all duration-200 group disabled:opacity-40 disabled:cursor-not-allowed"
                title="Put PC to Sleep"
              >
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform mb-2">
                  <Moon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-indigo-300">Sleep PC</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Suspend state</span>
              </button>

              {/* Restart Button */}
              <button
                onClick={() => onRequestPowerAction('restart')}
                disabled={!isAgentOnline}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#162035]/70 hover:bg-amber-950/50 border border-amber-500/20 hover:border-amber-500/50 text-slate-200 transition-all duration-200 group disabled:opacity-40 disabled:cursor-not-allowed"
                title="Reboot PC"
              >
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:rotate-180 transition-transform duration-500 mb-2">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-amber-300">Restart PC</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Safe reboot</span>
              </button>

              {/* Shutdown Button */}
              <button
                onClick={() => onRequestPowerAction('shutdown')}
                disabled={!isAgentOnline}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#162035]/70 hover:bg-rose-950/50 border border-rose-500/20 hover:border-rose-500/50 text-slate-200 transition-all duration-200 group disabled:opacity-40 disabled:cursor-not-allowed"
                title="Shut Down PC"
              >
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform mb-2">
                  <Power className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-rose-300">Shut Down</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Safe power off</span>
              </button>

              {/* Lock Workstation Button */}
              <button
                onClick={() => onRequestPowerAction('lock')}
                disabled={!isAgentOnline}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#162035]/70 hover:bg-cyan-950/50 border border-cyan-500/20 hover:border-cyan-500/50 text-slate-200 transition-all duration-200 group disabled:opacity-40 disabled:cursor-not-allowed"
                title="Lock Windows Workstation"
              >
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform mb-2">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-cyan-300">Lock PC</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Lock screen</span>
              </button>

            </div>

            {/* Live Telemetry Progress Meters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
              
              {/* CPU Meter */}
              <div className="p-3 rounded-2xl bg-[#0e1422]/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    CPU Utilization ({telemetry?.cpuCores ? `${telemetry.cpuCores} Cores` : 'Cores'})
                  </span>
                  <span className="font-mono font-bold text-cyan-400">
                    {isAgentOnline ? `${cpuPercent}%` : '--'}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full"
                    style={{ width: `${isAgentOnline ? cpuPercent : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* RAM Meter */}
              <div className="p-3 rounded-2xl bg-[#0e1422]/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                    RAM Usage {telemetry?.usedRamGB ? `(${telemetry.usedRamGB} / ${telemetry.totalRamGB} GB)` : ''}
                  </span>
                  <span className="font-mono font-bold text-purple-400">
                    {isAgentOnline ? `${ramPercent}%` : '--'}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 rounded-full"
                    style={{ width: `${isAgentOnline ? ramPercent : 0}%` }}
                  ></div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
