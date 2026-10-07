import { Router } from 'express';
import { PERMISSIONS } from '../../constants/permissions';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission, somitiScoped } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { memberController } from './member.controller';
import { createMemberSchema, updateMemberSchema } from './member.validation';

const router = Router();

router.use(authenticate, somitiScoped);

router.get('/', requirePermission(PERMISSIONS.MEMBER_READ), memberController.list);

router.post(
  '/',
  requirePermission(PERMISSIONS.MEMBER_WRITE),
  validate(createMemberSchema),
  memberController.create
);

router.get('/:id', requirePermission(PERMISSIONS.MEMBER_READ), memberController.getById);

router.patch(
  '/:id',
  requirePermission(PERMISSIONS.MEMBER_WRITE),
  validate(updateMemberSchema),
  memberController.update
);

export const memberRoutes = router;
