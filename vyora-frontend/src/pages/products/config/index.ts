import { ItemUnit, TaxRatePercent } from '../../../types';

export type StockFilter = 'ALL' | 'LOW' | 'IN_STOCK' | 'OUT_OF_STOCK';

export const STOCK_FILTER_OPTIONS: { value: StockFilter; label: string }[] = [
  { value: 'ALL', label: 'All Stock Levels' },
  { value: 'LOW', label: '⚠️ Low Stock' },
  { value: 'IN_STOCK', label: '✅ In Stock' },
  { value: 'OUT_OF_STOCK', label: '❌ Out of Stock' },
];

export const TAX_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All GST Slabs' },
  { value: '0', label: '0% Nil Rated' },
  { value: '5', label: '5% GST' },
  { value: '12', label: '12% GST' },
  { value: '18', label: '18% GST' },
  { value: '28', label: '28% GST' },
];

export const UNIT_OPTIONS: { value: ItemUnit; label: string }[] = [
  { value: 'PCS', label: 'Pieces (PCS)' },
  { value: 'BOX', label: 'Boxes (BOX)' },
  { value: 'KG', label: 'Kilograms (KG)' },
  { value: 'LTR', label: 'Liters (LTR)' },
  { value: 'MTR', label: 'Meters (MTR)' },
  { value: 'SET', label: 'Sets (SET)' },
  { value: 'UNT', label: 'Units (UNT)' },
  { value: 'PKT', label: 'Packets (PKT)' },
];

export const TAX_RATE_OPTIONS: { value: TaxRatePercent; label: string }[] = [
  { value: 0, label: '0% (Nil Rated)' },
  { value: 5, label: '5% GST' },
  { value: 12, label: '12% GST' },
  { value: 18, label: '18% GST (Standard)' },
  { value: 28, label: '28% GST (Luxury)' },
];
