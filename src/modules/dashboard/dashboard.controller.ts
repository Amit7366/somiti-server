import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/ApiResponse';
import { dashboardService } from './dashboard.service';
import { ROLE_META } from '../../constants/roles';
import { ROLE_PERMISSIONS } from '../../constants/permissions';

export const dashboardController = {
  summary: catchAsync(async (req: Request, res: Response) => {
    const summary = await dashboardService.summary(req.user!);
    sendResponse(res, 200, 'Dashboard summary', {
      ...summary,
      role: req.user!.role,
      roleMeta: ROLE_META[req.user!.role],
      permissions: ROLE_PERMISSIONS[req.user!.role],
    });
  }),
};
