import mongoose, { Schema, Document, Model } from 'mongoose';
import { InvoiceStatus, ItemUnit, TaxRatePercent, InvoiceItemLine } from '@vyora/shared-types';

export interface IInvoiceItemSnapshot {
  productId: string;
  productName: string;
  sku: string;
  hsnCode?: string;
  unit: ItemUnit;
  quantity: number;
  unitPriceMinor: number;
  discountPercent: number;
  discountAmountMinor: number;
  taxableAmountMinor: number;
  taxRatePercent: TaxRatePercent;
  cgstMinor: number;
  sgstMinor: number;
  igstMinor: number;
  totalTaxMinor: number;
  lineTotalMinor: number;
}

const InvoiceItemSnapshotSchema = new Schema<IInvoiceItemSnapshot>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    hsnCode: { type: String },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPriceMinor: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    discountAmountMinor: { type: Number, default: 0 },
    taxableAmountMinor: { type: Number, required: true },
    taxRatePercent: { type: Number, required: true },
    cgstMinor: { type: Number, default: 0 },
    sgstMinor: { type: Number, default: 0 },
    igstMinor: { type: Number, default: 0 },
    totalTaxMinor: { type: Number, default: 0 },
    lineTotalMinor: { type: Number, required: true },
  },
  { _id: false },
);

export interface IInvoice extends Document {
  businessId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  customerId: string;
  customerSnapshot: {
    name: string;
    phone: string;
    email?: string;
    gstin?: string;
    address: string;
    state: string;
    stateCode?: string;
  };
  businessSnapshot?: {
    name: string;
    legalName?: string;
    phone: string;
    email: string;
    gstin?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  issueDate: string;
  dueDate: string;
  isInterState: boolean;
  items: IInvoiceItemSnapshot[];
  subtotalMinor: number;
  totalDiscountMinor: number;
  totalTaxableAmountMinor: number;
  cgstMinor: number;
  sgstMinor: number;
  igstMinor: number;
  totalTaxMinor: number;
  roundOffMinor: number;
  grandTotalMinor: number;
  paidAmountMinor: number;
  dueAmountMinor: number;
  notes?: string;
  terms?: string;
  cancelReason?: string;
  cancelledAt?: string;
  cancelledByUserId?: string;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    businessId: { type: String, required: true, ref: 'Business', index: true },
    invoiceNumber: { type: String, required: true, index: true },
    status: {
      type: String,
      required: true,
      enum: ['DRAFT', 'FINALIZED', 'PAID', 'PARTIAL', 'UNPAID', 'CANCELLED'],
      default: 'DRAFT',
      index: true,
    },
    customerId: { type: String, required: true, ref: 'Party', index: true },
    customerSnapshot: { type: Schema.Types.Mixed, required: true },
    businessSnapshot: { type: Schema.Types.Mixed },
    issueDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    isInterState: { type: Boolean, default: false },
    items: { type: [InvoiceItemSnapshotSchema], required: true },
    subtotalMinor: { type: Number, required: true },
    totalDiscountMinor: { type: Number, default: 0 },
    totalTaxableAmountMinor: { type: Number, required: true },
    cgstMinor: { type: Number, default: 0 },
    sgstMinor: { type: Number, default: 0 },
    igstMinor: { type: Number, default: 0 },
    totalTaxMinor: { type: Number, default: 0 },
    roundOffMinor: { type: Number, default: 0 },
    grandTotalMinor: { type: Number, required: true },
    paidAmountMinor: { type: Number, default: 0 },
    dueAmountMinor: { type: Number, required: true },
    notes: { type: String },
    terms: { type: String },
    cancelReason: { type: String },
    cancelledAt: { type: String },
    cancelledByUserId: { type: String, ref: 'User' },
    createdByUserId: { type: String, required: true, ref: 'User' },
  },
  { timestamps: true },
);

InvoiceSchema.index({ businessId: 1, invoiceNumber: 1 });
InvoiceSchema.index({ businessId: 1, status: 1 });
InvoiceSchema.index({ businessId: 1, createdAt: -1 });

export const InvoiceModel: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
