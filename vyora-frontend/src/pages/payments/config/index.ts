import { PaymentMethod } from '@vyora/shared-types';

export type PaymentTypeFilter = 'ALL' | 'RECEIPT' | 'PAYMENT';

export const PAYMENT_TYPE_FILTER_OPTIONS: { value: PaymentTypeFilter; label: string }[] = [
  { value: 'ALL', label: 'All Vouchers' },
  { value: 'RECEIPT', label: 'Receipt (Inflow)' },
  { value: 'PAYMENT', label: 'Payment (Outflow)' },
];

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Methods' },
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer / IMPS / NEFT' },
  { value: 'UPI', label: 'UPI / QR Code' },
  { value: 'CHEQUE', label: 'Cheque' },
];
