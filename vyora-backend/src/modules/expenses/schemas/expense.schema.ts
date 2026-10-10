import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PaymentMethod } from '@vyora/shared-types';

export type ExpenseRecordDocument = ExpenseRecord & Document;

@Schema({ timestamps: true })
export class ExpenseRecord {
  @Prop({ required: true, type: String, ref: 'Business', index: true })
  businessId: string;

  @Prop({ required: true, trim: true, index: true })
  category: string;

  @Prop({ required: true })
  amountMinor: number;

  @Prop({ required: true })
  expenseDate: string;

  @Prop({
    required: true,
    enum: ['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'CARD', 'OTHER'],
  })
  paymentMethod: PaymentMethod;

  @Prop({ trim: true })
  vendorName?: string;

  @Prop()
  notes?: string;

  @Prop({ required: true, type: String, ref: 'User' })
  createdByUserId: string;
}

export const ExpenseRecordSchema = SchemaFactory.createForClass(ExpenseRecord);
ExpenseRecordSchema.index({ businessId: 1, expenseDate: -1 });
