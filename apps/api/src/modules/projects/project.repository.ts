// ────────────────────────────────────────────────────────────────
// Planora API — Project Repository (Data Access Layer)
// ────────────────────────────────────────────────────────────────

import type { Project } from '@planora/domain';

/**
 * Repository interface — abstracts storage so we can swap
 * in-memory for Postgres/Prisma later without touching services.
 *
 * All methods return Promises to support both sync (in-memory)
 * and async (database) implementations.
 */
export interface IProjectRepository {
  findAll(): Promise<Project[]>;
  findById(id: string): Promise<Project | undefined>;
  create(project: Project): Promise<Project>;
  update(project: Project): Promise<Project>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  nextId(): string;
}

// ── In-Memory Implementation ──────────────────────────────────

export class InMemoryProjectRepository implements IProjectRepository {
  private readonly store: Map<string, Project> = new Map();

  async findAll(): Promise<Project[]> {
    return Array.from(this.store.values());
  }

  async findById(id: string): Promise<Project | undefined> {
    return this.store.get(id);
  }

  async create(project: Project): Promise<Project> {
    this.store.set(project.id, project);
    return project;
  }

  async update(project: Project): Promise<Project> {
    this.store.set(project.id, project);
    return project;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.store.has(id);
  }

  nextId(): string {
    return `proj-${Date.now()}`;
  }
}
