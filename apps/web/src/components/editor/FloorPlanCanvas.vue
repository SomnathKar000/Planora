<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import type { Layout, Room, Furniture, Wall, Opening } from '@planora/domain';
import { MeasurementUnit, fromMillimeters, FurnitureType, WallType, OpeningType } from '@planora/domain';
import ToolDock, { type EditorTool } from '@/components/editor/ToolDock.vue';
import {
  Plus,
  Minus,
  Maximize2,
  RotateCw,
  Trash2,
  Copy,
} from '@lucide/vue';

const props = defineProps<{
  layout: Layout;
  unit: MeasurementUnit;
  lengthFt: number;
  widthFt: number;
}>();

const emit = defineEmits<{
  (e: 'update:layout', layout: Layout): void;
  (e: 'select-room', room: Room | null): void;
  (e: 'select-furniture', furniture: Furniture | null): void;
  (e: 'open-catalog'): void;
}>();

const activeTool = ref<EditorTool>('select');
const selectedRoomId = ref<string | null>(null);
const selectedFurnitureId = ref<string | null>(null);

// Zoom and pan state
const zoomLevel = ref(1);
const panOffset = ref({ x: 0, y: 0 });

function zoomIn() {
  zoomLevel.value = Math.min(2.5, Math.round((zoomLevel.value + 0.15) * 100) / 100);
}

function zoomOut() {
  zoomLevel.value = Math.max(0.4, Math.round((zoomLevel.value - 0.15) * 100) / 100);
}

function resetZoom() {
  zoomLevel.value = 1;
  panOffset.value = { x: 0, y: 0 };
}

// Coordinate scaling: map boundary mm to SVG viewBox (600 x 400 default view coordinate space)
const svgWidth = 600;
const svgHeight = 400;

const scaleX = computed(() => {
  const w = props.layout.boundary.width || 1;
  return (svgWidth - 30) / w;
});

const scaleY = computed(() => {
  const h = props.layout.boundary.height || 1;
  return (svgHeight - 30) / h;
});

function mmToSvgX(xMm: number): number {
  return 15 + xMm * scaleX.value;
}

function mmToSvgY(yMm: number): number {
  return 15 + yMm * scaleY.value;
}

function mmToSvgW(wMm: number): number {
  return wMm * scaleX.value;
}

function mmToSvgH(hMm: number): number {
  return hMm * scaleY.value;
}

function svgToMmX(svgX: number): number {
  return Math.max(0, (svgX - 15) / scaleX.value);
}

function svgToMmY(svgY: number): number {
  return Math.max(0, (svgY - 15) / scaleY.value);
}

// Convert mm to display unit string
function formatDisplayDims(wMm: number, hMm: number): string {
  const w = Math.round(fromMillimeters(wMm, props.unit));
  const h = Math.round(fromMillimeters(hMm, props.unit));
  const unitStr = props.unit === MeasurementUnit.Feet ? 'ft' : 'm';
  return `${w} × ${h} ${unitStr}`;
}

// Currently selected objects
const selectedRoom = computed(() => {
  return props.layout.rooms.find((r) => r.id === selectedRoomId.value) || null;
});

const selectedFurniture = computed(() => {
  return props.layout.furniture.find((f) => f.id === selectedFurnitureId.value) || null;
});

function selectRoom(room: Room) {
  if (activeTool.value !== 'select') return;
  selectedRoomId.value = room.id;
  selectedFurnitureId.value = null;
  emit('select-room', room);
  emit('select-furniture', null);
}

function selectFurniture(furn: Furniture) {
  if (activeTool.value !== 'select') return;
  selectedFurnitureId.value = furn.id;
  selectedRoomId.value = null;
  emit('select-furniture', furn);
  emit('select-room', null);
}

function deselectAll() {
  selectedRoomId.value = null;
  selectedFurnitureId.value = null;
  emit('select-room', null);
  emit('select-furniture', null);
}

// ────────────────────────────────────────────────────────────────
// 1. Interactive Furniture Dragging & Transformation
// ────────────────────────────────────────────────────────────────
const isDraggingFurn = ref(false);
const dragFurnId = ref<string | null>(null);
let dragStartPos = { x: 0, y: 0 };
let dragStartClient = { x: 0, y: 0 };

function startDragFurniture(furn: Furniture, e: MouseEvent) {
  if (activeTool.value !== 'select') return;
  e.stopPropagation();
  selectFurniture(furn);

  isDraggingFurn.value = true;
  dragFurnId.value = furn.id;
  dragStartPos = { x: furn.position.x, y: furn.position.y };
  dragStartClient = { x: e.clientX, y: e.clientY };

  window.addEventListener('mousemove', onDragFurnitureMove);
  window.addEventListener('mouseup', onDragFurnitureUp);
}

