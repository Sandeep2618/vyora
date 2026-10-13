export const getBalanceVariant = (balanceMinor: number): { className: string; type: string } => {
  if (balanceMinor > 0) {
    return { className: 'text-[#B91C1C] dark:text-[#F87171]', type: 'due' };
  }
  if (balanceMinor < 0) {
    return { className: 'text-[#A16207] dark:text-[#FBBF24]', type: 'advance' };
  }
  return { className: 'text-[#15803D] dark:text-[#34D399]', type: 'settled' };
};
