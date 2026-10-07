import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/ApiResponse';
import { memberService } from './member.service';

export const memberController = {
  list: catchAsync(async (req: Request, res: Response) => {
    const members = await memberService.list(req.user!, {
      areaId: req.query.areaId as string | undefined,
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
    });
    sendResponse(res, 200, 'Members fetched', members);
  }),

  getById: catchAsync(async (req: Request, res: Response) => {
    const member = await memberService.getById(req.user!, req.params.id);
    sendResponse(res, 200, 'Member fetched', member);
  }),

  create: catchAsync(async (req: Request, res: Response) => {
    const member = await memberService.create(req.user!, req.body);
    sendResponse(res, 201, 'Member created', member);
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const member = await memberService.update(req.user!, req.params.id, req.body);
    sendResponse(res, 200, 'Member updated', member);
  }),
};
