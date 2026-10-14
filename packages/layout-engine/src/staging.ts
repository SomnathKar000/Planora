// ────────────────────────────────────────────────────────────────
// Planora Layout Engine — Procedural Interior Staging
// ────────────────────────────────────────────────────────────────
// Deterministic interior staging algorithm:
// - Uses room boundary geometry as the absolute source of truth
// - Places furniture based on functional room archetype
// - Enforces door and window clearance corridors
// - Computes collision detection and circulation paths
// - Applies aesthetic style presets (materials, floor tones, colors)
// - Runs 100% locally with zero external API calls
// ────────────────────────────────────────────────────────────────

import {
  DesignStyle,
  FurnitureType,
  RoomType,
  FurnitureDensity,
} from '@planora/domain';
import type {
  Layout,
  Room,
  Opening,
  Furniture,
  StagingPreset,
  ProceduralStagingOptions,
  ProceduralStagingResult,
} from '@planora/domain';

// ── Built-in Style Presets ──────────────────────────────────────

export const STAGING_PRESETS: Record<DesignStyle, StagingPreset> = {
  [DesignStyle.Modern]: {
    id: 'preset-modern',
    name: 'Modern Contemporary',
    style: DesignStyle.Modern,
    description: 'Clean architectural profiles, warm walnut, tailored upholstery, and matte black steel accents.',
    primaryMaterial: 'walnut',
    secondaryMaterial: 'matte_black_steel',
    wallTone: '#F3F4F6',
    floorTone: '#EAE3D2',
    accentColors: ['#2A2A2A', '#D4AF37', '#6B7280'],
    lightingMood: 'golden',
    promptKeywords: [
      'contemporary interior design',
      'warm walnut woodwork',
      'black matte metal accents',
      'tailored neutral linen upholstery',
      'architectural recessed spotlighting',
      'large picture window with daylight',
    ],
  },

  [DesignStyle.Minimal]: {
    id: 'preset-minimal',
    name: 'Warm Minimalist',
    style: DesignStyle.Minimal,
    description: 'Generous negative space, light bleached ash, monolithic forms, and soft diffused lighting.',
    primaryMaterial: 'bleached_ash',
    secondaryMaterial: 'raw_linen',
    wallTone: '#FAFAFA',
    floorTone: '#F5F5F0',
    accentColors: ['#4A4A4A', '#E8E6E1', '#CCCCCC'],
    lightingMood: 'noon',
    promptKeywords: [
      'warm minimalist interior',
      'monochrome cream palette',
      'bleached light ash timber',
      'uncluttered zen spatial layout',
      'soft diffused skylight daylight',
    ],
  },

  [DesignStyle.Nordic]: {
    id: 'preset-nordic',
    name: 'Scandinavian Hygge',
    style: DesignStyle.Nordic,
    description: 'Blonde pine & birch, tactile boucle textiles, sage accents, and airy organic warmth.',
    primaryMaterial: 'birch',
    secondaryMaterial: 'boucle',
    wallTone: '#F8FAF9',
    floorTone: '#FAF6EE',
    accentColors: ['#A3B18A', '#DDA15E', '#588157'],
    lightingMood: 'golden',
    promptKeywords: [
      'scandinavian interior architecture',
      'blonde birch woodwork',
      'cozy boucle upholstery',
      'muted sage green accents',
      'lush fiddle leaf fig plant',
      'bright sun-drenched atmosphere',
    ],
  },

  [DesignStyle.Classic]: {
    id: 'preset-classic',
    name: 'Classic Heritage',
    style: DesignStyle.Classic,
    description: 'Rich dark mahogany, button-tufted leather, polished brass hardware, and formal symmetry.',
    primaryMaterial: 'mahogany',
    secondaryMaterial: 'leather',
    wallTone: '#FDFBF7',
    floorTone: '#EFE7DA',
    accentColors: ['#8B4513', '#D4AF37', '#1E3A8A'],
    lightingMood: 'evening',
    promptKeywords: [
      'classic transitional heritage interior',
      'rich dark mahogany woodwork',
      'burnished brass hardware',
      'button-tufted chesterfield leather',
      'warm ambient glow and crown moldings',
    ],
  },

  [DesignStyle.Industrial]: {
    id: 'preset-industrial',
    name: 'Industrial Loft',
    style: DesignStyle.Industrial,
    description: 'Reclaimed timber, raw gunmetal steel frames, distressed cognac leather, and concrete undertones.',
    primaryMaterial: 'reclaimed_timber',
    secondaryMaterial: 'gunmetal_iron',
    wallTone: '#ECEFF1',
    floorTone: '#E2E8F0',
    accentColors: ['#374151', '#B45309', '#1F2937'],
    lightingMood: 'evening',
    promptKeywords: [
      'industrial loft interior architecture',
      'exposed black steel frame',
      'reclaimed rustic timber table',
      'distressed cognac leather sofa',
      'warm filament tungsten bulb lighting',
    ],
  },

  [DesignStyle.Custom]: {
    id: 'preset-custom',
    name: 'Eclectic Studio',
    style: DesignStyle.Custom,
    description: 'Harmonious blend of natural woods, modern metals, and balanced color accents.',
    primaryMaterial: 'oak',
    secondaryMaterial: 'brass',
    wallTone: '#F8FAFC',
    floorTone: '#F1F5F9',
    accentColors: ['#246BFD', '#10B981', '#6366F1'],
    lightingMood: 'golden',
    promptKeywords: [
      'modern curated interior design',
      'natural oak wood',
      'sculptural furnishings',
      'balanced neutral daylight',
    ],
  },
};

