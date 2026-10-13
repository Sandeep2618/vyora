// Product / Item Domain Types
export type TaxRatePercent = 0 | 5 | 12 | 18 | 28;
export type ItemUnit = 'PCS' | 'BOX' | 'KG' | 'LTR' | 'MTR' | 'SET' | 'UNT' | 'PKT';

export interface Product {
  id: string;
  businessId: string;
  name: string;
  sku: string;
  hsnCode?: string;
  description?: string;
  unit: ItemUnit;
  sellingPriceMinor: number;
  purchasePriceMinor: number;
  taxRatePercent: TaxRatePercent;
  openingStock: number;
  currentStock: number;
  reorderLevel: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  sku: string;
  hsnCode?: string;
  description?: string;
  unit: ItemUnit;
  sellingPriceMinor: number;
  purchasePriceMinor?: number;
  taxRatePercent: TaxRatePercent;
  openingStock?: number;
  reorderLevel?: number;
}
