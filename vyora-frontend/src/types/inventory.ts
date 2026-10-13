// Stock Movement & Inventory Domain Types
export type StockMovementType =
  | 'OPENING'
  | 'SALE'
  | 'PURCHASE'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'SALE_CANCEL'
  | 'PURCHASE_CANCEL';

export interface StockMovement {
  id: string;
  businessId: string;
  productId: string;
  movementType: StockMovementType;
  quantityDelta: number;
  resultingStock: number;
  reason?: string;
  referenceType: 'INVOICE' | 'PURCHASE' | 'MANUAL_ADJUSTMENT' | 'INITIAL_SETUP';
  referenceId?: string;
  performedByUserId: string;
  createdAt: string;
}
