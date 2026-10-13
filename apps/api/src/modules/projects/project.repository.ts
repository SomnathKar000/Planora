// ────────────────────────────────────────────────────────────────
// Planora API — Project Repository (Data Access Layer)
// ────────────────────────────────────────────────────────────────

import type { Project } from '@planora/domain';

/**
 * Repository interface — abstracts storage so we can swap
 * in-memory for Postgres/SQLite later without touching services.
 */
export interface IProjectRepository {
  findAll(): Project[];
  findById(id: string): Project | undefined;
  create(project: Project): Project;
  update(project: Project): Project;
  delete(id: string): boolean;
  exists(id: string): boolean;
  nextId(): string;
}

// ── In-Memory Implementation ──────────────────────────────────

export class InMemoryProjectRepository implements IProjectRepository {
  private readonly store: Map<string, Project> = new Map();

  findAll(): Project[] {
    return Array.from(this.store.values());
  }

  findById(id: string): Project | undefined {
    return this.store.get(id);
  }

  create(project: Project): Project {
    this.store.set(project.id, project);
    return project;
  }

  update(project: Project): Project {
    this.store.set(project.id, project);
    return project;
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  exists(id: string): boolean {
    return this.store.has(id);
  }

  nextId(): string {
    return `proj-${Date.now()}`;
  }
}
