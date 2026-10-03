import bcrypt from 'bcryptjs';
import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { ROLE_LIST, ROLES, type Role } from '../../constants/roles';

export interface IUser extends Document {
  name: string;
  email?: string;
  phone: string;
  password: string;
  role: Role;
  somiti?: Types.ObjectId;
  branch?: Types.ObjectId;
  nid?: string;
  address?: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {
  hashPassword(plain: string): Promise<string>;
}

const userSchema = new Schema<IUser, IUserModel>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      unique: true,
    },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ROLE_LIST, required: true, default: ROLES.MEMBER },
    somiti: { type: Schema.Types.ObjectId, ref: 'Somiti' },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    nid: { type: String, trim: true },
    address: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ somiti: 1, role: 1 });
userSchema.index({ somiti: 1, isApproved: 1 });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.statics.hashPassword = function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
};

export const User = mongoose.model<IUser, IUserModel>('User', userSchema);
