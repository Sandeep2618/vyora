import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select';
import { ITableController, ITableOption } from '../../config/interface';
import { TABLE_CLASSES, DEFAULT_PAGE_SIZE_OPTIONS } from '../../config/constant';

interface ITableFooterProps<T = any> {
  controller: ITableController<T>;
  option: ITableOption<T>;
}

export function TableFooter<T = any>({
  controller,
  option,
}: ITableFooterProps<T>) {
  if (option.footer === false || option.pagination === false || controller.total === 0) {
    return null;
  }

  const { pageIndex, pageSize, totalPages, total, setPageIndex, setPageSize } = controller;

  const pageSizeOptions =
    (typeof option.pagination === 'object' && option.pagination.pageSizeOptions) ||
    DEFAULT_PAGE_SIZE_OPTIONS;

  const startRecord = total === 0 ? 0 : pageIndex * pageSize + 1;
  const endRecord = Math.min((pageIndex + 1) * pageSize, total);

  // Generate visible page numbers (sliding window around current page)
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);

      const left = Math.max(1, pageIndex - 1);
      const right = Math.min(totalPages - 2, pageIndex + 1);

      if (left > 1) {
        pages.push('ellipsis');
      }

      for (let i = left; i <= right; i++) {
        pages.push(i);
      }

      if (right < totalPages - 2) {
        pages.push('ellipsis');
      }

      pages.push(totalPages - 1);
    }

    return pages;
  };

  return (
    <div className={TABLE_CLASSES.footer}>
      {/* Left side: Rows per page + records range */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[#566B69] dark:text-[#8FA8A4]">Rows per page:</span>
          <SelectRoot
            value={String(pageSize)}
            onValueChange={(val) => setPageSize(Number(val))}
          >
            <SelectTrigger
              size="sm"
              className="h-7 w-[68px] px-2 text-xs font-semibold bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-md shadow-2xs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="min-w-[68px]">
              {pageSizeOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </div>

        <div className="text-xs text-[#566B69] dark:text-[#8FA8A4]">
          {total === 0 ? (
            '0 of 0 entries'
          ) : (
            <>
              Showing <span className="font-semibold text-[#123B3A] dark:text-[#E6F4F1]">{startRecord}</span> to{' '}
              <span className="font-semibold text-[#123B3A] dark:text-[#E6F4F1]">{endRecord}</span> of{' '}
              <span className="font-semibold text-[#123B3A] dark:text-[#E6F4F1]">{total.toLocaleString('en-IN')}</span> entries
            </>
          )}
        </div>
      </div>

      {/* Right side: Page navigation */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          type="button"
          onClick={() => setPageIndex(0)}
          disabled={pageIndex === 0}
          className="p-1.5 rounded-md text-[#123B3A] dark:text-[#E6F4F1] hover:bg-[#F4F8F7] dark:hover:bg-[#162E2D] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
          disabled={pageIndex === 0}
          className="p-1.5 rounded-md text-[#123B3A] dark:text-[#E6F4F1] hover:bg-[#F4F8F7] dark:hover:bg-[#162E2D] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numeric page buttons */}
        <div className="flex items-center gap-0.5">
          {getPageNumbers().map((p, idx) => {
            if (p === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-7 h-7 flex items-center justify-center text-xs text-[#566B69] dark:text-[#8FA8A4] select-none"
                >
                  …
                </span>
              );
            }

            const isActive = p === pageIndex;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPageIndex(p)}
                className={`w-7 h-7 flex items-center justify-center text-xs font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'text-[#123B3A] dark:text-[#E6F4F1] hover:bg-[#F4F8F7] dark:hover:bg-[#162E2D]'
                }`}
              >
                {p + 1}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => setPageIndex(Math.min(totalPages - 1, pageIndex + 1))}
          disabled={pageIndex >= totalPages - 1}
          className="p-1.5 rounded-md text-[#123B3A] dark:text-[#E6F4F1] hover:bg-[#F4F8F7] dark:hover:bg-[#162E2D] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => setPageIndex(totalPages - 1)}
          disabled={pageIndex >= totalPages - 1}
          className="p-1.5 rounded-md text-[#123B3A] dark:text-[#E6F4F1] hover:bg-[#F4F8F7] dark:hover:bg-[#162E2D] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