function onDragFurnitureMove(e: MouseEvent) {
  if (!isDraggingFurn.value || !dragFurnId.value) return;

  const dxClient = e.clientX - dragStartClient.x;
  const dyClient = e.clientY - dragStartClient.y;

  // Convert client pixel delta to mm coordinates (considering current zoom level and SVG scale)
  const dxMm = dxClient / (scaleX.value * zoomLevel.value);
  const dyMm = dyClient / (scaleY.value * zoomLevel.value);

  // Snap to 100mm increments
  const rawX = dragStartPos.x + dxMm;
  const rawY = dragStartPos.y + dyMm;
  const snappedX = Math.round(rawX / 100) * 100;
  const snappedY = Math.round(rawY / 100) * 100;

  // Clamp within boundary
  const b = props.layout.boundary;
  const clampedX = Math.max(500, Math.min(b.width - 500, snappedX));
  const clampedY = Math.max(500, Math.min(b.height - 500, snappedY));

  const updatedFurniture = props.layout.furniture.map((f) => {
    if (f.id === dragFurnId.value) {
      return { ...f, position: { ...f.position, x: clampedX, y: clampedY } };
    }
    return f;
  });

  emit('update:layout', { ...props.layout, furniture: updatedFurniture });
}

function onDragFurnitureUp() {
  isDraggingFurn.value = false;
  dragFurnId.value = null;
  window.removeEventListener('mousemove', onDragFurnitureMove);
  window.removeEventListener('mouseup', onDragFurnitureUp);
}

function rotateSelectedFurniture(degDelta = 90) {
  if (!selectedFurniture.value) return;
  const curRot = selectedFurniture.value.rotation || 0;
  const newRot = (curRot + degDelta) % 360;

  const updated = props.layout.furniture.map((f) =>
    f.id === selectedFurnitureId.value ? { ...f, rotation: newRot } : f
  );
  emit('update:layout', { ...props.layout, furniture: updated });
}

function duplicateSelectedFurniture() {
  if (!selectedFurniture.value) return;
  const source = selectedFurniture.value;
  const newId = `furn-${Date.now()}`;
  const duplicate: Furniture = {
    ...source,
    id: newId,
    name: `${source.name} (Copy)`,
    position: {
      x: Math.min(props.layout.boundary.width - 600, source.position.x + 400),
      y: Math.min(props.layout.boundary.height - 600, source.position.y + 400),
    },
  };

  emit('update:layout', {
    ...props.layout,
    furniture: [...props.layout.furniture, duplicate],
  });
  selectFurniture(duplicate);
}

function deleteSelectedFurniture() {
  if (!selectedFurnitureId.value) return;
  const filtered = props.layout.furniture.filter((f) => f.id !== selectedFurnitureId.value);
  emit('update:layout', { ...props.layout, furniture: filtered });
  deselectAll();
}

// ────────────────────────────────────────────────────────────────
// 2. Interactive Room Resizing Handles
// ────────────────────────────────────────────────────────────────
type HandleType = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w';
const isResizingRoom = ref(false);
let activeHandle: HandleType | null = null;
let roomResizeStart = { x: 0, y: 0, width: 0, height: 0 };
let resizeStartClient = { x: 0, y: 0 };

function startResizeRoom(handle: HandleType, e: MouseEvent) {
  if (!selectedRoom.value) return;
  e.stopPropagation();

  isResizingRoom.value = true;
  activeHandle = handle;
  roomResizeStart = { ...selectedRoom.value.boundary };
  resizeStartClient = { x: e.clientX, y: e.clientY };

  window.addEventListener('mousemove', onResizeRoomMove);
  window.addEventListener('mouseup', onResizeRoomUp);
}

function onResizeRoomMove(e: MouseEvent) {
  if (!isResizingRoom.value || !selectedRoom.value || !activeHandle) return;

  const dxMm = (e.clientX - resizeStartClient.x) / (scaleX.value * zoomLevel.value);
  const dyMm = (e.clientY - resizeStartClient.y) / (scaleY.value * zoomLevel.value);

  let { x, y, width, height } = roomResizeStart;

  // Snapped to 100mm increments
  const snap = (v: number) => Math.round(v / 100) * 100;

  if (activeHandle === 'se' || activeHandle === 'e' || activeHandle === 's') {
    if (activeHandle.includes('e')) width = Math.max(1200, snap(width + dxMm));
    if (activeHandle.includes('s')) height = Math.max(1200, snap(height + dyMm));
  } else if (activeHandle === 'nw' || activeHandle === 'w' || activeHandle === 'n') {
    if (activeHandle.includes('w')) {
      const newW = Math.max(1200, snap(width - dxMm));
      x = x + (width - newW);
      width = newW;
    }
    if (activeHandle.includes('n')) {
      const newH = Math.max(1200, snap(height - dyMm));
      y = y + (height - newH);
      height = newH;
    }
  } else if (activeHandle === 'ne') {
    width = Math.max(1200, snap(width + dxMm));
    const newH = Math.max(1200, snap(height - dyMm));
    y = y + (height - newH);
    height = newH;
  } else if (activeHandle === 'sw') {
    height = Math.max(1200, snap(height + dyMm));
    const newW = Math.max(1200, snap(width - dxMm));
    x = x + (width - newW);
    width = newW;
  }

  const updatedRooms = props.layout.rooms.map((r) => {
    if (r.id === selectedRoomId.value) {
      return {
        ...r,
        boundary: { x, y, width, height },
        areaSqMm: width * height,
      };
    }
    return r;
  });

  emit('update:layout', { ...props.layout, rooms: updatedRooms });
}

