import { z } from 'zod';

export const createBranchSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    code: z.string().trim().min(2).max(20).optional(),
    address: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    managerId: z.string().optional(),
    somitiId: z.string().optional(),
  }),
});

export const updateBranchSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    address: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    managerId: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const branchIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});
