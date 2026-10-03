import { z } from 'zod';

const adminSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(10).max(20),
  email: z.string().email(),
  password: z.string().min(6),
});

export const createSomitiSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    code: z.string().trim().min(2).max(20),
    address: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    email: z.string().email().optional(),
    registrationNo: z.string().trim().optional(),
    collectionFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    admin: adminSchema.optional(),
  }),
});

export const updateSomitiSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    address: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    email: z.string().email().optional(),
    registrationNo: z.string().trim().optional(),
    isActive: z.boolean().optional(),
    settings: z
      .object({
        currency: z.string().optional(),
        collectionFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
      })
      .optional(),
    subscription: z
      .object({
        plan: z.string().optional(),
        status: z.enum(['trial', 'active', 'expired', 'cancelled']).optional(),
        expiresAt: z.string().optional(),
      })
      .optional(),
  }),
});

export const somitiIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});
