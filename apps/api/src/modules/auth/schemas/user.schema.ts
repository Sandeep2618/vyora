import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '@vyora/shared-types';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: String, default: 'OWNER', enum: ['OWNER', 'STAFF', 'ADMIN'] })
  role: UserRole;

  @Prop({ type: String, ref: 'Business', index: true })
  defaultBusinessId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
