import { Request, Response } from 'express';
import { Role } from '../../constants/roles';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/ApiResponse';
import { userService } from './user.service';

export const userController = {
  list: catchAsync(async (req: Request, res: Response) => {
    const users = await userService.list(req.user!, {
      role: req.query.role as string | undefined,
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
    });
    sendResponse(res, 200, 'Users fetched', users);
  }),

  getById: catchAsync(async (req: Request, res: Response) => {
    const user = await userService.getById(req.user!, req.params.id);
    sendResponse(res, 200, 'User fetched', user);
  }),

  create: catchAsync(async (req: Request, res: Response) => {
    const user = await userService.create(req.user!, req.body);
    sendResponse(res, 201, 'User created', user);
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const user = await userService.update(req.user!, req.params.id, req.body);
    sendResponse(res, 200, 'User updated', user);
  }),

  approve: catchAsync(async (req: Request, res: Response) => {
    const user = await userService.approve(req.user!, req.params.id);
    sendResponse(res, 200, 'Member approved', user);
  }),

  deactivate: catchAsync(async (req: Request, res: Response) => {
    const user = await userService.setActive(req.user!, req.params.id, false);
    sendResponse(res, 200, 'User deactivated', user);
  }),

  activate: catchAsync(async (req: Request, res: Response) => {
    const user = await userService.setActive(req.user!, req.params.id, true);
    sendResponse(res, 200, 'User activated', user);
  }),

  changeRole: catchAsync(async (req: Request, res: Response) => {
    const user = await userService.changeRole(
      req.user!,
      req.params.id,
      req.body.role as Role
    );
    sendResponse(res, 200, 'Role updated', user);
  }),
};
