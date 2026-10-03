import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/ApiResponse';
import { branchService } from './branch.service';

export const branchController = {
  list: catchAsync(async (req: Request, res: Response) => {
    const branches = await branchService.list(req.user!);
    sendResponse(res, 200, 'Branches fetched', branches);
  }),

  create: catchAsync(async (req: Request, res: Response) => {
    const branch = await branchService.create(req.user!, req.body);
    sendResponse(res, 201, 'Branch created', branch);
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const branch = await branchService.update(req.user!, req.params.id, req.body);
    sendResponse(res, 200, 'Branch updated', branch);
  }),
};