function onResizeRoomUp() {
  isResizingRoom.value = false;
  activeHandle = null;
  window.removeEventListener('mousemove', onResizeRoomMove);
  window.removeEventListener('mouseup', onResizeRoomUp);
}

// ────────────────────────────────────────────────────────────────
// 3. Interactive Wall Drawing
// ────────────────────────────────────────────────────────────────
const isDrawingWall = ref(false);
const wallDraftStart = ref<{ x: number; y: number } | null>(null);
const wallDraftEnd = ref<{ x: number; y: number } | null>(null);

function getSvgCoords(e: MouseEvent, svgEl: SVGSVGElement): { x: number; y: number } {
  const rect = svgEl.getBoundingClientRect();
  const clickX = ((e.clientX - rect.left) / rect.width) * svgWidth;
  const clickY = ((e.clientY - rect.top) / rect.height) * svgHeight;
  return { x: clickX, y: clickY };
}

function handleCanvasMouseDown(e: MouseEvent) {
  const svgEl = (e.currentTarget as HTMLElement).querySelector('svg');
  if (!svgEl) return;

  const { x, y } = getSvgCoords(e, svgEl);
  const mmX = Math.round(svgToMmX(x) / 100) * 100;
  const mmY = Math.round(svgToMmY(y) / 100) * 100;

  if (activeTool.value === 'wall') {
    isDrawingWall.value = true;
    wallDraftStart.value = { x: mmX, y: mmY };
    wallDraftEnd.value = { x: mmX, y: mmY };
  } else if (activeTool.value === 'door' || activeTool.value === 'window') {
    const isDoor = activeTool.value === 'door';
    let closestWall = props.layout.walls[0];
    let minD = Infinity;
    let bestRatio = 0.5;

    for (const w of props.layout.walls) {
      const dx = w.end.x - w.start.x;
      const dy = w.end.y - w.start.y;
      const lenSq = dx * dx + dy * dy;
      if (lenSq === 0) continue;
      const t = Math.max(0.1, Math.min(0.9, ((mmX - w.start.x) * dx + (mmY - w.start.y) * dy) / lenSq));
      const projX = w.start.x + t * dx;
      const projY = w.start.y + t * dy;
      const dist = Math.hypot(mmX - projX, mmY - projY);
      if (dist < minD) {
        minD = dist;
        closestWall = w;
        bestRatio = t;
      }
    }

    if (closestWall) {
      const newOpening: Opening = {
        id: `op-${Date.now()}`,
        wallId: closestWall.id,
        type: isDoor ? OpeningType.Door : OpeningType.Window,
        positionAlongWall: Math.round(bestRatio * 100) / 100,
        width: isDoor ? 900 : 1200,
        height: 2100,
      };
      emit('update:layout', {
        ...props.layout,
        openings: [...props.layout.openings, newOpening],
      });
    }
    activeTool.value = 'select';
  } else if (activeTool.value === 'furniture') {
    emit('open-catalog');
    activeTool.value = 'select';
  } else {
    // Select tool background click
    deselectAll();
  }
}

function getOpeningCoords(op: Opening) {
  const wall = props.layout.walls.find((w) => w.id === op.wallId);
  if (!wall) {
    return {
      x1: 1500,
      y1: 0,
      x2: 1500 + op.width,
      y2: 0,
      cx: 1500 + op.width / 2,
      cy: 0,
    };
  }
  const ratio = op.positionAlongWall ?? 0.5;
  const cx = wall.start.x + (wall.end.x - wall.start.x) * ratio;
  const cy = wall.start.y + (wall.end.y - wall.start.y) * ratio;
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const len = Math.hypot(dx, dy) || 1;
  const halfW = op.width / 2;

  const ux = dx / len;
  const uy = dy / len;

  return {
    cx,
    cy,
    x1: cx - ux * halfW,
    y1: cy - uy * halfW,
    x2: cx + ux * halfW,
    y2: cy + uy * halfW,
  };
}

function handleCanvasMouseMove(e: MouseEvent) {
  if (!isDrawingWall.value || !wallDraftStart.value) return;

  const svgEl = (e.currentTarget as HTMLElement).querySelector('svg');
  if (!svgEl) return;

  const { x, y } = getSvgCoords(e, svgEl);
  let mmX = Math.round(svgToMmX(x) / 100) * 100;
  let mmY = Math.round(svgToMmY(y) / 100) * 100;

  // Orthogonal axis snapping (within 20 degrees lock to horizontal or vertical)
  const dx = Math.abs(mmX - wallDraftStart.value.x);
  const dy = Math.abs(mmY - wallDraftStart.value.y);
  if (dx > dy * 2) {
    mmY = wallDraftStart.value.y; // snap horizontal
  } else if (dy > dx * 2) {
    mmX = wallDraftStart.value.x; // snap vertical
  }

  wallDraftEnd.value = { x: mmX, y: mmY };
}

