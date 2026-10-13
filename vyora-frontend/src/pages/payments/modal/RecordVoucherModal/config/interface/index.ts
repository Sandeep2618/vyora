import { PaymentMethod, PaymentType } from '@vyora/shared-types';

export interface RecordVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: PaymentType;
  onTypeChange: (type: PaymentType) => void;
  partyId: string;
  onPartyIdChange: (partyId: string) => void;
  partyOptions: { label: string; value: string }[];
  amountMajor: number | string;
  onAmountChange: (amount: string) => void;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  paymentDate: string;
  onPaymentDateChange: (date: string) => void;
  referenceNumber: string;
  onReferenceNumberChange: (ref: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}
