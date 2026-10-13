import { InvoiceStatus } from '@/types';
import { BadgeVariant } from '@/components/ui/Badge';
import { INVOICE_STATUS_VARIANT_MAP } from '../config/constant';

export const getStatusVariant = (status: InvoiceStatus): BadgeVariant => {
  return INVOICE_STATUS_VARIANT_MAP[status] ?? 'neutral';
};
