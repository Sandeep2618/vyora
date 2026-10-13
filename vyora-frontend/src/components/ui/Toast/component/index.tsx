import React, { useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToastItem } from '../config/interface';
import { DEFAULT_TOAST_DURATION } from '../config/constant';
import { setGlobalToastListener } from '../util';
import { ToastContext } from '../hook';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (t: Omit<ToastItem, 'id'>) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
      const newToast: ToastItem = { ...t, id };
      setToasts((prev) => [...prev, newToast]);

      const duration = t.duration || DEFAULT_TOAST_DURATION;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast],
  );

  useEffect(() => {
    setGlobalToastListener(addToast);
    return () => setGlobalToastListener(null);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <ToastMessage key={t.id} toast={t} onRemove={() => onRemove(t.id)} />
      ))}
    </div>
  );
};

const ToastMessage: React.FC<{
  toast: ToastItem;
  onRemove: () => void;
}> = ({ toast, onRemove }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6] shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/90 dark:bg-emerald-950/40',
    error: 'border-rose-200 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/40',
    info: 'border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322]',
  };

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-top-2 duration-200',
        borders[toast.type],
      )}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0 pr-1">
        <h5 className="text-xs font-bold text-[#123B3A] dark:text-[#F0FDFA] leading-tight">
          {toast.title}
        </h5>
        {toast.description && (
          <p className="text-[11px] text-[#566B69] dark:text-[#8FA8A4] mt-0.5 leading-normal">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={onRemove}
        className="text-[#566B69] hover:text-[#123B3A] dark:text-[#8FA8A4] dark:hover:text-[#F0FDFA] p-0.5 rounded cursor-pointer transition-colors"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
