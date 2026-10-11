import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (val: string) => void;
  onClear?: () => void;
  debounceMs?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  debounceMs = 300,
  placeholder = 'Search...',
  className,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value);

  // Sync when parent value changes externally (e.g. Reset Filters clicked)
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounce notification back to parent onChange
  useEffect(() => {
    if (debounceMs <= 0) {
      if (internalValue !== value) onChange(internalValue);
      return;
    }

    const timer = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalValue, debounceMs, onChange, value]);

  const handleClear = () => {
    setInternalValue('');
    onChange('');
    if (onClear) onClear();
  };

  return (
    <div className={cn('relative w-full', className)}>
      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#566B69] pointer-events-none" />
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 pl-8.5 pr-8 py-1.5 text-xs bg-[#F4F8F7] border border-[#D7E5E2] rounded-lg text-[#123B3A] placeholder-[#566B69]/60 focus:outline-none focus:border-[#0F766E] focus:bg-white transition-colors"
        {...props}
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#566B69] hover:text-[#123B3A] p-0.5"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
