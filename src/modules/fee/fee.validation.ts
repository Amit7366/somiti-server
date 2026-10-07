import { z } from 'zod';
import { FEE_PAYMENT_METHODS, FEE_STATUSES, FEE_TYPES } from './fee.model';

const objectId = z.string().trim().min(1);

export const createFeeSchema = z.object({
  body: z.object({
    memberId: objectId,
    areaId: objectId.optional(),
    collectionDate: z.string().trim().min(4).optional(),
    feeType: z.enum(FEE_TYPES),
    feeAmount: z.number().min(0),
    stampFee: z.number().min(0).optional(),
    otherFee: z.number().min(0).optional(),
    paymentMethod: z.enum(FEE_PAYMENT_METHODS).optional(),
    remarks: z.string().trim().max(500).optional(),
    status: z.enum(FEE_STATUSES).optional(),
    printReceipt: z.boolean().optional(),
    sendSms: z.boolean().optional(),
  }),
});

export const updateFeeSchema = z.object({
  body: z
    .object({
      collectionDate: z.string().trim().min(4).optional(),
      feeType: z.enum(FEE_TYPES).optional(),
      feeAmount: z.number().min(0).optional(),
      stampFee: z.number().min(0).optional(),
      otherFee: z.number().min(0).optional(),
      paymentMethod: z.enum(FEE_PAYMENT_METHODS).optional(),
      remarks: z.string().trim().max(500).optional(),
      status: z.enum(FEE_STATUSES).optional(),
      printReceipt: z.boolean().optional(),
      sendSms: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' }),
});
