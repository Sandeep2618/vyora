import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { StockMovementType } from '@vyora/shared-types';

export type StockMovementDocument = StockMovement & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class StockMovement {
  @Prop({ required: true, type: String, ref: 'Business', index: true })
  businessId: string;

  @Prop({ required: true, type: String, ref: 'Product', index: true })
  productId: string;

  @Prop({
    type: String,
    required: true,
    enum: [
      'OPENING',
      'SALE',
      'PURCHASE',
      'ADJUSTMENT_IN',
      'ADJUSTMENT_OUT',
      'SALE_CANCEL',
      'PURCHASE_CANCEL',
    ],
    index: true,
  })
  movementType: StockMovementType;

  @Prop({ required: true })
  quantityDelta: number; // positive for addition, negative for deduction

  @Prop({ required: true })
  resultingStock: number;

  @Prop()
  reason?: string;

  @Prop({
    required: true,
    enum: ['INVOICE', 'PURCHASE', 'MANUAL_ADJUSTMENT', 'INITIAL_SETUP'],
  })
  referenceType: string;

  @Prop({ index: true })
  referenceId?: string;

  @Prop({ required: true, type: String, ref: 'User' })
  performedByUserId: string;
}

export const StockMovementSchema = SchemaFactory.createForClass(StockMovement);
StockMovementSchema.index({ businessId: 1, productId: 1, createdAt: -1 });
