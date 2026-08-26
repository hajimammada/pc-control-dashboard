import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import PowerControlHub from './components/PowerControlHub';
import RemoteAccessHub from './components/RemoteAccessHub';
import AppGrid from './components/AppGrid';
import AddEditAppModal from './components/AddEditAppModal';
import ConfirmPowerModal from './components/ConfirmPowerModal';
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';

import { DEFAULT_APPS } from './data/defaultApps';
import { 
  getStoredSettings, 
  saveStoredSettings, 
  getStoredApps, 
  saveStoredApps,
  fetchAgentStatus,
  triggerMacroDroid,
  executePowerAction
} from './utils/api';

export default function App() {
  const [settings, setSettings] = useState(() => getStoredSettings());
  const [apps, setApps] = useState(() => getStoredApps(DEFAULT_APPS));
  const [telemetry, setTelemetry] = useState(null);
  const [isAgentOnline, setIsAgentOnline] = useState(false);
  const [isTriggeringMacroDroid, setIsTriggeringMacroDroid] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [powerActionModal, setPowerActionModal] = useState({ isOpen: false, action: null });

  // Toasts state
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Poll PC Agent Telemetry
  const checkAgent = useCallback(async () => {
    if (!settings.agentUrl) return;
    try {
      const res = await fetchAgentStatus(settings.agentUrl, settings.agentKey);
      if (res.online) {
        setIsAgentOnline(true);
        setTelemetry(res);
      } else {
        setIsAgentOnline(false);
      }
    } catch {
      setIsAgentOnline(false);
    }
  }, [settings.agentUrl, settings.agentKey]);

  useEffect(() => {
    checkAgent();
    if (settings.autoRefreshStats) {
      const interval = setInterval(checkAgent, settings.refreshIntervalMs || 5000);
      return () => clearInterval(interval);
    }
  }, [checkAgent, settings.autoRefreshStats, settings.refreshIntervalMs]);

  // Handle Settings Save
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // Handle MacroDroid Webhook Trigger
  const handleTriggerMacroDroid = async () => {
    if (!settings.macrodroidWebhookUrl) {
      addToast('Please set your MacroDroid Webhook URL in Settings first.', 'error');
      setIsSettingsOpen(true);
      return;
    }

    setIsTriggeringMacroDroid(true);
    addToast('Sending MacroDroid Power-ON signal...', 'info');

    try {
      const res = await triggerMacroDroid(settings.macrodroidWebhookUrl, settings.agentUrl);
      addToast(res.message || 'MacroDroid Power-ON triggered successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to send MacroDroid webhook', 'error');
    } finally {
      setIsTriggeringMacroDroid(false);
    }
  };

  // Handle Power Actions (Sleep / Restart / Shutdown / Lock / Abort)
  const handleRequestPowerAction = (action) => {
    setPowerActionModal({ isOpen: true, action });
  };

  const handleConfirmPowerAction = async (action) => {
    try {
      addToast(`Sending ${action.toUpperCase()} command to PC Agent...`, 'info');
      const res = await executePowerAction(action, settings.agentUrl, settings.agentKey);
      addToast(res.message || `${action.toUpperCase()} command executed successfully!`, 'success');
      // Refresh status after short delay
      setTimeout(checkAgent, 2000);
    } catch (err) {
      addToast(err.message || `Failed to execute ${action}`, 'error');
    }
  };

  const handleAbortPowerAction = async () => {
    try {
      const res = await executePowerAction('abort', settings.agentUrl, settings.agentKey);
      addToast(res.message || 'Shutdown/Restart cancelled!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to abort action', 'error');
    }
  };

  // Apps Management
  const handleSaveApp = (appData) => {
    let updated;
    if (editingApp) {
      updated = apps.map(a => a.id === appData.id ? appData : a);
      addToast(`Updated "${appData.title}"`, 'success');
    } else {
      updated = [appData, ...apps];
      addToast(`Added "${appData.title}" to dashboard`, 'success');
    }
    setApps(updated);
    saveStoredApps(updated);
  };

  const handleDeleteApp = (id) => {
    const target = apps.find(a => a.id === id);
    if (window.confirm(`Delete "${target?.title || 'this app'}" from dashboard?`)) {
      const updated = apps.filter(a => a.id !== id);
      setApps(updated);
      saveStoredApps(updated);
      addToast('App deleted from dashboard', 'info');
    }
  };

  const handleRestoreDefaults = () => {
    setApps(DEFAULT_APPS);
    saveStoredApps(DEFAULT_APPS);
  };

  const handleImportApps = (importedApps) => {
    setApps(importedApps);
    saveStoredApps(importedApps);
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 flex flex-col justify-between">
      
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed top-1/3 right-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        
        {/* Header */}
        <Header
          settings={settings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isAgentOnline={isAgentOnline}
        />

        {/* PC Power & Telemetry Hub */}
        <PowerControlHub
          telemetry={telemetry}
          isAgentOnline={isAgentOnline}
          settings={settings}
          onTriggerMacroDroid={handleTriggerMacroDroid}
          onRequestPowerAction={handleRequestPowerAction}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isTriggeringMacroDroid={isTriggeringMacroDroid}
        />

        {/* Remote Access Gateway: Chrome Remote Desktop + Google Antigravity */}
        <RemoteAccessHub
          settings={settings}
          isAgentOnline={isAgentOnline}
        />

        {/* Apps & Workspaces Hub */}
        <AppGrid
          apps={apps}
          onAddNewApp={() => {
            setEditingApp(null);
            setIsAddEditOpen(true);
          }}
          onEditApp={(app) => {
            setEditingApp(app);
            setIsAddEditOpen(true);
          }}
          onDeleteApp={handleDeleteApp}
        />

      </div>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#090d16]/80 py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="font-semibold text-slate-300">Nexus Command Center Startpage</span>
            <span>• Universal Chrome New Tab</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button 
              onClick={() => setIsSettingsOpen(true)} 
              className="hover:text-cyan-300 transition-colors"
            >
              Extension & Agent Setup Guide
            </button>
            <span className="text-slate-700">|</span>
            <span>Local & Remote Power Protocol</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddEditAppModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSave={handleSaveApp}
        editingApp={editingApp}
        existingCategories={['All', ...new Set(apps.map(a => a.category).filter(Boolean))]}
      />

      <ConfirmPowerModal
        isOpen={powerActionModal.isOpen}
        action={powerActionModal.action}
        onClose={() => setPowerActionModal({ isOpen: false, action: null })}
        onConfirm={handleConfirmPowerAction}
        onAbort={handleAbortPowerAction}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        apps={apps}
        onRestoreDefaultApps={handleRestoreDefaults}
        onImportData={handleImportApps}
        onShowToast={addToast}
      />

      {/* Floating Toast Notification Stack */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}
