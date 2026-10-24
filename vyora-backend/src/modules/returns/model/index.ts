import mongoose, { Schema, Document, Model } from 'mongoose';
import { ItemUnit, TaxRatePercent } from '@vyora/shared-types';

export interface IReturnItemSnapshot {
  productId: string;
  productName: string;
  sku: string;
  hsnCode?: string;
  unit: ItemUnit;
  quantity: number;
  unitPriceMinor: number;
  taxRatePercent: TaxRatePercent;
  taxableAmountMinor: number;
  cgstMinor: number;
  sgstMinor: number;
  igstMinor: number;
  totalMinor: number;
}

const ReturnItemSnapshotSchema = new Schema<IReturnItemSnapshot>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    hsnCode: { type: String },
    unit: { type: String, default: 'PCS' },
    quantity: { type: Number, required: true },
    unitPriceMinor: { type: Number, required: true },
    taxRatePercent: { type: Number, required: true },
    taxableAmountMinor: { type: Number, required: true },
    cgstMinor: { type: Number, default: 0 },
    sgstMinor: { type: Number, default: 0 },
    igstMinor: { type: Number, default: 0 },
    totalMinor: { type: Number, required: true },
  },
  { _id: false },
);

// Credit Note (Sales Return)
export interface ICreditNoteDocument extends Document {
  businessId: string;
  creditNoteNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  reason: string;
  items: IReturnItemSnapshot[];
  subtotalMinor: number;
  totalTaxMinor: number;
  grandTotalMinor: number;
  createdByUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CreditNoteSchema = new Schema<ICreditNoteDocument>(
  {
    businessId: { type: String, required: true, index: true },
    creditNoteNumber: { type: String, required: true },
    invoiceId: { type: String, required: true, index: true },
    invoiceNumber: { type: String, required: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    issueDate: { type: String, required: true },
    reason: { type: String, required: true },
    items: { type: [ReturnItemSnapshotSchema], required: true },
    subtotalMinor: { type: Number, required: true },
    totalTaxMinor: { type: Number, required: true },
    grandTotalMinor: { type: Number, required: true },
    createdByUserId: { type: String },
  },
  { timestamps: true },
);

CreditNoteSchema.index({ businessId: 1, creditNoteNumber: 1 }, { unique: true });

export const CreditNoteModel: Model<ICreditNoteDocument> =
  mongoose.models.CreditNote ||
  mongoose.model<ICreditNoteDocument>('CreditNote', CreditNoteSchema);

// Debit Note (Purchase Return)
export interface IDebitNoteDocument extends Document {
  businessId: string;
  debitNoteNumber: string;
  purchaseBillId: string;
  billNumber: string;
  supplierId: string;
  supplierName: string;
  issueDate: string;
  reason: string;
  items: IReturnItemSnapshot[];
  subtotalMinor: number;
  totalTaxMinor: number;
  grandTotalMinor: number;
  createdByUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DebitNoteSchema = new Schema<IDebitNoteDocument>(
  {
    businessId: { type: String, required: true, index: true },
    debitNoteNumber: { type: String, required: true },
    purchaseBillId: { type: String, required: true, index: true },
    billNumber: { type: String, required: true },
    supplierId: { type: String, required: true, index: true },
    supplierName: { type: String, required: true },
    issueDate: { type: String, required: true },
    reason: { type: String, required: true },
    items: { type: [ReturnItemSnapshotSchema], required: true },
    subtotalMinor: { type: Number, required: true },
    totalTaxMinor: { type: Number, required: true },
    grandTotalMinor: { type: Number, required: true },
    createdByUserId: { type: String },
  },
  { timestamps: true },
);

DebitNoteSchema.index({ businessId: 1, debitNoteNumber: 1 }, { unique: true });

export const DebitNoteModel: Model<IDebitNoteDocument> =
  mongoose.models.DebitNote ||
  mongoose.model<IDebitNoteDocument>('DebitNote', DebitNoteSchema);
