import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInventoryMovement extends Document {
  businessId: string;
  productId: string;
  movementType: string;
  referenceType?: string;
  referenceId?: string;
  quantityDelta: number;
  resultingStock: number;
  balanceAfter?: number;
  reason?: string;
  performedByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    businessId: { type: String, required: true, ref: 'Business', index: true },
    productId: { type: String, required: true, ref: 'Product', index: true },
    movementType: { type: String, required: true, index: true },
    referenceType: { type: String },
    referenceId: { type: String },
    quantityDelta: { type: Number, required: true },
    resultingStock: { type: Number, required: true },
    balanceAfter: { type: Number },
    reason: { type: String },
    performedByUserId: { type: String, required: true, ref: 'User' },
  },
  { timestamps: true },
);

InventoryMovementSchema.index({ businessId: 1, productId: 1, createdAt: -1 });

export const InventoryMovementModel: Model<IInventoryMovement> =
  mongoose.models.StockMovement ||
  mongoose.models.InventoryMovement ||
  mongoose.model<IInventoryMovement>('StockMovement', InventoryMovementSchema);
