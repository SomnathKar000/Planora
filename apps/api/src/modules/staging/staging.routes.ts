// ────────────────────────────────────────────────────────────────
// Planora API — Staging Routes
// ────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { ProceduralStagingRequestSchema, AiImageEditRequestSchema } from '@planora/shared-types';
import type { StagingController } from './staging.controller.js';
import { validate, asyncHandler } from '../../middleware/index.js';

/**
 * Registers all staging & AI inpainting routes.
 */
export function registerStagingRoutes(router: Router, ctrl: StagingController): Router {
  // Procedural Interior Staging (100% offline, deterministic)
  router.post('/procedural', validate(ProceduralStagingRequestSchema), asyncHandler(ctrl.stageProcedurally));
  router.get('/presets', asyncHandler(ctrl.getPresets));

  // AI-Powered Image Editing & Inpainting
  router.post('/ai/edit', validate(AiImageEditRequestSchema), asyncHandler(ctrl.createAiEditJob));
  router.get('/ai/jobs/:jobId', asyncHandler(ctrl.getJobStatus));
  router.post('/ai/jobs/:jobId/cancel', asyncHandler(ctrl.cancelJob));

  return router;
}
