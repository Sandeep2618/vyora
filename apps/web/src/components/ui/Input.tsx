import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#123B3A] mb-1">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full px-3 py-2 text-sm bg-white border border-[#D7E5E2] rounded-lg text-[#123B3A] placeholder-[#566B69]/60 transition-colors',
            'focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]',
            error && 'border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]',
            className,
          )}
          {...props}
        />
        {helperText && !error && (
          <p className="mt-1 text-xs text-[#566B69]">{helperText}</p>
        )}
        {error && <p className="mt-1 text-xs text-[#B91C1C] font-medium">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
