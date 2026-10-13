// ────────────────────────────────────────────────────────────────
// Planora API — Project Routes
// ────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { CreateProjectSchema, UpdateProjectSchema } from '@planora/shared-types';
import type { ProjectController } from './project.controller.js';
import { validate, asyncHandler } from '../../middleware/index.js';

/**
 * Registers all `/projects` routes on the given router.
 * Each route is wrapped with asyncHandler and optional validation middleware.
 */
export function registerProjectRoutes(router: Router, ctrl: ProjectController): Router {
  router.get('/',                        asyncHandler(ctrl.list));
  router.get('/:id',                     asyncHandler(ctrl.getById));
  router.post('/',          validate(CreateProjectSchema), asyncHandler(ctrl.create));
  router.put('/:id',        validate(UpdateProjectSchema), asyncHandler(ctrl.update));
  router.delete('/:id',                  asyncHandler(ctrl.remove));
  router.post('/:id/layouts/generate',   asyncHandler(ctrl.generateLayouts));

  return router;
}
