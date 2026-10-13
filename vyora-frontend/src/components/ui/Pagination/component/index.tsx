import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaginationProps } from '../config/interface';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '../config/constant';
import { calculatePageNumbers } from '../util';

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  if (totalItems <= 0 || totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const pages = calculatePageNumbers(currentPage, totalPages);

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 pt-3.5 pb-1 border-t border-[#D7E5E2] dark:border-[#1E3B38] text-xs text-[#566B69] dark:text-[#8FA8A4]',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className="text-[#123B3A] dark:text-[#F0FDFA]">{startItem}</strong>-
          <strong className="text-[#123B3A] dark:text-[#F0FDFA]">{endItem}</strong> of{' '}
          <strong className="text-[#123B3A] dark:text-[#F0FDFA]">{totalItems}</strong> entries
        </span>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#D7E5E2] dark:border-[#1E3B38]">
            <span className="hidden sm:inline text-[11px]">Rows:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 text-xs bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-lg text-[#123B3A] dark:text-[#F0FDFA] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6]"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322] text-[#566B69] dark:text-[#8FA8A4] hover:bg-[#F4F8F7] dark:hover:bg-[#142B2A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {pages.map((p, idx) =>
          typeof p === 'number' ? (
            <button
              key={idx}
              onClick={() => onPageChange(p)}
              className={cn(
                'min-w-[28px] h-7 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                currentPage === p
                  ? 'bg-[#0F766E] text-white dark:bg-[#14B8A6] dark:text-[#0A1615] shadow-xs'
                  : 'border border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322] text-[#123B3A] dark:text-[#F0FDFA] hover:bg-[#F4F8F7] dark:hover:bg-[#142B2A]',
              )}
            >
              {p}
            </button>
          ) : (
            <span key={idx} className="px-1 text-[#566B69] dark:text-[#8FA8A4] select-none">
              ...
            </span>
          ),
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322] text-[#566B69] dark:text-[#8FA8A4] hover:bg-[#F4F8F7] dark:hover:bg-[#142B2A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
