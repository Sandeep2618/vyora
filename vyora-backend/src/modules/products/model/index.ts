import mongoose, { Schema, Document, Model } from 'mongoose';
import { ItemUnit, TaxRatePercent } from '@vyora/shared-types';

export interface IProduct extends Document {
  businessId: string;
  name: string;
  sku: string;
  hsnCode?: string;
  description?: string;
  imageUrl?: string;
  unit: ItemUnit;
  sellingPriceMinor: number;
  purchasePriceMinor: number;
  taxRatePercent: TaxRatePercent;
  openingStock: number;
  currentStock: number;
  reorderLevel: number;
  isArchived: boolean;
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedByUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    businessId: { type: String, required: true, ref: 'Business', index: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true, uppercase: true },
    hsnCode: { type: String, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    unit: {
      type: String,
      default: 'PCS',
      enum: ['PCS', 'BOX', 'KG', 'LTR', 'MTR', 'SET', 'UNT', 'PKT'],
    },
    sellingPriceMinor: { type: Number, required: true, default: 0 },
    purchasePriceMinor: { type: Number, required: true, default: 0 },
    taxRatePercent: {
      type: Number,
      required: true,
      default: 18,
      enum: [0, 0.25, 3, 5, 12, 18, 28],
    },
    openingStock: { type: Number, default: 0 },
    currentStock: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 5 },
    isArchived: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedByUserId: { type: String, ref: 'User' },
  },
  { timestamps: true },
);

ProductSchema.index({ businessId: 1, sku: 1 });
ProductSchema.index({ businessId: 1, isArchived: 1 });
ProductSchema.index({ businessId: 1, isDeleted: 1 });

export const ProductModel: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
