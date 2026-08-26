import React, { useState, useEffect } from 'react';
import { X, Check, Globe, Layers, Tag, FileText, Palette, Smile } from 'lucide-react';
import IconRenderer from './IconRenderer';

const POPULAR_ICONS = [
  'TrendingUp', 'Send', 'Layers', 'Globe', 'Briefcase', 'MessageSquare',
  'Monitor', 'Bot', 'Activity', 'GitBranch', 'Cloud', 'Sparkles',
  'Cpu', 'Mail', 'FileText', 'Video', 'Terminal', 'Database', 'Shield', 'Zap'
];

const COLOR_PRESETS = [
  '#00f2fe', '#4facfe', '#8b5cf6', '#ec4899', '#f43f5e', 
  '#f97316', '#eab308', '#10b981', '#06b6d4', '#64748b'
];

export default function AddEditAppModal({ isOpen, onClose, onSave, editingApp, existingCategories }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Web Applications');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Globe');
  const [iconColor, setIconColor] = useState('#00f2fe');
  const [badge, setBadge] = useState('');

  useEffect(() => {
    if (editingApp) {
      setTitle(editingApp.title || '');
      setUrl(editingApp.url || '');
      setCategory(editingApp.category || 'Web Applications');
      setDescription(editingApp.description || '');
      setIcon(editingApp.icon || 'Globe');
      setIconColor(editingApp.iconColor || '#00f2fe');
      setBadge(editingApp.badge || '');
    } else {
      setTitle('');
      setUrl('');
      setCategory('Web Applications');
      setCustomCategory('');
      setDescription('');
      setIcon('Globe');
      setIconColor('#00f2fe');
      setBadge('');
    }
  }, [editingApp, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    const finalCategory = category === '__custom__' ? (customCategory.trim() || 'Custom') : category;

    onSave({
      id: editingApp ? editingApp.id : `app-${Date.now()}`,
      title: title.trim(),
      url: url.trim(),
      category: finalCategory,
      description: description.trim(),
      icon,
      iconColor,
      badge: badge.trim()
    });
    onClose();
  };

  const categories = existingCategories.filter(c => c !== 'All');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#111728] border border-slate-700 shadow-2xl p-6 overflow-hidden animate-slide-up">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {editingApp ? 'Edit Application' : 'Add New Application'}
              </h3>
              <p className="text-xs text-slate-400">Configure app launcher card and settings</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          
          {/* App Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              App Name / Title <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My Dashboard, Trading Bot, Port 8080"
              className="w-full bg-[#162035] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* App URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target URL or Port <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. http://localhost:8080 or https://github.com"
              className="w-full bg-[#162035] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
            />
          </div>

          {/* Category Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#162035] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__custom__">+ New Category...</option>
              </select>
            </div>

            {category === '__custom__' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Cloud Services"
                  className="w-full bg-[#162035] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Badge Tag (Optional)
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. Bot, Local, V2"
                  className="w-full bg-[#162035] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Short Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this app or service does"
              className="w-full bg-[#162035] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Choose Icon or Type Custom Icon / Emoji
            </label>
            
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Lucide Icon Name, Emoji, or Image URL"
                className="flex-1 bg-[#162035] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center border"
                style={{ backgroundColor: `${iconColor}20`, borderColor: `${iconColor}40` }}
              >
                <IconRenderer name={icon} className="w-5 h-5" color={iconColor} />
              </div>
            </div>

            {/* Popular Icons Preset Grid */}
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-[#0e1422] rounded-xl border border-slate-800">
              {POPULAR_ICONS.map(iconName => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${icon === iconName ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : ''}`}
                  title={iconName}
                >
                  <IconRenderer name={iconName} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Color Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_PRESETS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setIconColor(c)}
                  className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                  style={{ 
                    backgroundColor: c, 
                    borderColor: iconColor === c ? '#ffffff' : 'transparent' 
                  }}
                >
                  {iconColor === c && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                </button>
              ))}
              <input
                type="color"
                value={iconColor}
                onChange={(e) => setIconColor(e.target.value)}
                className="w-7 h-7 rounded-lg bg-transparent cursor-pointer ml-1"
                title="Custom color"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all duration-200"
            >
              {editingApp ? 'Save Changes' : 'Add Application'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
