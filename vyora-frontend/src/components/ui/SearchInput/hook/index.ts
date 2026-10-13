import { useState, useEffect } from 'react';

export interface UseSearchInputOptions {
  value: string;
  onChange: (val: string) => void;
  debounceMs?: number;
}

export const useSearchInput = ({
  value,
  onChange,
  debounceMs = 300,
}: UseSearchInputOptions) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

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

  const handleClear = (onClear?: () => void) => {
    setInternalValue('');
    onChange('');
    if (onClear) onClear();
  };

  return {
    internalValue,
    setInternalValue,
    handleClear,
  };
};
