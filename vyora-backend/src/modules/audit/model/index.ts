import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  businessId: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'INVOICE' | 'PURCHASE' | 'PAYMENT' | 'STOCK' | 'PRODUCT' | 'PARTY' | 'BUSINESS';
  entityId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    businessId: { type: String, required: true, ref: 'Business', index: true },
    userId: { type: String, required: true, ref: 'User' },
    userName: { type: String, required: true },
    action: { type: String, required: true },
    entityType: {
      type: String,
      required: true,
      enum: ['INVOICE', 'PURCHASE', 'PAYMENT', 'STOCK', 'PRODUCT', 'PARTY', 'BUSINESS'],
    },
    entityId: { type: String, required: true },
    details: { type: Object },
    ipAddress: { type: String },
  },
  { timestamps: true },
);

AuditLogSchema.index({ businessId: 1, createdAt: -1 });

export const AuditLogModel: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
