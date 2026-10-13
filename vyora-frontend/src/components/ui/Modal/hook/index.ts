import { useEffect } from 'react';

export interface UseModalDismissOptions {
  isOpen: boolean;
  onClose: () => void;
}

export const useModalDismiss = ({ isOpen, onClose }: UseModalDismissOptions) => {
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
