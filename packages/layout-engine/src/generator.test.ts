import { describe, it, expect } from 'vitest';
import { generateLayout } from './generator.js';
import { RoomType } from '@planora/domain';

describe('Layout Engine Generator', () => {
  it('generates 3 candidate layouts matching requested room program', () => {
    const boundary = { x: 0, y: 0, width: 9000, height: 6000 };
    const roomProgram = [
      { id: '1', type: RoomType.LivingRoom, name: 'Living Room', count: 1, targetArea: 24 },
      { id: '2', type: RoomType.Bedroom, name: 'Bedroom', count: 1, targetArea: 16 },
      { id: '3', type: RoomType.Kitchen, name: 'Kitchen', count: 1, targetArea: 10 },
      { id: '4', type: RoomType.Bathroom, name: 'Bathroom', count: 1, targetArea: 6 },
    ];

    const layouts = generateLayout({
      boundary,
      roomProgram,
      candidateCount: 3,
    });

    expect(layouts).toHaveLength(3);

    for (const layout of layouts) {
      expect(layout.boundary).toEqual(boundary);
      expect(layout.rooms.length).toBeGreaterThanOrEqual(4);
      expect(layout.walls.length).toBeGreaterThanOrEqual(4); // At least 4 perimeter walls
      expect(layout.openings.length).toBeGreaterThan(0);
      expect(layout.furniture.length).toBeGreaterThan(0);
      expect(layout.score).toBeGreaterThan(80);

      // Verify all rooms are inside boundary
      for (const room of layout.rooms) {
        expect(room.boundary.x).toBeGreaterThanOrEqual(boundary.x);
        expect(room.boundary.y).toBeGreaterThanOrEqual(boundary.y);
        expect(room.boundary.x + room.boundary.width).toBeLessThanOrEqual(boundary.x + boundary.width + 1);
        expect(room.boundary.y + room.boundary.height).toBeLessThanOrEqual(boundary.y + boundary.height + 1);
      }
    }
  });

  it('handles single room studio gracefully', () => {
    const boundary = { x: 0, y: 0, width: 6000, height: 4000 };
    const roomProgram = [
      { id: '1', type: RoomType.LivingRoom, name: 'Open Studio', count: 1, targetArea: 24 },
    ];

    const layouts = generateLayout({
      boundary,
      roomProgram,
      candidateCount: 1,
    });

    expect(layouts).toHaveLength(1);
    expect(layouts[0].rooms).toHaveLength(1);
    expect(layouts[0].rooms[0].boundary.width).toBe(boundary.width);
    expect(layouts[0].rooms[0].boundary.height).toBe(boundary.height);
  });
});
