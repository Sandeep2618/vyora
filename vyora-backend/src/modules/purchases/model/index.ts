import mongoose, { Schema, Document, Model } from 'mongoose';
import { PurchaseStatus, ItemUnit, TaxRatePercent } from '@vyora/shared-types';

export interface IPurchaseItemSnapshot {
  productId: string;
  productName: string;
  sku: string;
  unit: ItemUnit;
  quantity: number;
  unitPriceMinor: number;
  taxRatePercent: TaxRatePercent;
  taxableAmountMinor: number;
  cgstMinor?: number;
  sgstMinor?: number;
  igstMinor?: number;
  totalTaxMinor: number;
  lineTotalMinor: number;
}

const PurchaseItemSnapshotSchema = new Schema<IPurchaseItemSnapshot>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPriceMinor: { type: Number, required: true },
    taxRatePercent: { type: Number, required: true },
    taxableAmountMinor: { type: Number, required: true },
    cgstMinor: { type: Number, default: 0 },
    sgstMinor: { type: Number, default: 0 },
    igstMinor: { type: Number, default: 0 },
    totalTaxMinor: { type: Number, required: true },
    lineTotalMinor: { type: Number, required: true },
  },
  { _id: false },
);

export interface IPurchaseBill extends Document {
  businessId: string;
  billNumber: string;
  supplierId: string;
  supplierSnapshot: {
    name: string;
    phone: string;
    gstin?: string;
    state?: string;
    stateCode?: string;
  };
  billDate: string;
  dueDate?: string;
  status: PurchaseStatus;
  items: IPurchaseItemSnapshot[];
  subtotalMinor: number;
  cgstMinor?: number;
  sgstMinor?: number;
  igstMinor?: number;
  isInterState?: boolean;
  totalTaxMinor: number;
  grandTotalMinor: number;
  paidAmountMinor: number;
  dueAmountMinor: number;
  notes?: string;
  createdByUserId: string;
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedByUserId?: string;
  deleteReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseBillSchema = new Schema<IPurchaseBill>(
  {
    businessId: { type: String, required: true, ref: 'Business', index: true },
    billNumber: { type: String, required: true, index: true },
    supplierId: { type: String, required: true, ref: 'Party', index: true },
    supplierSnapshot: { type: Schema.Types.Mixed, required: true },
    billDate: { type: String, required: true },
    dueDate: { type: String },
    status: {
      type: String,
      required: true,
      enum: ['RECEIVED', 'PAID', 'PARTIAL', 'UNPAID', 'CANCELLED'],
      default: 'RECEIVED',
    },
    items: { type: [PurchaseItemSnapshotSchema], required: true },
    subtotalMinor: { type: Number, required: true },
    cgstMinor: { type: Number, default: 0 },
    sgstMinor: { type: Number, default: 0 },
    igstMinor: { type: Number, default: 0 },
    isInterState: { type: Boolean, default: false },
    totalTaxMinor: { type: Number, default: 0 },
    grandTotalMinor: { type: Number, required: true },
    paidAmountMinor: { type: Number, default: 0 },
    dueAmountMinor: { type: Number, required: true },
    notes: { type: String },
    createdByUserId: { type: String, required: true, ref: 'User' },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedByUserId: { type: String, ref: 'User' },
    deleteReason: { type: String },
  },
  { timestamps: true },
);

PurchaseBillSchema.index({ businessId: 1, billNumber: 1 });
PurchaseBillSchema.index({ businessId: 1, isDeleted: 1 });
PurchaseBillSchema.index({ businessId: 1, createdAt: -1 });

export const PurchaseBillModel: Model<IPurchaseBill> =
  mongoose.models.PurchaseBill || mongoose.model<IPurchaseBill>('PurchaseBill', PurchaseBillSchema);
