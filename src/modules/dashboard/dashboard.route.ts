import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { somitiScoped } from '../../middlewares/authorize.middleware';
import { dashboardController } from './dashboard.controller';

const router = Router();

router.use(authenticate, somitiScoped);
router.get('/summary', dashboardController.summary);

export const dashboardRoutes = router;
