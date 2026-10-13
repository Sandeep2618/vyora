import { useEffect } from 'react';

export interface UseDrawerDismissOptions {
  isOpen: boolean;
  onClose: () => void;
}

export const useDrawerDismiss = ({ isOpen, onClose }: UseDrawerDismissOptions) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
};
