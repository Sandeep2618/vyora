import { BadgeVariant } from '@/components/ui/Badge';

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_CURRENT_PAGE = 1;

export const INVOICE_STATUS_VARIANT_MAP: Record<string, BadgeVariant> = {
  PAID: 'paid',
  PARTIAL: 'pending',
  DRAFT: 'pending',
  UNPAID: 'overdue',
  CANCELLED: 'cancelled',
};
