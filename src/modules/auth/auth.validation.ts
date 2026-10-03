import { z } from 'zod';

const phone = z
  .string()
  .trim()
  .min(10, 'Phone must be at least 10 digits')
  .max(20);

const password = z.string().min(6, 'Password must be at least 6 characters');

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    phone,
    email: z.string().email().optional(),
    password,
    somitiCode: z.string().trim().min(2).max(20),
    nid: z.string().trim().optional(),
    address: z.string().trim().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().trim().min(3, 'Email or phone is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const PLAN_VALUES = [
  'trial',
  'starter',
  'basic',
  'standard',
  'professional',
  'business',
  'enterprise',
] as const;

export const registerSomitiSchema = z.object({
  body: z.object({
    institutionName: z.string().trim().min(2).max(120),
    somitiType: z.string().trim().min(2).max(80),
    address: z.string().trim().min(3).max(200),
    contactPhone: z
      .string()
      .trim()
      .max(20)
      .optional()
      .transform((value) => (value ? value : undefined)),
    phone,
    password,
    plan: z.enum(PLAN_VALUES),
    acceptedTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms' }),
    }),
  }),
});
