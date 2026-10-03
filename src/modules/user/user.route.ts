import { Router } from 'express';
import { PERMISSIONS } from '../../constants/permissions';
import { ROLES } from '../../constants/roles';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize, requirePermission, somitiScoped } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { userController } from './user.controller';
import {
  changeRoleSchema,
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from './user.validation';

const router = Router();

router.use(authenticate, somitiScoped);

router.get(
  '/',
  requirePermission(PERMISSIONS.USER_READ, PERMISSIONS.MEMBER_READ),
  userController.list
);

router.post(
  '/',
  requirePermission(PERMISSIONS.USER_WRITE),
  validate(createUserSchema),
  userController.create
);

router.get(
  '/:id',
  requirePermission(PERMISSIONS.USER_READ, PERMISSIONS.MEMBER_READ, PERMISSIONS.ACCOUNT_OWN_READ),
  validate(userIdParamSchema),
  userController.getById
);

router.patch(
  '/:id',
  requirePermission(PERMISSIONS.USER_WRITE, PERMISSIONS.MEMBER_WRITE, PERMISSIONS.ACCOUNT_OWN_READ),
  validate(updateUserSchema),
  userController.update
);

router.patch(
  '/:id/approve',
  requirePermission(PERMISSIONS.MEMBER_APPROVE),
  validate(userIdParamSchema),
  userController.approve
);

router.patch(
  '/:id/deactivate',
  requirePermission(PERMISSIONS.USER_WRITE),
  validate(userIdParamSchema),
  userController.deactivate
);

router.patch(
  '/:id/activate',
  requirePermission(PERMISSIONS.USER_WRITE),
  validate(userIdParamSchema),
  userController.activate
);

router.patch(
  '/:id/role',
  authorize(ROLES.SUPER_ADMIN, ROLES.SOMITI_ADMIN),
  validate(changeRoleSchema),
  userController.changeRole
);

export const userRoutes = router;
