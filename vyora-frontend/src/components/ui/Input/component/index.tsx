import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { InputProps } from '../config/interface';
import {
  INPUT_BASE_STYLES,
  INPUT_ERROR_STYLES,
  INPUT_DEFAULT_BORDER_STYLES,
} from '../config/constant';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, required, className, id, rightElement, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined);
    const cleanLabel = label?.replace(/\s*\*$/, '');
    const isRequired = required || label?.includes('*');

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[#123B3A] dark:text-[#F0FDFA] select-none"
          >
            {cleanLabel}
            {isRequired && (
              <span
                className="text-[#B91C1C] dark:text-rose-400 font-bold ml-1 text-xs"
                title="Required field"
              >
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            required={isRequired}
            onFocus={(e) => {
              if (props.type === 'number') {
                e.target.select();
              }
              props.onFocus?.(e);
            }}
            className={cn(
              INPUT_BASE_STYLES,
              error ? INPUT_ERROR_STYLES : INPUT_DEFAULT_BORDER_STYLES,
              rightElement && 'pr-10',
              className,
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p className="text-[11px] font-medium text-[#B91C1C] dark:text-rose-400 mt-0.5">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-[11px] text-[#566B69] dark:text-[#8FA8A4] mt-0.5">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
