import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/ApiResponse';
import { somitiService } from './somiti.service';

export const somitiController = {
  list: catchAsync(async (req: Request, res: Response) => {
    const somitis = await somitiService.list(req.user!);
    sendResponse(res, 200, 'Somitis fetched', somitis);
  }),

  getById: catchAsync(async (req: Request, res: Response) => {
    const somiti = await somitiService.getById(req.user!, req.params.id);
    sendResponse(res, 200, 'Somiti fetched', somiti);
  }),

  create: catchAsync(async (req: Request, res: Response) => {
    const result = await somitiService.create(req.user!, req.body);
    sendResponse(res, 201, 'Somiti created', result);
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const somiti = await somitiService.update(req.user!, req.params.id, req.body);
    sendResponse(res, 200, 'Somiti updated', somiti);
  }),
};
