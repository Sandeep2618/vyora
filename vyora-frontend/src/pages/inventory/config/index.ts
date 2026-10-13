export type MovementTypeFilter = 'ALL' | 'SALE' | 'PURCHASE' | 'ADJUSTMENT' | 'CANCEL' | 'OPENING';

export interface MovementItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  movementType: string;
  quantityDelta: number;
  resultingStock: number;
  reason?: string;
  referenceType?: string;
  createdAt: string;
}

export const MOVEMENT_TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Movement Types' },
  { value: 'SALE', label: 'Sales Orders' },
  { value: 'PURCHASE', label: 'Purchase Inward' },
  { value: 'ADJUSTMENT', label: 'Manual Adjustments' },
  { value: 'CANCEL', label: 'Cancelled Orders' },
  { value: 'OPENING', label: 'Opening Stock' },
];
