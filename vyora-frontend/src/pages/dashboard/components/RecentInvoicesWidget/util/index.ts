import { BadgeVariant } from '@/components/ui/Badge';
import { RECENT_INVOICE_STATUS_MAP } from '../config/constant';

export const getRecentInvoiceStatusVariant = (status: string): BadgeVariant => {
  return RECENT_INVOICE_STATUS_MAP[status] || 'neutral';
};
