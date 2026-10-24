import mongoose, { Schema, Document, Model } from 'mongoose';
import { PartyType } from '@vyora/shared-types';

export interface IAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  pincode?: string;
}

const AddressSchema = new Schema<IAddress>(
  {
    line1: { type: String, default: '' },
    line2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    stateCode: { type: String, default: '' },
    pincode: { type: String, default: '' },
  },
  { _id: false },
);

export interface IParty extends Document {
  businessId: string;
  type: PartyType;
  name: string;
  contactPerson?: string;
  phone?: string;
  isWalkIn?: boolean;
  email?: string;
  gstin?: string;
  pan?: string;
  billingAddress: IAddress;
  shippingAddress?: IAddress;
  openingBalanceMinor: number;
  currentBalanceMinor: number;
  creditLimitMinor?: number;
  isArchived: boolean;
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedByUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PartySchema = new Schema<IParty>(
  {
    businessId: { type: String, required: true, ref: 'Business', index: true },
    type: {
      type: String,
      required: true,
      enum: ['CUSTOMER', 'SUPPLIER', 'BOTH'],
      index: true,
    },
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true },
    phone: { type: String, default: '', trim: true },
    isWalkIn: { type: Boolean, default: false, index: true },
    email: { type: String, lowercase: true, trim: true },
    gstin: { type: String, trim: true, uppercase: true },
    pan: { type: String, trim: true, uppercase: true },
    billingAddress: { type: AddressSchema, default: () => ({}) },
    shippingAddress: { type: AddressSchema },
    openingBalanceMinor: { type: Number, default: 0 },
    currentBalanceMinor: { type: Number, default: 0 },
    creditLimitMinor: { type: Number },
    isArchived: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedByUserId: { type: String, ref: 'User' },
  },
  { timestamps: true },
);

PartySchema.index({ businessId: 1, type: 1, isArchived: 1 });
PartySchema.index({ businessId: 1, isDeleted: 1 });
PartySchema.index({ businessId: 1, name: 1 });

export const PartyModel: Model<IParty> =
  mongoose.models.Party || mongoose.model<IParty>('Party', PartySchema);
