import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PaymentMethod, PaymentType } from '@vyora/shared-types';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true, type: String, ref: 'Business', index: true })
  businessId: string;

  @Prop({ required: true, index: true })
  paymentNumber: string;

  @Prop({ type: String, required: true, enum: ['RECEIPT', 'PAYMENT'], index: true })
  type: PaymentType;

  @Prop({ required: true, type: String, ref: 'Party', index: true })
  partyId: string;

  @Prop({ required: true })
  partyName: string;

  @Prop({ type: String, ref: 'Invoice', index: true })
  invoiceId?: string;

  @Prop({ type: String, ref: 'PurchaseBill', index: true })
  purchaseBillId?: string;

  @Prop({ required: true })
  amountMinor: number;

  @Prop({
    type: String,
    required: true,
    enum: ['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'CARD', 'OTHER'],
  })
  paymentMethod: PaymentMethod;

  @Prop({ trim: true })
  referenceNumber?: string;

  @Prop({ required: true })
  paymentDate: string;

  @Prop()
  notes?: string;

  @Prop({ trim: true, index: true })
  idempotencyKey?: string;

  @Prop({ required: true, type: String, ref: 'User' })
  receivedByUserId: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.index({ businessId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });
PaymentSchema.index({ businessId: 1, createdAt: -1 });
