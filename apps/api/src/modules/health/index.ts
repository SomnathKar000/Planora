// ────────────────────────────────────────────────────────────────
// Planora API — Health Module
// ────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { config } from '../../config/index.js';
import { sendSuccess } from '../../shared/response.js';

export function registerHealthRoutes(router: Router): Router {
  router.get('/health', (_req, res) => {
    sendSuccess(res, {
      status: 'ok',
      version: config.api.version,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
