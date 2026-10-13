export interface SalesTrendPoint {
  date: string;
  salesMinor: number;
}

export interface CategoryBreakdown {
  categoryName: string;
  percentage: number;
}

export interface RecentInvoiceItem {
  id: string;
  invoiceNumber: string;
  customerName: string;
  date: string;
  amountMinor: number;
  status: string;
}

export interface TopProductItem {
  productId: string;
  productName: string;
  soldQuantity: number;
  revenueMinor: number;
}

export const CATEGORY_COLORS = ['#0F766E', '#123B3A', '#15803D', '#A16207'];
