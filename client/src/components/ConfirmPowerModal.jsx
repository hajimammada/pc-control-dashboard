import React, { useState, useEffect } from 'react';
import { AlertTriangle, Moon, RotateCcw, Power, Lock, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function ConfirmPowerModal({ isOpen, onClose, action, onConfirm, onAbort }) {
  const [countdown, setCountdown] = useState(5);
  const [isCountingDown, setIsCountingDown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      setIsCountingDown(false);
    }
  }, [isOpen, action]);

  useEffect(() => {
    let timer;
    if (isCountingDown && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (isCountingDown && countdown === 0) {
      setIsCountingDown(false);
      onConfirm(action);
      onClose();
    }
    return () => clearTimeout(timer);
  }, [isCountingDown, countdown, action, onConfirm, onClose]);

  if (!isOpen || !action) return null;

  const actionDetails = {
    sleep: {
      title: 'Put PC to Sleep',
      icon: Moon,
      iconColor: '#818cf8',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      description: 'Your PC will enter low-power sleep state immediately. Network services will pause until woken up via MacroDroid.',
      buttonText: 'Confirm Sleep Now',
      buttonClass: 'bg-indigo-600 hover:bg-indigo-500 text-white'
    },
    restart: {
      title: 'Restart PC',
      icon: RotateCcw,
      iconColor: '#f59e0b',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      description: 'All running applications will close and the operating system will restart. A 5-second countdown will initiate.',
      buttonText: 'Initiate Restart',
      buttonClass: 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold'
    },
    shutdown: {
      title: 'Shut Down PC',
      icon: Power,
      iconColor: '#f43f5e',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      description: 'This will completely turn off the power to your PC. To power it back on, trigger the MacroDroid webhook.',
      buttonText: 'Initiate Shutdown',
      buttonClass: 'bg-rose-600 hover:bg-rose-500 text-white font-bold'
    },
    lock: {
      title: 'Lock PC Workstation',
      icon: Lock,
      iconColor: '#00f2fe',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      description: 'Locks the current Windows user session immediately.',
      buttonText: 'Lock Workstation',
      buttonClass: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
    }
  }[action] || {
    title: 'Confirm Action',
    icon: AlertTriangle,
    iconColor: '#f59e0b',
    bgColor: 'bg-slate-800',
    borderColor: 'border-slate-700',
    description: 'Are you sure you want to proceed with this system power action?',
    buttonText: 'Confirm',
    buttonClass: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
  };

  const IconComponent = actionDetails.icon;

  const handleStartAction = () => {
    if (action === 'sleep' || action === 'lock') {
      onConfirm(action);
      onClose();
    } else {
      setIsCountingDown(true);
    }
  };

  const handleCancelCountdown = () => {
    setIsCountingDown(false);
    setCountdown(5);
    if (onAbort) onAbort();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-[#111728] border border-slate-700 shadow-2xl p-6 overflow-hidden animate-slide-up text-center">
        
        {/* Header Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border" style={{ backgroundColor: `${actionDetails.iconColor}15`, borderColor: `${actionDetails.iconColor}40` }}>
          <IconComponent className="w-8 h-8" style={{ color: actionDetails.iconColor }} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2">
          {actionDetails.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          {actionDetails.description}
        </p>

        {/* Countdown Active State */}
        {isCountingDown ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-6">
            <p className="text-xs font-bold text-amber-300 mb-1">
              Executing {action.toUpperCase()} in
            </p>
            <div className="text-4xl font-mono font-black text-amber-400 my-2 animate-pulse">
              {countdown}s
            </div>
            <p className="text-[11px] text-slate-400 mb-3">Click Abort immediately to cancel</p>
            <button
              onClick={handleCancelCountdown}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg"
            >
              🛑 ABORT / CANCEL NOW
            </button>
          </div>
        ) : (
          /* Action Buttons */
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleStartAction}
              className={`flex-1 py-3 px-4 rounded-xl text-xs transition-all shadow-lg ${actionDetails.buttonClass}`}
            >
              {actionDetails.buttonText}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
