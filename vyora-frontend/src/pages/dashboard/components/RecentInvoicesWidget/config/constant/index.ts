import { BadgeVariant } from '@/components/ui/Badge';

export const RECENT_INVOICE_STATUS_MAP: Record<string, BadgeVariant> = {
  PAID: 'paid',
  PARTIAL: 'pending',
  DRAFT: 'pending',
  UNPAID: 'overdue',
  CANCELLED: 'cancelled',
};
