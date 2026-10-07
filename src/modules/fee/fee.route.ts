import { Router } from 'express';
import { PERMISSIONS } from '../../constants/permissions';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission, somitiScoped } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { feeController } from './fee.controller';
import { createFeeSchema, updateFeeSchema } from './fee.validation';

const router = Router();

router.use(authenticate, somitiScoped);

router.get('/', requirePermission(PERMISSIONS.COLLECTION_ENTRY, PERMISSIONS.MEMBER_READ), feeController.list);
router.get(
  '/summary',
  requirePermission(PERMISSIONS.COLLECTION_ENTRY, PERMISSIONS.MEMBER_READ),
  feeController.summary
);
router.post('/', requirePermission(PERMISSIONS.COLLECTION_ENTRY, PERMISSIONS.MEMBER_WRITE), validate(createFeeSchema), feeController.create);
router.get('/:id', requirePermission(PERMISSIONS.COLLECTION_ENTRY, PERMISSIONS.MEMBER_READ), feeController.getById);
router.patch(
  '/:id',
  requirePermission(PERMISSIONS.COLLECTION_ENTRY, PERMISSIONS.MEMBER_WRITE),
  validate(updateFeeSchema),
  feeController.update
);

export const feeRoutes = router;
