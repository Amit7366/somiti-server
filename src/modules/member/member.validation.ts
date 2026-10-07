import { z } from 'zod';
import { MEMBER_CATEGORIES, MEMBER_STATUSES } from './member.model';

const objectId = z.string().trim().min(1);
const mediaUrl = z.string().trim().max(500).optional().or(z.literal(''));

const nomineeSchema = z.object({
  name: z.string().trim().min(2).max(80),
  mobile: z.string().trim().min(10).max(20),
  relation: z.string().trim().max(40).optional(),
  nationalId: z.string().trim().max(40).optional(),
  sharePercent: z.number().min(0).max(100),
  address: z.string().trim().max(200).optional(),
  photoUrl: mediaUrl,
  signatureUrl: mediaUrl,
  isPrimary: z.boolean().optional(),
});

export const createMemberSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(80),
      mobile: z.string().trim().min(10).max(20),
      category: z.enum(MEMBER_CATEGORIES).optional(),
      status: z.enum(MEMBER_STATUSES).optional(),
      joinDate: z.string().trim().min(4).optional(),
      address: z.string().trim().max(300).optional(),
      areaId: objectId.optional(),
      branchId: objectId.optional(),
      assignedStaffId: objectId.optional(),
      nid: z.string().trim().max(40).optional(),
      fatherOrHusbandName: z.string().trim().max(80).optional(),
      motherOrWifeName: z.string().trim().max(80).optional(),
      annualIncome: z.number().min(0).optional(),
      photoUrl: z.string().trim().optional(),
      signatureUrl: z.string().trim().optional(),
      nidFrontUrl: z.string().trim().optional(),
      nidBackUrl: z.string().trim().optional(),
      nominees: z.array(nomineeSchema).min(1).max(10),
    })
    .superRefine((data, ctx) => {
      const total = data.nominees.reduce((sum, n) => sum + n.sharePercent, 0);
      if (Math.abs(total - 100) > 0.01) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nominee share percentages must total 100%',
          path: ['nominees'],
        });
      }
    }),
});

export const updateMemberSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    mobile: z.string().trim().min(10).max(20).optional(),
    category: z.enum(MEMBER_CATEGORIES).optional(),
    status: z.enum(MEMBER_STATUSES).optional(),
    joinDate: z.string().trim().min(4).optional(),
    address: z.string().trim().max(300).optional(),
    areaId: objectId.nullable().optional(),
    branchId: objectId.nullable().optional(),
    assignedStaffId: objectId.nullable().optional(),
    nid: z.string().trim().max(40).optional(),
    fatherOrHusbandName: z.string().trim().max(80).optional(),
    motherOrWifeName: z.string().trim().max(80).optional(),
    annualIncome: z.number().min(0).optional(),
    photoUrl: z.string().trim().optional(),
    signatureUrl: z.string().trim().optional(),
    nidFrontUrl: z.string().trim().optional(),
    nidBackUrl: z.string().trim().optional(),
    nominees: z.array(nomineeSchema).min(1).max(10).optional(),
    isActive: z.boolean().optional(),
    admissionFee: z.number().min(0).optional(),
    permanentAddress: z.string().trim().max(300).optional(),
    gender: z.string().trim().max(20).optional(),
    dateOfBirth: z.string().trim().min(4).optional(),
    occupation: z.string().trim().max(80).optional(),
    accountControls: z
      .object({
        profileFrozen: z.boolean(),
        savingsFrozen: z.boolean(),
        dpsFrozen: z.boolean(),
        fdrFrozen: z.boolean(),
        loanFrozen: z.boolean(),
      })
      .optional(),
  }),
});
