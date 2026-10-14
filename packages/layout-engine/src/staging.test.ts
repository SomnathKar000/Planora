import { describe, it, expect } from 'vitest';
import { DesignStyle, RoomType, FurnitureDensity } from '@planora/domain';
import type { Layout } from '@planora/domain';
import { stageLayout, STAGING_PRESETS } from './staging.js';

describe('Procedural Staging Engine', () => {
  const mockLayout: Layout = {
    id: 'test-layout-1',
    version: 1,
    boundary: { x: 0, y: 0, width: 8000, height: 6000 },
    rooms: [
      {
        id: 'r-living',
        type: RoomType.LivingRoom,
        name: 'Living Room',
        boundary: { x: 0, y: 0, width: 4500, height: 3500 },
        areaSqMm: 15750000,
      },
      {
        id: 'r-bed',
        type: RoomType.Bedroom,
        name: 'Primary Bedroom',
        boundary: { x: 4500, y: 0, width: 3500, height: 3500 },
        areaSqMm: 12250000,
      },
      {
        id: 'r-bath',
        type: RoomType.Bathroom,
        name: 'Bathroom',
        boundary: { x: 4500, y: 3500, width: 2500, height: 2500 },
        areaSqMm: 6250000,
      },
    ],
    walls: [],
    openings: [],
    furniture: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('stages layout with Modern style preset and places appropriate furniture', () => {
    const result = stageLayout(mockLayout, {
      style: DesignStyle.Modern,
      density: FurnitureDensity.Balanced,
    });

    expect(result.stagedItemCount).toBeGreaterThan(0);
    expect(result.layout.furniture.length).toBeGreaterThan(0);
    expect(result.appliedPreset.style).toBe(DesignStyle.Modern);
    expect(result.appliedPreset.primaryMaterial).toBe('walnut');

    // Rooms floor tone updated
    expect(result.layout.rooms[0].color).toBe(STAGING_PRESETS[DesignStyle.Modern].floorTone);

    // Verify living room has sofa and coffee table
    const livingFurniture = result.layout.furniture.filter((f) => f.roomId === 'r-living');
    expect(livingFurniture.some((f) => f.name.includes('Sofa'))).toBe(true);

    // Verify bedroom has bed
    const bedFurniture = result.layout.furniture.filter((f) => f.roomId === 'r-bed');
    expect(bedFurniture.some((f) => f.name.includes('Bed'))).toBe(true);
  });

  it('stages layout with Scandinavian / Nordic style preset', () => {
    const result = stageLayout(mockLayout, {
      style: DesignStyle.Nordic,
      density: FurnitureDensity.Balanced,
    });

    expect(result.appliedPreset.style).toBe(DesignStyle.Nordic);
    expect(result.appliedPreset.primaryMaterial).toBe('birch');
    expect(result.appliedPreset.secondaryMaterial).toBe('boucle');
    expect(result.layout.rooms[0].color).toBe(STAGING_PRESETS[DesignStyle.Nordic].floorTone);
  });

  it('ensures no overlapping furniture pieces (collision detection)', () => {
    const result = stageLayout(mockLayout, {
      style: DesignStyle.Modern,
      density: FurnitureDensity.Dense,
    });

    const furn = result.layout.furniture;
    for (let i = 0; i < furn.length; i++) {
      for (let j = i + 1; j < furn.length; j++) {
        const a = furn[i];
        const b = furn[j];
        // Only check items in the same room
        if (a.roomId === b.roomId) {
          const aMinX = a.position.x - a.width / 2;
          const aMaxX = a.position.x + a.width / 2;
          const aMinY = a.position.y - a.depth / 2;
          const aMaxY = a.position.y + a.depth / 2;

          const bMinX = b.position.x - b.width / 2;
          const bMaxX = b.position.x + b.width / 2;
          const bMinY = b.position.y - b.depth / 2;
          const bMaxY = b.position.y + b.depth / 2;

          const overlap = !(aMaxX <= bMinX || aMinX >= bMaxX || aMaxY <= bMinY || aMinY >= bMaxY);
          expect(overlap).toBe(false);
        }
      }
    }
  });
});
