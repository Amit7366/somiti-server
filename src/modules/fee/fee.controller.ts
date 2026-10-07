import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/ApiResponse';
import { feeService } from './fee.service';

export const feeController = {
  list: catchAsync(async (req: Request, res: Response) => {
    const fees = await feeService.list(req.user!, {
      areaId: req.query.areaId as string | undefined,
      feeType: req.query.feeType as string | undefined,
      search: req.query.search as string | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
      status: req.query.status as string | undefined,
    });
    sendResponse(res, 200, 'Fee collections fetched', fees);
  }),

  summary: catchAsync(async (req: Request, res: Response) => {
    const summary = await feeService.summary(req.user!);
    sendResponse(res, 200, 'Fee summary fetched', summary);
  }),

  getById: catchAsync(async (req: Request, res: Response) => {
    const fee = await feeService.getById(req.user!, req.params.id);
    sendResponse(res, 200, 'Fee collection fetched', fee);
  }),

  create: catchAsync(async (req: Request, res: Response) => {
    const fee = await feeService.create(req.user!, req.body);
    sendResponse(res, 201, 'Fee collection saved', fee);
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const fee = await feeService.update(req.user!, req.params.id, req.body);
    sendResponse(res, 200, 'Fee collection updated', fee);
  }),
};
