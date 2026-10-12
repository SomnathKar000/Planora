// ────────────────────────────────────────────────────────────────
// Planora Layout Engine — Parametric & Heuristic Layout Generator
// ────────────────────────────────────────────────────────────────

import type {
  Layout,
  Room,
  Wall,
  Opening,
  Furniture,
  RoomProgramEntry,
  Rect,
} from '@planora/domain';
import {
  RoomType,
  WallType,
  OpeningType,
  DoorSwing,
  FurnitureType,
} from '@planora/domain';

export interface GenerateOptions {
  boundary: Rect;
  roomProgram: RoomProgramEntry[];
  candidateCount?: number;
}

// Room color tokens for 2D floorplan visualization
const ROOM_COLORS: Record<string, string> = {
  [RoomType.LivingRoom]: '#EFF6FF', // Soft Blue
  [RoomType.Bedroom]: '#F5F3FF',   // Soft Purple
  [RoomType.Kitchen]: '#FFFBEB',   // Soft Amber
  [RoomType.Bathroom]: '#ECFDF5',  // Soft Emerald
  [RoomType.HomeOffice]: '#F0FDFA',// Soft Teal
  [RoomType.DiningRoom]: '#FEF2F2',// Soft Rose
  [RoomType.Hallway]: '#F8FAFC',   // Soft Slate
  [RoomType.Balcony]: '#F7FEE7',   // Soft Lime
  [RoomType.Storage]: '#F1F5F9',   // Light Gray
  [RoomType.Custom]: '#F8FAFC',
};

interface RoomReq {
  type: RoomType;
  name: string;
  weight: number; // area weight
}

/**
 * Generate geometrically valid candidate layouts based on boundary and room program.
 */
