import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Zap, 
  Server, 
  Key, 
  Monitor, 
  Bot, 
  FileCode,
  CheckCircle2,
  ExternalLink,
  Shield
} from 'lucide-react';
import { triggerMacroDroid, fetchAgentStatus } from '../utils/api';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  settings, 
  onSaveSettings, 
  onShowToast
}) {
  const [formData, setFormData] = useState({ ...settings });
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testingAgent, setTestingAgent] = useState(false);
  const [agentTestResult, setAgentTestResult] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    onShowToast('Settings saved successfully!', 'success');
    onClose();
  };

  const handleTestMacroDroid = async () => {
    if (!formData.macrodroidWebhookUrl) {
      onShowToast('Please enter a MacroDroid Webhook URL first.', 'error');
      return;
    }
    setTestingWebhook(true);
    try {
      const res = await triggerMacroDroid(formData.macrodroidWebhookUrl, formData.agentUrl);
      onShowToast(res.message || 'MacroDroid signal dispatched!', 'success');
    } catch (err) {
      onShowToast(err.message || 'Failed to dispatch MacroDroid signal', 'error');
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleTestAgent = async () => {
    setTestingAgent(true);
    setAgentTestResult(null);
    try {
      const res = await fetchAgentStatus(formData.agentUrl, formData.agentKey);
      if (res.online) {
        setAgentTestResult({ success: true, text: `Connected to ${res.hostname || 'PC Agent'}! CPU: ${res.cpuUsagePercent}%, RAM: ${res.ramUsagePercent}%` });
        onShowToast('PC Agent connection verified!', 'success');
      } else {
        setAgentTestResult({ success: false, text: res.error || 'Could not connect to PC Agent.' });
        onShowToast('Agent connection failed.', 'error');
      }
    } catch (err) {
      setAgentTestResult({ success: false, text: err.message });
      onShowToast('Agent test error.', 'error');
    } finally {
      setTestingAgent(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#101726] border border-slate-700 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d1320]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">PC Remote & Power Settings</h3>
              <p className="text-xs text-slate-400">Configure MacroDroid, remote agent & New Tab extension</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-[#0e1422] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${activeTab === 'general' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Power & Webhooks
          </button>
          <button
            onClick={() => setActiveTab('remote')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${activeTab === 'remote' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Remote Access URLs
          </button>
          <button
            onClick={() => setActiveTab('chrome')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${activeTab === 'chrome' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Chrome New Tab Setup
          </button>
        </div>

        {/* Tab Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* TAB 1: GENERAL / POWER */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              
              {/* MacroDroid Webhook URL */}
              <div className="p-4 rounded-2xl bg-[#141c2e] border border-cyan-500/20">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    MacroDroid Power-ON Webhook URL
                  </label>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Wake PC
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  Enter your MacroDroid webhook URL (e.g. from your phone's MacroDroid webhook trigger):
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={formData.macrodroidWebhookUrl}
                    onChange={(e) => handleChange('macrodroidWebhookUrl', e.target.value)}
                    placeholder="https://trigger.macrodroid.com/YOUR_ID/power-on"
                    className="flex-1 bg-[#101726] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleTestMacroDroid}
                    disabled={testingWebhook}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 transition-colors whitespace-nowrap"
                  >
                    {testingWebhook ? 'Testing...' : 'Test Signal'}
                  </button>
                </div>
              </div>

              {/* PC Companion Agent URL & Key */}
              <div className="p-4 rounded-2xl bg-[#141c2e] border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-purple-400" />
                    Nexus PC Agent URL (Local or Cloudflare Tunnel)
                  </label>
                  <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    Sleep / Restart / Shutdown
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  Remote Endpoint: <code className="text-cyan-300 font-mono">https://pc.hajimammad.com</code> (or <code className="text-slate-300">http://localhost:49880</code> when on the same PC).
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.agentUrl}
                      onChange={(e) => handleChange('agentUrl', e.target.value)}
                      placeholder="https://pc.hajimammad.com"
                      className="flex-1 bg-[#101726] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleTestAgent}
                      disabled={testingAgent}
                      className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold border border-purple-500/40 transition-colors whitespace-nowrap"
                    >
                      {testingAgent ? 'Testing...' : 'Test Ping'}
                    </button>
                  </div>

                  {agentTestResult && (
                    <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${agentTestResult.success ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'}`}>
                      <span>{agentTestResult.text}</span>
                    </div>
                  )}

                  {/* Agent Key */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Agent Secret Key (Token Auth)
                    </label>
                    <input
                      type="password"
                      value={formData.agentKey}
                      onChange={(e) => handleChange('agentKey', e.target.value)}
                      placeholder="nexus-secret-key-2026"
                      className="w-full bg-[#101726] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: REMOTE ACCESS URLS */}
          {activeTab === 'remote' && (
            <div className="space-y-4">
              
              {/* Chrome Remote Desktop URL */}
              <div className="p-4 rounded-2xl bg-[#141c2e] border border-slate-700">
                <label className="text-xs font-bold text-white flex items-center gap-2 mb-1.5">
                  <Monitor className="w-4 h-4 text-blue-400" />
                  Chrome Remote Desktop Access URL
                </label>
                <p className="text-xs text-slate-400 mb-2">
                  Direct URL to access your PC on Chrome Remote Desktop:
                </p>
                <input
                  type="url"
                  value={formData.remoteDesktopUrl}
                  onChange={(e) => handleChange('remoteDesktopUrl', e.target.value)}
                  placeholder="https://remotedesktop.google.com/access"
                  className="w-full bg-[#101726] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Google Antigravity URL */}
              <div className="p-4 rounded-2xl bg-[#141c2e] border border-slate-700">
                <label className="text-xs font-bold text-white flex items-center gap-2 mb-1.5">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  Google Antigravity Web Interface URL
                </label>
                <p className="text-xs text-slate-400 mb-2">
                  Address of your local or remote Antigravity web interface:
                </p>
                <input
                  type="text"
                  value={formData.antigravityUrl}
                  onChange={(e) => handleChange('antigravityUrl', e.target.value)}
                  placeholder="http://localhost:49880"
                  className="w-full bg-[#101726] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

            </div>
          )}

          {/* TAB 3: CHROME NEW TAB EXTENSION SETUP */}
          {activeTab === 'chrome' && (
            <div className="p-5 rounded-2xl bg-[#141c2e] border border-cyan-500/20 space-y-4">
              <div className="flex items-center gap-2.5">
                <FileCode className="w-5 h-5 text-cyan-400" />
                <h4 className="font-bold text-white text-sm">How to Set as Default New Tab on All PCs</h4>
              </div>

              <ol className="list-decimal list-inside space-y-2.5 text-xs text-slate-300 leading-relaxed">
                <li>
                  Open Chrome and navigate to <code className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-mono">chrome://extensions</code>
                </li>
                <li>
                  Toggle <strong className="text-white">"Developer mode"</strong> switch in the top right corner.
                </li>
                <li>
                  Click the <strong className="text-white">"Load unpacked"</strong> button in the top left.
                </li>
                <li>
                  Select the extension folder:
                  <div className="p-2.5 mt-1.5 rounded-xl bg-[#0b101c] border border-slate-800 text-cyan-400 font-mono text-[11px] select-all">
                    c:\Users\aliye\Projects\AntigravityWorkspace\nexus-dashboard\extension
                  </div>
                </li>
                <li>
                  Open a new tab in Chrome! You will immediately see your PC Command Center!
                </li>
              </ol>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200">
                ✨ <strong>Zero Latency:</strong> Packaged locally as a lightweight Chrome extension so every new tab loads instantly.
              </div>
            </div>
          )}

          {/* Footer Actions */}
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
              Save Settings
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
