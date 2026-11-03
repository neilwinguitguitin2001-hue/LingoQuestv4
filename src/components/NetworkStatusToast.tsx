import React, { useEffect, useState } from 'react';
import { CheckCircle2, CloudOff, Database, Wifi, WifiOff, X } from 'lucide-react';

export const NetworkStatusToast: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState<boolean>(false);
  const [isDismissedWhileOffline, setIsDismissedWhileOffline] = useState<boolean>(false);

  useEffect(() => {
    let reconnectTimer: number | undefined;

    const handleOffline = () => {
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      setShowReconnected(false);
      setIsDismissedWhileOffline(false);
      setIsOnline(false);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setIsDismissedWhileOffline(false);
      setShowReconnected(true);

      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      reconnectTimer = window.setTimeout(() => {
        setShowReconnected(false);
      }, 4200);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
    };
  }, []);

  // Nothing to show when online and not in the brief post-reconnection confirmation window
  if (isOnline && !showReconnected) {
    return null;
  }

  // Minimized pill if the user dismissed the full toast while still offline
  if (!isOnline && isDismissedWhileOffline) {
    return (
      <div
        className="fixed bottom-4 right-4 z-[90] pointer-events-auto animate-lq-page-enter"
        role="status"
        aria-live="polite"
      >
        <button
          type="button"
          onClick={() => setIsDismissedWhileOffline(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#0B1E36]/95 text-amber-300 border border-amber-500/40 shadow-xl backdrop-blur-md hover:bg-[#102A4C] transition text-xs font-bold cursor-pointer"
          title="Click to view offline mode details"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>Offline · Cached Mode</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-5 sm:bottom-5 z-[90] max-w-md w-auto pointer-events-none flex justify-center sm:justify-end"
      role="status"
      aria-live="polite"
    >
      {!isOnline ? (
        <div className="pointer-events-auto w-full bg-[#0B1E36]/95 text-white border border-amber-400/40 rounded-2xl p-4 shadow-2xl shadow-slate-950/60 backdrop-blur-md flex items-start gap-3.5 animate-lq-page-enter">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-300 mt-0.5">
            <CloudOff className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
              <h4 className="text-xs sm:text-sm font-extrabold text-amber-200 tracking-tight">
                Connection Interrupted · Offline Mode
              </h4>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed mt-1">
              You are currently viewing <strong className="text-white font-semibold">offline/cached content</strong>. You can continue reading lessons and taking quizzes—your progress is saved locally and will sync automatically once reconnected.
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-sky-300">
              <Database className="w-3 h-3 text-sky-400 shrink-0" />
              <span>Local Cache Active · Safe to Continue</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDismissedWhileOffline(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0 cursor-pointer"
            aria-label="Minimize offline notification"
            title="Minimize"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="pointer-events-auto w-full bg-[#0B1E36]/95 text-white border border-emerald-400/40 rounded-2xl px-4 py-3 shadow-2xl shadow-slate-950/60 backdrop-blur-md flex items-center gap-3 animate-lq-page-enter">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-300">
            <Wifi className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <h4 className="text-xs sm:text-sm font-extrabold text-emerald-300">
                Connection Restored · Back Online
              </h4>
            </div>
            <p className="text-[11px] text-slate-300 truncate mt-0.5">
              Live cloud synchronization is active again.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowReconnected(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default NetworkStatusToast;
