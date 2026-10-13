export const calculateLineTotal = (quantity: number | string, rateMajor: number | string): number => {
  const q = typeof quantity === 'number' ? quantity : Number(quantity) || 0;
  const r = typeof rateMajor === 'number' ? rateMajor : Number(rateMajor) || 0;
  return q * r;
};
