import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModalProps } from '../config/interface';
import { useModalDismiss } from '../hook';
import { resolveModalWidthClass } from '../util';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth,
}) => {
  useModalDismiss({ isOpen, onClose });

  if (!isOpen) return null;

  const widthClass = resolveModalWidthClass(maxWidth);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full max-w-[95vw] bg-white dark:bg-[#112322] rounded-2xl shadow-2xl shadow-[#123B3A]/20 dark:shadow-black/50 border border-[#D7E5E2] dark:border-[#1E3B38] overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 cursor-default',
          widthClass,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322]">
          <div className="pr-4">
            <h3 className="text-base sm:text-lg font-black text-[#123B3A] dark:text-[#F0FDFA] tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-[#566B69] dark:text-[#8FA8A4] mt-0.5 leading-normal">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F8F7] dark:bg-[#142B2A] hover:bg-[#E6F4F2] dark:hover:bg-[#1E3E3C] text-[#566B69] dark:text-[#8FA8A4] hover:text-[#0F766E] dark:hover:text-[#14B8A6] flex items-center justify-center transition-all shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto">{children}</div>

        {footer && (
          <div className="px-5 sm:px-6 py-3.5 bg-[#F4F8F7]/70 dark:bg-[#0D1C1B] border-t border-[#D7E5E2] dark:border-[#1E3B38] flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
