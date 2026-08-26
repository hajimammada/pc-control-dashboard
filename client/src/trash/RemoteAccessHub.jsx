import React from 'react';
import { Monitor, Bot, ExternalLink, Shield, ArrowUpRight, Copy, Check, Terminal } from 'lucide-react';

export default function RemoteAccessHub({ settings, isAgentOnline }) {
  const [copiedId, setCopiedId] = React.useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const remoteDesktopUrl = settings.remoteDesktopUrl || 'https://remotedesktop.google.com/access';
  const antigravityUrl = settings.antigravityUrl || 'http://localhost:49880';

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          Remote PC Access & Antigravity Gateway
        </h2>
        <span className="text-[11px] text-slate-500">Secure Direct Access Points</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 1. Chrome Remote Desktop Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#12192b]/90 to-[#101726]/90 border border-blue-500/20 hover:border-blue-500/50 p-5 shadow-lg group transition-all duration-300">
          
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 group-hover:bg-blue-500/20 transition-all duration-300">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base group-hover:text-blue-300 transition-colors">
                    Chrome Remote Desktop
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Google
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct remote desktop stream & complete PC mouse/keyboard control
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
            <a
              href={remoteDesktopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 hover:shadow-blue-600/40 transition-all duration-200"
            >
              <span>Connect to PC via Chrome Remote</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <button
              onClick={() => handleCopy(remoteDesktopUrl, 'crd')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Copy Chrome Remote Desktop URL"
            >
              {copiedId === 'crd' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 2. Google Antigravity Web Interface Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#12192b]/90 to-[#101726]/90 border border-cyan-500/20 hover:border-cyan-500/50 p-5 shadow-lg group transition-all duration-300">
          
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-500/20 transition-all duration-300">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                    Google Antigravity Web Interface
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Agentic IDE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Access Antigravity agentic workspace, coding tools, and terminal
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
            <a
              href={antigravityUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-200"
            >
              <Terminal className="w-4 h-4" />
              <span>Launch Google Antigravity</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <button
              onClick={() => handleCopy(antigravityUrl, 'agy')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Copy Antigravity URL"
            >
              {copiedId === 'agy' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
