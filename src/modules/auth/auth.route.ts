import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { authController } from './auth.controller';
import { loginSchema, registerSchema, registerSomitiSchema } from './auth.validation';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/register-somiti', validate(registerSomitiSchema), authController.registerSomiti);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);
router.post('/logout', authController.logout);

export const authRoutes = router;
