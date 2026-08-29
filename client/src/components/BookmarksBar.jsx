import React, { useState, useEffect, useRef } from 'react';
import { 
  ExternalLink, 
  Folder, 
  ChevronDown, 
  Globe,
  Settings,
  Bookmark,
  LayoutGrid
} from 'lucide-react';

const STORAGE_KEY = 'pc_control_custom_bookmarks_v1';

export default function BookmarksBar({ onOpenSettings }) {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return []; // Empty by default
  });

  const [activeFolderId, setActiveFolderId] = useState(null);
  const dropdownRef = useRef(null);

  // Sync with Chrome Extension Bookmarks API if running in extension mode
  useEffect(() => {
    if (typeof window !== 'undefined' && window.chrome && window.chrome.bookmarks && window.chrome.bookmarks.getTree) {
      try {
        window.chrome.bookmarks.getTree((tree) => {
          if (tree && tree.length > 0) {
            const root = tree[0];
            const bar = root.children?.find(c => c.id === '1' || c.title?.toLowerCase().includes('bar') || c.title?.toLowerCase().includes('toolbar')) || root.children?.[0];
            if (bar && bar.children && bar.children.length > 0) {
              setBookmarks(bar.children);
            }
          }
        });
      } catch (err) {
        console.warn('Chrome bookmarks API error:', err);
      }
    }
  }, []);

  // Listen to live bookmark updates dispatched from SettingsModal
  useEffect(() => {
    const handleUpdate = (e) => {
      setBookmarks(e.detail || []);
    };
    window.addEventListener('pc_control_bookmarks_updated', handleUpdate);
    window.addEventListener('storage', () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        setBookmarks(saved ? JSON.parse(saved) : []);
      } catch (e) {}
    });
    return () => {
      window.removeEventListener('pc_control_bookmarks_updated', handleUpdate);
    };
  }, []);

  // Close folder dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveFolderId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFaviconUrl = (url, customIcon) => {
    if (customIcon) return customIcon;
    if (!url) return null;
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  return (
    <div className="relative w-full bg-[#080b13]/95 border-b border-slate-800/80 backdrop-blur-md px-4 py-1.5 flex items-center justify-center text-xs z-40 transition-all shadow-sm overflow-visible">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-center gap-2 py-0.5 overflow-visible" ref={dropdownRef}>
        
        {/* EMPTY STATE: Prompt to import in Settings */}
        {(!bookmarks || bookmarks.length === 0) ? (
          <div className="flex items-center justify-center gap-3 py-0.5">
            <button
              onClick={() => onOpenSettings?.('bookmarks')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-200 cursor-pointer shadow-sm group font-medium"
            >
              <Bookmark className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span>Import Bookmarks in Settings</span>
            </button>
            <span className="text-[11px] text-slate-500">
              (Settings ⚙️ $\rightarrow$ Bookmarks & Extension)
            </span>
          </div>
        ) : (
          /* POPULATED STATE: Centered Bookmarks List */
          <div className="flex items-center justify-center gap-1 flex-wrap sm:flex-nowrap overflow-visible">
            
            {/* Chrome Apps shortcut icon */}
            <a
              href="chrome://apps"
              onClick={(e) => {
                if (!window.chrome?.bookmarks) {
                  e.preventDefault();
                }
              }}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/70 transition-colors mr-1 cursor-pointer flex-shrink-0"
              title="Chrome Apps"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </a>

            {bookmarks.map((item) => {
              const isFolder = item.children && item.children.length > 0;
              const isOpen = activeFolderId === item.id;
              const favicon = getFaviconUrl(item.url, item.iconUrl);

              if (isFolder) {
                return (
                  <div key={item.id} className="relative flex-shrink-0">
                    <button
                      onClick={() => setActiveFolderId(isOpen ? null : item.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-medium ${
                        isOpen ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/70'
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                      <span className="truncate max-w-[120px]">{item.title}</span>
                      <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Folder Dropdown Menu - Floating & Unclipped */}
                    {isOpen && (
                      <div className="absolute top-full left-0 mt-2 min-w-[250px] max-h-96 overflow-y-auto rounded-2xl bg-[#111728] border border-slate-700/90 shadow-2xl p-2 z-50 animate-slide-up text-left backdrop-blur-xl ring-1 ring-white/10">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1 mb-1 border-b border-slate-800">
                          {item.title} ({item.children.length})
                        </div>
                        {item.children.map((child) => (
                          <a
                            key={child.id}
                            href={child.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-xs group cursor-pointer"
                            onClick={() => setActiveFolderId(null)}
                          >
                            <img
                              src={getFaviconUrl(child.url, child.iconUrl)}
                              alt=""
                              className="w-4 h-4 rounded-sm object-contain flex-shrink-0"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <span className="truncate flex-1">{child.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors text-xs font-medium flex-shrink-0 group cursor-pointer"
                >
                  {favicon ? (
                    <img
                      src={favicon}
                      alt=""
                      className="w-4 h-4 rounded-sm object-contain flex-shrink-0 group-hover:scale-110 transition-transform"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://www.google.com/favicon.ico';
                      }}
                    />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span className="truncate max-w-[130px]">{item.title}</span>
                </a>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}