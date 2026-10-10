import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ItemUnit, TaxRatePercent } from '@vyora/shared-types';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, type: String, ref: 'Business', index: true })
  businessId: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, uppercase: true })
  sku: string;

  @Prop({ trim: true })
  hsnCode?: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: String, default: 'PCS', enum: ['PCS', 'BOX', 'KG', 'LTR', 'MTR', 'SET', 'UNT', 'PKT'] })
  unit: ItemUnit;

  @Prop({ required: true, default: 0 })
  sellingPriceMinor: number;

  @Prop({ required: true, default: 0 })
  purchasePriceMinor: number;

  @Prop({ type: Number, required: true, default: 18, enum: [0, 5, 12, 18, 28] })
  taxRatePercent: TaxRatePercent;

  @Prop({ default: 0 })
  openingStock: number;

  @Prop({ default: 0 })
  currentStock: number;

  @Prop({ default: 5 })
  reorderLevel: number;

  @Prop({ default: false, index: true })
  isArchived: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ businessId: 1, sku: 1 });
ProductSchema.index({ businessId: 1, isArchived: 1 });
