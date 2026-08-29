import React, { useState, useEffect, useRef } from 'react';
import { 
  ExternalLink, 
  Folder, 
  ChevronDown, 
  Bookmark, 
  Globe,
  LayoutGrid
} from 'lucide-react';

const DEFAULT_BOOKMARKS = [
  {
    id: 'b1',
    title: 'Gemini',
    url: 'https://gemini.google.com',
    iconUrl: 'https://www.google.com/s2/favicons?domain=gemini.google.com&sz=64'
  },
  {
    id: 'b2',
    title: 'Notebook',
    url: 'https://notebooklm.google.com',
    iconUrl: 'https://www.google.com/s2/favicons?domain=notebooklm.google.com&sz=64'
  },
  {
    id: 'b3',
    title: 'Google AI Studio',
    url: 'https://aistudio.google.com',
    iconUrl: 'https://www.google.com/s2/favicons?domain=aistudio.google.com&sz=64'
  },
  {
    id: 'b4',
    title: 'GitHub',
    url: 'https://github.com',
    iconUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=64'
  },
  {
    id: 'b5',
    title: 'YouTube',
    url: 'https://www.youtube.com',
    iconUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64'
  },
  {
    id: 'b6',
    title: 'WhatsApp',
    url: 'https://web.whatsapp.com',
    iconUrl: 'https://www.google.com/s2/favicons?domain=web.whatsapp.com&sz=64'
  },
  {
    id: 'b7',
    title: 'Telegram',
    url: 'https://web.telegram.org',
    iconUrl: 'https://www.google.com/s2/favicons?domain=web.telegram.org&sz=64'
  },
  {
    id: 'b8',
    title: 'Mail',
    url: 'https://mail.google.com',
    iconUrl: 'https://www.google.com/s2/favicons?domain=mail.google.com&sz=64'
  }
];

const STORAGE_KEY = 'pc_control_custom_bookmarks_v1';

export default function BookmarksBar() {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_BOOKMARKS;
  });

  const [activeFolderId, setActiveFolderId] = useState(null);
  const [isExtensionMode, setIsExtensionMode] = useState(false);
  const dropdownRef = useRef(null);

  // Check if Chrome extension bookmarks API is available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.chrome && window.chrome.bookmarks && window.chrome.bookmarks.getTree) {
      try {
        window.chrome.bookmarks.getTree((tree) => {
          if (tree && tree.length > 0) {
            const root = tree[0];
            const bar = root.children?.find(c => c.id === '1' || c.title?.toLowerCase().includes('bar') || c.title?.toLowerCase().includes('toolbar')) || root.children?.[0];
            if (bar && bar.children && bar.children.length > 0) {
              setBookmarks(bar.children);
              setIsExtensionMode(true);
            }
          }
        });
      } catch (err) {
        console.warn('Chrome bookmarks API error:', err);
      }
    }
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
    <div className="w-full bg-[#080b13]/95 border-b border-slate-800/80 backdrop-blur-md px-4 py-1.5 flex items-center justify-center text-xs z-30 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-center gap-1 overflow-x-auto scrollbar-none py-0.5" ref={dropdownRef}>
        
        {/* Centered Bookmarks List */}
        <div className="flex items-center justify-center gap-1 flex-nowrap">
          {/* Chrome Apps shortcut icon */}
          <a
            href="chrome://apps"
            onClick={(e) => {
              if (!isExtensionMode) {
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
                    <div className="absolute top-full left-0 mt-1 w-56 rounded-2xl bg-[#111728] border border-slate-700 shadow-2xl p-1.5 z-50 animate-slide-up text-left">
                      {item.children.map((child) => (
                        <a
                          key={child.id}
                          href={child.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-xs"
                          onClick={() => setActiveFolderId(null)}
                        >
                          <img
                            src={getFaviconUrl(child.url, child.iconUrl)}
                            alt=""
                            className="w-4 h-4 rounded-sm object-contain"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <span className="truncate flex-1">{child.title}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
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

      </div>
    </div>
  );
}