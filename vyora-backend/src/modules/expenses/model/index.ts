import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaymentMethod } from '@vyora/shared-types';

export interface IExpenseItemLine {
  itemName: string;
  quantity: number;
  rateMinor: number;
  amountMinor: number;
}

export interface IExpenseRecord extends Document {
  businessId: string;
  expenseNumber?: string;
  category: string;
  amountMinor: number;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  vendorName?: string;
  notes?: string;
  isGst?: boolean;
  items?: IExpenseItemLine[];
  createdByUserId: string;
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedByUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseRecordSchema = new Schema<IExpenseRecord>(
  {
    businessId: { type: String, required: true, ref: 'Business', index: true },
    expenseNumber: { type: String, trim: true },
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
    isGst: { type: Boolean, default: false },
    items: [
      {
        itemName: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        rateMinor: { type: Number, required: true, default: 0 },
        amountMinor: { type: Number, required: true, default: 0 },
      },
    ],
    createdByUserId: { type: String, required: true, ref: 'User' },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedByUserId: { type: String, ref: 'User' },
  },
  { timestamps: true },
);

ExpenseRecordSchema.index({ businessId: 1, expenseDate: -1 });
ExpenseRecordSchema.index({ businessId: 1, isDeleted: 1 });

export const ExpenseRecordModel: Model<IExpenseRecord> =
  mongoose.models.ExpenseRecord || mongoose.model<IExpenseRecord>('ExpenseRecord', ExpenseRecordSchema);
