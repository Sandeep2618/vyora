import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Standalone global dispatcher so toast can be called inside or outside React components
type ToastListener = (toast: Omit<ToastItem, 'id'>) => void;
let globalToastListener: ToastListener | null = null;

export const toast = {
  success: (title: string, description?: string, duration?: number) => {
    if (globalToastListener) {
      globalToastListener({ type: 'success', title, description, duration });
    }
  },
  error: (title: string, description?: string, duration?: number) => {
    if (globalToastListener) {
      globalToastListener({ type: 'error', title, description, duration });
    }
  },
  info: (title: string, description?: string, duration?: number) => {
    if (globalToastListener) {
      globalToastListener({ type: 'info', title, description, duration });
    }
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast: ToastItem = { ...t, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = t.duration || 3500;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  useEffect(() => {
    globalToastListener = addToast;
    return () => {
      globalToastListener = null;
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toasts: [],
      addToast: () => {},
      removeToast: () => {},
      toast,
    };
  }
  return { ...context, toast };
};

export const Toaster: React.FC = () => {
  const context = useContext(ToastContext);
  const toasts = context?.toasts || [];
  const removeToast = context?.removeToast || (() => {});

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white border shadow-lg transition-all transform animate-in slide-in-from-bottom-5 duration-200',
            t.type === 'success' && 'border-[#A0D2CA] text-[#123B3A]',
            t.type === 'error' && 'border-rose-200 text-rose-950',
            t.type === 'info' && 'border-[#D7E5E2] text-[#123B3A]'
          )}
        >
          {t.type === 'success' && (
            <div className="w-8 h-8 rounded-xl bg-[#E6F4F2] text-[#0F766E] flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          {t.type === 'error' && (
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#B91C1C] flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          {t.type === 'info' && (
            <div className="w-8 h-8 rounded-xl bg-[#F4F8F7] text-[#0F766E] flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
          )}

          <div className="flex-1 min-w-0 pr-1">
            <h4 className="text-xs font-bold leading-tight">{t.title}</h4>
            {t.description && (
              <p className="text-[11px] text-[#566B69] mt-0.5 leading-relaxed">
                {t.description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="text-[#566B69] hover:text-[#123B3A] p-1 rounded-lg hover:bg-[#F4F8F7] transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