function handleCanvasMouseUp() {
  if (isDrawingWall.value && wallDraftStart.value && wallDraftEnd.value) {
    const start = wallDraftStart.value;
    const end = wallDraftEnd.value;
    const len = Math.hypot(end.x - start.x, end.y - start.y);

    if (len > 300) {
      const newWall: Wall = {
        id: `wall-${Date.now()}`,
        start,
        end,
        thickness: 150,
        height: 2700,
        type: WallType.Interior,
      };
      emit('update:layout', {
        ...props.layout,
        walls: [...props.layout.walls, newWall],
      });
    }

    isDrawingWall.value = false;
    wallDraftStart.value = null;
    wallDraftEnd.value = null;
    activeTool.value = 'select';
  }
}

// ────────────────────────────────────────────────────────────────
// 4. Keyboard Shortcuts (Delete, Rotate R, Escape)
// ────────────────────────────────────────────────────────────────
function handleKeyDown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

  if (e.key === 'Backspace' || e.key === 'Delete') {
    if (selectedFurnitureId.value) {
      deleteSelectedFurniture();
      e.preventDefault();
    } else if (selectedRoomId.value) {
      const filtered = props.layout.rooms.filter((r) => r.id !== selectedRoomId.value);
      emit('update:layout', { ...props.layout, rooms: filtered });
      deselectAll();
      e.preventDefault();
    }
  } else if (e.key === 'r' || e.key === 'R') {
    if (selectedFurnitureId.value) {
      rotateSelectedFurniture(90);
      e.preventDefault();
    }
  } else if (e.key === 'Escape') {
    deselectAll();
    isDrawingWall.value = false;
    wallDraftStart.value = null;
    wallDraftEnd.value = null;
    activeTool.value = 'select';
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('mousemove', onDragFurnitureMove);
  window.removeEventListener('mouseup', onDragFurnitureUp);
  window.removeEventListener('mousemove', onResizeRoomMove);
  window.removeEventListener('mouseup', onResizeRoomUp);
});
</script>

