// ────────────────────────────────────────────────────────────────
// Planora Domain — Core Entities
// ────────────────────────────────────────────────────────────────

import type { Point2D, Rect, Dimensions } from './geometry.js';
import {
  ProjectType,
  MeasurementUnit,
  RoomType,
  DesignStyle,
  FurnitureDensity,
  WallType,
  OpeningType,
  DoorSwing,
  FurnitureType,
  ProjectStatus,
} from './enums.js';

// ── Room ────────────────────────────────────────────────────────

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  /** Boundary polygon (or rectangular Rect) in mm coordinates */
  boundary: Rect;
  /** Calculated area in sq mm — always derived from boundary, never manually set */
  areaSqMm: number;
  /** Optional target dimensions from user input (in display units) */
  targetDimensions?: Dimensions;
  /** Color for 2D rendering */
  color?: string;
}

// ── Wall ────────────────────────────────────────────────────────

export interface Wall {
  id: string;
  start: Point2D;
  end: Point2D;
  thickness: number;  // mm (default 150mm ≈ 6 inches)
  height: number;     // mm (default 2700mm ≈ 9 feet)
  type: WallType;
}

// ── Opening (Door / Window) ─────────────────────────────────────

export interface Opening {
  id: string;
  type: OpeningType;
  wallId: string;
  /** Position along the wall as a ratio (0 = start, 1 = end) */
  positionAlongWall: number;
  width: number;   // mm
  height: number;  // mm
  /** Sill height from floor for windows */
  sillHeight?: number; // mm
  /** Door swing direction */
  swing?: DoorSwing;
}

// ── Furniture ───────────────────────────────────────────────────

export interface Furniture {
  id: string;
  type: FurnitureType;
  name: string;
  position: Point2D;
  rotation: number; // degrees
  width: number;    // mm
  depth: number;    // mm
  height: number;   // mm
  roomId?: string;
  material?: string; // e.g. 'oak' | 'walnut' | 'leather' | 'linen' | 'metal' | 'boucle'
  color?: string;    // hex or css color
}

// ── Design Preferences ──────────────────────────────────────────

export interface DesignPreferences {
  style: DesignStyle;
  furnitureDensity: FurnitureDensity;
  /** Palette accent color hex codes */
  paletteAccents: string[];
}

// ── Layout ──────────────────────────────────────────────────────

export interface Layout {
  id: string;
  version: number;
  /** The outer boundary of the floor / plot in mm */
  boundary: Rect;
  rooms: Room[];
  walls: Wall[];
  openings: Opening[];
  furniture: Furniture[];
  /** Quality score from 0 to 100 */
  score?: number;
  /** Validation issues detected */
  issues?: LayoutIssue[];
  /** When this layout was generated / last modified */
  createdAt: string;
  updatedAt: string;
}

export interface LayoutIssue {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  /** IDs of affected entities */
  affectedIds?: string[];
}

// ── Project ─────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  /** Display dimensions in user's preferred unit */
  dimensions: Dimensions;
  unit: MeasurementUnit;
  /** Number of floors (MVP = 1) */
  floors: number;
  /** Design preferences */
  preferences: DesignPreferences;
  /** Currently active layout */
  selectedLayoutId?: string;
  /** All saved layout versions */
  layouts: Layout[];
  /** Room program — the desired rooms before layout generation */
  roomProgram: RoomProgramEntry[];
  /** Tag / category */
  tag?: string;
  /** Optimistic concurrency version */
  version: number;
  createdAt: string;
  updatedAt: string;
}

/** A room requested by the user before layout generation */
export interface RoomProgramEntry {
  id: string;
  type: RoomType;
  name: string;
  count: number;
  /** Target area in display units */
  targetArea?: number;
  /** Target dimensions in display units */
  targetDimensions?: Dimensions;
}

// ── Staging Entities ────────────────────────────────────────────

export interface StagingPreset {
  id: string;
  name: string;
  style: DesignStyle;
  description: string;
  primaryMaterial: string;
  secondaryMaterial: string;
  wallTone: string;
  floorTone: string;
  accentColors: string[];
  lightingMood: 'golden' | 'noon' | 'evening';
  promptKeywords: string[];
}

export interface ProceduralStagingOptions {
  style: DesignStyle;
  density?: FurnitureDensity;
  clearanceMm?: number;
  preserveExistingFurniture?: boolean;
}

export interface ProceduralStagingResult {
  layout: Layout;
  stagedItemCount: number;
  clearedCirculationPaths: boolean;
  appliedPreset: StagingPreset;
  score: number;
}

// ── Re-exports ──────────────────────────────────────────────────

export type {
  Point2D,
  Point3D,
  Rect,
  Polygon,
  BoundingBox,
  Dimensions,
} from './geometry.js';