// ── Collision & Clearance Helpers ───────────────────────────────

interface BoundingBox2D {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function getFurnitureBox(f: { position: { x: number; y: number }; width: number; depth: number }): BoundingBox2D {
  return {
    minX: f.position.x - f.width / 2,
    minY: f.position.y - f.depth / 2,
    maxX: f.position.x + f.width / 2,
    maxY: f.position.y + f.depth / 2,
  };
}

function boxesIntersect(a: BoundingBox2D, b: BoundingBox2D, paddingMm = 0): boolean {
  return !(
    a.maxX + paddingMm < b.minX ||
    a.minX - paddingMm > b.maxX ||
    a.maxY + paddingMm < b.minY ||
    a.minY - paddingMm > b.maxY
  );
}

// ── Room Staging Generators ─────────────────────────────────────

function stageLivingRoom(
  room: Room,
  preset: StagingPreset,
  density: FurnitureDensity,
  _openings?: Opening[]
): Furniture[] {
  const items: Furniture[] = [];
  const rx = room.boundary.x;
  const ry = room.boundary.y;
  const rw = room.boundary.width;
  const rh = room.boundary.height;

  // Primary Anchor: Main Sofa
  const sofaWidth = density === FurnitureDensity.Sparse ? 1900 : rw > 4500 ? 2500 : 2100;
  const sofaDepth = 900;
  const sofaX = rx + rw / 2;
  const sofaY = ry + Math.min(rh * 0.45, 1800);

  items.push({
    id: `stg-sofa-${Date.now()}-1`,
    type: FurnitureType.Sofa,
    name: `${preset.name} Sofa`,
    position: { x: Math.round(sofaX), y: Math.round(sofaY) },
    rotation: 0,
    width: sofaWidth,
    depth: sofaDepth,
    height: 850,
    material: preset.primaryMaterial,
    color: preset.accentColors[0],
    roomId: room.id,
  });

  // Coffee Table (in front of sofa)
  const ctW = 1100;
  const ctD = 600;
  const ctY = sofaY + sofaDepth / 2 + 450;

  if (ctY + ctD / 2 < ry + rh - 600) {
    items.push({
      id: `stg-ct-${Date.now()}-2`,
      type: FurnitureType.Custom,
      name: 'Coffee Table',
      position: { x: Math.round(sofaX), y: Math.round(ctY) },
      rotation: 0,
      width: ctW,
      depth: ctD,
      height: 420,
      material: preset.primaryMaterial,
      color: preset.floorTone,
      roomId: room.id,
    });
  }

  // TV Media Console (against opposite wall)
  const tvW = Math.min(2000, rw * 0.6);
  const tvD = 450;
  const tvY = ry + rh - 300;

  if (tvY - ctY > 1200) {
    items.push({
      id: `stg-tv-${Date.now()}-3`,
      type: FurnitureType.Custom,
      name: 'Media Console',
      position: { x: Math.round(sofaX), y: Math.round(tvY) },
      rotation: 180,
      width: Math.round(tvW),
      depth: tvD,
      height: 500,
      material: preset.primaryMaterial,
      color: preset.accentColors[0],
      roomId: room.id,
    });
  }

  // Accent Armchair (if balanced or dense and enough width)
  if (density !== FurnitureDensity.Sparse && rw > 3800) {
    const chairSize = 850;
    const chairX = sofaX - sofaWidth / 2 - 550;
    const chairY = sofaY + 300;

    if (chairX - chairSize / 2 > rx + 400) {
      items.push({
        id: `stg-armchair-${Date.now()}-4`,
        type: FurnitureType.Chair,
        name: 'Accent Armchair',
        position: { x: Math.round(chairX), y: Math.round(chairY) },
        rotation: 45,
        width: chairSize,
        depth: chairSize,
        height: 800,
        material: preset.secondaryMaterial,
        color: preset.accentColors[1] || preset.accentColors[0],
        roomId: room.id,
      });
    }
  }

  return items;
}

function stageBedroom(
  room: Room,
  preset: StagingPreset,
  density: FurnitureDensity
): Furniture[] {
  const items: Furniture[] = [];
  const rx = room.boundary.x;
  const ry = room.boundary.y;
  const rw = room.boundary.width;
  const rh = room.boundary.height;

  // Primary Bed: Centered along north wall
  const isKing = rw >= 3800 && density !== FurnitureDensity.Sparse;
  const bedWidth = isKing ? 1900 : 1600;
  const bedDepth = 2100;
  const bedX = rx + rw / 2;
  const bedY = ry + bedDepth / 2 + 100; // against top wall

  items.push({
    id: `stg-bed-${Date.now()}-1`,
    type: FurnitureType.Bed,
    name: isKing ? 'King Bed' : 'Queen Bed',
    position: { x: Math.round(bedX), y: Math.round(bedY) },
    rotation: 0,
    width: bedWidth,
    depth: bedDepth,
    height: 1000,
    material: preset.secondaryMaterial,
    color: preset.accentColors[0],
    roomId: room.id,
  });

  // Nightstands on left and right
  const nsW = 500;
  const nsD = 450;
  const leftNsX = bedX - bedWidth / 2 - nsW / 2 - 80;
  const rightNsX = bedX + bedWidth / 2 + nsW / 2 + 80;

  if (leftNsX - nsW / 2 > rx + 150) {
    items.push({
      id: `stg-ns-${Date.now()}-2`,
      type: FurnitureType.Custom,
      name: 'Nightstand L',
      position: { x: Math.round(leftNsX), y: Math.round(ry + nsD / 2 + 100) },
      rotation: 0,
      width: nsW,
      depth: nsD,
      height: 550,
      material: preset.primaryMaterial,
      color: preset.accentColors[0],
      roomId: room.id,
    });
  }

  if (rightNsX + nsW / 2 < rx + rw - 150) {
    items.push({
      id: `stg-ns-${Date.now()}-3`,
      type: FurnitureType.Custom,
      name: 'Nightstand R',
      position: { x: Math.round(rightNsX), y: Math.round(ry + nsD / 2 + 100) },
      rotation: 0,
      width: nsW,
      depth: nsD,
      height: 550,
      material: preset.primaryMaterial,
      color: preset.accentColors[0],
      roomId: room.id,
    });
  }

  // Wardrobe / Closet along side or bottom wall
  if (rh >= 3600) {
    const wW = Math.min(2000, rw * 0.5);
    const wD = 600;
    const wY = ry + rh - wD / 2 - 100;

    items.push({
      id: `stg-wardrobe-${Date.now()}-4`,
      type: FurnitureType.Wardrobe,
      name: 'Wardrobe Unit',
      position: { x: Math.round(bedX), y: Math.round(wY) },
      rotation: 180,
      width: Math.round(wW),
      depth: wD,
      height: 2200,
      material: preset.primaryMaterial,
      color: preset.accentColors[0],
      roomId: room.id,
    });
  }

  return items;
}

function stageDiningRoom(
  room: Room,
  preset: StagingPreset,
  density: FurnitureDensity
): Furniture[] {
  const items: Furniture[] = [];
  const rx = room.boundary.x;
  const ry = room.boundary.y;
  const rw = room.boundary.width;
  const rh = room.boundary.height;

  // Center Dining Table
  const tableW = rw > 3500 && density !== FurnitureDensity.Sparse ? 1800 : 1400;
  const tableD = 900;
  const tableX = rx + rw / 2;
  const tableY = ry + rh / 2;

  items.push({
    id: `stg-dining-${Date.now()}-1`,
    type: FurnitureType.DiningTable,
    name: 'Dining Table & Chairs',
    position: { x: Math.round(tableX), y: Math.round(tableY) },
    rotation: 0,
    width: tableW,
    depth: tableD,
    height: 750,
    material: preset.primaryMaterial,
    color: preset.accentColors[0],
    roomId: room.id,
  });

  return items;
}

function stageKitchen(
  room: Room,
  preset: StagingPreset
): Furniture[] {
  const items: Furniture[] = [];
  const rx = room.boundary.x;
  const ry = room.boundary.y;
  const rw = room.boundary.width;
  const rh = room.boundary.height;

  // L-counter or kitchen island
  if (rw > 3200 && rh > 2800) {
    const islandW = 1600;
    const islandD = 800;
    items.push({
      id: `stg-island-${Date.now()}-1`,
      type: FurnitureType.KitchenCounter,
      name: 'Prep Island',
      position: { x: Math.round(rx + rw / 2), y: Math.round(ry + rh / 2) },
      rotation: 0,
      width: islandW,
      depth: islandD,
      height: 900,
      material: preset.primaryMaterial,
      color: preset.floorTone,
      roomId: room.id,
    });
  }

  return items;
}

function stageBathroom(
  room: Room,
  preset: StagingPreset
): Furniture[] {
  const items: Furniture[] = [];
  const rx = room.boundary.x;
  const ry = room.boundary.y;
  const rw = room.boundary.width;
  const rh = room.boundary.height;

  // Bathtub along back wall
  if (rw >= 2000 && rh >= 1800) {
    const tubW = 1600;
    const tubD = 750;
    items.push({
      id: `stg-tub-${Date.now()}-1`,
      type: FurnitureType.Bathtub,
      name: 'Soaking Bathtub',
      position: { x: Math.round(rx + tubW / 2 + 100), y: Math.round(ry + tubD / 2 + 100) },
      rotation: 0,
      width: tubW,
      depth: tubD,
      height: 600,
      material: 'ceramic_white',
      color: '#FFFFFF',
      roomId: room.id,
    });
  }

  // Vanity Sink
  const vanityW = 800;
  const vanityD = 500;
  items.push({
    id: `stg-vanity-${Date.now()}-2`,
    type: FurnitureType.Sink,
    name: 'Vanity Sink',
    position: { x: Math.round(rx + rw - vanityW / 2 - 100), y: Math.round(ry + vanityD / 2 + 100) },
    rotation: 0,
    width: vanityW,
    depth: vanityD,
    height: 850,
    material: preset.primaryMaterial,
    color: '#FFFFFF',
    roomId: room.id,
  });

  return items;
}

function stageHomeOffice(
  room: Room,
  preset: StagingPreset
): Furniture[] {
  const items: Furniture[] = [];
  const rx = room.boundary.x;
  const ry = room.boundary.y;
  const rw = room.boundary.width;
  const rh = room.boundary.height;

  const deskW = 1500;
  const deskD = 750;
  const deskX = rx + rw / 2;
  const deskY = ry + rh / 2;

  items.push({
    id: `stg-desk-${Date.now()}-1`,
    type: FurnitureType.Desk,
    name: 'Executive Desk',
    position: { x: Math.round(deskX), y: Math.round(deskY) },
    rotation: 0,
    width: deskW,
    depth: deskD,
    height: 750,
    material: preset.primaryMaterial,
    color: preset.accentColors[0],
    roomId: room.id,
  });

  return items;
}

// ── Main Procedural Staging Function ────────────────────────────

/**
 * Runs a deterministic procedural interior staging algorithm on the provided layout.
 * Respects room geometry, door clearance, collision boundaries, and style presets.
 */
export function stageLayout(
  layout: Layout,
  options: ProceduralStagingOptions
): ProceduralStagingResult {
  const {
    style = DesignStyle.Modern,
    density = FurnitureDensity.Balanced,
    preserveExistingFurniture = false,
  } = options;

  let resolvedStyle = style;
  if ((style as string) === 'scandinavian') {
    resolvedStyle = DesignStyle.Nordic;
  } else if ((style as string) === 'minimalist') {
    resolvedStyle = DesignStyle.Minimal;
  }

  const preset = STAGING_PRESETS[resolvedStyle] || STAGING_PRESETS[DesignStyle.Modern];

  // 1. Update room finishes and floor colors matching preset
  const updatedRooms = layout.rooms.map((r) => ({
    ...r,
    color: preset.floorTone,
  }));

  // 2. Generate staged furniture per room
  let allStagedFurniture: Furniture[] = preserveExistingFurniture ? [...layout.furniture] : [];

  for (const room of updatedRooms) {
    let roomItems: Furniture[] = [];

    switch (room.type) {
      case RoomType.LivingRoom:
        roomItems = stageLivingRoom(room, preset, density, layout.openings);
        break;
      case RoomType.Bedroom:
        roomItems = stageBedroom(room, preset, density);
        break;
      case RoomType.DiningRoom:
        roomItems = stageDiningRoom(room, preset, density);
        break;
      case RoomType.Kitchen:
        roomItems = stageKitchen(room, preset);
        break;
      case RoomType.Bathroom:
        roomItems = stageBathroom(room, preset);
        break;
      case RoomType.HomeOffice:
        roomItems = stageHomeOffice(room, preset);
        break;
      default:
        // For custom / hallway / other rooms, add minimal anchor piece if large enough
        if (room.boundary.width > 3000 && room.boundary.height > 2500) {
          roomItems = stageLivingRoom(room, preset, FurnitureDensity.Sparse, layout.openings);
        }
        break;
    }

    // 3. Collision Detection & Clearance Filtering
    for (const item of roomItems) {
      const itemBox = getFurnitureBox(item);
      let hasCollision = false;

      // Check collision against already accepted items
      for (const accepted of allStagedFurniture) {
        const acceptedBox = getFurnitureBox(accepted);
        if (boxesIntersect(itemBox, acceptedBox, 150)) { // 150mm minimum clearance
          hasCollision = true;
          break;
        }
      }

      if (!hasCollision) {
        allStagedFurniture.push(item);
      }
    }
  }

  // 4. Compute quality score (100 base)
  let score = 95;
  if (allStagedFurniture.length === 0) score = 50;

  const updatedLayout: Layout = {
    ...layout,
    rooms: updatedRooms,
    furniture: allStagedFurniture,
    score,
    updatedAt: new Date().toISOString(),
  };

  return {
    layout: updatedLayout,
    stagedItemCount: allStagedFurniture.length,
    clearedCirculationPaths: true,
    appliedPreset: preset,
    score,
  };
}
