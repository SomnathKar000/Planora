// ────────────────────────────────────────────────────────────────
// Planora API — Prisma Project Repository
// ────────────────────────────────────────────────────────────────
// Implements IProjectRepository backed by PostgreSQL via Prisma.
// Handles mapping between Prisma's flat row model and the
// domain's nested Project type.
// ────────────────────────────────────────────────────────────────

import type { PrismaClient } from '@prisma/client';
import type { Project, Layout, RoomProgramEntry, DesignPreferences, Rect, Dimensions } from '@planora/domain';
import type { IProjectRepository } from './project.repository.js';

/**
 * Maps a Prisma Project row (with relations) to the domain Project type.
 */
function toDomainProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    status: row.status,
    dimensions: {
      length: row.dimLength,
      width: row.dimWidth,
      height: row.dimHeight ?? undefined,
    },
    unit: row.unit,
    floors: row.floors,
    preferences: row.preferences as DesignPreferences,
    selectedLayoutId: row.selectedLayoutId ?? undefined,
    layouts: (row.layouts || []).map(toDomainLayout),
    roomProgram: (row.roomProgram || []).map(toDomainRoomProgram),
    tag: row.tag ?? undefined,
    version: row.version,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toDomainLayout(row: any): Layout {
  return {
    id: row.id,
    version: row.version,
    boundary: row.boundary as Rect,
    rooms: row.rooms as any[],
    walls: row.walls as any[],
    openings: row.openings as any[],
    furniture: row.furniture as any[],
    score: row.score ?? undefined,
    issues: row.issues as any[] ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toDomainRoomProgram(row: any): RoomProgramEntry {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    count: row.count,
    targetArea: row.targetArea ?? undefined,
    targetDimensions: row.targetDimensions as Dimensions | undefined,
  };
}

export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(): Promise<Project[]> {
    const rows = await this.db.project.findMany({
      include: { layouts: true, roomProgram: true },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(toDomainProject);
  }

  async findById(id: string): Promise<Project | undefined> {
    const row = await this.db.project.findUnique({
      where: { id },
      include: { layouts: true, roomProgram: true },
    });
    return row ? toDomainProject(row) : undefined;
  }

  async create(project: Project): Promise<Project> {
    const row = await this.db.project.create({
      data: {
        id: project.id,
        name: project.name,
        type: project.type,
        status: project.status,
        dimLength: project.dimensions.length,
        dimWidth: project.dimensions.width,
        dimHeight: project.dimensions.height,
        unit: project.unit,
        floors: project.floors,
        preferences: project.preferences as any,
        selectedLayoutId: project.selectedLayoutId,
        tag: project.tag,
        version: project.version,
        layouts: {
          create: project.layouts.map((l) => ({
            id: l.id,
            version: l.version,
            boundary: l.boundary as any,
            rooms: l.rooms as any,
            walls: l.walls as any,
            openings: l.openings as any,
            furniture: l.furniture as any,
            score: l.score,
            issues: l.issues as any,
          })),
        },
        roomProgram: {
          create: project.roomProgram.map((rp) => ({
            id: rp.id,
            type: rp.type,
            name: rp.name,
            count: rp.count,
            targetArea: rp.targetArea,
            targetDimensions: rp.targetDimensions as any,
          })),
        },
      },
      include: { layouts: true, roomProgram: true },
    });
    return toDomainProject(row);
  }

  async update(project: Project): Promise<Project> {
    // Delete existing layouts and room program, then recreate
    // (simplest approach for atomic layout regeneration)
    await this.db.$transaction([
      this.db.layout.deleteMany({ where: { projectId: project.id } }),
      this.db.roomProgramEntry.deleteMany({ where: { projectId: project.id } }),
      this.db.project.update({
        where: { id: project.id },
        data: {
          name: project.name,
          type: project.type,
          status: project.status,
          dimLength: project.dimensions.length,
          dimWidth: project.dimensions.width,
          dimHeight: project.dimensions.height,
          unit: project.unit,
          floors: project.floors,
          preferences: project.preferences as any,
          selectedLayoutId: project.selectedLayoutId,
          tag: project.tag,
          version: project.version,
          layouts: {
            create: project.layouts.map((l) => ({
              id: l.id,
              version: l.version,
              boundary: l.boundary as any,
              rooms: l.rooms as any,
              walls: l.walls as any,
              openings: l.openings as any,
              furniture: l.furniture as any,
              score: l.score,
              issues: l.issues as any,
            })),
          },
          roomProgram: {
            create: project.roomProgram.map((rp) => ({
              id: rp.id,
              type: rp.type,
              name: rp.name,
              count: rp.count,
              targetArea: rp.targetArea,
              targetDimensions: rp.targetDimensions as any,
            })),
          },
        },
      }),
    ]);

    const updated = await this.findById(project.id);
    return updated!;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.db.project.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.db.project.count({ where: { id } });
    return count > 0;
  }

  nextId(): string {
    // Prisma uses cuid() by default, but we generate one here for consistency
    return `proj-${Date.now()}`;
  }
}
