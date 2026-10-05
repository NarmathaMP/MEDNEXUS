import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const isAmber = toast.kind === 'amber';
        const isError = toast.kind === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-right-8 ${
              isError
                ? 'bg-rose-950/90 border-rose-500/30 text-rose-100'
                : isAmber
                ? 'bg-amber-950/90 border-amber-500/30 text-amber-100'
                : 'bg-slate-900/95 border-fuchsia-500/30 text-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isError ? (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              ) : isAmber ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
              )}
              <p className="text-xs font-medium leading-relaxed truncate">{toast.text}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors shrink-0"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
