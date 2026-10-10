import { TaxRatePercent, ItemUnit } from '../types';

/**
 * Minor unit to major unit conversion (e.g. 100 paise -> 1.00 INR)
 */
export function minorToMajor(minor: number): number {
  return Number((minor / 100).toFixed(2));
}

/**
 * Major unit to minor unit conversion (e.g. 10.50 INR -> 1050 paise)
 */
export function majorToMinor(major: number): number {
  return Math.round(major * 100);
}

/**
 * Formats minor units into Indian currency format (e.g., 4825000 -> "₹48,250.00")
 */
export function formatCurrency(amountMinor: number, currency: string = 'INR'): string {
  const major = amountMinor / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(major);
}

/**
 * Formats a number with Indian grouping without currency symbol (e.g., 4825000 -> "48,250.00")
 */
export function formatAmountNumber(amountMinor: number): string {
  const major = amountMinor / 100;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(major);
}

export interface LineItemInput {
  productId: string;
  productName: string;
  sku: string;
  hsnCode?: string;
  unit: ItemUnit;
  quantity: number;
  unitPriceMinor: number;
  discountPercent?: number; // 0 to 100
  taxRatePercent: TaxRatePercent;
}

export interface CalculatedLineItem {
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

export interface InvoiceTotals {
  subtotalMinor: number;
  totalDiscountMinor: number;
  totalTaxableAmountMinor: number;
  cgstMinor: number;
  sgstMinor: number;
  igstMinor: number;
  totalTaxMinor: number;
  unroundedGrandTotalMinor: number;
  roundOffMinor: number;
  grandTotalMinor: number;
}

/**
 * Authoritative line item tax and amount calculator
 */
export function calculateLineItem(
  item: LineItemInput,
  isInterState: boolean = false,
): CalculatedLineItem {
  const qty = Math.max(0, item.quantity);
  const unitPrice = Math.max(0, Math.round(item.unitPriceMinor));
  const discountPct = Math.min(100, Math.max(0, item.discountPercent || 0));

  const grossLineMinor = qty * unitPrice;
  const discountAmountMinor = Math.round((grossLineMinor * discountPct) / 100);
  const taxableAmountMinor = Math.max(0, grossLineMinor - discountAmountMinor);

  let cgstMinor = 0;
  let sgstMinor = 0;
  let igstMinor = 0;

  if (item.taxRatePercent > 0) {
    if (isInterState) {
      igstMinor = Math.round((taxableAmountMinor * item.taxRatePercent) / 100);
    } else {
      const halfRate = item.taxRatePercent / 2;
      cgstMinor = Math.round((taxableAmountMinor * halfRate) / 100);
      sgstMinor = Math.round((taxableAmountMinor * halfRate) / 100);
    }
  }

  const totalTaxMinor = isInterState ? igstMinor : cgstMinor + sgstMinor;
  const lineTotalMinor = taxableAmountMinor + totalTaxMinor;

  return {
    productId: item.productId,
    productName: item.productName,
    sku: item.sku,
    hsnCode: item.hsnCode,
    unit: item.unit,
    quantity: qty,
    unitPriceMinor: unitPrice,
    discountPercent: discountPct,
    discountAmountMinor,
    taxableAmountMinor,
    taxRatePercent: item.taxRatePercent,
    cgstMinor,
    sgstMinor,
    igstMinor,
    totalTaxMinor,
    lineTotalMinor,
  };
}

/**
 * Calculates authoritative invoice summary totals
 */
export function calculateInvoiceTotals(
  lines: CalculatedLineItem[],
  enableRoundOff: boolean = true,
): InvoiceTotals {
  let subtotalMinor = 0;
  let totalDiscountMinor = 0;
  let totalTaxableAmountMinor = 0;
  let cgstMinor = 0;
  let sgstMinor = 0;
  let igstMinor = 0;
  let totalTaxMinor = 0;

  for (const line of lines) {
    subtotalMinor += line.quantity * line.unitPriceMinor;
    totalDiscountMinor += line.discountAmountMinor;
    totalTaxableAmountMinor += line.taxableAmountMinor;
    cgstMinor += line.cgstMinor;
    sgstMinor += line.sgstMinor;
    igstMinor += line.igstMinor;
    totalTaxMinor += line.totalTaxMinor;
  }

  const unroundedGrandTotalMinor = totalTaxableAmountMinor + totalTaxMinor;

  let roundOffMinor = 0;
  let grandTotalMinor = unroundedGrandTotalMinor;

  if (enableRoundOff) {
    const roundedMajor = Math.round(unroundedGrandTotalMinor / 100);
    grandTotalMinor = roundedMajor * 100;
    roundOffMinor = grandTotalMinor - unroundedGrandTotalMinor;
  }

  return {
    subtotalMinor,
    totalDiscountMinor,
    totalTaxableAmountMinor,
    cgstMinor,
    sgstMinor,
    igstMinor,
    totalTaxMinor,
    unroundedGrandTotalMinor,
    roundOffMinor,
    grandTotalMinor,
  };
}

/**
 * Generate standard padded invoice/bill number e.g. "INV-0048"
 */
export function formatDocumentNumber(prefix: string, sequence: number, padding: number = 4): string {
  const padded = String(sequence).padStart(padding, '0');
  return `${prefix}${padded}`;
}

/**
 * Format ISO date string into readable DD MMM YYYY (e.g. "23 Apr 2025")
 */
export function formatDateReadable(isoString: string | Date): string {
  if (!isoString) return '';
  const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
