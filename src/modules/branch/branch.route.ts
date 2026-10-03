import { Router } from 'express';
import { PERMISSIONS } from '../../constants/permissions';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission, somitiScoped } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { branchController } from './branch.controller';
import { createBranchSchema, updateBranchSchema } from './branch.validation';

const router = Router();

router.use(authenticate, somitiScoped);

router.get('/', requirePermission(PERMISSIONS.BRANCH_READ), branchController.list);

router.post(
  '/',
  requirePermission(PERMISSIONS.BRANCH_MANAGE),
  validate(createBranchSchema),
  branchController.create
);

router.patch(
  '/:id',
  requirePermission(PERMISSIONS.BRANCH_MANAGE),
  validate(updateBranchSchema),
  branchController.update
);

export const branchRoutes = router;
