import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, required, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined);

    // Clean label text: if label contains a trailing '*', remove it and render our styled red asterisk
    const cleanLabel = label?.replace(/\s*\*$/, '');
    const isRequired = required || label?.includes('*');

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[#123B3A] select-none"
          >
            {cleanLabel}
            {isRequired && (
              <span className="text-[#B91C1C] font-bold ml-1 text-xs" title="Required field">
                *
              </span>
            )}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          required={isRequired}
          className={cn(
            'flex h-10 w-full rounded-xl border bg-white px-3.5 py-2 text-xs font-semibold text-[#123B3A] shadow-2xs transition-all',
            'placeholder:text-[#566B69]/60 placeholder:font-normal',
            'focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]',
            error
              ? 'border-[#B91C1C] bg-[#FEF2F2]/30 focus:border-[#B91C1C] focus:ring-[#B91C1C]/20'
              : 'border-[#D7E5E2] hover:border-[#A0BDB8]',
            'disabled:bg-[#F4F8F7] disabled:text-[#566B69]/60 disabled:cursor-not-allowed',
            className,
          )}
          {...props}
        />

        {error && (
          <p className="text-[11px] font-medium text-[#B91C1C] flex items-center gap-1 mt-0.5">
            <span>{error}</span>
          </p>
        )}

        {helperText && !error && (
          <p className="text-[11px] text-[#566B69] mt-0.5">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
