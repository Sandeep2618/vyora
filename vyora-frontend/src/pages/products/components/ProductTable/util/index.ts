export const checkProductStockStatus = (currentStock: number, reorderLevel: number) => {
  const isOutOfStock = currentStock <= 0;
  const isLowStock = currentStock > 0 && currentStock <= reorderLevel;
  return { isOutOfStock, isLowStock };
};
