import { NextFunction, Request, Response } from 'express';
import { hasAnyPermission, type Permission } from '../constants/permissions';
import { ROLES, type Role } from '../constants/roles';
import { ApiError } from '../utils/ApiError';

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, 'Authentication required'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ApiError(403, 'You do not have access to this resource'));
      return;
    }
    next();
  };
}

export function requirePermission(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, 'Authentication required'));
      return;
    }
    if (!hasAnyPermission(req.user.role, permissions)) {
      next(new ApiError(403, 'Insufficient permission'));
      return;
    }
    next();
  };
}

export function somitiScoped(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new ApiError(401, 'Authentication required'));
    return;
  }
  if (req.user.role === ROLES.SUPER_ADMIN) {
    next();
    return;
  }
  if (!req.user.somitiId) {
    next(new ApiError(403, 'No somiti is assigned to this account'));
    return;
  }
  next();
}
