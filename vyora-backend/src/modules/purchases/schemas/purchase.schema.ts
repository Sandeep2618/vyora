import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { PurchaseStatus, ItemUnit, TaxRatePercent } from '@vyora/shared-types';

export type PurchaseBillDocument = PurchaseBill & Document;

@Schema({ _id: false })
export class PurchaseItemSnapshot {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  sku: string;

  @Prop({ type: String, required: true })
  unit: ItemUnit;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  unitPriceMinor: number;

  @Prop({ type: Number, required: true })
  taxRatePercent: TaxRatePercent;

  @Prop({ required: true })
  taxableAmountMinor: number;

  @Prop({ required: true })
  totalTaxMinor: number;

  @Prop({ required: true })
  lineTotalMinor: number;
}

@Schema({ timestamps: true })
export class PurchaseBill {
  @Prop({ required: true, type: String, ref: 'Business', index: true })
  businessId: string;

  @Prop({ required: true, index: true })
  billNumber: string;

  @Prop({ required: true, type: String, ref: 'Party', index: true })
  supplierId: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  supplierSnapshot: {
    name: string;
    phone: string;
    gstin?: string;
    state?: string;
  };

  @Prop({ required: true })
  billDate: string;

  @Prop()
  dueDate?: string;

  @Prop({
    type: String,
    required: true,
    enum: ['RECEIVED', 'PAID', 'PARTIAL', 'UNPAID', 'CANCELLED'],
    default: 'RECEIVED',
  })
  status: PurchaseStatus;

  @Prop({ type: [SchemaFactory.createForClass(PurchaseItemSnapshot)], required: true })
  items: PurchaseItemSnapshot[];

  @Prop({ required: true })
  subtotalMinor: number;

  @Prop({ default: 0 })
  totalTaxMinor: number;

  @Prop({ required: true })
  grandTotalMinor: number;

  @Prop({ default: 0 })
  paidAmountMinor: number;

  @Prop({ required: true })
  dueAmountMinor: number;

  @Prop()
  notes?: string;

  @Prop({ required: true, type: String, ref: 'User' })
  createdByUserId: string;
}

export const PurchaseBillSchema = SchemaFactory.createForClass(PurchaseBill);
PurchaseBillSchema.index({ businessId: 1, billNumber: 1 });
PurchaseBillSchema.index({ businessId: 1, createdAt: -1 });
