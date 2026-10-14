// ────────────────────────────────────────────────────────────────
// Planora API — Staging Controller (HTTP → Service Bridge)
// ────────────────────────────────────────────────────────────────

import type { Request, Response } from 'express';
import type { StagingService } from './staging.service.js';
import { sendSuccess } from '../../shared/response.js';

export class StagingController {
  constructor(private readonly service: StagingService) {}

  stageProcedurally = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.stageProcedurally(req.body);
    sendSuccess(res, result);
  };

  getPresets = async (_req: Request, res: Response): Promise<void> => {
    const presets = this.service.getPresets();
    sendSuccess(res, presets);
  };

  createAiEditJob = async (req: Request, res: Response): Promise<void> => {
    const clientId =
      (req.headers['x-client-id'] as string) ||
      (req.headers['x-forwarded-for'] as string) ||
      req.ip ||
      'anonymous';

    const job = await this.service.createAiEditJob(clientId, req.body);
    sendSuccess(res, job, 201);
  };

  getJobStatus = async (req: Request, res: Response): Promise<void> => {
    const jobId = req.params.jobId as string;
    const job = await this.service.getJobStatus(jobId);
    sendSuccess(res, job);
  };

  cancelJob = async (req: Request, res: Response): Promise<void> => {
    const jobId = req.params.jobId as string;
    const result = await this.service.cancelJob(jobId);
    sendSuccess(res, result);
  };
}
