export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
export const SEARCH_DEBOUNCE_MS = 300;
export const STORAGE_PREFIX = 'vyora:table:';

export const TABLE_CLASSES = {
  container:
    'w-full bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl overflow-hidden shadow-2xs flex flex-col',
  tableWrapper: 'relative w-full overflow-x-auto min-h-[160px]',
  table: 'w-full caption-bottom text-xs text-left border-collapse',
  thead: 'bg-[#F4F8F7]/80 dark:bg-[#142B2A] border-b border-[#D7E5E2] dark:border-[#1E3B38]',
  th: 'h-10 px-3.5 text-left align-middle font-bold text-[#123B3A] dark:text-[#E6F4F1] tracking-tight select-none',
  tbody: 'divide-y divide-[#D7E5E2] dark:divide-[#1E3B38] bg-white dark:bg-[#112322]',
  tr: 'transition-colors hover:bg-[#F4F8F7]/70 dark:hover:bg-[#162E2D]/60 data-[selected=true]:bg-[#E6F4F2] dark:data-[selected=true]:bg-[#162E2D]',
  td: 'p-3.5 align-middle text-[#123B3A] dark:text-[#E6F4F1]',
  toolbar:
    'flex flex-wrap items-center justify-between gap-3 p-3.5 border-b border-[#D7E5E2] dark:border-[#1E3B38] bg-[#FBFDFD] dark:bg-[#132625]',
  footer:
    'flex flex-wrap items-center justify-between gap-3 p-3.5 border-t border-[#D7E5E2] dark:border-[#1E3B38] bg-[#FBFDFD] dark:bg-[#132625] text-xs text-[#566B69] dark:text-[#8FA8A4]',
  bulkBar:
    'fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#123B3A] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200 border border-[#0F766E]/50',
};
