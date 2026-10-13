import { ItemUnit, TaxRatePercent } from './product';

// Purchases Domain Types
export type PurchaseStatus = 'RECEIVED' | 'PAID' | 'PARTIAL' | 'UNPAID' | 'CANCELLED';

export interface PurchaseItemLine {
  id?: string;
  productId: string;
  productName: string;
  sku: string;
  unit: ItemUnit;
  quantity: number;
  unitPriceMinor: number;
  taxRatePercent: TaxRatePercent;
  taxableAmountMinor: number;
  totalTaxMinor: number;
  lineTotalMinor: number;
}

export interface PurchaseBill {
  id: string;
  businessId: string;
  billNumber: string;
  supplierId: string;
  supplierSnapshot: {
    name: string;
    phone: string;
    gstin?: string;
    state?: string;
  };
  billDate: string;
  dueDate?: string;
  status: PurchaseStatus;
  items: PurchaseItemLine[];
  subtotalMinor: number;
  totalTaxMinor: number;
  grandTotalMinor: number;
  paidAmountMinor: number;
  dueAmountMinor: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
