import { Invoice } from '@/types';

export interface InvoicePrintTemplateProps {
  invoice: Invoice;
  isOwner: boolean;
  onRecordPaymentClick: () => void;
}