<template>
  <div
    class="relative flex-1 w-full h-full bg-[#F8FAFC] overflow-hidden flex items-center justify-center p-6 select-none"
    @mousedown="handleCanvasMouseDown"
    @mousemove="handleCanvasMouseMove"
    @mouseup="handleCanvasMouseUp"
  >
    <!-- Subtle CAD Grid Background (SVG Pattern) -->
    <div class="absolute inset-0 pointer-events-none opacity-40">
      <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#D1DAF4" stroke-width="0.5" />
          </pattern>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100%" height="100%" fill="url(#smallGrid)" />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#B3C5FF" stroke-width="1" />
          </pattern>
        </defs>
        <rect id="cad-canvas-bg" width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>

    <!-- Active Tool Status Badge (Top Left) -->
    <div
      v-if="activeTool !== 'select'"
      class="absolute top-4 left-4 bg-brand-primary text-white rounded-xl shadow-elevation-2 px-3 py-1.5 flex items-center gap-2 z-20 text-caption-xs font-semibold animate-fade-in"
    >
      <span class="w-2 h-2 rounded-full bg-white animate-pulse" />
      <span>
        {{
          activeTool === 'wall'
            ? 'Click & drag on canvas to draw interior wall (Esc to cancel)'
            : activeTool === 'door'
            ? 'Click on plan to place 900mm door fixture'
            : activeTool === 'window'
            ? 'Click on exterior wall to place double-glazed window'
            : 'Click to open furniture catalog'
        }}
      </span>
    </div>

    <!-- Zoom HUD Pill (Top right overlay on canvas) -->
    <div class="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-xl shadow-elevation-2 px-2.5 py-1 flex items-center gap-1.5 z-20 text-content-secondary border border-border-hairline">
      <button
        type="button"
        @click.stop="zoomIn"
        class="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded cursor-pointer transition-colors"
        title="Zoom In"
      >
        <Plus class="w-3.5 h-3.5" />
      </button>
      <span class="text-caption-xs font-mono font-bold px-1 text-content-primary">
        {{ Math.round(zoomLevel * 100) }}%
      </span>
      <button
        type="button"
        @click.stop="zoomOut"
        class="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded cursor-pointer transition-colors"
        title="Zoom Out"
      >
        <Minus class="w-3.5 h-3.5" />
      </button>
      <span class="w-px h-3.5 bg-border-hairline mx-0.5" />
      <button
        type="button"
        @click.stop="resetZoom"
        class="px-1.5 h-6 flex items-center gap-1 hover:bg-slate-100 rounded text-brand-primary cursor-pointer transition-colors text-[11px] font-semibold whitespace-nowrap"
        title="Fit to Screen"
      >
        <Maximize2 class="w-3.5 h-3.5" />
        <span>Fit</span>
      </button>
    </div>

    <!-- Scaled Drafting Board Container -->
    <div
      class="relative w-full max-w-[620px] aspect-[1.45/1] my-auto transition-transform duration-100"
      :style="{
        transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
        cursor: activeTool === 'wall' ? 'crosshair' : activeTool === 'select' ? 'default' : 'pointer',
      }"
    >
      <!-- TOP DIMENSION ARROW -->
      <div class="absolute -top-7 left-0 right-0 flex items-center justify-center pointer-events-none">
        <div class="w-full flex items-center px-4">
          <span class="text-[12px] text-content-secondary -mr-1">◀</span>
          <div class="flex-1 h-px bg-content-secondary/60" />
          <span class="px-2.5 py-0.5 bg-white font-mono text-[11px] font-bold text-content-primary shadow-xs rounded border border-border-hairline">
            {{ lengthFt }} {{ unit === MeasurementUnit.Feet ? 'ft' : 'm' }}
          </span>
          <div class="flex-1 h-px bg-content-secondary/60" />
          <span class="text-[12px] text-content-secondary -ml-1">▶</span>
        </div>
      </div>

      <!-- LEFT VERTICAL DIMENSION ARROW -->
      <div class="absolute -left-9 top-0 bottom-0 flex flex-col items-center justify-center pointer-events-none">
        <div class="h-full flex flex-col items-center py-4">
          <span class="text-[10px] text-content-secondary -mb-1">▲</span>
          <div class="flex-1 w-px bg-content-secondary/60" />
          <span class="py-1 px-1 bg-white font-mono text-[11px] font-bold text-content-primary shadow-xs rounded border border-border-hairline [writing-mode:vertical-rl] rotate-180">
            {{ widthFt }} {{ unit === MeasurementUnit.Feet ? 'ft' : 'm' }}
          </span>
          <div class="flex-1 w-px bg-content-secondary/60" />
          <span class="text-[10px] text-content-secondary -mt-1">▼</span>
        </div>
      </div>

      <!-- SVG 2D Floor Plan Schematic -->
      <div class="w-full h-full relative rounded-lg shadow-elevation-2 bg-[#FAF8F5] overflow-hidden border border-[#E2E8F0]">
        <svg
          class="w-full h-full"
          viewBox="0 0 600 400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- 1. Room Floor Plates (Materials & Color Fills) -->
          <g id="rooms-group">
            <g
              v-for="room in layout.rooms"
              :key="room.id"
              class="cursor-pointer group"
              @click.stop="selectRoom(room)"
            >
              <!-- Room Floor Base -->
              <rect
                :x="mmToSvgX(room.boundary.x)"
                :y="mmToSvgY(room.boundary.y)"
                :width="mmToSvgW(room.boundary.width)"
                :height="mmToSvgH(room.boundary.height)"
                :fill="room.color || '#F8FAFC'"
                class="transition-colors group-hover:opacity-95"
              />

              <!-- Active Selection Highlight Halo -->
              <rect
                v-if="selectedRoomId === room.id"
                :x="mmToSvgX(room.boundary.x) + 2"
                :y="mmToSvgY(room.boundary.y) + 2"
                :width="mmToSvgW(room.boundary.width) - 4"
                :height="mmToSvgH(room.boundary.height) - 4"
                fill="none"
                stroke="#246BFD"
                stroke-width="2.5"
                stroke-dasharray="6 3"
                rx="3"
              />

              <!-- Subtle Floor Parquet Hatching -->
              <line
                :x1="mmToSvgX(room.boundary.x)"
                :y1="mmToSvgY(room.boundary.y) + mmToSvgH(room.boundary.height) * 0.33"
                :x2="mmToSvgX(room.boundary.x) + mmToSvgW(room.boundary.width)"
                :y2="mmToSvgY(room.boundary.y) + mmToSvgH(room.boundary.height) * 0.33"
                stroke="#E2E8F0"
                stroke-width="0.8"
                opacity="0.6"
              />
              <line
                :x1="mmToSvgX(room.boundary.x)"
                :y1="mmToSvgY(room.boundary.y) + mmToSvgH(room.boundary.height) * 0.66"
                :x2="mmToSvgX(room.boundary.x) + mmToSvgW(room.boundary.width)"
                :y2="mmToSvgY(room.boundary.y) + mmToSvgH(room.boundary.height) * 0.66"
                stroke="#E2E8F0"
                stroke-width="0.8"
                opacity="0.6"
              />
            </g>
          </g>

          <!-- 2. Furniture Silhouettes & CAD Symbols with Rotation and Drag -->
          <g id="furniture-group">
            <g
              v-for="furn in layout.furniture"
              :key="furn.id"
              class="cursor-grab active:cursor-grabbing group"
              :transform="`rotate(${furn.rotation || 0}, ${mmToSvgX(furn.position.x)}, ${mmToSvgY(furn.position.y)})`"
              @mousedown.stop="startDragFurniture(furn, $event)"
              @click.stop="selectFurniture(furn)"
            >
              <!-- Selection Highlight Ring -->
              <rect
                v-if="selectedFurnitureId === furn.id"
                :x="mmToSvgX(furn.position.x - furn.width / 2) - 4"
                :y="mmToSvgY(furn.position.y - furn.depth / 2) - 4"
                :width="mmToSvgW(furn.width) + 8"
                :height="mmToSvgH(furn.depth) + 8"
                rx="6"
                fill="#246BFD"
                fill-opacity="0.1"
                stroke="#246BFD"
                stroke-width="1.8"
                stroke-dasharray="4 2"
              />

              <!-- Sofa -->
              <template v-if="furn.type === FurnitureType.Sofa">
                <rect
                  :x="mmToSvgX(furn.position.x - furn.width / 2)"
                  :y="mmToSvgY(furn.position.y - furn.depth / 2)"
                  :width="mmToSvgW(furn.width)"
                  :height="mmToSvgH(furn.depth)"
                  rx="4"
                  fill="#E6DFD3"
                  stroke="#8C8170"
                  stroke-width="1.2"
                />
                <rect
                  :x="mmToSvgX(furn.position.x - furn.width / 2) + 3"
                  :y="mmToSvgY(furn.position.y - furn.depth / 2) + 3"
                  :width="mmToSvgW(furn.width) - 6"
                  :height="mmToSvgH(furn.depth) * 0.55"
                  rx="2"
                  fill="#FAF6EE"
                  stroke="#A39886"
                  stroke-width="0.8"
                />
              </template>

              <!-- Bed -->
              <template v-else-if="furn.type === FurnitureType.Bed">
                <rect
                  :x="mmToSvgX(furn.position.x - furn.width / 2)"
                  :y="mmToSvgY(furn.position.y - furn.depth / 2)"
                  :width="mmToSvgW(furn.width)"
                  :height="mmToSvgH(furn.depth)"
                  rx="4"
                  fill="#D9D4C7"
                  stroke="#8A8275"
                  stroke-width="1.5"
                />
                <!-- Headboard -->
                <rect
                  :x="mmToSvgX(furn.position.x - furn.width / 2)"
                  :y="mmToSvgY(furn.position.y - furn.depth / 2)"
                  :width="mmToSvgW(furn.width)"
                  :height="6"
                  rx="2"
                  fill="#5F574B"
                />
                <!-- Pillows -->
                <rect
                  :x="mmToSvgX(furn.position.x - furn.width / 2) + 6"
                  :y="mmToSvgY(furn.position.y - furn.depth / 2) + 10"
                  :width="mmToSvgW(furn.width) * 0.4"
                  :height="14"
                  rx="3"
                  fill="#FFFFFF"
                  stroke="#C2BDB2"
                  stroke-width="0.8"
                />
                <rect
                  :x="mmToSvgX(furn.position.x - furn.width / 2) + mmToSvgW(furn.width) * 0.52"
                  :y="mmToSvgY(furn.position.y - furn.depth / 2) + 10"
                  :width="mmToSvgW(furn.width) * 0.4"
                  :height="14"
                  rx="3"
                  fill="#FFFFFF"
                  stroke="#C2BDB2"
                  stroke-width="0.8"
                />
              </template>

              <!-- Dining Table -->
              <template v-else-if="furn.type === FurnitureType.DiningTable">
                <rect
                  :x="mmToSvgX(furn.position.x - furn.width / 2)"
                  :y="mmToSvgY(furn.position.y - furn.depth / 2)"
                  :width="mmToSvgW(furn.width)"
                  :height="mmToSvgH(furn.depth)"
                  rx="4"
                  fill="#B39B82"
                  stroke="#68543E"
                  stroke-width="1.2"
                />
              </template>

              <!-- Bathtub -->
              <template v-else-if="furn.type === FurnitureType.Bathtub">
                <rect
                  :x="mmToSvgX(furn.position.x - furn.width / 2)"
                  :y="mmToSvgY(furn.position.y - furn.depth / 2)"
                  :width="mmToSvgW(furn.width)"
                  :height="mmToSvgH(furn.depth)"
                  rx="6"
                  fill="#FFFFFF"
                  stroke="#717C8A"
                  stroke-width="1.5"
                />
                <ellipse
                  :cx="mmToSvgX(furn.position.x)"
                  :cy="mmToSvgY(furn.position.y)"
                  :rx="mmToSvgW(furn.width) * 0.42"
                  :ry="mmToSvgH(furn.depth) * 0.35"
                  fill="#D6E5F5"
                />
              </template>

              <!-- Desk -->
              <template v-else-if="furn.type === FurnitureType.Desk">
                <rect
                  :x="mmToSvgX(furn.position.x - furn.width / 2)"
                  :y="mmToSvgY(furn.position.y - furn.depth / 2)"
                  :width="mmToSvgW(furn.width)"
                  :height="mmToSvgH(furn.depth)"
                  rx="2"
                  fill="#C2A888"
                  stroke="#7B6143"
                  stroke-width="1.2"
                />
              </template>

              <!-- Generic / Fallback Furniture Fixture -->
              <template v-else>
                <rect
                  :x="mmToSvgX(furn.position.x - furn.width / 2)"
                  :y="mmToSvgY(furn.position.y - furn.depth / 2)"
                  :width="mmToSvgW(furn.width)"
                  :height="mmToSvgH(furn.depth)"
                  rx="3"
                  fill="#E2E8F0"
                  stroke="#64748B"
                  stroke-width="1.2"
                />
              </template>
            </g>
          </g>

          <!-- 3. Interior Walls -->
          <g id="interior-walls">
            <line
              v-for="wall in layout.walls.filter(w => w.type === 'interior')"
              :key="wall.id"
              :x1="mmToSvgX(wall.start.x)"
              :y1="mmToSvgY(wall.start.y)"
              :x2="mmToSvgX(wall.end.x)"
              :y2="mmToSvgY(wall.end.y)"
              stroke="#1E2837"
              stroke-width="5"
              stroke-linecap="square"
            />
          </g>

          <!-- 4. Exterior Boundary Walls -->
          <g id="exterior-walls">
            <line
              v-for="wall in layout.walls.filter(w => w.type === 'exterior')"
              :key="wall.id"
              :x1="mmToSvgX(wall.start.x)"
              :y1="mmToSvgY(wall.start.y)"
              :x2="mmToSvgX(wall.end.x)"
              :y2="mmToSvgY(wall.end.y)"
              stroke="#121B2E"
              stroke-width="9"
              stroke-linecap="square"
            />
          </g>

          <!-- 5. Rubberband Wall Draft Preview Line (When Drawing) -->
          <line
            v-if="isDrawingWall && wallDraftStart && wallDraftEnd"
            :x1="mmToSvgX(wallDraftStart.x)"
            :y1="mmToSvgY(wallDraftStart.y)"
            :x2="mmToSvgX(wallDraftEnd.x)"
            :y2="mmToSvgY(wallDraftEnd.y)"
            stroke="#246BFD"
            stroke-width="6"
            stroke-dasharray="6 4"
            stroke-linecap="round"
          />

          <!-- 6. Windows (Exterior Double Glass Lines) -->
          <g id="windows-group">
            <template v-for="op in layout.openings.filter(o => o.type === 'window')" :key="op.id">
              <line
                :x1="mmToSvgX(getOpeningCoords(op).x1)"
                :y1="mmToSvgY(getOpeningCoords(op).y1)"
                :x2="mmToSvgX(getOpeningCoords(op).x2)"
                :y2="mmToSvgY(getOpeningCoords(op).y2)"
                stroke="#0052D6"
                stroke-width="5"
                stroke-linecap="square"
              />
              <line
                :x1="mmToSvgX(getOpeningCoords(op).x1)"
                :y1="mmToSvgY(getOpeningCoords(op).y1) - 2"
                :x2="mmToSvgX(getOpeningCoords(op).x2)"
                :y2="mmToSvgY(getOpeningCoords(op).y2) - 2"
                stroke="#89CEFF"
                stroke-width="2.5"
                stroke-linecap="square"
              />
            </template>
          </g>

          <!-- 7. Doors & Swing Arcs -->
          <g id="doors-group">
            <template v-for="op in layout.openings.filter(o => o.type === 'door')" :key="op.id">
              <path
                :d="`M ${mmToSvgX(getOpeningCoords(op).cx)} ${mmToSvgY(getOpeningCoords(op).cy)} A 28 28 0 0 1 ${mmToSvgX(getOpeningCoords(op).cx) - 26} ${mmToSvgY(getOpeningCoords(op).cy) - 26}`"
                fill="none"
                stroke="#737687"
                stroke-width="1.2"
                stroke-dasharray="2 2"
              />
              <line
                :x1="mmToSvgX(getOpeningCoords(op).x1)"
                :y1="mmToSvgY(getOpeningCoords(op).y1)"
                :x2="mmToSvgX(getOpeningCoords(op).x2)"
                :y2="mmToSvgY(getOpeningCoords(op).y2)"
                stroke="#737687"
                stroke-width="3"
                stroke-linecap="round"
              />
            </template>
          </g>

          <!-- 8. Labels & Room Dimensions Text -->
          <g id="labels-group">
            <g v-for="room in layout.rooms" :key="`lbl-${room.id}`" class="pointer-events-none">
              <text
                :x="mmToSvgX(room.boundary.x + room.boundary.width / 2)"
                :y="mmToSvgY(room.boundary.y + room.boundary.height / 2) + 2"
                fill="#121B2E"
                font-family="Plus Jakarta Sans, sans-serif"
                font-size="13"
                font-weight="700"
                text-anchor="middle"
              >
                {{ room.name }}
              </text>
              <text
                :x="mmToSvgX(room.boundary.x + room.boundary.width / 2)"
                :y="mmToSvgY(room.boundary.y + room.boundary.height / 2) + 16"
                fill="#64748B"
                font-family="Plus Jakarta Sans, sans-serif"
                font-size="10"
                font-weight="500"
                text-anchor="middle"
              >
                {{ formatDisplayDims(room.boundary.width, room.boundary.height) }}
              </text>
            </g>
          </g>

          <!-- 9. Interactive Resize Handles for Selected Room -->
          <g v-if="selectedRoom && activeTool === 'select'" id="room-resize-handles">
            <!-- 4 Corner Handles -->
            <circle
              :cx="mmToSvgX(selectedRoom.boundary.x)"
              :cy="mmToSvgY(selectedRoom.boundary.y)"
              r="5"
              fill="#FFFFFF"
              stroke="#246BFD"
              stroke-width="2"
              class="cursor-nwse-resize hover:scale-125 transition-transform"
              @mousedown.stop="startResizeRoom('nw', $event)"
            />
            <circle
              :cx="mmToSvgX(selectedRoom.boundary.x + selectedRoom.boundary.width)"
              :cy="mmToSvgY(selectedRoom.boundary.y)"
              r="5"
              fill="#FFFFFF"
              stroke="#246BFD"
              stroke-width="2"
              class="cursor-nesw-resize hover:scale-125 transition-transform"
              @mousedown.stop="startResizeRoom('ne', $event)"
            />
            <circle
              :cx="mmToSvgX(selectedRoom.boundary.x + selectedRoom.boundary.width)"
              :cy="mmToSvgY(selectedRoom.boundary.y + selectedRoom.boundary.height)"
              r="5"
              fill="#FFFFFF"
              stroke="#246BFD"
              stroke-width="2"
              class="cursor-nwse-resize hover:scale-125 transition-transform"
              @mousedown.stop="startResizeRoom('se', $event)"
            />
            <circle
              :cx="mmToSvgX(selectedRoom.boundary.x)"
              :cy="mmToSvgY(selectedRoom.boundary.y + selectedRoom.boundary.height)"
              r="5"
              fill="#FFFFFF"
              stroke="#246BFD"
              stroke-width="2"
              class="cursor-nesw-resize hover:scale-125 transition-transform"
              @mousedown.stop="startResizeRoom('sw', $event)"
            />
            <!-- 4 Edge Midpoint Handles -->
            <circle
              :cx="mmToSvgX(selectedRoom.boundary.x + selectedRoom.boundary.width / 2)"
              :cy="mmToSvgY(selectedRoom.boundary.y)"
              r="4"
              fill="#246BFD"
              class="cursor-ns-resize hover:scale-125 transition-transform"
              @mousedown.stop="startResizeRoom('n', $event)"
            />
            <circle
              :cx="mmToSvgX(selectedRoom.boundary.x + selectedRoom.boundary.width / 2)"
              :cy="mmToSvgY(selectedRoom.boundary.y + selectedRoom.boundary.height)"
              r="4"
              fill="#246BFD"
              class="cursor-ns-resize hover:scale-125 transition-transform"
              @mousedown.stop="startResizeRoom('s', $event)"
            />
            <circle
              :cx="mmToSvgX(selectedRoom.boundary.x)"
              :cy="mmToSvgY(selectedRoom.boundary.y + selectedRoom.boundary.height / 2)"
              r="4"
              fill="#246BFD"
              class="cursor-ew-resize hover:scale-125 transition-transform"
              @mousedown.stop="startResizeRoom('w', $event)"
            />
            <circle
              :cx="mmToSvgX(selectedRoom.boundary.x + selectedRoom.boundary.width)"
              :cy="mmToSvgY(selectedRoom.boundary.y + selectedRoom.boundary.height / 2)"
              r="4"
              fill="#246BFD"
              class="cursor-ew-resize hover:scale-125 transition-transform"
              @mousedown.stop="startResizeRoom('e', $event)"
            />
          </g>
        </svg>

        <!-- Floating Quick-Actions Pill over Selected Furniture -->
        <div
          v-if="selectedFurniture && !isDraggingFurn"
          class="absolute z-20 pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1 rounded-xl shadow-elevation-3 border border-border-hairline transition-all"
          :style="{
            left: `${mmToSvgX(selectedFurniture.position.x) - 50}px`,
            top: `${Math.max(10, mmToSvgY(selectedFurniture.position.y - selectedFurniture.depth / 2) - 40)}px`,
          }"
        >
          <button
            type="button"
            @click.stop="rotateSelectedFurniture(90)"
            title="Rotate 90° (R key)"
            class="w-6 h-6 rounded flex items-center justify-center text-content-secondary hover:text-brand-primary hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <RotateCw class="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            @click.stop="duplicateSelectedFurniture"
            title="Duplicate"
            class="w-6 h-6 rounded flex items-center justify-center text-content-secondary hover:text-brand-primary hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <Copy class="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            @click.stop="deleteSelectedFurniture"
            title="Delete (Backspace)"
            class="w-6 h-6 rounded flex items-center justify-center text-content-secondary hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Floating CAD Toolbar at the bottom -->
    <ToolDock
      v-model:activeTool="activeTool"
      @open-catalog="emit('open-catalog')"
    />
  </div>
</template>
