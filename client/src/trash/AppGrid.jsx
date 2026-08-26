import React, { useState } from 'react';
import { Plus, Grid, Search, Filter, Layers } from 'lucide-react';
import AppCard from './AppCard';
import { CATEGORIES } from '../data/defaultApps';

export default function AppGrid({ apps, onAddNewApp, onEditApp, onDeleteApp }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterQuery, setFilterQuery] = useState('');

  // Extract all unique categories dynamically
  const dynamicCategories = ['All', ...new Set(apps.map(a => a.category).filter(Boolean))];

  const filteredApps = apps.filter(app => {
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    const matchesQuery = !filterQuery.trim() || 
      app.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (app.description && app.description.toLowerCase().includes(filterQuery.toLowerCase())) ||
      (app.category && app.category.toLowerCase().includes(filterQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="w-full">
      
      {/* Category Tabs & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          {dynamicCategories.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                  isActive 
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20' 
                    : 'bg-[#111728]/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Right side: In-grid filter & "+ Add App" button */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter apps..."
              className="w-full bg-[#111728]/80 border border-slate-800 focus:border-cyan-500/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none transition-colors"
            />
          </div>

          <button
            onClick={onAddNewApp}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 transition-all duration-200 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add App</span>
          </button>
        </div>

      </div>

      {/* Apps Grid */}
      {filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredApps.map(app => (
            <AppCard
              key={app.id}
              app={app}
              onEdit={onEditApp}
              onDelete={onDeleteApp}
            />
          ))}

          {/* Quick "+ Add App" Grid Card */}
          <button
            onClick={onAddNewApp}
            className="rounded-2xl border-2 border-dashed border-slate-800 hover:border-cyan-500/40 bg-[#101726]/30 hover:bg-[#121a2c]/60 p-6 flex flex-col items-center justify-center text-slate-400 hover:text-cyan-300 transition-all duration-300 group min-h-[140px]"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 flex items-center justify-center mb-2 transition-all">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">Add Custom App / Link</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Port, URL, or Bot</span>
          </button>
        </div>
      ) : (
        <div className="py-12 text-center rounded-2xl bg-[#111728]/40 border border-slate-800/60 p-6">
          <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">No applications match your filter</p>
          <p className="text-xs text-slate-400 mt-1">Try changing category or clearing your search.</p>
        </div>
      )}

    </div>
  );
}
