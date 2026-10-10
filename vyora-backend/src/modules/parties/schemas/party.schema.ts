import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PartyType } from '@vyora/shared-types';

export type PartyDocument = Party & Document;

@Schema({ _id: false })
export class Address {
  @Prop({ required: true })
  line1: string;

  @Prop()
  line2?: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ default: '27' })
  stateCode?: string;

  @Prop({ required: true })
  pincode: string;
}

@Schema({ timestamps: true })
export class Party {
  @Prop({ required: true, type: String, ref: 'Business', index: true })
  businessId: string;

  @Prop({ type: String, required: true, enum: ['CUSTOMER', 'SUPPLIER', 'BOTH'], index: true })
  type: PartyType;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  contactPerson?: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ lowercase: true, trim: true })
  email?: string;

  @Prop({ trim: true, uppercase: true })
  gstin?: string;

  @Prop({ trim: true, uppercase: true })
  pan?: string;

  @Prop({ required: true, type: Address })
  billingAddress: Address;

  @Prop({ type: Address })
  shippingAddress?: Address;

  @Prop({ default: 0 })
  openingBalanceMinor: number;

  @Prop({ default: 0 })
  currentBalanceMinor: number; // positive = party owes business (receivable); negative = business owes party (payable)

  @Prop()
  creditLimitMinor?: number;

  @Prop({ default: false, index: true })
  isArchived: boolean;
}

export const PartySchema = SchemaFactory.createForClass(Party);
PartySchema.index({ businessId: 1, type: 1, isArchived: 1 });
PartySchema.index({ businessId: 1, name: 1 });
