// ────────────────────────────────────────────────────────────────
// Planora — Architectural Blueprint Templates Catalog
// ────────────────────────────────────────────────────────────────
// Pre-configured, structurally validated templates across residential,
// commercial, loft, and townhouse archetypes.
// ────────────────────────────────────────────────────────────────

import {
  ProjectType,
  MeasurementUnit,
  DesignStyle,
  FurnitureDensity,
  RoomType,
} from '@planora/domain';
import type { RoomProgramEntry } from '@planora/domain';

export interface ArchitecturalTemplate {
  id: string;
  name: string;
  category: 'Apartments' | 'Houses' | 'Lofts' | 'Commercial';
  tag: string;
  description: string;
  areaSqFt: number;
  areaSqM: number;
  details: string;
  archetype: ProjectType;
  dimensions: {
    length: number; // ft
    width: number;  // ft
    height: number; // ft
  };
  unit: MeasurementUnit;
  floors: number;
  style: DesignStyle;
  density: FurnitureDensity;
  paletteAccents: string[];
  roomProgram: RoomProgramEntry[];
  /** SVG preview layout elements for card visualization */
  svgPreview: {
    viewBox: string;
    rooms: {
      name: string;
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
    }[];
  };
}

export const ARCHITECTURAL_TEMPLATES: ArchitecturalTemplate[] = [
  // ── APARTMENTS & STUDIOS ───────────────────────────────────────
  {
    id: 'tpl-studio-micro',
    name: 'Micro Studio Flat',
    category: 'Apartments',
    tag: 'Compact',
    description: 'High-efficiency urban studio optimizing open circulation, integrated kitchenette, and full bathroom.',
    areaSqFt: 450,
    areaSqM: 42,
    details: '1 Bath • Efficiency Galley • Murphy Bed Ready',
    archetype: ProjectType.Apartment,
    dimensions: { length: 25, width: 18, height: 9 },
    unit: MeasurementUnit.Feet,
    floors: 1,
    style: DesignStyle.Minimal,
    density: FurnitureDensity.Sparse,
    paletteAccents: ['#FAFAFA', '#E2E8F0', '#246BFD'],
    roomProgram: [
      { id: 'rp-1', type: RoomType.LivingRoom, name: 'Studio Living & Bed', count: 1, targetArea: 270 },
      { id: 'rp-2', type: RoomType.Kitchen, name: 'Efficiency Kitchenette', count: 1, targetArea: 70 },
      { id: 'rp-3', type: RoomType.Bathroom, name: 'Bathroom', count: 1, targetArea: 50 },
      { id: 'rp-4', type: RoomType.EntryHall, name: 'Entry Foyer', count: 1, targetArea: 35 },
    ],
    svgPreview: {
      viewBox: '0 0 200 150',
      rooms: [
        { name: 'Studio', x: 10, y: 10, w: 120, h: 130, color: '#DBEAFE' },
        { name: 'Kitchen', x: 135, y: 10, w: 55, h: 60, color: '#FEF3C7' },
        { name: 'Bath', x: 135, y: 75, w: 55, h: 65, color: '#D1FAE5' },
      ],
    },
  },
  {
    id: 'tpl-1bed-garden',
    name: '1-Bedroom Garden Suite',
    category: 'Apartments',
    tag: 'Popular',
    description: 'Balanced 1-bedroom flat with generous living room, breakfast bar kitchen, and dedicated balcony egress.',
    areaSqFt: 650,
    areaSqM: 60,
    details: '1 Bed, 1 Bath • Breakfast Bar • Balcony',
    archetype: ProjectType.Apartment,
    dimensions: { length: 30, width: 22, height: 9.5 },
    unit: MeasurementUnit.Feet,
    floors: 1,
    style: DesignStyle.Nordic,
    density: FurnitureDensity.Balanced,
    paletteAccents: ['#FAF6EE', '#A3B18A', '#DDA15E'],
    roomProgram: [
      { id: 'rp-1', type: RoomType.LivingRoom, name: 'Living Room', count: 1, targetArea: 250 },
      { id: 'rp-2', type: RoomType.Bedroom, name: 'Primary Bedroom', count: 1, targetArea: 180 },
      { id: 'rp-3', type: RoomType.Kitchen, name: 'Open Kitchen / Dining', count: 1, targetArea: 110 },
      { id: 'rp-4', type: RoomType.Bathroom, name: 'Full Bathroom', count: 1, targetArea: 55 },
      { id: 'rp-5', type: RoomType.Balcony, name: 'Garden Balcony', count: 1, targetArea: 45 },
    ],
    svgPreview: {
      viewBox: '0 0 200 150',
      rooms: [
        { name: 'Living', x: 10, y: 10, w: 100, h: 80, color: '#DBEAFE' },
        { name: 'Kitchen', x: 10, y: 95, w: 100, h: 45, color: '#FEF3C7' },
        { name: 'Bedroom', x: 115, y: 10, w: 75, h: 80, color: '#FEF3C7' },
        { name: 'Bath', x: 115, y: 95, w: 45, h: 45, color: '#D1FAE5' },
        { name: 'Deck', x: 165, y: 95, w: 25, h: 45, color: '#E0E7FF' },
      ],
    },
  },
  {
    id: 'tpl-2bed-urban',
    name: '2-Bedroom Urban Flat',
    category: 'Apartments',
    tag: 'Trending',
    description: 'Versatile dual-bedroom layout with master ensuite, guest room or private office, and spacious central lounge.',
    areaSqFt: 850,
    areaSqM: 79,
    details: '2 Bed, 1.5 Bath • Work From Home Nook',
    archetype: ProjectType.Apartment,
    dimensions: { length: 34, width: 25, height: 10 },
    unit: MeasurementUnit.Feet,
    floors: 1,
    style: DesignStyle.Modern,
    density: FurnitureDensity.Balanced,
    paletteAccents: ['#EAE3D2', '#246BFD', '#64748B'],
    roomProgram: [
      { id: 'rp-1', type: RoomType.LivingRoom, name: 'Living Room', count: 1, targetArea: 280 },
      { id: 'rp-2', type: RoomType.Bedroom, name: 'Primary Bedroom', count: 1, targetArea: 190 },
      { id: 'rp-3', type: RoomType.Bedroom, name: 'Guest Bedroom / Office', count: 1, targetArea: 140 },
      { id: 'rp-4', type: RoomType.Kitchen, name: 'Chef Kitchen', count: 1, targetArea: 120 },
      { id: 'rp-5', type: RoomType.Bathroom, name: 'Primary Bath', count: 1, targetArea: 60 },
      { id: 'rp-6', type: RoomType.Bathroom, name: 'Powder Room', count: 1, targetArea: 40 },
    ],
    svgPreview: {
      viewBox: '0 0 200 150',
      rooms: [
        { name: 'Living', x: 10, y: 10, w: 90, h: 85, color: '#DBEAFE' },
        { name: 'Kitchen', x: 10, y: 100, w: 90, h: 40, color: '#FEF3C7' },
        { name: 'Primary', x: 105, y: 10, w: 85, h: 55, color: '#FEF3C7' },
        { name: 'Guest Bed', x: 105, y: 70, w: 55, h: 40, color: '#FEF3C7' },
        { name: 'Bath', x: 105, y: 115, w: 40, h: 25, color: '#D1FAE5' },
        { name: 'Powder', x: 150, y: 115, w: 40, h: 25, color: '#D1FAE5' },
      ],
    },
  },
  {
    id: 'tpl-penthouse-luxury',
    name: 'Panoramic Penthouse Corner',
    category: 'Apartments',
    tag: 'Luxury',
    description: 'Expansive luxury penthouse with wrapped glass perimeter, grand entertaining salon, and split bedroom wings.',
    areaSqFt: 1500,
    areaSqM: 139,
    details: '2 Bed, 2.5 Bath • Grand Salon • Terrace',
    archetype: ProjectType.Apartment,
    dimensions: { length: 50, width: 30, height: 12 },
    unit: MeasurementUnit.Feet,
    floors: 1,
    style: DesignStyle.Modern,
    density: FurnitureDensity.Dense,
    paletteAccents: ['#F3F4F6', '#D4AF37', '#1E293B'],
    roomProgram: [
      { id: 'rp-1', type: RoomType.LivingRoom, name: 'Grand Entertaining Salon', count: 1, targetArea: 550 },
      { id: 'rp-2', type: RoomType.Kitchen, name: 'Island Gourmet Kitchen', count: 1, targetArea: 220 },
      { id: 'rp-3', type: RoomType.DiningRoom, name: 'Formal Dining', count: 1, targetArea: 180 },
      { id: 'rp-4', type: RoomType.Bedroom, name: 'Primary Suite', count: 1, targetArea: 280 },
      { id: 'rp-5', type: RoomType.Bedroom, name: 'Guest Suite', count: 1, targetArea: 180 },
      { id: 'rp-6', type: RoomType.Bathroom, name: 'Spa Ensuite', count: 1, targetArea: 90 },
    ],
    svgPreview: {
      viewBox: '0 0 200 150',
      rooms: [
        { name: 'Grand Salon', x: 10, y: 10, w: 110, h: 90, color: '#DBEAFE' },
        { name: 'Kitchen', x: 10, y: 105, w: 65, h: 35, color: '#FEF3C7' },
        { name: 'Dining', x: 80, y: 105, w: 40, h: 35, color: '#FEF3C7' },
        { name: 'Primary Suite', x: 125, y: 10, w: 65, h: 70, color: '#FEF3C7' },
        { name: 'Spa Bath', x: 125, y: 85, w: 65, h: 25, color: '#D1FAE5' },
        { name: 'Guest Suite', x: 125, y: 115, w: 65, h: 25, color: '#FEF3C7' },
      ],
    },
  },

  // ── HOUSES & VILLAS ───────────────────────────────────────────
  {
    id: 'tpl-suburban-ranch',
    name: 'Suburban Single-Story Ranch',
    category: 'Houses',
    tag: 'Family',
    description: 'Classic horizontal family floor plan with split bedroom privacy, formal entry hall, and central great room.',
    areaSqFt: 1800,
    areaSqM: 167,
    details: '3 Bed, 2 Bath • Mudroom • Great Room',
    archetype: ProjectType.House,
    dimensions: { length: 50, width: 36, height: 10 },
    unit: MeasurementUnit.Feet,
    floors: 1,
    style: DesignStyle.Classic,
    density: FurnitureDensity.Balanced,
    paletteAccents: ['#FDFBF7', '#8B4513', '#1E3A8A'],
    roomProgram: [
      { id: 'rp-1', type: RoomType.LivingRoom, name: 'Great Room', count: 1, targetArea: 420 },
      { id: 'rp-2', type: RoomType.Kitchen, name: 'Open Kitchen & Island', count: 1, targetArea: 240 },
      { id: 'rp-3', type: RoomType.Bedroom, name: 'Primary Suite', count: 1, targetArea: 280 },
      { id: 'rp-4', type: RoomType.Bedroom, name: 'Bedroom 2', count: 1, targetArea: 180 },
      { id: 'rp-5', type: RoomType.Bedroom, name: 'Bedroom 3', count: 1, targetArea: 160 },
      { id: 'rp-6', type: RoomType.Bathroom, name: 'Primary Bath', count: 1, targetArea: 80 },
      { id: 'rp-7', type: RoomType.Bathroom, name: 'Guest Bath', count: 1, targetArea: 60 },
    ],
    svgPreview: {
      viewBox: '0 0 200 150',
      rooms: [
        { name: 'Great Room', x: 60, y: 10, w: 80, h: 80, color: '#DBEAFE' },
        { name: 'Kitchen', x: 60, y: 95, w: 80, h: 45, color: '#FEF3C7' },
        { name: 'Primary', x: 10, y: 10, w: 45, h: 80, color: '#FEF3C7' },
        { name: 'Ensuite', x: 10, y: 95, w: 45, h: 45, color: '#D1FAE5' },
        { name: 'Bed 2', x: 145, y: 10, w: 45, h: 60, color: '#FEF3C7' },
        { name: 'Bed 3', x: 145, y: 75, w: 45, h: 45, color: '#FEF3C7' },
        { name: 'Bath 2', x: 145, y: 125, w: 45, h: 15, color: '#D1FAE5' },
      ],
    },
  },
  {
    id: 'tpl-scandi-villa',
    name: 'Scandinavian 2-Story Villa',
    category: 'Houses',
    tag: 'Architectural',
    description: 'Airy Nordic country villa with double-height light well, integrated sauna/spa, and organic timber materiality.',
    areaSqFt: 2400,
    areaSqM: 223,
    details: '4 Bed, 3 Bath • Double Height • Spa Ready',
    archetype: ProjectType.House,
    dimensions: { length: 48, width: 50, height: 10 },
    unit: MeasurementUnit.Feet,
    floors: 2,
    style: DesignStyle.Nordic,
    density: FurnitureDensity.Balanced,
    paletteAccents: ['#F8FAF9', '#A3B18A', '#588157'],
    roomProgram: [
      { id: 'rp-1', type: RoomType.LivingRoom, name: 'Cathedral Living Lounge', count: 1, targetArea: 500 },
      { id: 'rp-2', type: RoomType.DiningRoom, name: 'Sunlit Dining', count: 1, targetArea: 220 },
      { id: 'rp-3', type: RoomType.Kitchen, name: 'Birch Cabinet Kitchen', count: 1, targetArea: 250 },
      { id: 'rp-4', type: RoomType.Bedroom, name: 'Master Retreat', count: 1, targetArea: 320 },
      { id: 'rp-5', type: RoomType.Bedroom, name: 'Children Room 1', count: 1, targetArea: 180 },
      { id: 'rp-6', type: RoomType.Bedroom, name: 'Children Room 2', count: 1, targetArea: 180 },
      { id: 'rp-7', type: RoomType.Bathroom, name: 'Spa & Sauna Bath', count: 1, targetArea: 120 },
    ],
    svgPreview: {
      viewBox: '0 0 200 150',
      rooms: [
        { name: 'Cathedral Lounge', x: 10, y: 10, w: 95, h: 90, color: '#DBEAFE' },
        { name: 'Dining', x: 10, y: 105, w: 50, h: 35, color: '#FEF3C7' },
        { name: 'Kitchen', x: 65, y: 105, w: 40, h: 35, color: '#FEF3C7' },
        { name: 'Master', x: 110, y: 10, w: 80, h: 65, color: '#FEF3C7' },
        { name: 'Bed 2', x: 110, y: 80, w: 40, h: 60, color: '#FEF3C7' },
        { name: 'Bed 3', x: 155, y: 80, w: 35, h: 30, color: '#FEF3C7' },
        { name: 'Spa', x: 155, y: 115, w: 35, h: 25, color: '#D1FAE5' },
      ],
    },
  },
  {
    id: 'tpl-townhouse-modern',
    name: 'Modern 3-Story Townhouse',
    category: 'Houses',
    tag: 'Urban Home',
    description: 'Slender vertical footprint optimized for dense urban parcels, featuring rooftop terrace and flex office floor.',
    areaSqFt: 1350,
    areaSqM: 125,
    details: '3 Bed, 2 Bath • Rooftop Access • Flex Pod',
    archetype: ProjectType.House,
    dimensions: { length: 45, width: 30, height: 9.5 },
    unit: MeasurementUnit.Feet,
    floors: 1,
    style: DesignStyle.Modern,
    density: FurnitureDensity.Balanced,
    paletteAccents: ['#F8FAFC', '#246BFD', '#10B981'],
    roomProgram: [
      { id: 'rp-1', type: RoomType.LivingRoom, name: 'Open Concept Salon', count: 1, targetArea: 360 },
      { id: 'rp-2', type: RoomType.Kitchen, name: 'Linear Kitchen', count: 1, targetArea: 160 },
      { id: 'rp-3', type: RoomType.Bedroom, name: 'Primary Bedroom', count: 1, targetArea: 220 },
      { id: 'rp-4', type: RoomType.Bedroom, name: 'Bedroom 2', count: 1, targetArea: 160 },
      { id: 'rp-5', type: RoomType.HomeOffice, name: 'Executive Home Office', count: 1, targetArea: 130 },
      { id: 'rp-6', type: RoomType.Bathroom, name: 'Ensuite Bath', count: 1, targetArea: 65 },
    ],
    svgPreview: {
      viewBox: '0 0 200 150',
      rooms: [
        { name: 'Salon', x: 10, y: 10, w: 105, h: 80, color: '#DBEAFE' },
        { name: 'Kitchen', x: 10, y: 95, w: 105, h: 45, color: '#FEF3C7' },
        { name: 'Primary', x: 120, y: 10, w: 70, h: 50, color: '#FEF3C7' },
        { name: 'Office', x: 120, y: 65, w: 70, h: 40, color: '#E0E7FF' },
        { name: 'Bath', x: 120, y: 110, w: 70, h: 30, color: '#D1FAE5' },
      ],
    },
  },

  // ── LOFTS & WORKSPACES ────────────────────────────────────────
  {
    id: 'tpl-industrial-loft',
    name: 'Industrial Brick & Steel Loft',
    category: 'Lofts',
    tag: 'Industrial',
    description: 'Converted warehouse layout with raw gunmetal steel frames, concrete pillars, mezzanine sleeping, and 14ft clearance.',
    areaSqFt: 1100,
    areaSqM: 102,
    details: '14ft High Ceiling • Mezzanine Deck • 1.5 Bath',
    archetype: ProjectType.Apartment,
    dimensions: { length: 40, width: 28, height: 14 },
    unit: MeasurementUnit.Feet,
    floors: 1,
    style: DesignStyle.Industrial,
    density: FurnitureDensity.Sparse,
    paletteAccents: ['#ECEFF1', '#B45309', '#1F2937'],
    roomProgram: [
      { id: 'rp-1', type: RoomType.LivingRoom, name: 'Double-Height Living', count: 1, targetArea: 520 },
      { id: 'rp-2', type: RoomType.Kitchen, name: 'Stainless Island Kitchen', count: 1, targetArea: 180 },
      { id: 'rp-3', type: RoomType.Bedroom, name: 'Mezzanine Master', count: 1, targetArea: 210 },
      { id: 'rp-4', type: RoomType.Bathroom, name: 'Concrete Spa Bath', count: 1, targetArea: 80 },
      { id: 'rp-5', type: RoomType.HomeOffice, name: 'Studio Creative Pod', count: 1, targetArea: 110 },
    ],
    svgPreview: {
      viewBox: '0 0 200 150',
      rooms: [
        { name: 'Loft Living', x: 10, y: 10, w: 120, h: 130, color: '#DBEAFE' },
        { name: 'Mezzanine', x: 135, y: 10, w: 55, h: 55, color: '#E0E7FF' },
        { name: 'Kitchen', x: 135, y: 70, w: 55, h: 40, color: '#FEF3C7' },
        { name: 'Bath', x: 135, y: 115, w: 55, h: 25, color: '#D1FAE5' },
      ],
    },
  },
  {
    id: 'tpl-zen-courtyard',
    name: 'Minimalist Zen Courtyard Flat',
    category: 'Lofts',
    tag: 'Zen Minimal',
    description: 'Shoji-inspired tranquil retreat organized around an internal contemplative light atrium and tatami living room.',
    areaSqFt: 950,
    areaSqM: 88,
    details: 'Atrium Courtyard • Tatami Nook • Soaking Tub',
    archetype: ProjectType.House,
    dimensions: { length: 35, width: 27, height: 9 },
    unit: MeasurementUnit.Feet,
    floors: 1,
    style: DesignStyle.Minimal,
    density: FurnitureDensity.Sparse,
    paletteAccents: ['#FAFAFA', '#D1DAF4', '#4A4A4A'],
    roomProgram: [
      { id: 'rp-1', type: RoomType.LivingRoom, name: 'Engawa Tatami Lounge', count: 1, targetArea: 340 },
      { id: 'rp-2', type: RoomType.Bedroom, name: 'Minimalist Bedroom', count: 1, targetArea: 200 },
      { id: 'rp-3', type: RoomType.Kitchen, name: 'Clean Line Kitchen', count: 1, targetArea: 140 },
      { id: 'rp-4', type: RoomType.Bathroom, name: 'Cedar Soaking Bath', count: 1, targetArea: 90 },
      { id: 'rp-5', type: RoomType.HomeOffice, name: 'Tea & Study Pod', count: 1, targetArea: 90 },
    ],
    svgPreview: {
      viewBox: '0 0 200 150',
      rooms: [
        { name: 'Tatami Lounge', x: 10, y: 10, w: 90, h: 80, color: '#DBEAFE' },
        { name: 'Courtyard', x: 105, y: 35, w: 35, h: 50, color: '#E0F2FE' },
        { name: 'Kitchen', x: 10, y: 95, w: 90, h: 45, color: '#FEF3C7' },
        { name: 'Bedroom', x: 145, y: 10, w: 45, h: 75, color: '#FEF3C7' },
        { name: 'Bath', x: 105, y: 95, w: 85, h: 45, color: '#D1FAE5' },
      ],
    },
  },

  // ── COMMERCIAL & WORKSPACES ───────────────────────────────────
  {
    id: 'tpl-creative-agency',
    name: 'Creative Agency Studio Office',
    category: 'Commercial',
    tag: 'Commercial',
    description: 'Dynamic professional floor plate featuring central communal benching, glass boardroom, phone booths, and lounge bar.',
    areaSqFt: 2200,
    areaSqM: 204,
    details: 'Seats 18-24 • Boardroom • Coffee Bar',
    archetype: ProjectType.Commercial,
    dimensions: { length: 55, width: 40, height: 12 },
    unit: MeasurementUnit.Feet,
    floors: 1,
    style: DesignStyle.Modern,
    density: FurnitureDensity.Balanced,
    paletteAccents: ['#F8FAFC', '#246BFD', '#0EA5E9'],
    roomProgram: [
      { id: 'rp-1', type: RoomType.LivingRoom, name: 'Open Collaboration Studio', count: 1, targetArea: 800 },
      { id: 'rp-2', type: RoomType.HomeOffice, name: 'Executive Boardroom', count: 1, targetArea: 320 },
      { id: 'rp-3', type: RoomType.HomeOffice, name: 'Focus Pod / War Room', count: 1, targetArea: 200 },
      { id: 'rp-4', type: RoomType.Kitchen, name: 'Staff Lounge & Kitchenette', count: 1, targetArea: 260 },
      { id: 'rp-5', type: RoomType.EntryHall, name: 'Client Reception', count: 1, targetArea: 200 },
      { id: 'rp-6', type: RoomType.Bathroom, name: 'Executive Restroom 1', count: 1, targetArea: 80 },
      { id: 'rp-7', type: RoomType.Bathroom, name: 'Executive Restroom 2', count: 1, targetArea: 80 },
    ],
    svgPreview: {
      viewBox: '0 0 200 150',
      rooms: [
        { name: 'Open Studio', x: 10, y: 10, w: 100, h: 90, color: '#DBEAFE' },
        { name: 'Boardroom', x: 115, y: 10, w: 75, h: 50, color: '#E0E7FF' },
        { name: 'War Room', x: 115, y: 65, w: 75, h: 35, color: '#E0E7FF' },
        { name: 'Reception', x: 10, y: 105, w: 60, h: 35, color: '#FEF3C7' },
        { name: 'Cafe Bar', x: 75, y: 105, w: 70, h: 35, color: '#FEF3C7' },
        { name: 'W/C', x: 150, y: 105, w: 40, h: 35, color: '#D1FAE5' },
      ],
    },
  },
  {
    id: 'tpl-espresso-cafe',
    name: 'Artisan Espresso Bar & Cafe',
    category: 'Commercial',
    tag: 'Hospitality',
    description: 'High-throughput culinary floor layout with linear barista counter, banquette seating, POS queue, and back-of-house storage.',
    areaSqFt: 800,
    areaSqM: 74,
    details: 'Barista Line • 26 Covers • Restroom',
    archetype: ProjectType.Commercial,
    dimensions: { length: 40, width: 20, height: 11 },
    unit: MeasurementUnit.Feet,
    floors: 1,
    style: DesignStyle.Industrial,
    density: FurnitureDensity.Dense,
    paletteAccents: ['#ECEFF1', '#B45309', '#1F2937'],
    roomProgram: [
      { id: 'rp-1', type: RoomType.DiningRoom, name: 'Dining Seating & Banquette', count: 1, targetArea: 420 },
      { id: 'rp-2', type: RoomType.Kitchen, name: 'Barista Counter & Prep', count: 1, targetArea: 200 },
      { id: 'rp-3', type: RoomType.Bathroom, name: 'ADA Restroom', count: 1, targetArea: 70 },
      { id: 'rp-4', type: RoomType.Storage, name: 'Dry Storage & Roastery', count: 1, targetArea: 80 },
    ],
    svgPreview: {
      viewBox: '0 0 200 150',
      rooms: [
        { name: 'Main Seating', x: 10, y: 10, w: 120, h: 130, color: '#DBEAFE' },
        { name: 'Barista Bar', x: 135, y: 10, w: 55, h: 65, color: '#FEF3C7' },
        { name: 'Storage', x: 135, y: 80, w: 55, h: 30, color: '#E2E8F0' },
        { name: 'W/C', x: 135, y: 115, w: 55, h: 25, color: '#D1FAE5' },
      ],
    },
  },
];
