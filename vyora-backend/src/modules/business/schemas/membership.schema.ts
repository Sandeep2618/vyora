import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '@vyora/shared-types';

export type MembershipDocument = Membership & Document;

@Schema({ timestamps: true })
export class Membership {
  @Prop({ required: true, type: String, ref: 'User', index: true })
  userId: string;

  @Prop({ required: true, type: String, ref: 'Business', index: true })
  businessId: string;

  @Prop({ type: String, required: true, default: 'STAFF', enum: ['OWNER', 'STAFF', 'ADMIN'] })
  role: UserRole;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);
MembershipSchema.index({ userId: 1, businessId: 1 }, { unique: true });
