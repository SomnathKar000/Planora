// ────────────────────────────────────────────────────────────────
// Planora API — Replicate AI Image Editing Provider
// ────────────────────────────────────────────────────────────────
// Integrates with Replicate API for FLUX.1 Kontext / Flux Inpainting.
// Manages prediction lifecycle, polling, and failure recovery.
// ────────────────────────────────────────────────────────────────

import type {
  IImageEditProvider,
  ImageEditRequest,
  ImageEditJob,
  JobStatus,
} from '../provider.types.js';

interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[];
  error?: string;
  created_at: string;
  completed_at?: string;
}

export class ReplicateProvider implements IImageEditProvider {
  readonly name = 'replicate';
  private jobs = new Map<string, ImageEditJob>();

  constructor(
    private readonly apiToken?: string,
    private readonly model: string = 'black-forest-labs/flux-fill-pro'
  ) {}

  isConfigured(): boolean {
    return Boolean(this.apiToken && this.apiToken.trim().length > 0);
  }

  async createJob(request: ImageEditRequest): Promise<ImageEditJob> {
    if (!this.isConfigured()) {
      throw new Error('Replicate provider is not configured (missing REPLICATE_API_TOKEN)');
    }

    const initialJob: ImageEditJob = {
      id: `rep-pending-${Date.now()}`,
      status: 'pending',
      originalImageUrl: request.imageUrl,
      maskImageUrl: request.maskUrl,
      prompt: request.prompt,
      stylePreset: request.stylePreset,
      createdAt: new Date().toISOString(),
    };

    try {
      // Replicate model prediction endpoint
      const url = `https://api.replicate.com/v1/models/${this.model}/predictions`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            image: request.imageUrl,
            mask: request.maskUrl,
            prompt: request.prompt,
            negative_prompt: request.negativePrompt,
            guidance: request.guidanceScale ?? 7.5,
            output_format: 'png',
          },
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Replicate API error (${res.status}): ${errorText}`);
      }

      const prediction = (await res.json()) as ReplicatePrediction;
      const job: ImageEditJob = {
        id: prediction.id,
        status: this.mapStatus(prediction.status),
        originalImageUrl: request.imageUrl,
        maskImageUrl: request.maskUrl,
        prompt: request.prompt,
        stylePreset: request.stylePreset,
        createdAt: prediction.created_at,
      };

      this.jobs.set(prediction.id, job);
      return job;
    } catch (err: any) {
      const failedJob: ImageEditJob = {
        ...initialJob,
        status: 'failed',
        error: err.message || 'Unknown Replicate dispatch error',
        completedAt: new Date().toISOString(),
      };
      this.jobs.set(failedJob.id, failedJob);
      return failedJob;
    }
  }

  async getJob(jobId: string): Promise<ImageEditJob | null> {
    const existing = this.jobs.get(jobId);
    if (!existing || existing.status === 'succeeded' || existing.status === 'failed' || existing.status === 'cancelled') {
      return existing || null;
    }

    if (!this.isConfigured()) return existing;

    try {
      const res = await fetch(`https://api.replicate.com/v1/predictions/${jobId}`, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      });

      if (!res.ok) return existing;

      const prediction = (await res.json()) as ReplicatePrediction;
      existing.status = this.mapStatus(prediction.status);

      if (prediction.status === 'succeeded') {
        existing.resultImageUrl = Array.isArray(prediction.output)
          ? prediction.output[0]
          : prediction.output;
        existing.completedAt = prediction.completed_at || new Date().toISOString();
        existing.progress = 100;
      } else if (prediction.status === 'failed') {
        existing.error = prediction.error || 'Prediction failed';
        existing.completedAt = prediction.completed_at || new Date().toISOString();
      } else if (prediction.status === 'processing') {
        existing.progress = 60;
      }

      this.jobs.set(jobId, existing);
      return existing;
    } catch {
      return existing;
    }
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const existing = this.jobs.get(jobId);
    if (!existing) return false;

    if (!this.isConfigured()) {
      existing.status = 'cancelled';
      return true;
    }

    try {
      const res = await fetch(`https://api.replicate.com/v1/predictions/${jobId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      });
      if (res.ok) {
        existing.status = 'cancelled';
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private mapStatus(status: ReplicatePrediction['status']): JobStatus {
    switch (status) {
      case 'starting':
        return 'pending';
      case 'processing':
        return 'processing';
      case 'succeeded':
        return 'succeeded';
      case 'failed':
        return 'failed';
      case 'canceled':
        return 'cancelled';
      default:
        return 'pending';
    }
  }
}
