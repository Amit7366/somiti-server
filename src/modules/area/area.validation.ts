import { z } from 'zod';

const objectId = z.string().trim().min(1);

export const createAreaSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    branchId: objectId.optional(),
  }),
});

export const updateAreaSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    branchId: objectId.nullable().optional(),
    isActive: z.boolean().optional(),
  }),
});
