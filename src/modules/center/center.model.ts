import mongoose, { Document, Schema, Types } from 'mongoose';
import { MEETING_DAYS, type MeetingDay } from '../../constants/meetingDays';

export interface ICenter extends Document {
  name: string;
  somiti: Types.ObjectId;
  branch: Types.ObjectId;
  area?: Types.ObjectId;
  leaderName?: string;
  leaderMobile?: string;
  meetingDay?: MeetingDay;
  meetingTime?: string;
  fieldWorker?: Types.ObjectId;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const centerSchema = new Schema<ICenter>(
  {
    name: { type: String, required: true, trim: true },
    somiti: { type: Schema.Types.ObjectId, ref: 'Somiti', required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    area: { type: Schema.Types.ObjectId, ref: 'Area' },
    leaderName: { type: String, trim: true },
    leaderMobile: { type: String, trim: true },
    meetingDay: { type: String, enum: MEETING_DAYS },
    meetingTime: { type: String, trim: true },
    fieldWorker: { type: Schema.Types.ObjectId, ref: 'User' },
    address: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

centerSchema.index({ branch: 1, name: 1 }, { unique: true });
centerSchema.index({ somiti: 1, createdAt: -1 });

export const Center = mongoose.model<ICenter>('Center', centerSchema);
