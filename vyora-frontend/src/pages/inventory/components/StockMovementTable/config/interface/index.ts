import React from 'react';
import { MovementItem } from '@/pages/inventory/config';

export interface StockMovementTableProps {
  movements: MovementItem[];
  isLoading: boolean;
  canAdjust?: boolean;
  onOpenAdjustment: () => void;
  headerActions?: React.ReactNode;
}
