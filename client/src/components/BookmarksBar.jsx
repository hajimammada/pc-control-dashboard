import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ExternalLink, 
  Folder, 
  ChevronDown, 
  Globe,
  Settings,
  Bookmark,
  Search,
  X,
  Folders
} from 'lucide-react';

const STORAGE_KEY = 'pc_control_custom_bookmarks_v1';

export default function BookmarksBar({ onOpenSettings }) {
  const [bookmarksData, setBookmarksData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return { barBookmarks: parsed, otherBookmarks: [] };
        }
        return {
          barBookmarks: parsed.barBookmarks || [],
          otherBookmarks: parsed.otherBookmarks || []
        };
      }
    } catch (e) {}
    return { barBookmarks: [], otherBookmarks: [] };
  });

  const [activeFolderId, setActiveFolderId] = useState(null);
  const [isOtherOpen, setIsOtherOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const dropdownRef = useRef(null);
  const otherMenuRef = useRef(null);

  const barBookmarks = bookmarksData.barBookmarks || [];
  const otherBookmarks = bookmarksData.otherBookmarks || [];

  // Sync with Chrome Extension Bookmarks API if running in extension mode
  useEffect(() => {
    if (typeof window !== 'undefined' && window.chrome && window.chrome.bookmarks && window.chrome.bookmarks.getTree) {
      try {
        window.chrome.bookmarks.getTree((tree) => {
          if (tree && tree.length > 0) {
            const root = tree[0];
            // 0: Bookmarks Bar, 1: Other Bookmarks, 2: Mobile
            const bar = root.children?.find(c => c.id === '1' || c.title?.toLowerCase().includes('bar') || c.title?.toLowerCase().includes('toolbar')) || root.children?.[0];
            const others = root.children?.filter(c => c !== bar).flatMap(c => c.children || []) || [];

            if ((bar?.children && bar.children.length > 0) || others.length > 0) {
              setBookmarksData({
                barBookmarks: bar?.children || [],
                otherBookmarks: others
              });
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
      const data = e.detail;
      if (Array.isArray(data)) {
        setBookmarksData({ barBookmarks: data, otherBookmarks: [] });
      } else if (data && typeof data === 'object') {
        setBookmarksData({
          barBookmarks: data.barBookmarks || [],
          otherBookmarks: data.otherBookmarks || []
        });
      } else {
        setBookmarksData({ barBookmarks: [], otherBookmarks: [] });
      }
    };

    window.addEventListener('pc_control_bookmarks_updated', handleUpdate);
    window.addEventListener('storage', () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setBookmarksData({ barBookmarks: parsed, otherBookmarks: [] });
          } else {
            setBookmarksData({
              barBookmarks: parsed.barBookmarks || [],
              otherBookmarks: parsed.otherBookmarks || []
            });
          }
        } else {
          setBookmarksData({ barBookmarks: [], otherBookmarks: [] });
        }
      } catch (e) {}
    });

    return () => {
      window.removeEventListener('pc_control_bookmarks_updated', handleUpdate);
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveFolderId(null);
      }
      if (otherMenuRef.current && !otherMenuRef.current.contains(e.target)) {
        setIsOtherOpen(false);
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

  // Filter other bookmarks when search query is entered
  const filteredOtherBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return otherBookmarks;

    const q = searchQuery.toLowerCase();
    function filterNodes(nodes) {
      const matched = [];
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          const filteredChildren = filterNodes(node.children);
          if (filteredChildren.length > 0 || node.title.toLowerCase().includes(q)) {
            matched.push({
              ...node,
              children: filteredChildren.length > 0 ? filteredChildren : node.children
            });
          }
        } else if (node.title?.toLowerCase().includes(q) || node.url?.toLowerCase().includes(q)) {
          matched.push(node);
        }
      }
      return matched;
    }
    return filterNodes(otherBookmarks);
  }, [otherBookmarks, searchQuery]);

  const isEmpty = barBookmarks.length === 0 && otherBookmarks.length === 0;

  return (
    <div className="relative w-full bg-[#080b13]/95 border-b border-slate-800/80 backdrop-blur-md px-4 py-1.5 flex items-center justify-between text-xs z-40 transition-all shadow-sm overflow-visible">
      
      {/* 1. LEFT: Other Bookmarks Button */}
      <div className="relative flex items-center flex-shrink-0" ref={otherMenuRef}>
        <button
          onClick={() => {
            setIsOtherOpen(!isOtherOpen);
            setActiveFolderId(null);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs font-semibold ${
            isOtherOpen 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/20' 
              : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/70 border border-transparent'
          }`}
          title="Other Bookmarks"
        >
          <Folders className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Other Bookmarks</span>
          {otherBookmarks.length > 0 && (
            <span className="text-[10px] text-slate-500 font-mono">({otherBookmarks.length})</span>
          )}
        </button>

        {/* OTHER BOOKMARKS FLOATING PANEL */}
        {isOtherOpen && (
          <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 max-h-[80vh] flex flex-col rounded-2xl bg-[#101726]/98 border border-slate-700/90 shadow-2xl p-3 z-50 animate-slide-up text-left backdrop-blur-2xl ring-1 ring-white/10">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Folders className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Other Bookmarks</h4>
                  <p className="text-[10px] text-slate-400">
                    {otherBookmarks.length} categories / folders
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOtherOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search Filter if there are items */}
            {otherBookmarks.length > 0 && (
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search other bookmarks & folders..."
                  className="w-full bg-[#0d1320] border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            )}

            {/* Items List */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {otherBookmarks.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-800/30 rounded-xl border border-slate-800/80 my-2">
                  <Bookmark className="w-5 h-5 mx-auto text-slate-500 mb-1.5" />
                  <p className="font-semibold text-slate-300 mb-1">No Other Bookmarks Found</p>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Import your Chrome bookmarks HTML file in Settings (⚙️) to populate this list!
                  </p>
                  <button
                    onClick={() => {
                      setIsOtherOpen(false);
                      onOpenSettings?.('bookmarks');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Open Settings
                  </button>
                </div>
              ) : filteredOtherBookmarks.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No bookmarks matching "{searchQuery}"
                </div>
              ) : (
                filteredOtherBookmarks.map((node) => (
                  <BookmarkTreeItem
                    key={node.id}
                    item={node}
                    level={0}
                    getFaviconUrl={getFaviconUrl}
                    onLinkClick={() => setIsOtherOpen(false)}
                  />
                ))
              )}
            </div>

          </div>
        )}
      </div>

      {/* 2. CENTER: Bookmarks Bar Items */}
      <div className="flex-1 flex items-center justify-center overflow-visible px-2" ref={dropdownRef}>
        
        {isEmpty ? (
          <div className="flex items-center justify-center gap-3 py-0.5">
            <button
              onClick={() => onOpenSettings?.('bookmarks')}
              className="flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-200 cursor-pointer shadow-sm group font-medium"
            >
              <Bookmark className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span>Import Bookmarks in Settings</span>
            </button>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              (Settings ⚙️ $\rightarrow$ Bookmarks & Extension)
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1 flex-wrap sm:flex-nowrap overflow-visible">
            {barBookmarks.map((item) => {
              const isFolder = item.children && item.children.length > 0;
              const isOpen = activeFolderId === item.id;
              const favicon = getFaviconUrl(item.url, item.iconUrl);

              if (isFolder) {
                return (
                  <div key={item.id} className="relative flex-shrink-0">
                    <button
                      onClick={() => {
                        setActiveFolderId(isOpen ? null : item.id);
                        setIsOtherOpen(false);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-medium ${
                        isOpen ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/70'
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 flex-shrink-0" />
                      <span className="truncate max-w-[120px]">{item.title}</span>
                      <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Folder Dropdown Menu */}
                    {isOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 min-w-[250px] max-h-96 overflow-y-auto rounded-2xl bg-[#111728]/98 border border-slate-700/90 shadow-2xl p-2 z-50 animate-slide-up text-left backdrop-blur-xl ring-1 ring-white/10">
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

      {/* 3. RIGHT SPACER to balance Other Bookmarks button */}
      <div className="w-8 flex-shrink-0"></div>

    </div>
  );
}

// Recursive Bookmark Item inside Other Bookmarks Menu (Accordion for Folders)
function BookmarkTreeItem({ item, level = 0, getFaviconUrl, onLinkClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = item.children && item.children.length > 0;
  const favicon = getFaviconUrl(item.url, item.iconUrl);

  if (isFolder) {
    return (
      <div className="w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-xs font-medium cursor-pointer group"
          style={{ paddingLeft: `${8 + level * 12}px` }}
        >
          <div className="flex items-center gap-2 truncate">
            <Folder className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 flex-shrink-0" />
            <span className="truncate">{item.title}</span>
            <span className="text-[10px] text-slate-500 font-mono">({item.children.length})</span>
          </div>
          <ChevronDown className={`w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="border-l border-slate-800/80 ml-3.5 my-0.5 space-y-0.5">
            {item.children.map((child) => (
              <BookmarkTreeItem 
                key={child.id} 
                item={child} 
                level={level + 1} 
                getFaviconUrl={getFaviconUrl} 
                onLinkClick={onLinkClick} 
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-xs group cursor-pointer"
      style={{ paddingLeft: `${8 + level * 12}px` }}
      onClick={onLinkClick}
    >
      <img
        src={favicon || 'https://www.google.com/favicon.ico'}
        alt=""
        className="w-3.5 h-3.5 rounded-sm object-contain flex-shrink-0"
        onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.google.com/favicon.ico'; }}
      />
      <span className="truncate flex-1">{item.title}</span>
      <ExternalLink className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </a>
  );
}