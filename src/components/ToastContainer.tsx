import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 left-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none dir-rtl">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-in ${
              isSuccess
                ? 'bg-emerald-900/95 text-emerald-50 border-emerald-700/80'
                : isError
                ? 'bg-rose-900/95 text-rose-50 border-rose-700/80'
                : isWarning
                ? 'bg-amber-900/95 text-amber-50 border-amber-700/80'
                : 'bg-slate-900/95 text-slate-50 border-slate-700/80'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isError && <XCircle className="w-5 h-5 text-rose-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-sky-400" />}
            </div>

            <div className="flex-1 text-right">
              <h4 className="font-bold text-sm leading-tight">{toast.title}</h4>
              <p className="text-xs opacity-90 mt-1 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
