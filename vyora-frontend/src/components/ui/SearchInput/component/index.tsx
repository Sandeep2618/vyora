import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchInputProps } from '../config/interface';
import { DEFAULT_SEARCH_DEBOUNCE_MS, DEFAULT_SEARCH_PLACEHOLDER } from '../config/constant';
import { useSearchInput } from '../hook';

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  debounceMs = DEFAULT_SEARCH_DEBOUNCE_MS,
  placeholder = DEFAULT_SEARCH_PLACEHOLDER,
  className,
  ...props
}) => {
  const { internalValue, setInternalValue, handleClear } = useSearchInput({
    value,
    onChange,
    debounceMs,
  });

  return (
    <div className={cn('relative w-full', className)}>
      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#566B69] dark:text-[#8FA8A4] pointer-events-none" />
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 pl-8.5 pr-8 py-1.5 text-xs bg-[#F4F8F7] dark:bg-[#0D1C1B] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-lg text-[#123B3A] dark:text-[#F0FDFA] placeholder-[#566B69]/60 dark:placeholder-[#8FA8A4]/50 focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6] focus:bg-white dark:focus:bg-[#132826] transition-colors"
        {...props}
      />
      {internalValue && (
        <button
          type="button"
          onClick={() => handleClear(onClear)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#566B69] hover:text-[#123B3A] dark:text-[#8FA8A4] dark:hover:text-[#F0FDFA] p-0.5 rounded cursor-pointer transition-colors"
          title="Clear search"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
