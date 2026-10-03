import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IArea extends Document {
  name: string;
  somiti: Types.ObjectId;
  branch?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const areaSchema = new Schema<IArea>(
  {
    name: { type: String, required: true, trim: true },
    somiti: { type: Schema.Types.ObjectId, ref: 'Somiti', required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

areaSchema.index({ somiti: 1, name: 1 }, { unique: true });

export const Area = mongoose.model<IArea>('Area', areaSchema);
