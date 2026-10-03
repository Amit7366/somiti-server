import { CookieOptions, Response } from 'express';
import { env } from '../config/env';

export function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(env.cookieName, token, cookieOptions());
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(env.cookieName, { ...cookieOptions(), maxAge: 0 });
}
