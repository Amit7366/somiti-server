import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';
import { verifyToken } from '../utils/token';
import { User } from '../modules/user/user.model';

export const authenticate = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  const cookieToken = req.cookies?.[env.cookieName] as string | undefined;
  const token = bearer || cookieToken;

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }
  const user = await User.findById(payload.id);

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid or inactive account');
  }

  req.user = {
    id: user._id.toString(),
    role: user.role,
    somitiId: user.somiti?.toString(),
    branchId: user.branch?.toString(),
  };

  next();
});
