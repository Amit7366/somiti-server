import { Response } from 'express';

export function sendResponse<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): Response {
  return res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data: data ?? null,
  });
}
