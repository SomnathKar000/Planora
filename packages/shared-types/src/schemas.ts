// ────────────────────────────────────────────────────────────────
// Planora Shared Types — Zod Schemas & API Contracts
// ────────────────────────────────────────────────────────────────

import { z } from 'zod';

// ── Zod schemas for API validation ──────────────────────────────

export const ProjectTypeSchema = z.enum(['room', 'apartment', 'house', 'commercial']);
export const MeasurementUnitSchema = z.enum(['feet', 'meters', 'centimeters']);
export const RoomTypeSchema = z.enum([
  'living_room', 'bedroom', 'kitchen', 'bathroom', 'dining_room',
  'home_office', 'balcony', 'hallway', 'closet', 'laundry',
  'entry_hall', 'storage', 'garage', 'custom',
]);
export const DesignStyleSchema = z.enum(['modern', 'minimal', 'classic', 'industrial', 'nordic', 'custom']);
export const FurnitureDensitySchema = z.enum(['sparse', 'balanced', 'dense']);
export const ProjectStatusSchema = z.enum([
  'draft', 'in_progress', 'client_review', 'staging_ready', 'approved', 'complete',
]);

export const DimensionsSchema = z.object({
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive().optional(),
});

export const DesignPreferencesSchema = z.object({
  style: DesignStyleSchema,
  furnitureDensity: FurnitureDensitySchema,
  paletteAccents: z.array(z.string()).default([]),
});

export const RoomProgramEntrySchema = z.object({
  id: z.string(),
  type: RoomTypeSchema,
  name: z.string().min(1),
  count: z.number().int().min(0).max(20),
  targetArea: z.number().positive().optional(),
  targetDimensions: DimensionsSchema.optional(),
});

// ── API Request Schemas ─────────────────────────────────────────

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(200),
  type: ProjectTypeSchema,
  dimensions: DimensionsSchema,
  unit: MeasurementUnitSchema,
  floors: z.number().int().min(1).max(10).default(1),
  preferences: DesignPreferencesSchema.optional(),
  roomProgram: z.array(RoomProgramEntrySchema).optional(),
  tag: z.string().max(100).optional(),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: ProjectTypeSchema.optional(),
  dimensions: DimensionsSchema.optional(),
  unit: MeasurementUnitSchema.optional(),
  floors: z.number().int().min(1).max(10).optional(),
  preferences: DesignPreferencesSchema.optional(),
  roomProgram: z.array(RoomProgramEntrySchema).optional(),
  tag: z.string().max(100).optional(),
  status: ProjectStatusSchema.optional(),
  selectedLayoutId: z.string().optional(),
  version: z.number().int().min(0),
});

export const GenerateLayoutSchema = z.object({
  projectId: z.string(),
  candidateCount: z.number().int().min(1).max(10).default(3),
});

// ── API Response Types ──────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Inferred types ──────────────────────────────────────────────

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type GenerateLayoutInput = z.infer<typeof GenerateLayoutSchema>;
