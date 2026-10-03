import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/ApiResponse';
import { clearAuthCookie, setAuthCookie } from '../../utils/cookie';
import { authService } from './auth.service';

export const authController = {
  register: catchAsync(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    setAuthCookie(res, result.token);
    sendResponse(res, 201, 'Registration successful. Waiting for approval.', result);
  }),

  registerSomiti: catchAsync(async (req: Request, res: Response) => {
    const result = await authService.registerSomiti(req.body);
    setAuthCookie(res, result.token);
    sendResponse(res, 201, 'Somiti registered. 7-day free trial started.', result);
  }),

  login: catchAsync(async (req: Request, res: Response) => {
    const { identifier, password } = req.body as { identifier: string; password: string };
    const result = await authService.login(identifier, password);
    setAuthCookie(res, result.token);
    sendResponse(res, 200, 'Login successful', result);
  }),

  me: catchAsync(async (req: Request, res: Response) => {
    const user = await authService.me(req.user!.id);
    sendResponse(res, 200, 'Current user', user);
  }),

  logout: catchAsync(async (_req: Request, res: Response) => {
    clearAuthCookie(res);
    sendResponse(res, 200, 'Logged out');
  }),
};
