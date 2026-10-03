import { Router } from 'express';
import { PERMISSIONS } from '../../constants/permissions';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission, somitiScoped } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { centerController } from './center.controller';
import { createCenterSchema, updateCenterSchema } from './center.validation';

const router = Router();

router.use(authenticate, somitiScoped);

router.get('/', requirePermission(PERMISSIONS.CENTER_READ, PERMISSIONS.BRANCH_READ), centerController.list);

router.post(
  '/',
  requirePermission(PERMISSIONS.CENTER_MANAGE, PERMISSIONS.BRANCH_MANAGE),
  validate(createCenterSchema),
  centerController.create
);

router.get(
  '/:id',
  requirePermission(PERMISSIONS.CENTER_READ, PERMISSIONS.BRANCH_READ),
  centerController.getById
);

router.patch(
  '/:id',
  requirePermission(PERMISSIONS.CENTER_MANAGE, PERMISSIONS.BRANCH_MANAGE),
  validate(updateCenterSchema),
  centerController.update
);

export const centerRoutes = router;
