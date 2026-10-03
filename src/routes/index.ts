import { Router } from 'express';
import { ROLE_LIST, ROLE_META } from '../constants/roles';
import { ROLE_PERMISSIONS } from '../constants/permissions';
import { authRoutes } from '../modules/auth/auth.route';
import { userRoutes } from '../modules/user/user.route';
import { somitiRoutes } from '../modules/somiti/somiti.route';
import { branchRoutes } from '../modules/branch/branch.route';
import { dashboardRoutes } from '../modules/dashboard/dashboard.route';
import { areaRoutes } from '../modules/area/area.route';
import { centerRoutes } from '../modules/center/center.route';

export const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'SomitySolution API is running' });
});

router.get('/roles', (_req, res) => {
  res.json({
    success: true,
    message: 'Roles',
    data: ROLE_LIST.map((role) => ({
      key: role,
      ...ROLE_META[role],
      permissions: ROLE_PERMISSIONS[role],
    })),
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/somitis', somitiRoutes);
router.use('/branches', branchRoutes);
router.use('/areas', areaRoutes);
router.use('/centers', centerRoutes);
router.use('/dashboard', dashboardRoutes);
