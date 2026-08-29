import React, { useState, useEffect, useRef } from 'react';
import { 
  ExternalLink, 
  Folder, 
  ChevronDown, 
  Globe,
  Upload,
  Plus,
  Trash2,
  LayoutGrid
} from 'lucide-react';
import { parseNetscapeBookmarksHtml } from '../utils/bookmarkParser';

const STORAGE_KEY = 'pc_control_custom_bookmarks_v1';

export default function BookmarksBar() {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return []; // Empty by default as requested!
  });

  const [activeFolderId, setActiveFolderId] = useState(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Save to localStorage when updated
  const saveBookmarks = (items) => {
    setBookmarks(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save bookmarks:', e);
    }
  };

  // Handle HTML File Upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text === 'string') {
          // If JSON
          if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
            try {
              const parsed = JSON.parse(text);
              const list = Array.isArray(parsed) ? parsed : (parsed.bookmarks || []);
              saveBookmarks(list);
              return;
            } catch {}
          }
          // Parse Netscape Bookmark HTML
          const parsedBookmarks = parseNetscapeBookmarksHtml(text);
          if (parsedBookmarks && parsedBookmarks.length > 0) {
            saveBookmarks(parsedBookmarks);
          } else {
            alert('Could not find any bookmarks in this HTML file.');
          }
        }
      } catch (err) {
        console.error('Error parsing bookmarks file:', err);
        alert('Failed to parse bookmarks file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

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

  const handleClear = () => {
    if (window.confirm('Clear all bookmarks from the bar?')) {
      saveBookmarks([]);
    }
  };

  return (
    <div className="w-full bg-[#080b13]/95 border-b border-slate-800/80 backdrop-blur-md px-4 py-1.5 flex items-center justify-center text-xs z-30 transition-all shadow-sm">
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".html,.htm,.json"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="max-w-7xl mx-auto w-full flex items-center justify-center gap-2 overflow-x-auto scrollbar-none py-0.5" ref={dropdownRef}>
        
        {/* EMPTY STATE: Show Centered Import Button */}
        {(!bookmarks || bookmarks.length === 0) ? (
          <div className="flex items-center justify-center gap-3 py-0.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-200 cursor-pointer shadow-sm group font-medium"
            >
              <Upload className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span>Import Bookmarks (.html)</span>
            </button>
            <span className="text-[11px] text-slate-500">
              (Export from Chrome $\rightarrow$ Select file to populate bar)
            </span>
          </div>
        ) : (
          /* POPULATED STATE: Centered Bookmarks List */
          <div className="flex items-center justify-center gap-1 flex-nowrap">
            
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

                    {/* Folder Dropdown Menu */}
                    {isOpen && (
                      <div className="absolute top-full left-0 mt-1 w-60 max-h-80 overflow-y-auto rounded-2xl bg-[#111728] border border-slate-700 shadow-2xl p-1.5 z-50 animate-slide-up text-left">
                        {item.children.map((child) => (
                          <a
                            key={child.id}
                            href={child.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-xs group"
                            onClick={() => setActiveFolderId(null)}
                          >
                            <img
                              src={getFaviconUrl(child.url, child.iconUrl)}
                              alt=""
                              className="w-4 h-4 rounded-sm object-contain flex-shrink-0"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <span className="truncate flex-1">{child.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
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

            {/* Manage/Re-import & Clear Icons */}
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-800 flex-shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1 rounded-md text-slate-500 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Re-import / Replace Bookmarks (.html)"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClear}
                className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Clear Bookmarks Bar"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}