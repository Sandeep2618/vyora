import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class AuditLog {
  @Prop({ required: true, type: String, ref: 'Business', index: true })
  businessId: string;

  @Prop({ required: true, type: String, ref: 'User' })
  userId: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true, index: true })
  action: string;

  @Prop({
    required: true,
    enum: ['INVOICE', 'PURCHASE', 'PAYMENT', 'STOCK', 'PRODUCT', 'PARTY', 'BUSINESS'],
    index: true,
  })
  entityType: string;

  @Prop({ required: true, index: true })
  entityId: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  details?: Record<string, any>;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ businessId: 1, createdAt: -1 });
