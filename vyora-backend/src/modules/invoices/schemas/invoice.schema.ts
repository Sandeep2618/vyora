import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { InvoiceStatus, ItemUnit, TaxRatePercent } from '@vyora/shared-types';

export type InvoiceDocument = Invoice & Document;

@Schema({ _id: false })
export class InvoiceItemSnapshot {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  sku: string;

  @Prop()
  hsnCode?: string;

  @Prop({ type: String, required: true })
  unit: ItemUnit;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  unitPriceMinor: number;

  @Prop({ default: 0 })
  discountPercent: number;

  @Prop({ default: 0 })
  discountAmountMinor: number;

  @Prop({ required: true })
  taxableAmountMinor: number;

  @Prop({ type: Number, required: true })
  taxRatePercent: TaxRatePercent;

  @Prop({ default: 0 })
  cgstMinor: number;

  @Prop({ default: 0 })
  sgstMinor: number;

  @Prop({ default: 0 })
  igstMinor: number;

  @Prop({ default: 0 })
  totalTaxMinor: number;

  @Prop({ required: true })
  lineTotalMinor: number;
}

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true, type: String, ref: 'Business', index: true })
  businessId: string;

  @Prop({ required: true, index: true })
  invoiceNumber: string;

  @Prop({
    type: String,
    required: true,
    enum: ['DRAFT', 'FINALIZED', 'PAID', 'PARTIAL', 'UNPAID', 'CANCELLED'],
    default: 'DRAFT',
    index: true,
  })
  status: InvoiceStatus;

  @Prop({ required: true, type: String, ref: 'Party', index: true })
  customerId: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  customerSnapshot: {
    name: string;
    phone: string;
    email?: string;
    gstin?: string;
    address: string;
    state: string;
    stateCode?: string;
  };

  @Prop({ type: MongooseSchema.Types.Mixed })
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

  @Prop({ required: true })
  issueDate: string;

  @Prop({ required: true })
  dueDate: string;

  @Prop({ default: false })
  isInterState: boolean;

  @Prop({ type: [SchemaFactory.createForClass(InvoiceItemSnapshot)], required: true })
  items: InvoiceItemSnapshot[];

  @Prop({ required: true })
  subtotalMinor: number;

  @Prop({ default: 0 })
  totalDiscountMinor: number;

  @Prop({ required: true })
  totalTaxableAmountMinor: number;

  @Prop({ default: 0 })
  cgstMinor: number;

  @Prop({ default: 0 })
  sgstMinor: number;

  @Prop({ default: 0 })
  igstMinor: number;

  @Prop({ default: 0 })
  totalTaxMinor: number;

  @Prop({ default: 0 })
  roundOffMinor: number;

  @Prop({ required: true })
  grandTotalMinor: number;

  @Prop({ default: 0 })
  paidAmountMinor: number;

  @Prop({ required: true })
  dueAmountMinor: number;

  @Prop()
  notes?: string;

  @Prop()
  terms?: string;

  @Prop()
  cancelReason?: string;

  @Prop()
  cancelledAt?: string;

  @Prop({ type: String, ref: 'User' })
  cancelledByUserId?: string;

  @Prop({ type: String, ref: 'User' })
  createdByUserId: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
InvoiceSchema.index({ businessId: 1, invoiceNumber: 1 });
InvoiceSchema.index({ businessId: 1, status: 1 });
InvoiceSchema.index({ businessId: 1, createdAt: -1 });
