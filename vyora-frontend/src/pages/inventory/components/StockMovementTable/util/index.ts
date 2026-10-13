import { BadgeVariant } from '@/components/ui/Badge';

export const getMovementBadgeVariant = (type: string, delta: number): { variant: BadgeVariant; text: string } => {
  switch (type) {
    case 'PURCHASE':
    case 'OPENING':
    case 'ADJUSTMENT_IN':
    case 'SALE_CANCEL':
      return { variant: 'success', text: `+${delta}` };
    case 'SALE':
    case 'ADJUSTMENT_OUT':
    case 'PURCHASE_CANCEL':
      return { variant: 'overdue', text: `${delta}` };
    default:
      return { variant: 'neutral', text: delta > 0 ? `+${delta}` : `${delta}` };
  }
};
