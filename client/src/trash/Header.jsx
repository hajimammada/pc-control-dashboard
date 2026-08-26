import React, { useState, useEffect, useRef } from 'react';
import { Search, Settings, Globe, Youtube, Github, ExternalLink, Sparkles, Sliders, Shield } from 'lucide-react';

const SEARCH_ENGINES = {
  google: { name: 'Google', url: 'https://www.google.com/search?q=', icon: Globe },
  duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: Shield },
  youtube: { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=', icon: Youtube },
  github: { name: 'GitHub', url: 'https://github.com/search?q=', icon: Github }
};

export default function Header({ settings, onOpenSettings, onSearchSubmit, isAgentOnline }) {
  const [time, setTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEngine, setSelectedEngine] = useState(settings.searchEngine || 'google');
  const [engineDropdownOpen, setEngineDropdownOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut: Press '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if user entered a direct URL
    const query = searchQuery.trim();
    if (query.startsWith('http://') || query.startsWith('https://')) {
      window.location.href = query;
      return;
    }
    if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(query)) {
      window.location.href = `https://${query}`;
      return;
    }

    const engine = SEARCH_ENGINES[selectedEngine] || SEARCH_ENGINES.google;
    window.location.href = `${engine.url}${encodeURIComponent(query)}`;
  };

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 5) return 'Night Shift Mode';
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const formattedDate = time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  const CurrentEngineIcon = SEARCH_ENGINES[selectedEngine]?.icon || Globe;

  return (
    <header className="relative w-full mb-8 pt-4 pb-2">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Brand & Greeting */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 flex items-center justify-center p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
              <div className="w-full h-full bg-[#0d1322] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            {isAgentOnline && (
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0d1322]"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                NEXUS COMMAND
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                PRO Startpage
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>{getGreeting()}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-medium">{formattedDate}</span>
            </p>
          </div>
        </div>

        {/* Center: Search Bar with Multi-Engine Support */}
        <div className="w-full md:w-auto md:flex-1 max-w-2xl px-2">
          <form onSubmit={handleSearch} className="relative group">
            <div className="relative flex items-center bg-[#101726]/80 hover:bg-[#141d30]/90 focus-within:bg-[#141d30] border border-slate-700/60 focus-within:border-cyan-500/70 rounded-2xl shadow-inner transition-all duration-200 backdrop-blur-md">
              
              {/* Search Engine Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setEngineDropdownOpen(!engineDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-3 text-xs font-semibold text-slate-400 hover:text-cyan-300 border-r border-slate-700/50 transition-colors"
                  title="Change Search Engine"
                >
                  <CurrentEngineIcon className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">{SEARCH_ENGINES[selectedEngine]?.name}</span>
                </button>

                {engineDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-36 bg-[#121929] border border-slate-700/80 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                    {Object.entries(SEARCH_ENGINES).map(([key, engine]) => {
                      const Icon = engine.icon;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setSelectedEngine(key);
                            setEngineDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-slate-800 transition-colors ${selectedEngine === key ? 'text-cyan-400 font-semibold bg-cyan-500/10' : 'text-slate-300'}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{engine.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Input Field */}
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search web, execute URL, or press '/'..."
                className="w-full bg-transparent px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />

              {/* Search Action / Keyboard shortcut tag */}
              <div className="flex items-center gap-1.5 pr-3">
                {searchQuery ? (
                  <button
                    type="submit"
                    className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 rounded border border-slate-700/50">
                    /
                  </kbd>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Right: Live Digital Clock & Settings */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="font-mono text-2xl font-bold tracking-wider text-slate-100 drop-shadow">
              {formattedTime}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
              LOCAL TIME
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-3 rounded-2xl bg-[#111726]/80 hover:bg-[#19233a] text-slate-300 hover:text-cyan-400 border border-slate-700/60 hover:border-cyan-500/40 transition-all duration-200 shadow-md group"
            title="Configure Dashboard Settings & Webhooks"
          >
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
          </button>
        </div>

      </div>
    </header>
  );
}
