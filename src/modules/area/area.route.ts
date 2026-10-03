import { Router } from 'express';
import { PERMISSIONS } from '../../constants/permissions';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission, somitiScoped } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { areaController } from './area.controller';
import { createAreaSchema, updateAreaSchema } from './area.validation';

const router = Router();

router.use(authenticate, somitiScoped);

router.get('/', requirePermission(PERMISSIONS.CENTER_READ, PERMISSIONS.BRANCH_READ), areaController.list);

router.post(
  '/',
  requirePermission(PERMISSIONS.CENTER_MANAGE, PERMISSIONS.BRANCH_MANAGE),
  validate(createAreaSchema),
  areaController.create
);

router.patch(
  '/:id',
  requirePermission(PERMISSIONS.CENTER_MANAGE, PERMISSIONS.BRANCH_MANAGE),
  validate(updateAreaSchema),
  areaController.update
);

export const areaRoutes = router;
