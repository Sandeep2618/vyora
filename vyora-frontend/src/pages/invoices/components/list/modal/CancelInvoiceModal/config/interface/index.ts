import { Invoice } from '@/types';

export interface CancelInvoiceModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}
