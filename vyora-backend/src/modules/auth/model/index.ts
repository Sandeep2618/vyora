import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from '@vyora/shared-types';

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  phoneVerified: boolean;
  passwordHash?: string;
  role: UserRole;
  roles: UserRole[];
  defaultBusinessId?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, sparse: true, index: true },
    phone: { type: String, trim: true, sparse: true, index: true },
    phoneVerified: { type: Boolean, default: false },
    passwordHash: { type: String },
    role: {
      type: String,
      default: 'OWNER',
      enum: ['OWNER', 'STAFF', 'CUSTOMER', 'ADMIN'],
    },
    roles: {
      type: [String],
      enum: ['OWNER', 'STAFF', 'CUSTOMER', 'ADMIN'],
      default: ['OWNER'],
    },
    defaultBusinessId: { type: String, ref: 'Business', index: true },
    avatarUrl: { type: String },
  },
  { timestamps: true },
);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
