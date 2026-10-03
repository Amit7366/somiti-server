import { MEETING_DAYS } from '../../constants/meetingDays';
import { z } from 'zod';

const objectId = z.string().trim().min(1);

export const createCenterSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    branchId: objectId,
    areaId: objectId.optional(),
    leaderName: z.string().trim().max(80).optional(),
    leaderMobile: z.string().trim().max(20).optional(),
    meetingDay: z.enum(MEETING_DAYS).optional(),
    meetingTime: z.string().trim().max(10).optional(),
    fieldWorkerId: objectId.optional(),
    address: z.string().trim().max(200).optional(),
  }),
});

export const updateCenterSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    branchId: objectId.optional(),
    areaId: objectId.nullable().optional(),
    leaderName: z.string().trim().max(80).optional(),
    leaderMobile: z.string().trim().max(20).optional(),
    meetingDay: z.enum(MEETING_DAYS).nullable().optional(),
    meetingTime: z.string().trim().max(10).optional(),
    fieldWorkerId: objectId.nullable().optional(),
    address: z.string().trim().max(200).optional(),
    isActive: z.boolean().optional(),
  }),
});
