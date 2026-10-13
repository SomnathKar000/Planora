// ────────────────────────────────────────────────────────────────
// Planora API — Project Service (Business Logic Layer)
// ────────────────────────────────────────────────────────────────

import type { Project } from '@planora/domain';
import {
  ProjectType,
  MeasurementUnit,
  DesignStyle,
  FurnitureDensity,
  ProjectStatus,
  toMillimeters,
} from '@planora/domain';
import { generateLayout } from '@planora/layout-engine';
import type { CreateProjectInput, UpdateProjectInput } from '@planora/shared-types';
import type { IProjectRepository } from './project.repository.js';
import { NotFoundError, ConflictError } from '../../shared/errors.js';
import { config } from '../../config/index.js';

export class ProjectService {
  constructor(private readonly repo: IProjectRepository) {}

  // ── Queries ────────────────────────────────────────────────

  async listProjects(): Promise<Project[]> {
    return this.repo.findAll();
  }

  async getProject(id: string): Promise<Project> {
    const project = await this.repo.findById(id);
    if (!project) throw new NotFoundError('Project', id);
    return project;
  }

  // ── Commands ───────────────────────────────────────────────

  async createProject(input: CreateProjectInput): Promise<Project> {
    const projectId = this.repo.nextId();
    const now = new Date().toISOString();

    // Convert to mm for layout engine
    const widthMm = toMillimeters(input.dimensions.length, input.unit as MeasurementUnit);
    const heightMm = toMillimeters(input.dimensions.width, input.unit as MeasurementUnit);

    const layouts = generateLayout({
      boundary: { x: 0, y: 0, width: widthMm, height: heightMm },
      roomProgram: (input.roomProgram || []) as any,
      candidateCount: config.layout.defaultCandidateCount,
    });

    const project: Project = {
      id: projectId,
      name: input.name,
      type: input.type as ProjectType,
      status: ProjectStatus.InProgress,
      dimensions: input.dimensions,
      unit: input.unit as MeasurementUnit,
      floors: input.floors,
      preferences: (input.preferences as any) || {
        style: DesignStyle.Modern,
        furnitureDensity: FurnitureDensity.Balanced,
        paletteAccents: [],
      },
      layouts,
      selectedLayoutId: layouts[0]?.id,
      roomProgram: (input.roomProgram as any) || [],
      tag: input.tag,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    return this.repo.create(project);
  }

  async updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError('Project', id);

    // Optimistic concurrency check
    if (input.version !== undefined && input.version !== existing.version) {
      throw new ConflictError(
        `Version mismatch: expected ${existing.version}, received ${input.version}`,
      );
    }

    const updated: Project = {
      ...existing,
      ...input,
      dimensions: (input.dimensions || existing.dimensions) as any,
      preferences: (input.preferences || existing.preferences) as any,
      roomProgram: (input.roomProgram || existing.roomProgram) as any,
      unit: (input.unit || existing.unit) as any,
      type: (input.type || existing.type) as any,
      status: (input.status || existing.status) as any,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };

    return this.repo.update(updated);
  }

  async deleteProject(id: string): Promise<void> {
    if (!(await this.repo.exists(id))) throw new NotFoundError('Project', id);
    await this.repo.delete(id);
  }

  // ── Layout Generation ──────────────────────────────────────

  async generateLayouts(id: string, candidateCount?: number): Promise<{ layouts: any[]; selectedLayoutId: string | undefined }> {
    const project = await this.repo.findById(id);
    if (!project) throw new NotFoundError('Project', id);

    const count = candidateCount ?? config.layout.defaultCandidateCount;
    const widthMm = toMillimeters(project.dimensions.length, project.unit);
    const heightMm = toMillimeters(project.dimensions.width, project.unit);

    const layouts = generateLayout({
      boundary: { x: 0, y: 0, width: widthMm, height: heightMm },
      roomProgram: project.roomProgram || [],
      candidateCount: count,
    });

    project.layouts = layouts;
    project.selectedLayoutId = layouts[0]?.id;
    project.updatedAt = new Date().toISOString();
    await this.repo.update(project);

    return { layouts, selectedLayoutId: project.selectedLayoutId };
  }
}
