import React, { useState } from 'react';
import { ExternalLink, MoreVertical, Edit2, Trash2, Copy, Check, Terminal, Folder } from 'lucide-react';
import IconRenderer from './IconRenderer';

export default function AppCard({ app, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(app.url);
    setCopied(true);
    setMenuOpen(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardClick = () => {
    if (app.url) {
      window.open(app.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#111728]/70 hover:bg-[#151f36]/90 border border-slate-800/80 hover:border-cyan-500/40 p-5 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col justify-between"
    >
      {/* Top Ambient Glow */}
      <div 
        className="absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
        style={{ backgroundColor: app.iconColor || '#00f2fe' }}
      ></div>

      <div>
        {/* Header with Icon, Badge & Action Menu */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div 
            className="w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105"
            style={{ 
              backgroundColor: `${app.iconColor || '#00f2fe'}15`,
              borderColor: `${app.iconColor || '#00f2fe'}35`
            }}
          >
            <IconRenderer 
              name={app.icon} 
              className="w-5 h-5" 
              color={app.iconColor || '#00f2fe'} 
            />
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {app.badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {app.badge}
              </span>
            )}

            {/* Options Menu Button */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors opacity-0 group-hover:opacity-100"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-[#141d30] border border-slate-700 rounded-xl shadow-2xl z-30 py-1 overflow-hidden">
                  <button
                    onClick={handleCopy}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-slate-300 hover:bg-slate-800 hover:text-cyan-400"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                  
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(app); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-slate-300 hover:bg-slate-800 hover:text-cyan-400"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit App</span>
                  </button>

                  <button
                    onClick={() => { setMenuOpen(false); onDelete(app.id); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-rose-400 hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
          <span>{app.title}</span>
          {app.isWorkspaceProject && (
            <span title="Workspace Project">
              <Folder className="w-3 h-3 text-cyan-400 inline" />
            </span>
          )}
        </h3>

        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {app.description || app.url}
        </p>
      </div>

      {/* Footer Link / Launcher */}
      <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="truncate max-w-[170px] text-slate-400 font-mono text-[10px]">
          {app.url ? app.url.replace(/^https?:\/\//, '').replace(/^file:\/\/\//, '') : ''}
        </span>
        <div className="flex items-center gap-1 text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform">
          <span>Launch</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>

    </div>
  );
}
