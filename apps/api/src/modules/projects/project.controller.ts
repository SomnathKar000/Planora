// ────────────────────────────────────────────────────────────────
// Planora API — Project Controller (HTTP → Service Bridge)
// ────────────────────────────────────────────────────────────────

import type { Request, Response } from 'express';
import type { ProjectService } from './project.service.js';
import { sendSuccess, sendPaginated } from '../../shared/response.js';

/**
 * Thin controller — maps HTTP semantics to service calls
 * and delegates response formatting to shared helpers.
 * No business logic lives here.
 */
export class ProjectController {
  constructor(private readonly service: ProjectService) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const projects = this.service.listProjects();
    sendPaginated(res, projects);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const project = this.service.getProject(id);
    sendSuccess(res, project);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const project = this.service.createProject(req.body);
    sendSuccess(res, project, 201);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const project = this.service.updateProject(id, req.body);
    sendSuccess(res, project);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    this.service.deleteProject(id);
    sendSuccess(res, { deleted: true });
  };

  generateLayouts = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const candidateCount = req.body.candidateCount;
    const result = this.service.generateLayouts(id, candidateCount);
    sendSuccess(res, result);
  };
}
