import { Router } from 'express';
import { PERMISSIONS } from '../../constants/permissions';
import { ROLES } from '../../constants/roles';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize, requirePermission, somitiScoped } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { somitiController } from './somiti.controller';
import {
  createSomitiSchema,
  somitiIdParamSchema,
  updateSomitiSchema,
} from './somiti.validation';

const router = Router();

router.use(authenticate, somitiScoped);

router.get('/', requirePermission(PERMISSIONS.SOMITI_READ), somitiController.list);

router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN),
  validate(createSomitiSchema),
  somitiController.create
);

router.get(
  '/:id',
  requirePermission(PERMISSIONS.SOMITI_READ),
  validate(somitiIdParamSchema),
  somitiController.getById
);

router.patch(
  '/:id',
  requirePermission(PERMISSIONS.SOMITI_UPDATE, PERMISSIONS.SETTINGS_SOMITI),
  validate(updateSomitiSchema),
  somitiController.update
);

export const somitiRoutes = router;
