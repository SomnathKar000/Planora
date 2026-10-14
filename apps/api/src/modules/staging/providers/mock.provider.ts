// ────────────────────────────────────────────────────────────────
// Planora API — Mock Image Editing Provider
// ────────────────────────────────────────────────────────────────
// Deterministic in-memory provider used when REPLICATE_API_TOKEN is unset
// or during unit testing / local development.
// ────────────────────────────────────────────────────────────────

import type {
  IImageEditProvider,
  ImageEditRequest,
  ImageEditJob,
} from '../provider.types.js';

export class MockImageEditProvider implements IImageEditProvider {
  readonly name = 'mock';
  private jobs = new Map<string, ImageEditJob>();

  constructor(private readonly intervalMs: number = 200) {}

  isConfigured(): boolean {
    return true;
  }

  async createJob(request: ImageEditRequest): Promise<ImageEditJob> {
    const id = `job-mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    // Check test failure hook
    if (request.prompt.includes('simulate_failure') || request.prompt.includes('fail_test')) {
      const failedJob: ImageEditJob = {
        id,
        status: 'failed',
        originalImageUrl: request.imageUrl,
        maskImageUrl: request.maskUrl,
        prompt: request.prompt,
        stylePreset: request.stylePreset,
        error: 'Simulated provider execution failure (test error)',
        createdAt: now,
        completedAt: now,
      };
      this.jobs.set(id, failedJob);
      return failedJob;
    }

    const job: ImageEditJob = {
      id,
      status: 'pending',
      progress: 10,
      originalImageUrl: request.imageUrl,
      maskImageUrl: request.maskUrl,
      prompt: request.prompt,
      stylePreset: request.stylePreset,
      createdAt: now,
    };

    this.jobs.set(id, job);

    // Simulate asynchronous progress ticks
    setTimeout(() => {
      const cur = this.jobs.get(id);
      if (cur && cur.status !== 'cancelled') {
        cur.status = 'processing';
        cur.progress = 55;
      }
    }, this.intervalMs);

    setTimeout(() => {
      const cur = this.jobs.get(id);
      if (cur && cur.status !== 'cancelled') {
        cur.status = 'succeeded';
        cur.progress = 100;
        cur.completedAt = new Date().toISOString();
        // Return an architectural render mock image or echo back with enhanced treatment
        cur.resultImageUrl = request.imageUrl;
      }
    }, this.intervalMs * 2);

    return job;
  }

  async getJob(jobId: string): Promise<ImageEditJob | null> {
    return this.jobs.get(jobId) || null;
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    if (job.status === 'succeeded' || job.status === 'failed') return false;

    job.status = 'cancelled';
    job.completedAt = new Date().toISOString();
    return true;
  }
}
