import { describe, it, expect, beforeEach } from 'vitest';
import { StagingService } from './staging.service.js';
import { InMemoryProjectRepository } from '../projects/project.repository.js';
import { MockImageEditProvider } from './providers/mock.provider.js';
import { QuotaManager } from './quota.manager.js';
import { AppError, ValidationError } from '../../shared/errors.js';
import {
  DesignStyle,
  RoomType,
  FurnitureDensity,
  ProjectType,
  ProjectStatus,
  MeasurementUnit,
} from '@planora/domain';
import type { Project, Layout } from '@planora/domain';

describe('StagingService & AI Inpainting Workflow', () => {
  let projectRepo: InMemoryProjectRepository;
  let mockProvider: MockImageEditProvider;
  let quotaManager: QuotaManager;
  let service: StagingService;

  const sampleLayout: Layout = {
    id: 'layout-1',
    version: 1,
    boundary: { x: 0, y: 0, width: 8000, height: 6000 },
    rooms: [
      {
        id: 'r-living',
        type: RoomType.LivingRoom,
        name: 'Living Room',
        boundary: { x: 0, y: 0, width: 4500, height: 3500 },
        areaSqMm: 15750000,
      },
      {
        id: 'r-bed',
        type: RoomType.Bedroom,
        name: 'Primary Bedroom',
        boundary: { x: 4500, y: 0, width: 3500, height: 3500 },
        areaSqMm: 12250000,
      },
    ],
    walls: [],
    openings: [],
    furniture: [],
    score: 85,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleProject: Project = {
    id: 'proj-123',
    name: 'Nordic Residence',
    type: ProjectType.Apartment,
    status: ProjectStatus.Draft,
    dimensions: { length: 8, width: 6, height: 2.8 },
    unit: MeasurementUnit.Meters,
    floors: 1,
    preferences: {
      style: DesignStyle.Nordic,
      furnitureDensity: FurnitureDensity.Balanced,
      paletteAccents: ['#A3B18A'],
    },
    layouts: [sampleLayout],
    selectedLayoutId: 'layout-1',
    roomProgram: [],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    projectRepo = new InMemoryProjectRepository();
    await projectRepo.create(sampleProject);
    mockProvider = new MockImageEditProvider(5); // fast 5ms interval for tests
    quotaManager = new QuotaManager({
      maxRequestsPerHour: 3,
      maxImageUploadBytes: 1024 * 1024, // 1MB for test
    });
    service = new StagingService(projectRepo, mockProvider, quotaManager);
  });

  describe('Procedural Staging (Deterministic & Room Geometry-based)', () => {
    it('stages a layout with Scandinavian style and adds furniture without altering room boundaries', async () => {
      const result = await service.stageProcedurally({
        projectId: 'proj-123',
        layoutId: 'layout-1',
        style: 'scandinavian',
        density: 'balanced',
      });

      expect(result.appliedPreset.style).toBe(DesignStyle.Nordic);
      expect(result.appliedPreset.lightingMood).toBe('golden');
      expect(result.layout.furniture.length).toBeGreaterThan(0);

      // Verify room geometry was preserved
      const updatedProject = await projectRepo.findById('proj-123');
      expect(updatedProject?.layouts[0].rooms[0].boundary).toEqual(sampleLayout.rooms[0].boundary);
      expect(updatedProject?.layouts[0].rooms[1].boundary).toEqual(sampleLayout.rooms[1].boundary);

      // Verify materials are applied
      const placedPieces = result.layout.furniture;
      expect(placedPieces.some((f) => f.material?.includes('birch') || f.material?.includes('boucle'))).toBe(true);
    });

    it('returns style presets catalog including all 5 core styles', () => {
      const { presets, provider } = service.getPresets();
      expect(provider).toBe('mock');
      expect(presets.length).toBeGreaterThanOrEqual(5);

      const styles = presets.map((p) => p.style);
      expect(styles).toContain(DesignStyle.Modern);
      expect(styles).toContain(DesignStyle.Minimal);
      expect(styles).toContain(DesignStyle.Nordic);
      expect(styles).toContain(DesignStyle.Classic);
      expect(styles).toContain(DesignStyle.Industrial);
    });
  });

  describe('AI Image Editing Jobs (Provider Independent)', () => {
    const validBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    it('creates an edit job, tracks status, and completes with generated image', async () => {
      const job = await service.createAiEditJob('client-1', {
        projectId: 'proj-123',
        image: validBase64,
        prompt: 'Add a contemporary light oak coffee table with linen sofa',
        style: 'modern',
      });

      expect(job.id).toBeDefined();
      expect(job.status).toBe('pending');
      expect(job.prompt).toContain('coffee table');
      expect(job.originalImageUrl).toBe(validBase64);

      // Poll until finished (using fast test interval)
      let currentJob = await service.getJobStatus(job.id);
      let attempts = 0;
      while (currentJob.status !== 'succeeded' && attempts < 20) {
        await new Promise((resolve) => setTimeout(resolve, 20));
        currentJob = await service.getJobStatus(job.id);
        attempts++;
      }

      expect(currentJob.status).toBe('succeeded');
      expect(currentJob.progress).toBe(100);
      expect(currentJob.resultImageUrl).toBeDefined();
      expect(currentJob.originalImageUrl).toBe(validBase64); // original is strictly retained
    });

    it('allows cancelling an in-flight job', async () => {
      const slowProvider = new MockImageEditProvider(500); // slower ticks
      const slowService = new StagingService(projectRepo, slowProvider, quotaManager);

      const job = await slowService.createAiEditJob('client-cancel', {
        image: validBase64,
        prompt: 'Modern redesign',
      });

      const cancelRes = await slowService.cancelJob(job.id);
      expect(cancelRes.success).toBe(true);

      const statusAfterCancel = await slowService.getJobStatus(job.id);
      expect(statusAfterCancel.status).toBe('cancelled');
    });
  });

  describe('Validation & Quota Limits', () => {
    const validBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    it('enforces hourly request quota caps', async () => {
      // Limit was set to 3 requests/hour
      await service.createAiEditJob('client-quota', { image: validBase64, prompt: 'Prompt 1' });
      await service.createAiEditJob('client-quota', { image: validBase64, prompt: 'Prompt 2' });
      await service.createAiEditJob('client-quota', { image: validBase64, prompt: 'Prompt 3' });

      // 4th request should fail with AppError 429 QUOTA_EXCEEDED
      await expect(
        service.createAiEditJob('client-quota', { image: validBase64, prompt: 'Prompt 4' })
      ).rejects.toThrow(AppError);

      try {
        await service.createAiEditJob('client-quota', { image: validBase64, prompt: 'Prompt 4' });
      } catch (err: any) {
        expect(err.statusCode).toBe(429);
        expect(err.code).toBe('QUOTA_EXCEEDED');
      }
    });

    it('rejects invalid image payload formatting', async () => {
      await expect(
        service.createAiEditJob('client-val', {
          image: 'ftp://not-supported/file.txt',
          prompt: 'Re-style room',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('rejects image payloads exceeding size limits', async () => {
      // Construct payload larger than 1MB
      const hugeData = 'data:image/png;base64,' + 'A'.repeat(1.5 * 1024 * 1024);
      await expect(
        service.createAiEditJob('client-oversize', {
          image: hugeData,
          prompt: 'Re-style room',
        })
      ).rejects.toThrow(ValidationError);
    });
  });
});
