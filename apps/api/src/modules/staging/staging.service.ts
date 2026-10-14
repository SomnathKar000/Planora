// ────────────────────────────────────────────────────────────────
// Planora API — Staging Service (Business Logic Layer)
// ────────────────────────────────────────────────────────────────

import { stageLayout, STAGING_PRESETS } from '@planora/layout-engine';
import type { ProceduralStagingInput, AiImageEditInput } from '@planora/shared-types';
import type { ProceduralStagingResult, StagingPreset, DesignStyle } from '@planora/domain';
import type { IProjectRepository } from '../projects/project.repository.js';
import type { IImageEditProvider, ImageEditJob } from './provider.types.js';
import type { QuotaManager } from './quota.manager.js';
import { NotFoundError, AppError, ValidationError } from '../../shared/errors.js';

export class StagingService {
  constructor(
    private readonly projectRepo: IProjectRepository,
    private readonly imageProvider: IImageEditProvider,
    private readonly quotaManager: QuotaManager
  ) {}

  /**
   * Runs the deterministic procedural staging layout engine on a project.
   */
  async stageProcedurally(input: ProceduralStagingInput): Promise<ProceduralStagingResult> {
    const project = await this.projectRepo.findById(input.projectId);
    if (!project) {
      throw new NotFoundError('Project', input.projectId);
    }

    // Determine target layout
    const targetLayoutId = input.layoutId || project.selectedLayoutId || project.layouts[0]?.id;
    const targetLayout = project.layouts.find((l: any) => l.id === targetLayoutId) || project.layouts[0];

    if (!targetLayout) {
      throw new ValidationError('Project has no existing layouts to stage.');
    }

    const stagingResult = stageLayout(targetLayout, {
      style: input.style as DesignStyle,
      density: input.density as any,
      preserveExistingFurniture: input.preserveExistingFurniture,
    });

    // Update project with staged layout
    const updatedLayouts = project.layouts.map((l: any) =>
      l.id === stagingResult.layout.id ? stagingResult.layout : l
    );

    project.layouts = updatedLayouts;
    project.updatedAt = new Date().toISOString();
    await this.projectRepo.update(project);

    return stagingResult;
  }

  /**
   * Returns list of architectural style presets with materials and lighting moods.
   */
  getPresets(): { presets: StagingPreset[]; provider: string } {
    return {
      presets: Object.values(STAGING_PRESETS),
      provider: this.imageProvider.name,
    };
  }

  /**
   * Submits an AI image editing (inpainting / style transfer) job.
   */
  async createAiEditJob(clientId: string, input: AiImageEditInput): Promise<ImageEditJob> {
    // 1. Enforce quota & rate limits
    const quota = this.quotaManager.checkQuota(clientId);
    if (!quota.allowed) {
      const waitMinutes = Math.ceil(quota.resetInMs / 60000);
      throw new AppError(
        429,
        'QUOTA_EXCEEDED',
        `Staging generation quota exceeded. Please wait ${waitMinutes} minute(s) before trying again.`
      );
    }

    // 2. Validate source image payload
    try {
      this.quotaManager.validateImagePayload(input.image, 'Source Image');
      if (input.mask) {
        this.quotaManager.validateImagePayload(input.mask, 'Mask Image');
      }
    } catch (err: any) {
      throw new ValidationError(err.message);
    }

    // 3. Dispatch to active provider
    const job = await this.imageProvider.createJob({
      imageUrl: input.image,
      maskUrl: input.mask,
      prompt: input.prompt,
      negativePrompt: input.negativePrompt,
      stylePreset: input.style,
      guidanceScale: input.guidanceScale,
    });

    // Record consumption if successfully accepted
    this.quotaManager.recordUsage(clientId);

    return job;
  }

  /**
   * Polls job status.
   */
  async getJobStatus(jobId: string): Promise<ImageEditJob> {
    const job = await this.imageProvider.getJob(jobId);
    if (!job) {
      throw new NotFoundError('ImageEditJob', jobId);
    }
    return job;
  }

  /**
   * Cancels a running job.
   */
  async cancelJob(jobId: string): Promise<{ success: boolean; message: string }> {
    const cancelled = await this.imageProvider.cancelJob(jobId);
    return {
      success: cancelled,
      message: cancelled ? 'Job cancelled successfully.' : 'Job could not be cancelled or already finished.',
    };
  }
}
