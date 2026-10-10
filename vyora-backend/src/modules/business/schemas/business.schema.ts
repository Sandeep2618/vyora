import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BusinessDocument = Business & Document;

@Schema({ timestamps: true })
export class Business {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  legalName?: string;

  @Prop({ trim: true })
  gstin?: string;

  @Prop({ trim: true })
  pan?: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  addressLine1: string;

  @Prop()
  addressLine2?: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ default: '27' })
  stateCode?: string;

  @Prop({ required: true })
  pincode: string;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ default: 'INV-' })
  invoicePrefix: string;

  @Prop({ default: 4 })
  invoiceNumberPadding: number;

  @Prop({ default: 1 })
  nextInvoiceNumber: number;

  @Prop({ default: 'BILL-' })
  purchasePrefix: string;

  @Prop({ default: 1 })
  nextPurchaseNumber: number;

  @Prop()
  termsAndConditions?: string;

  @Prop({ required: true, type: String, ref: 'User' })
  ownerUserId: string;

  @Prop({ type: String, enum: ['starter', 'growth', 'enterprise'], default: 'growth' })
  subscriptionPlan: 'starter' | 'growth' | 'enterprise';
}

export const BusinessSchema = SchemaFactory.createForClass(Business);
