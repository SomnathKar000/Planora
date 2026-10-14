// ────────────────────────────────────────────────────────────────
// Planora API — Auth Middleware
// ────────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from 'express';
import type { User } from '@planora/domain';
import type { AuthService } from './auth.service.js';
import { UnauthorizedError } from '../../shared/errors.js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function createAuthMiddleware(authService: AuthService) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Authentication token required'));
    }

    const token = authHeader.substring(7).trim();
    try {
      const user = await authService.verifySession(token);
      if (!user) {
        return next(new UnauthorizedError('Invalid or expired authentication session'));
      }
      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  };
}
