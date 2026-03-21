/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Toast, LogEntry } from '../ux/logic';
import { Bell, History, X, CheckCircle, AlertCircle, Flame, Send } from 'lucide-react';

export function UXOverlay() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setToasts([...window.state.toasts]);
      setLogs([...window.state.logs]);
    };

    window.addEventListener('ux-state-update', handleUpdate);
    return () => window.removeEventListener('ux-state-update', handleUpdate);
  }, []);

  return (
    <>
      {/* Toast Container */}
      <div
        className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className="flex items-center gap-3 bg-slate-900/90 border border-primary/30 text-white px-4 py-3 rounded-lg shadow-2xl backdrop-blur-md animate-slide-in pointer-events-auto min-w-[280px]"
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
            {toast.type === 'burn' && <Flame className="w-5 h-5 text-orange-500" />}
            {toast.type === 'transfer' && <Send className="w-5 h-5 text-blue-500" />}
            {toast.type === 'info' && <Bell className="w-5 h-5 text-primary" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Transaction Log Panel Toggle */}
      <button 
        onClick={() => setShowLogs(!showLogs)}
        className="fixed bottom-6 right-6 z-[100] bg-slate-900/80 border border-primary/20 p-3 rounded-full text-primary hover:bg-primary hover:text-slate-900 transition-all shadow-xl backdrop-blur-md"
      >
        <History className="w-6 h-6" />
      </button>

      {/* Transaction Log Panel */}
      {showLogs && (
        <div className="fixed bottom-20 right-6 z-[100] w-80 max-h-[400px] bg-slate-950/90 border border-primary/30 rounded-xl shadow-2xl backdrop-blur-lg flex flex-col animate-slide-in">
          <div className="p-4 border-b border-primary/20 flex justify-between items-center">
            <h3 className="text-primary text-xs font-black tracking-widest uppercase">Encryption Log</h3>
            <button onClick={() => setShowLogs(false)} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-[10px]">
            {logs.length === 0 ? (
              <p className="text-slate-600 text-center py-4 italic">No recent activities...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="p-2 border border-slate-800 rounded bg-slate-900/50 flex flex-col">
                  <div className="flex justify-between text-slate-500 mb-1">
                    <span>{log.time}</span>
                    <span className="text-primary/70">{log.action}</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>{log.amount}</span>
                    <span className={log.result.includes('Insufficient') ? 'text-red-400' : 'text-green-400'}>
                      {log.result}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
