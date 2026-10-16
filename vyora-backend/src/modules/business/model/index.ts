import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole, SubscriptionPlan } from '@vyora/shared-types';

export interface IBusiness extends Document {
  name: string;
  legalName?: string;
  logoUrl?: string;
  gstin?: string;
  pan?: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  stateCode?: string;
  pincode: string;
  currency: string;
  invoicePrefix: string;
  invoiceNumberPadding: number;
  nextInvoiceNumber: number;
  purchasePrefix: string;
  nextPurchaseNumber: number;
  termsAndConditions?: string;
  ownerUserId: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus?: 'active' | 'expired' | 'trial';
  subscriptionExpiresAt?: Date;
  upiId?: string;
  staffPermissions: {
    invoices: boolean;
    parties: boolean;
    products: boolean;
    inventory: boolean;
    purchases: boolean;
    payments: boolean;
    reports: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    name: { type: String, required: true, trim: true },
    legalName: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
    gstin: { type: String, trim: true, uppercase: true },
    pan: { type: String, trim: true, uppercase: true },
    upiId: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    stateCode: { type: String, default: '27' },
    pincode: { type: String, required: true },
    currency: { type: String, default: 'INR' },
    invoicePrefix: { type: String, default: 'INV-' },
    invoiceNumberPadding: { type: Number, default: 4 },
    nextInvoiceNumber: { type: Number, default: 1 },
    purchasePrefix: { type: String, default: 'BILL-' },
    nextPurchaseNumber: { type: Number, default: 1 },
    termsAndConditions: { type: String },
    ownerUserId: { type: String, required: true, index: true },
    subscriptionPlan: {
      type: String,
      enum: ['starter', 'free', 'growth', 'enterprise'],
      default: 'growth',
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'expired', 'trial'],
      default: 'active',
    },
    subscriptionExpiresAt: { type: Date },
    staffPermissions: {
      type: Object,
      default: {
        invoices: true,
        parties: true,
        products: true,
        inventory: true,
        purchases: true,
        payments: true,
        reports: false,
      },
    },
  },
  { timestamps: true },
);

export interface IMembership extends Document {
  userId: string;
  businessId: string;
  role: UserRole;
  permissions: string[];
  status?: string;
  invitedBy?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<IMembership>(
  {
    userId: { type: String, required: true, index: true },
    businessId: { type: String, required: true, index: true },
    role: {
      type: String,
      required: true,
      default: 'STAFF',
      enum: ['OWNER', 'STAFF', 'CUSTOMER', 'ADMIN'],
    },
    permissions: {
      type: [String],
      default: ['POS_CREATE_INVOICE', 'INVENTORY_VIEW_STOCK'],
    },
    status: { type: String, default: 'ACTIVE' },
    invitedBy: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

MembershipSchema.index({ userId: 1, businessId: 1 }, { unique: true });

export const BusinessModel: Model<IBusiness> =
  mongoose.models.Business || mongoose.model<IBusiness>('Business', BusinessSchema);

export const MembershipModel: Model<IMembership> =
  mongoose.models.Membership || mongoose.model<IMembership>('Membership', MembershipSchema);
