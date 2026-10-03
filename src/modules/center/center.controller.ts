import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/ApiResponse';
import { centerService } from './center.service';

export const centerController = {
  list: catchAsync(async (req: Request, res: Response) => {
    const centers = await centerService.list(req.user!, {
      branchId: req.query.branchId as string | undefined,
      areaId: req.query.areaId as string | undefined,
    });
    sendResponse(res, 200, 'Centers fetched', centers);
  }),

  getById: catchAsync(async (req: Request, res: Response) => {
    const center = await centerService.getById(req.user!, req.params.id);
    sendResponse(res, 200, 'Center fetched', center);
  }),

  create: catchAsync(async (req: Request, res: Response) => {
    const center = await centerService.create(req.user!, req.body);
    sendResponse(res, 201, 'Center created', center);
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const center = await centerService.update(req.user!, req.params.id, req.body);
    sendResponse(res, 200, 'Center updated', center);
  }),
};
