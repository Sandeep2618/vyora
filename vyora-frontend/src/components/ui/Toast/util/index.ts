import { ToastItem } from '../config/interface';

type ToastListener = (toast: Omit<ToastItem, 'id'>) => void;
let globalToastListener: ToastListener | null = null;

export const setGlobalToastListener = (listener: ToastListener | null) => {
  globalToastListener = listener;
};

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
