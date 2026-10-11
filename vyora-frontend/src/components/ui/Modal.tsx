import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'lg',
}) => {
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

  if (!isOpen) return null;

  const widthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          'w-full max-w-[95vw] bg-white rounded-2xl shadow-2xl shadow-[#123B3A]/20 border border-[#D7E5E2] overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200',
          widthStyles[maxWidth],
        )}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#D7E5E2] bg-white">
          <div className="pr-4">
            <h3 className="text-base sm:text-lg font-black text-[#123B3A] tracking-tight">{title}</h3>
            {description && (
              <p className="text-xs text-[#566B69] mt-0.5 leading-normal">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F8F7] hover:bg-[#E6F4F2] text-[#566B69] hover:text-[#0F766E] flex items-center justify-center transition-all shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto">{children}</div>

        {footer && (
          <div className="px-5 sm:px-6 py-3.5 bg-[#F4F8F7]/70 border-t border-[#D7E5E2] flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
