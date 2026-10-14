// ────────────────────────────────────────────────────────────────
// Planora API — Image Editing Provider Contracts
// ────────────────────────────────────────────────────────────────

export interface ImageEditRequest {
  imageUrl: string;         // source image (Data URI or HTTPS URL)
  maskUrl?: string;         // optional binary inpainting mask
  prompt: string;           // positive styling prompt
  negativePrompt?: string;  // negative prompt to guide diffusion
  stylePreset?: string;
  guidanceScale?: number;
}

export type JobStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';

export interface ImageEditJob {
  id: string;
  status: JobStatus;
  progress?: number;        // 0 to 100 percentage
  originalImageUrl: string;
  maskImageUrl?: string;
  resultImageUrl?: string;
  prompt: string;
  stylePreset?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface IImageEditProvider {
  readonly name: string;
  isConfigured(): boolean;
  createJob(request: ImageEditRequest): Promise<ImageEditJob>;
  getJob(jobId: string): Promise<ImageEditJob | null>;
  cancelJob(jobId: string): Promise<boolean>;
}
