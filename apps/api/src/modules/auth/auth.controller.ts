// ────────────────────────────────────────────────────────────────
// Planora API — Auth Controller (HTTP Handling Layer)
// ────────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from 'express';
import type { AuthService } from './auth.service.js';
import { RegisterDtoSchema, LoginDtoSchema } from './auth.types.js';
import { sendSuccess } from '../../shared/response.js';
import { ValidationError } from '../../shared/errors.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = RegisterDtoSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid registration details', {
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const result = await this.authService.register(parsed.data);
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = LoginDtoSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid login credentials', {
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const result = await this.authService.login(parsed.data);
      sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new ValidationError('User session not attached');
      }
      sendSuccess(res, req.user, 200);
    } catch (err) {
      next(err);
    }
  };
}
