import { ItemUnit, TaxRatePercent } from './product';

// Invoice Domain Types
export type InvoiceStatus =
  | 'DRAFT'
  | 'FINALIZED'
  | 'PAID'
  | 'PARTIAL'
  | 'UNPAID'
  | 'CANCELLED';

export interface InvoiceItemLine {
  id?: string;
  productId: string;
  productName: string;
  sku: string;
  hsnCode?: string;
  unit: ItemUnit;
  quantity: number;
  unitPriceMinor: number;
  discountPercent: number;
  discountAmountMinor: number;
  taxableAmountMinor: number;
  taxRatePercent: TaxRatePercent;
  cgstMinor: number;
  sgstMinor: number;
  igstMinor: number;
  totalTaxMinor: number;
  lineTotalMinor: number;
}

export interface Invoice {
  id: string;
  businessId: string;
  invoiceNumber: string;
  customerId: string;
  customerSnapshot: {
    name: string;
    phone: string;
    email?: string;
    gstin?: string;
    address: string;
    state: string;
    stateCode?: string;
  };
  businessSnapshot?: {
    name: string;
    legalName?: string;
    phone: string;
    email: string;
    upiId?: string;
    gstin?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  isInterState: boolean;
  items: InvoiceItemLine[];
  subtotalMinor: number;
  totalDiscountMinor: number;
  totalTaxableAmountMinor: number;
  cgstMinor: number;
  sgstMinor: number;
  igstMinor: number;
  totalTaxMinor: number;
  roundOffMinor: number;
  grandTotalMinor: number;
  paidAmountMinor: number;
  dueAmountMinor: number;
  notes?: string;
  terms?: string;
  cancelReason?: string;
  cancelledAt?: string;
  cancelledByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceItemInput {
  productId: string;
  quantity: number;
  unitPriceMinor: number;
  discountPercent?: number;
  taxRatePercent: TaxRatePercent;
}

export interface CreateInvoiceInput {
  customerId: string;
  issueDate: string;
  dueDate: string;
  items: CreateInvoiceItemInput[];
  notes?: string;
  roundOff?: boolean;
}

export interface CalculatedLineItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPriceMinor: number;
  discountPercent: number;
  discountAmountMinor: number;
  taxableAmountMinor: number;
  taxRatePercent: number;
  cgstMinor: number;
  sgstMinor: number;
  igstMinor: number;
  totalTaxMinor: number;
  lineTotalMinor: number;
}

export interface InvoiceTotals {
  subtotalMinor: number;
  totalDiscountMinor: number;
  totalTaxableAmountMinor: number;
  cgstMinor: number;
  sgstMinor: number;
  igstMinor: number;
  totalTaxMinor: number;
  roundOffMinor: number;
  grandTotalMinor: number;
  items: CalculatedLineItem[];
}
