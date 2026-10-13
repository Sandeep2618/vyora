// Payments & Receipts Domain Types
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | 'CARD' | 'OTHER';
export type PaymentType = 'RECEIPT' | 'PAYMENT';

export interface PaymentRecord {
  id: string;
  businessId: string;
  paymentNumber: string;
  type: PaymentType;
  partyId: string;
  partyName: string;
  invoiceId?: string;
  purchaseBillId?: string;
  amountMinor: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
  idempotencyKey?: string;
  receivedByUserId: string;
  createdAt: string;
}
