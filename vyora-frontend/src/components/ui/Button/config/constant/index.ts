export const BUTTON_BASE_STYLES =
  'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

export const BUTTON_VARIANTS: Record<string, string> = {
  primary:
    'bg-[#0F766E] text-white hover:bg-[#0D665F] dark:bg-[#14B8A6] dark:text-[#0A1615] dark:hover:bg-[#0D9488] focus:ring-[#0F766E] shadow-sm',
  secondary:
    'bg-[#E6F4F2] text-[#0F766E] hover:bg-[#D3EDE9] dark:bg-[#162E2D] dark:text-[#14B8A6] dark:hover:bg-[#1E3E3C] focus:ring-[#0F766E]',
  outline:
    'border border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322] text-[#123B3A] dark:text-[#F0FDFA] hover:bg-[#F4F8F7] dark:hover:bg-[#142B2A] focus:ring-[#0F766E]',
  ghost:
    'text-[#566B69] dark:text-[#8FA8A4] hover:bg-[#E6F4F2] dark:hover:bg-[#142B2A] hover:text-[#0F766E] dark:hover:text-[#14B8A6] focus:ring-[#0F766E]',
  danger:
    'bg-[#B91C1C] text-white hover:bg-[#991B1B] dark:bg-rose-600 dark:hover:bg-rose-700 focus:ring-[#B91C1C] shadow-sm',
};

export const BUTTON_SIZES: Record<string, string> = {
  sm: 'px-2.5 py-1.5 text-xs gap-1.5',
  md: 'px-3.5 py-2 text-sm gap-2',
  lg: 'px-4.5 py-2.5 text-base gap-2.5',
};

export const DEFAULT_BUTTON_VARIANT = 'primary';
export const DEFAULT_BUTTON_SIZE = 'md';
