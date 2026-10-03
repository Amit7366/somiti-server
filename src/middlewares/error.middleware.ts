import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';

export function notFound(_req: Request, _res: Response, next: NextFunction): void {
  next(new ApiError(404, 'Route not found'));
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const apiError = err as ApiError & { code?: number };
  let statusCode = apiError.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (apiError.code === 11000) {
    statusCode = 409;
    message = 'A record with this unique value already exists';
  }

  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal server error';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: apiError.errors ?? null,
  });
}
