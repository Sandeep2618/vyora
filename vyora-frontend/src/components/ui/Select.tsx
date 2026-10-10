import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, required, className, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined);
    const cleanLabel = label?.replace(/\s*\*$/, '');
    const isRequired = required || label?.includes('*');

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
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

        <select
          ref={ref}
          id={selectId}
          required={isRequired}
          className={cn(
            'w-full px-3 py-2 text-xs bg-white border rounded-lg text-[#123B3A] transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]',
            error
              ? 'border-[#B91C1C] bg-[#FEF2F2]/30 focus:border-[#B91C1C]'
              : 'border-[#D7E5E2] hover:border-[#A0BDB8]',
            'disabled:bg-[#F4F8F7] disabled:text-[#566B69] disabled:cursor-not-allowed',
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {error && (
          <p className="text-[11px] font-medium text-[#B91C1C] mt-0.5">{error}</p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
