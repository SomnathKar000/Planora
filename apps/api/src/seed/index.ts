// ────────────────────────────────────────────────────────────────
// Planora API — Seed Data
// ────────────────────────────────────────────────────────────────

import type { Project } from '@planora/domain';
import {
  ProjectType,
  MeasurementUnit,
  DesignStyle,
  FurnitureDensity,
  ProjectStatus,
  RoomType,
} from '@planora/domain';
import { generateLayout } from '@planora/layout-engine';
import type { IProjectRepository } from '../modules/projects/project.repository.js';

/**
 * Seeds initial demonstration data into the repository.
 * Called once at startup in dev mode.
 */
export function seedDatabase(repo: IProjectRepository): void {
  const initialProject: Project = {
    id: 'proj-1',
    name: 'Downtown Loft Apt. 4B',
    type: ProjectType.Apartment,
    status: ProjectStatus.InProgress,
    dimensions: { length: 30, width: 20, height: 10 },
    unit: MeasurementUnit.Feet,
    floors: 1,
    preferences: {
      style: DesignStyle.Modern,
      furnitureDensity: FurnitureDensity.Balanced,
      paletteAccents: ['#EAE3D2', '#A88B68', '#587B95'],
    },
    selectedLayoutId: 'layout-1',
    layouts: generateLayout({
      boundary: { x: 0, y: 0, width: 9144, height: 6096 },
      roomProgram: [
        { id: 'rp-1', type: RoomType.LivingRoom, name: 'Living Room', count: 1, targetArea: 192 },
        { id: 'rp-2', type: RoomType.Bedroom, name: 'Primary Bedroom', count: 1, targetArea: 144 },
        { id: 'rp-3', type: RoomType.Kitchen, name: 'Kitchen / Dining', count: 1, targetArea: 96 },
        { id: 'rp-4', type: RoomType.Bathroom, name: 'Full Bathroom', count: 1, targetArea: 48 },
      ],
      candidateCount: 3,
    }),
    roomProgram: [
      { id: 'rp-1', type: RoomType.LivingRoom, name: 'Living Room', count: 1, targetArea: 192 },
      { id: 'rp-2', type: RoomType.Bedroom, name: 'Primary Bedroom', count: 1, targetArea: 144 },
      { id: 'rp-3', type: RoomType.Kitchen, name: 'Kitchen / Dining', count: 1, targetArea: 96 },
      { id: 'rp-4', type: RoomType.Bathroom, name: 'Full Bathroom', count: 1, targetArea: 48 },
    ],
    tag: 'Residential Remodel & Staging',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  repo.create(initialProject);
  console.log(`🌱 Seeded ${1} demo project(s)`);
}
