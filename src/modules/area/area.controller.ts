import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/ApiResponse';
import { areaService } from './area.service';

export const areaController = {
  list: catchAsync(async (req: Request, res: Response) => {
    const areas = await areaService.list(req.user!, {
      branchId: req.query.branchId as string | undefined,
    });
    sendResponse(res, 200, 'Areas fetched', areas);
  }),

  create: catchAsync(async (req: Request, res: Response) => {
    const area = await areaService.create(req.user!, req.body);
    sendResponse(res, 201, 'Area created', area);
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const area = await areaService.update(req.user!, req.params.id, req.body);
    sendResponse(res, 200, 'Area updated', area);
  }),
};