export function generateLayout(options: GenerateOptions): Layout[] {
  const { boundary, roomProgram, candidateCount = 3 } = options;

  // Flatten room program by count
  const roomReqs: RoomReq[] = [];
  for (const entry of roomProgram) {
    const count = entry.count || 1;
    for (let i = 0; i < count; i++) {
      const suffix = count > 1 ? ` ${i + 1}` : '';
      roomReqs.push({
        type: entry.type,
        name: `${entry.name || formatRoomTypeName(entry.type)}${suffix}`,
        weight: entry.targetArea || getDefaultAreaForType(entry.type),
      });
    }
  }

  // If no rooms requested, provide default standard studio/1BR
  if (roomReqs.length === 0) {
    roomReqs.push(
      { type: RoomType.LivingRoom, name: 'Living Room', weight: 24 },
      { type: RoomType.Bedroom, name: 'Primary Bedroom', weight: 16 },
      { type: RoomType.Kitchen, name: 'Kitchen', weight: 10 },
      { type: RoomType.Bathroom, name: 'Bathroom', weight: 6 },
    );
  }

  const layouts: Layout[] = [];

  for (let c = 0; c < candidateCount; c++) {
    const layoutId = `layout-${Date.now()}-${c + 1}`;
    const rooms = partitionSpace(boundary, roomReqs, c);
    const walls = generateWallsFromRooms(boundary, rooms);
    const openings = generateOpenings(walls, rooms);
    const furniture = generateFurniture(rooms);

    layouts.push({
      id: layoutId,
      version: 1,
      boundary: { ...boundary },
      rooms,
      walls,
      openings,
      furniture,
      score: 92 - c * 4,
      issues: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return layouts;
}

/**
 * Partition rectangular boundary into sub-rectangles matching room program
 */
function partitionSpace(boundary: Rect, reqs: RoomReq[], variantIndex: number): Room[] {
  const rooms: Room[] = [];
  const W = boundary.width;
  const H = boundary.height;
  const n = reqs.length;

  if (n === 1) {
    rooms.push({
      id: `room-1`,
      name: reqs[0].name,
      type: reqs[0].type,
      boundary: { x: boundary.x, y: boundary.y, width: W, height: H },
      areaSqMm: W * H,
      color: ROOM_COLORS[reqs[0].type] ?? '#F8FAFC',
    });
    return rooms;
  }

  const isAltVariant = variantIndex % 2 === 1;
  const splitRatio = isAltVariant ? 0.58 : 0.52;
  const isLandscape = W >= H;

  if (n === 2) {
    if (isLandscape) {
      const w1 = Math.round(W * splitRatio);
      rooms.push(createRoom(reqs[0], boundary.x, boundary.y, w1, H, 0));
      rooms.push(createRoom(reqs[1], boundary.x + w1, boundary.y, W - w1, H, 1));
    } else {
      const h1 = Math.round(H * splitRatio);
      rooms.push(createRoom(reqs[0], boundary.x, boundary.y, W, h1, 0));
      rooms.push(createRoom(reqs[1], boundary.x, boundary.y + h1, W, H - h1, 1));
    }
    return rooms;
  }

  if (isLandscape) {
    const leftW = Math.round(W * (isAltVariant ? 0.45 : 0.42));
    const rightW = W - leftW;

    const privateRooms = reqs.filter(
      (r) => r.type === RoomType.Bedroom || r.type === RoomType.Bathroom || r.type === RoomType.HomeOffice,
    );
    const socialRooms = reqs.filter(
      (r) => r.type !== RoomType.Bedroom && r.type !== RoomType.Bathroom && r.type !== RoomType.HomeOffice,
    );

    const leftList = privateRooms.length > 0 ? privateRooms : reqs.slice(0, Math.ceil(n / 2));
    const rightList = socialRooms.length > 0 ? socialRooms : reqs.slice(Math.ceil(n / 2));

    subdivideStack(leftList, boundary.x, boundary.y, leftW, H, 'vertical', rooms, 0);
    subdivideStack(rightList, boundary.x + leftW, boundary.y, rightW, H, 'vertical', rooms, leftList.length);
  } else {
    const topH = Math.round(H * (isAltVariant ? 0.45 : 0.42));
    const bottomH = H - topH;

    const topList = reqs.slice(0, Math.ceil(n / 2));
    const bottomList = reqs.slice(Math.ceil(n / 2));

    subdivideStack(topList, boundary.x, boundary.y, W, topH, 'horizontal', rooms, 0);
    subdivideStack(bottomList, boundary.x, boundary.y + topH, W, bottomH, 'horizontal', rooms, topList.length);
  }

  return rooms;
}

function subdivideStack(
  list: RoomReq[],
  x: number,
  y: number,
  w: number,
  h: number,
  direction: 'vertical' | 'horizontal',
  out: Room[],
  idStart: number,
) {
  if (list.length === 0) return;
  if (list.length === 1) {
    out.push(createRoom(list[0], x, y, w, h, idStart));
    return;
  }

  const totalWeight = list.reduce((sum, r) => sum + r.weight, 0);
  let currentOffset = 0;

  for (let i = 0; i < list.length; i++) {
    const req = list[i];
    const isLast = i === list.length - 1;
    const fraction = req.weight / totalWeight;

    if (direction === 'vertical') {
      const sliceH = isLast ? h - currentOffset : Math.round(h * fraction);
      out.push(createRoom(req, x, y + currentOffset, w, sliceH, idStart + i));
      currentOffset += sliceH;
    } else {
      const sliceW = isLast ? w - currentOffset : Math.round(w * fraction);
      out.push(createRoom(req, x + currentOffset, y, sliceW, h, idStart + i));
      currentOffset += sliceW;
    }
  }
}

function createRoom(req: RoomReq, x: number, y: number, w: number, h: number, index: number): Room {
  return {
    id: `room-${index + 1}`,
    name: req.name,
    type: req.type,
    boundary: { x, y, width: w, height: h },
    areaSqMm: w * h,
    color: ROOM_COLORS[req.type] ?? '#F8FAFC',
  };
}

/**
 * Generate structural walls: 4 perimeter exterior walls + interior partition walls along shared edges
 */
function generateWallsFromRooms(boundary: Rect, rooms: Room[]): Wall[] {
  const walls: Wall[] = [];
  let wallIndex = 1;

  // Exterior walls (boundary perimeter)
  const x0 = boundary.x;
  const y0 = boundary.y;
  const x1 = boundary.x + boundary.width;
  const y1 = boundary.y + boundary.height;

  walls.push({
    id: `wall-ext-${wallIndex++}`,
    start: { x: x0, y: y0 },
    end: { x: x1, y: y0 },
    thickness: 200,
    height: 2700,
    type: WallType.Exterior,
  });
  walls.push({
    id: `wall-ext-${wallIndex++}`,
    start: { x: x1, y: y0 },
    end: { x: x1, y: y1 },
    thickness: 200,
    height: 2700,
    type: WallType.Exterior,
  });
  walls.push({
    id: `wall-ext-${wallIndex++}`,
    start: { x: x1, y: y1 },
    end: { x: x0, y: y1 },
    thickness: 200,
    height: 2700,
    type: WallType.Exterior,
  });
  walls.push({
    id: `wall-ext-${wallIndex++}`,
    start: { x: x0, y: y1 },
    end: { x: x0, y: y0 },
    thickness: 200,
    height: 2700,
    type: WallType.Exterior,
  });

  // Interior walls (find adjacent edges between rooms)
  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      const a = rooms[i].boundary;
      const b = rooms[j].boundary;

      // Vertical shared edge
      if (Math.abs(a.x + a.width - b.x) < 5 || Math.abs(b.x + b.width - a.x) < 5) {
        const sharedX = Math.abs(a.x + a.width - b.x) < 5 ? b.x : a.x;
        const startY = Math.max(a.y, b.y);
        const endY = Math.min(a.y + a.height, b.y + b.height);
        if (endY - startY > 100) {
          walls.push({
            id: `wall-int-${wallIndex++}`,
            start: { x: sharedX, y: startY },
            end: { x: sharedX, y: endY },
            thickness: 120,
            height: 2700,
            type: WallType.Interior,
          });
        }
      }

      // Horizontal shared edge
      if (Math.abs(a.y + a.height - b.y) < 5 || Math.abs(b.y + b.height - a.y) < 5) {
        const sharedY = Math.abs(a.y + a.height - b.y) < 5 ? b.y : a.y;
        const startX = Math.max(a.x, b.x);
        const endX = Math.min(a.x + a.width, b.x + b.width);
        if (endX - startX > 100) {
          walls.push({
            id: `wall-int-${wallIndex++}`,
            start: { x: startX, y: sharedY },
            end: { x: endX, y: sharedY },
            thickness: 120,
            height: 2700,
            type: WallType.Interior,
          });
        }
      }
    }
  }

  return walls;
}

/**
 * Generate doors & windows along walls
 */
function generateOpenings(walls: Wall[], _rooms: Room[]): Opening[] {
  const openings: Opening[] = [];
  let openingIndex = 1;

  for (const wall of walls) {
    const isInterior = wall.type === WallType.Interior;
    const len = Math.hypot(wall.end.x - wall.start.x, wall.end.y - wall.start.y);

    if (len < 1200) continue;

    if (isInterior) {
      openings.push({
        id: `opening-${openingIndex++}`,
        type: OpeningType.Door,
        wallId: wall.id,
        positionAlongWall: 0.5,
        width: 850,
        height: 2100,
        swing: DoorSwing.Right,
      });
    } else {
      openings.push({
        id: `opening-${openingIndex++}`,
        type: OpeningType.Window,
        wallId: wall.id,
        positionAlongWall: 0.5,
        width: 1400,
        height: 1200,
        sillHeight: 900,
      });
    }
  }

  return openings;
}

/**
 * Generate sensible default furniture pieces for each room
 */
function generateFurniture(rooms: Room[]): Furniture[] {
  const furniture: Furniture[] = [];
  let fIndex = 1;

  for (const room of rooms) {
    const b = room.boundary;
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;

    switch (room.type) {
      case RoomType.LivingRoom:
        furniture.push({
          id: `furn-${fIndex++}`,
          type: FurnitureType.Sofa,
          name: 'Modern 3-Seat Sofa',
          position: { x: cx, y: cy - 400 },
          rotation: 0,
          width: 2100,
          depth: 900,
          height: 850,
          roomId: room.id,
        });
        break;

      case RoomType.Bedroom:
        furniture.push({
          id: `furn-${fIndex++}`,
          type: FurnitureType.Bed,
          name: 'Queen Bed Platform',
          position: { x: cx, y: cy },
          rotation: 0,
          width: 1600,
          depth: 2100,
          height: 1000,
          roomId: room.id,
        });
        break;

      case RoomType.Kitchen:
      case RoomType.DiningRoom:
        furniture.push({
          id: `furn-${fIndex++}`,
          type: FurnitureType.DiningTable,
          name: 'Dining Table',
          position: { x: cx, y: cy },
          rotation: 0,
          width: 1400,
          depth: 850,
          height: 750,
          roomId: room.id,
        });
        break;

      case RoomType.Bathroom:
        furniture.push({
          id: `furn-${fIndex++}`,
          type: FurnitureType.Bathtub,
          name: 'Freestanding Bathtub',
          position: { x: b.x + 850, y: b.y + 500 },
          rotation: 0,
          width: 1500,
          depth: 750,
          height: 600,
          roomId: room.id,
        });
        break;

      case RoomType.HomeOffice:
        furniture.push({
          id: `furn-${fIndex++}`,
          type: FurnitureType.Desk,
          name: 'Executive Workstation',
          position: { x: cx, y: cy },
          rotation: 0,
          width: 1500,
          depth: 750,
          height: 750,
          roomId: room.id,
        });
        break;
    }
  }

  return furniture;
}

function formatRoomTypeName(type: RoomType): string {
  switch (type) {
    case RoomType.LivingRoom:
      return 'Living Room';
    case RoomType.Bedroom:
      return 'Bedroom';
    case RoomType.Kitchen:
      return 'Kitchen';
    case RoomType.Bathroom:
      return 'Bathroom';
    case RoomType.HomeOffice:
      return 'Home Office';
    case RoomType.DiningRoom:
      return 'Dining Room';
    case RoomType.Hallway:
      return 'Hallway';
    case RoomType.Balcony:
      return 'Balcony';
    default:
      return 'Room';
  }
}

function getDefaultAreaForType(type: RoomType): number {
  switch (type) {
    case RoomType.LivingRoom:
      return 24;
    case RoomType.Bedroom:
      return 16;
    case RoomType.Kitchen:
      return 12;
    case RoomType.Bathroom:
      return 6;
    case RoomType.HomeOffice:
      return 12;
    case RoomType.DiningRoom:
      return 14;
    default:
      return 10;
  }
}
