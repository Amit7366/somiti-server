import mongoose, { Document, Schema, Types } from 'mongoose';

export const FEE_TYPES = [
  'ADMISSION',
  'FORM',
  'SERVICE_CHARGE',
  'LATE',
  'OTHER',
] as const;
export type FeeType = (typeof FEE_TYPES)[number];

export const FEE_PAYMENT_METHODS = ['CASH', 'MFS', 'BANK'] as const;
export type FeePaymentMethod = (typeof FEE_PAYMENT_METHODS)[number];

export const FEE_STATUSES = ['DRAFT', 'COMPLETED'] as const;
export type FeeStatus = (typeof FEE_STATUSES)[number];

export interface IFeeCollection extends Document {
  receiptNo: string;
  collectionDate: Date;
  feeType: FeeType;
  feeAmount: number;
  stampFee: number;
  otherFee: number;
  totalAmount: number;
  paymentMethod: FeePaymentMethod;
  remarks?: string;
  status: FeeStatus;
  printReceipt: boolean;
  sendSms: boolean;
  member: Types.ObjectId;
  area?: Types.ObjectId;
  branch?: Types.ObjectId;
  somiti: Types.ObjectId;
  collectedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const feeCollectionSchema = new Schema<IFeeCollection>(
  {
    receiptNo: { type: String, required: true, trim: true, uppercase: true },
    collectionDate: { type: Date, required: true, default: Date.now },
    feeType: { type: String, enum: FEE_TYPES, required: true },
    feeAmount: { type: Number, required: true, min: 0, default: 0 },
    stampFee: { type: Number, required: true, min: 0, default: 0 },
    otherFee: { type: Number, required: true, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0, default: 0 },
    paymentMethod: { type: String, enum: FEE_PAYMENT_METHODS, default: 'CASH' },
    remarks: { type: String, trim: true, maxlength: 500 },
    status: { type: String, enum: FEE_STATUSES, default: 'COMPLETED' },
    printReceipt: { type: Boolean, default: true },
    sendSms: { type: Boolean, default: false },
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    area: { type: Schema.Types.ObjectId, ref: 'Area' },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    somiti: { type: Schema.Types.ObjectId, ref: 'Somiti', required: true },
    collectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

feeCollectionSchema.index({ somiti: 1, receiptNo: 1 }, { unique: true });
feeCollectionSchema.index({ somiti: 1, collectionDate: -1 });
feeCollectionSchema.index({ member: 1, collectionDate: -1 });

export const FeeCollection = mongoose.model<IFeeCollection>('FeeCollection', feeCollectionSchema);
