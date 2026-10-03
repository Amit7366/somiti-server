import { z } from 'zod';
import { ROLES } from '../../constants/roles';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    phone: z.string().trim().min(10).max(20),
    email: z.string().email().optional(),
    password: z.string().min(6),
    role: z.nativeEnum(ROLES),
    somitiId: z.string().optional(),
    branchId: z.string().optional(),
    nid: z.string().trim().optional(),
    address: z.string().trim().optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    email: z.string().email().optional(),
    phone: z.string().trim().min(10).max(20).optional(),
    nid: z.string().trim().optional(),
    address: z.string().trim().optional(),
    branchId: z.string().nullable().optional(),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const changeRoleSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    role: z.nativeEnum(ROLES).refine((role) => role !== ROLES.SUPER_ADMIN, {
      message: 'Cannot assign super admin through this endpoint',
    }),
  }),
});
