import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaymentMethod } from '@vyora/shared-types';

export interface IExpenseRecord extends Document {
  businessId: string;
  category: string;
  amountMinor: number;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  vendorName?: string;
  notes?: string;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseRecordSchema = new Schema<IExpenseRecord>(
  {
    businessId: { type: String, required: true, ref: 'Business', index: true },
    category: { type: String, required: true, trim: true, index: true },
    amountMinor: { type: Number, required: true },
    expenseDate: { type: String, required: true },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'CARD', 'OTHER'],
    },
    vendorName: { type: String, trim: true },
    notes: { type: String },
    createdByUserId: { type: String, required: true, ref: 'User' },
  },
  { timestamps: true },
);

ExpenseRecordSchema.index({ businessId: 1, expenseDate: -1 });

export const ExpenseRecordModel: Model<IExpenseRecord> =
  mongoose.models.ExpenseRecord || mongoose.model<IExpenseRecord>('ExpenseRecord', ExpenseRecordSchema);
