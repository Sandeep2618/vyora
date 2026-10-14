import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaymentMethod, PaymentType } from '@vyora/shared-types';

export interface IPayment extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    businessId: { type: String, required: true, ref: 'Business', index: true },
    paymentNumber: { type: String, required: true, index: true },
    type: { type: String, required: true, enum: ['RECEIPT', 'PAYMENT'], index: true },
    partyId: { type: String, required: true, ref: 'Party', index: true },
    partyName: { type: String, required: true },
    invoiceId: { type: String, ref: 'Invoice', index: true },
    purchaseBillId: { type: String, ref: 'PurchaseBill', index: true },
    amountMinor: { type: Number, required: true },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'CARD', 'OTHER'],
    },
    referenceNumber: { type: String, trim: true },
    paymentDate: { type: String, required: true },
    notes: { type: String },
    idempotencyKey: { type: String, trim: true, index: true },
    receivedByUserId: { type: String, required: true, ref: 'User' },
  },
  { timestamps: true },
);

PaymentSchema.index({ businessId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });
PaymentSchema.index({ businessId: 1, createdAt: -1 });

export const PaymentModel: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
