// ────────────────────────────────────────────────────────────────
// Planora Domain — Geometry Primitives
// All coordinates are in integer millimeters.
// ────────────────────────────────────────────────────────────────

/** A 2D point in millimeters */
export interface Point2D {
  x: number; // mm
  y: number; // mm
}

/** A 3D point in millimeters */
export interface Point3D {
  x: number; // mm
  y: number; // mm
  z: number; // mm
}

/** Axis-aligned bounding box (2D) */
export interface BoundingBox {
  minX: number; // mm
  minY: number; // mm
  maxX: number; // mm
  maxY: number; // mm
}

/** A rectangle defined by origin + dimensions */
export interface Rect {
  x: number;      // mm — left edge
  y: number;      // mm — top edge
  width: number;  // mm
  height: number; // mm
}

/** A closed polygon represented as ordered vertices */
export interface Polygon {
  vertices: Point2D[];
}

/** Dimensions in the user's display unit (converted from mm for storage) */
export interface Dimensions {
  length: number; // in display unit
  width: number;  // in display unit
  height?: number; // in display unit (optional for 2D contexts)
}

// ────────────────────────────────────────────────────────────────
// Unit conversion utilities
// ────────────────────────────────────────────────────────────────

import { MeasurementUnit } from './enums.js';

const MM_PER_FOOT = 304.8;
const MM_PER_METER = 1000;
const MM_PER_CM = 10;

/** Convert a value from the given display unit to internal millimeters */
export function toMillimeters(value: number, unit: MeasurementUnit): number {
  switch (unit) {
    case MeasurementUnit.Feet:
      return Math.round(value * MM_PER_FOOT);
    case MeasurementUnit.Meters:
      return Math.round(value * MM_PER_METER);
    case MeasurementUnit.Centimeters:
      return Math.round(value * MM_PER_CM);
  }
}

/** Convert a value from internal millimeters to the given display unit */
export function fromMillimeters(mm: number, unit: MeasurementUnit): number {
  switch (unit) {
    case MeasurementUnit.Feet:
      return mm / MM_PER_FOOT;
    case MeasurementUnit.Meters:
      return mm / MM_PER_METER;
    case MeasurementUnit.Centimeters:
      return mm / MM_PER_CM;
  }
}

/** Calculate area of a rectangle in square millimeters */
export function rectArea(rect: Rect): number {
  return rect.width * rect.height;
}

/** Calculate area of a simple polygon using the Shoelace formula (sq mm) */
export function polygonArea(polygon: Polygon): number {
  const { vertices } = polygon;
  const n = vertices.length;
  if (n < 3) return 0;

  let area = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }

  return Math.abs(area) / 2;
}

/** Convert area from sq mm to display unit squared */
export function convertArea(sqMm: number, unit: MeasurementUnit): number {
  switch (unit) {
    case MeasurementUnit.Feet:
      return sqMm / (MM_PER_FOOT * MM_PER_FOOT);
    case MeasurementUnit.Meters:
      return sqMm / (MM_PER_METER * MM_PER_METER);
    case MeasurementUnit.Centimeters:
      return sqMm / (MM_PER_CM * MM_PER_CM);
  }
}

/** Check if two rectangles overlap (exclusive of touching edges) */
export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/** Check if rectangle `inner` is fully contained within `outer` */
export function rectContains(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

/** Get the bounding box of a rectangle */
export function rectToBounds(rect: Rect): BoundingBox {
  return {
    minX: rect.x,
    minY: rect.y,
    maxX: rect.x + rect.width,
    maxY: rect.y + rect.height,
  };
}

/** Format a dimension value for display (e.g. "12 x 16 ft") */
export function formatDimension(value: number, unit: MeasurementUnit): string {
  const rounded = Math.round(value * 100) / 100;
  switch (unit) {
    case MeasurementUnit.Feet:
      return `${rounded} ft`;
    case MeasurementUnit.Meters:
      return `${rounded} m`;
    case MeasurementUnit.Centimeters:
      return `${rounded} cm`;
  }
}

/** Format area for display (e.g. "600 sq ft") */
export function formatArea(value: number, unit: MeasurementUnit): string {
  const rounded = Math.round(value);
  switch (unit) {
    case MeasurementUnit.Feet:
      return `${rounded} sq ft`;
    case MeasurementUnit.Meters:
      return `${rounded} sq m`;
    case MeasurementUnit.Centimeters:
      return `${rounded} sq cm`;
  }
}
