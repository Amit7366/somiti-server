import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBranch extends Document {
  name: string;
  code: string;
  somiti: Types.ObjectId;
  address?: string;
  phone?: string;
  manager?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    somiti: { type: Schema.Types.ObjectId, ref: 'Somiti', required: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    manager: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

branchSchema.index({ somiti: 1, code: 1 }, { unique: true });

branchSchema.virtual('centers', {
  ref: 'Center',
  localField: '_id',
  foreignField: 'branch',
});

branchSchema.set('toJSON', { virtuals: true });
branchSchema.set('toObject', { virtuals: true });

export const Branch = mongoose.model<IBranch>('Branch', branchSchema);
