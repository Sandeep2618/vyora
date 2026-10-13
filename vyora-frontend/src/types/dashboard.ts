import { InvoiceStatus } from './invoice';

// Dashboard Summary Metrics Domain Types
export interface DashboardSummary {
  totalSalesMinor: number;
  totalSalesChangePercent: number;
  totalInvoicesCount: number;
  totalInvoicesChangePercent: number;
  outstandingReceivablesMinor: number;
  outstandingReceivablesChangePercent: number;
  totalStockValueMinor: number;
  totalStockValueChangePercent: number;
  recentInvoices: {
    id: string;
    invoiceNumber: string;
    customerName: string;
    date: string;
    amountMinor: number;
    status: InvoiceStatus;
  }[];
  topProducts: {
    productId: string;
    productName: string;
    soldQuantity: number;
    revenueMinor: number;
  }[];
  salesTrend: {
    date: string;
    salesMinor: number;
  }[];
  salesByCategory: {
    categoryName: string;
    salesMinor: number;
    percentage: number;
  }[];
  lowStockCount: number;
}
