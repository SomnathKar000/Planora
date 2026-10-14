// ────────────────────────────────────────────────────────────────
// Planora API — Auth Routes
// ────────────────────────────────────────────────────────────────

import { Router } from 'express';
import type { AuthController } from './auth.controller.js';
import type { RequestHandler } from 'express';

export function createAuthRouter(controller: AuthController, authMiddleware: RequestHandler): Router {
  const router = Router();

  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.get('/me', authMiddleware, controller.getMe);

  return router;
}
