import mongoose, { Document, Schema, Types } from 'mongoose';

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled';
export type CollectionFrequency = 'daily' | 'weekly' | 'monthly';

export interface ISomiti extends Document {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  registrationNo?: string;
  establishedAt?: Date;
  subscription: {
    plan: string;
    status: SubscriptionStatus;
    expiresAt?: Date;
  };
  settings: {
    currency: string;
    collectionFrequency: CollectionFrequency;
    somitiType?: string;
  };
  createdBy?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const somitiSchema = new Schema<ISomiti>(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    registrationNo: { type: String, trim: true },
    establishedAt: { type: Date },
    subscription: {
      plan: { type: String, default: 'standard' },
      status: {
        type: String,
        enum: ['trial', 'active', 'expired', 'cancelled'],
        default: 'trial',
      },
      expiresAt: { type: Date },
    },
    settings: {
      currency: { type: String, default: 'BDT' },
      collectionFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly',
      },
      somitiType: { type: String, trim: true },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Somiti = mongoose.model<ISomiti>('Somiti', somitiSchema);
