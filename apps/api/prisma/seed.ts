// ────────────────────────────────────────────────────────────────
// Planora API — Database Seed Command
// ────────────────────────────────────────────────────────────────
// Run via: npm run db:seed  (or: npx prisma db seed)
//
// This is an explicit CLI command — NOT auto-run at startup.
// It inserts demo data into the database for development.
// ────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import {
  ProjectType,
  MeasurementUnit,
  DesignStyle,
  FurnitureDensity,
  ProjectStatus,
  RoomType,
} from '@planora/domain';
import { generateLayout } from '@planora/layout-engine';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Planora database...\n');

  // Clear existing data
  await prisma.layout.deleteMany();
  await prisma.roomProgramEntry.deleteMany();
  await prisma.project.deleteMany();
  console.log('   ✓ Cleared existing data');

  // ── Demo Project 1: Downtown Loft ──────────────────────────

  const roomProgram1 = [
    { id: 'rp-1', type: RoomType.LivingRoom, name: 'Living Room', count: 1, targetArea: 192 },
    { id: 'rp-2', type: RoomType.Bedroom, name: 'Primary Bedroom', count: 1, targetArea: 144 },
    { id: 'rp-3', type: RoomType.Kitchen, name: 'Kitchen / Dining', count: 1, targetArea: 96 },
    { id: 'rp-4', type: RoomType.Bathroom, name: 'Full Bathroom', count: 1, targetArea: 48 },
  ];

  const layouts1 = generateLayout({
    boundary: { x: 0, y: 0, width: 9144, height: 6096 },
    roomProgram: roomProgram1,
    candidateCount: 3,
  });

  await prisma.project.create({
    data: {
      id: 'proj-1',
      name: 'Downtown Loft Apt. 4B',
      type: ProjectType.Apartment,
      status: ProjectStatus.InProgress,
      dimLength: 30,
      dimWidth: 20,
      dimHeight: 10,
      unit: MeasurementUnit.Feet,
      floors: 1,
      preferences: {
        style: DesignStyle.Modern,
        furnitureDensity: FurnitureDensity.Balanced,
        paletteAccents: ['#EAE3D2', '#A88B68', '#587B95'],
      },
      selectedLayoutId: layouts1[0]?.id,
      tag: 'Residential Remodel & Staging',
      version: 1,
      layouts: {
        create: layouts1.map((l) => ({
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
        create: roomProgram1.map((rp) => ({
          id: rp.id,
          type: rp.type,
          name: rp.name,
          count: rp.count,
          targetArea: rp.targetArea,
        })),
      },
    },
  });
  console.log('   ✓ Created: Downtown Loft Apt. 4B');

  // ── Demo Project 2: Modern Studio ──────────────────────────

  const roomProgram2 = [
    { id: 'rp-5', type: RoomType.LivingRoom, name: 'Open Plan Living', count: 1, targetArea: 250 },
    { id: 'rp-6', type: RoomType.Kitchen, name: 'Kitchen Island', count: 1, targetArea: 80 },
    { id: 'rp-7', type: RoomType.Bathroom, name: 'En-Suite Bathroom', count: 1, targetArea: 40 },
  ];

  const layouts2 = generateLayout({
    boundary: { x: 0, y: 0, width: 7620, height: 5486 },
    roomProgram: roomProgram2,
    candidateCount: 3,
  });

  await prisma.project.create({
    data: {
      id: 'proj-2',
      name: 'Modern Studio – Unit 12A',
      type: ProjectType.Room,
      status: ProjectStatus.Draft,
      dimLength: 25,
      dimWidth: 18,
      dimHeight: 9,
      unit: MeasurementUnit.Feet,
      floors: 1,
      preferences: {
        style: DesignStyle.Minimal,
        furnitureDensity: FurnitureDensity.Sparse,
        paletteAccents: ['#F5F0EB', '#2D2D2D', '#C4A882'],
      },
      selectedLayoutId: layouts2[0]?.id,
      tag: 'New Build',
      version: 1,
      layouts: {
        create: layouts2.map((l) => ({
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
        create: roomProgram2.map((rp) => ({
          id: rp.id,
          type: rp.type,
          name: rp.name,
          count: rp.count,
          targetArea: rp.targetArea,
        })),
      },
    },
  });
  console.log('   ✓ Created: Modern Studio – Unit 12A');

  // ── Demo Project 3: Family Home ────────────────────────────

  const roomProgram3 = [
    { id: 'rp-8', type: RoomType.LivingRoom, name: 'Family Room', count: 1, targetArea: 300 },
    { id: 'rp-9', type: RoomType.Bedroom, name: 'Master Bedroom', count: 1, targetArea: 200 },
    { id: 'rp-10', type: RoomType.Bedroom, name: 'Kids Room', count: 2, targetArea: 120 },
    { id: 'rp-11', type: RoomType.Kitchen, name: 'Kitchen', count: 1, targetArea: 150 },
    { id: 'rp-12', type: RoomType.Bathroom, name: 'Main Bathroom', count: 1, targetArea: 60 },
    { id: 'rp-13', type: RoomType.Bathroom, name: 'Half Bath', count: 1, targetArea: 30 },
    { id: 'rp-14', type: RoomType.HomeOffice, name: 'Home Office', count: 1, targetArea: 100 },
  ];

  const layouts3 = generateLayout({
    boundary: { x: 0, y: 0, width: 15240, height: 10668 },
    roomProgram: roomProgram3,
    candidateCount: 3,
  });

  await prisma.project.create({
    data: {
      id: 'proj-3',
      name: 'Riverside Family Home',
      type: ProjectType.House,
      status: ProjectStatus.ClientReview,
      dimLength: 50,
      dimWidth: 35,
      dimHeight: 10,
      unit: MeasurementUnit.Feet,
      floors: 2,
      preferences: {
        style: DesignStyle.Classic,
        furnitureDensity: FurnitureDensity.Balanced,
        paletteAccents: ['#FDF6EC', '#8B6F4E', '#4A6741'],
      },
      selectedLayoutId: layouts3[0]?.id,
      tag: 'Residential New Build',
      version: 1,
      layouts: {
        create: layouts3.map((l) => ({
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
        create: roomProgram3.map((rp) => ({
          id: rp.id,
          type: rp.type,
          name: rp.name,
          count: rp.count,
          targetArea: rp.targetArea,
        })),
      },
    },
  });
  console.log('   ✓ Created: Riverside Family Home');

  console.log(`\n✅ Seeded 3 demo projects with layouts successfully.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
