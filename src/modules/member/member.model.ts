import mongoose, { Document, Schema, Types } from 'mongoose';

export const MEMBER_CATEGORIES = [
  'GENERAL',
  'MONTHLY_SAVINGS',
  'DAILY_SAVINGS',
  'BORROWER',
  'SPECIAL',
] as const;
export type MemberCategory = (typeof MEMBER_CATEGORIES)[number];

export const MEMBER_STATUSES = ['ACTIVE', 'INACTIVE', 'CLOSED'] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export interface INominee {
  name: string;
  mobile: string;
  relation?: string;
  nationalId?: string;
  sharePercent: number;
  address?: string;
  photoUrl?: string;
  signatureUrl?: string;
  isPrimary: boolean;
}

export interface IMember extends Document {
  code: string;
  name: string;
  mobile: string;
  category: MemberCategory;
  status: MemberStatus;
  joinDate: Date;
  address?: string;
  nid?: string;
  fatherOrHusbandName?: string;
  motherOrWifeName?: string;
  annualIncome?: number;
  photoUrl?: string;
  signatureUrl?: string;
  nidFrontUrl?: string;
  nidBackUrl?: string;
  somiti: Types.ObjectId;
  branch?: Types.ObjectId;
  area?: Types.ObjectId;
  assignedStaff?: Types.ObjectId;
  user?: Types.ObjectId;
  createdBy?: Types.ObjectId;
  nominees: INominee[];
  admissionFee?: number;
  passbookNo?: string;
  permanentAddress?: string;
  gender?: string;
  dateOfBirth?: Date;
  occupation?: string;
  accountControls?: {
    profileFrozen: boolean;
    savingsFrozen: boolean;
    dpsFrozen: boolean;
    fdrFrozen: boolean;
    loanFrozen: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const nomineeSchema = new Schema<INominee>(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    relation: { type: String, trim: true },
    nationalId: { type: String, trim: true },
    sharePercent: { type: Number, required: true, min: 0, max: 100, default: 100 },
    address: { type: String, trim: true },
    photoUrl: { type: String, trim: true },
    signatureUrl: { type: String, trim: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: true }
);

const memberSchema = new Schema<IMember>(
  {
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    category: { type: String, enum: MEMBER_CATEGORIES, default: 'GENERAL' },
    status: { type: String, enum: MEMBER_STATUSES, default: 'ACTIVE' },
    joinDate: { type: Date, required: true, default: Date.now },
    address: { type: String, trim: true },
    nid: { type: String, trim: true },
    fatherOrHusbandName: { type: String, trim: true },
    motherOrWifeName: { type: String, trim: true },
    annualIncome: { type: Number, min: 0 },
    photoUrl: { type: String, trim: true },
    signatureUrl: { type: String, trim: true },
    nidFrontUrl: { type: String, trim: true },
    nidBackUrl: { type: String, trim: true },
    somiti: { type: Schema.Types.ObjectId, ref: 'Somiti', required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    area: { type: Schema.Types.ObjectId, ref: 'Area' },
    assignedStaff: { type: Schema.Types.ObjectId, ref: 'User' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    nominees: { type: [nomineeSchema], default: [] },
    admissionFee: { type: Number, min: 0, default: 0 },
    passbookNo: { type: String, trim: true },
    permanentAddress: { type: String, trim: true },
    gender: { type: String, trim: true },
    dateOfBirth: { type: Date },
    occupation: { type: String, trim: true },
    accountControls: {
      profileFrozen: { type: Boolean, default: false },
      savingsFrozen: { type: Boolean, default: false },
      dpsFrozen: { type: Boolean, default: false },
      fdrFrozen: { type: Boolean, default: false },
      loanFrozen: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

memberSchema.index({ somiti: 1, code: 1 }, { unique: true });
memberSchema.index({ somiti: 1, mobile: 1 }, { unique: true });
memberSchema.index({ somiti: 1, area: 1 });
memberSchema.index({ somiti: 1, status: 1 });

export const Member = mongoose.model<IMember>('Member', memberSchema);
