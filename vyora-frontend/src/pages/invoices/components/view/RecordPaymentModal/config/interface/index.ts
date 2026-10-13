import { PaymentMethod } from '@/types';

export interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceNumber: string;
  dueAmountMinor: number;
  payAmountMajor: number | string;
  onPayAmountChange: (val: string) => void;
  payMethod: PaymentMethod;
  onPayMethodChange: (val: PaymentMethod) => void;
  payRef: string;
  onPayRefChange: (val: string) => void;
  payNotes: string;
  onPayNotesChange: (val: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}
