import express from 'express';
import cors from 'cors';
import { CreateProjectSchema, UpdateProjectSchema } from '@planora/shared-types';
import type { Project } from '@planora/domain';
import {
  ProjectType,
  MeasurementUnit,
  DesignStyle,
  FurnitureDensity,
  ProjectStatus,
  RoomType,
  toMillimeters,
} from '@planora/domain';
import { generateLayout } from '@planora/layout-engine';

const app = express();
const PORT = process.env.API_PORT ?? 3001;

app.use(cors());
app.use(express.json());

// ── In-Memory Store ──────────────────────────────────────
const projects: Map<string, Project> = new Map();

// Seed initial project
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
projects.set(initialProject.id, initialProject);

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    },
  });
});

// ── Projects CRUD ────────────────────────────────────────

// List projects
app.get('/api/projects', (_req, res) => {
  const items = Array.from(projects.values());
  res.json({
    success: true,
    data: {
      items,
      total: items.length,
      page: 1,
      pageSize: items.length,
    },
  });
});

// Get single project
app.get('/api/projects/:id', (req, res) => {
  const project = projects.get(req.params.id);
  if (!project) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Project with ID ${req.params.id} not found` },
    });
    return;
  }
  res.json({ success: true, data: project });
});

// Create project
app.post('/api/projects', (req, res) => {
  const parsed = CreateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid project payload', details: parsed.error.format() },
    });
    return;
  }

  const input = parsed.data;
  const projectId = `proj-${Date.now()}`;
  const now = new Date().toISOString();

  // Generate initial layouts
  const widthMm = toMillimeters(input.dimensions.length, input.unit as MeasurementUnit);
  const heightMm = toMillimeters(input.dimensions.width, input.unit as MeasurementUnit);

  const layouts = generateLayout({
    boundary: { x: 0, y: 0, width: widthMm, height: heightMm },
    roomProgram: (input.roomProgram || []) as any,
    candidateCount: 3,
  });

  const newProject: Project = {
    id: projectId,
    name: input.name,
    type: input.type as ProjectType,
    status: ProjectStatus.InProgress,
    dimensions: input.dimensions,
    unit: input.unit as MeasurementUnit,
    floors: input.floors,
    preferences: input.preferences as any || {
      style: DesignStyle.Modern,
      furnitureDensity: FurnitureDensity.Balanced,
      paletteAccents: [],
    },
    layouts,
    selectedLayoutId: layouts[0]?.id,
    roomProgram: input.roomProgram as any || [],
    tag: input.tag,
    version: 1,
    createdAt: now,
    updatedAt: now,
  };

  projects.set(newProject.id, newProject);
  res.status(201).json({ success: true, data: newProject });
});

// Update project
app.put('/api/projects/:id', (req, res) => {
  const existing = projects.get(req.params.id);
  if (!existing) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Project ${req.params.id} not found` },
    });
    return;
  }

  const parsed = UpdateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid update payload', details: parsed.error.format() },
    });
    return;
  }

  const updated: Project = {
    ...existing,
    ...parsed.data,
    dimensions: (parsed.data.dimensions || existing.dimensions) as any,
    preferences: (parsed.data.preferences || existing.preferences) as any,
    roomProgram: (parsed.data.roomProgram || existing.roomProgram) as any,
    unit: (parsed.data.unit || existing.unit) as any,
    type: (parsed.data.type || existing.type) as any,
    status: (parsed.data.status || existing.status) as any,
    version: existing.version + 1,
    updatedAt: new Date().toISOString(),
  };

  projects.set(updated.id, updated);
  res.json({ success: true, data: updated });
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
  if (!projects.has(req.params.id)) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Project ${req.params.id} not found` },
    });
    return;
  }
  projects.delete(req.params.id);
  res.json({ success: true, data: { deleted: true } });
});

// Generate layouts for project
app.post('/api/projects/:id/layouts/generate', (req, res) => {
  const project = projects.get(req.params.id);
  if (!project) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Project ${req.params.id} not found` },
    });
    return;
  }

  const count = req.body.candidateCount || 3;
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
  projects.set(project.id, project);

  res.json({ success: true, data: { layouts, selectedLayoutId: project.selectedLayoutId } });
});

app.listen(PORT, () => {
  console.log(`🏗️  Planora API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Projects: http://localhost:${PORT}/api/projects`);
});
