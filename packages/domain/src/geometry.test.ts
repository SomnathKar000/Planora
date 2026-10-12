import { describe, it, expect } from 'vitest';
import {
  toMillimeters,
  fromMillimeters,
  rectArea,
  rectContains,
  rectsOverlap,
  polygonArea,
} from './geometry.js';
import { MeasurementUnit } from './enums.js';

describe('Geometry & Unit Conversions', () => {
  it('converts feet to millimeters and back', () => {
    const feet = 30;
    const mm = toMillimeters(feet, MeasurementUnit.Feet);
    expect(mm).toBe(9144);
    expect(fromMillimeters(mm, MeasurementUnit.Feet)).toBeCloseTo(30, 2);
  });

  it('converts meters to millimeters and back', () => {
    const meters = 5;
    const mm = toMillimeters(meters, MeasurementUnit.Meters);
    expect(mm).toBe(5000);
    expect(fromMillimeters(mm, MeasurementUnit.Meters)).toBe(5);
  });

  it('calculates rectangular area correctly', () => {
    const rect = { x: 0, y: 0, width: 3000, height: 2000 };
    expect(rectArea(rect)).toBe(6000000);
  });

  it('accurately tests rect containment and overlap', () => {
    const outer = { x: 0, y: 0, width: 5000, height: 4000 };
    const inner = { x: 100, y: 100, width: 2000, height: 1500 };
    const outside = { x: 6000, y: 0, width: 1000, height: 1000 };
    const overlapping = { x: 4000, y: 2000, width: 2000, height: 2000 };

    expect(rectContains(outer, inner)).toBe(true);
    expect(rectContains(outer, outside)).toBe(false);
    expect(rectsOverlap(outer, overlapping)).toBe(true);
    expect(rectsOverlap(outer, outside)).toBe(false);
  });

  it('calculates shoelace polygon area for convex shapes', () => {
    const polygon = {
      vertices: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 3 },
        { x: 0, y: 3 },
      ],
    };
    expect(polygonArea(polygon)).toBe(12);
  });
});
