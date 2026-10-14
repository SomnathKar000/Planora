<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
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
  Ruler,
  X,
} from '@lucide/vue';

const props = defineProps<{
  layout: Layout;
  unit: MeasurementUnit;
  lengthFt: number;
  widthFt: number;
  selectedRoomId?: string | null;
  selectedFurnitureId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:layout', layout: Layout): void;
  (e: 'select-room', room: Room | null): void;
  (e: 'select-furniture', furniture: Furniture | null): void;
  (e: 'open-catalog'): void;
}>();

const floorPlanSvgRef = ref<SVGSVGElement | null>(null);

const activeTool = ref<EditorTool>('select');
const localRoomId = ref<string | null>(props.selectedRoomId || null);
const localFurnitureId = ref<string | null>(props.selectedFurnitureId || null);
const selectedWallId = ref<string | null>(null);
const selectedOpeningId = ref<string | null>(null);

// Sync with parent props
watch(
  () => props.selectedRoomId,
  (val) => {
    localRoomId.value = val || null;
    if (val) {
      localFurnitureId.value = null;
      selectedWallId.value = null;
      selectedOpeningId.value = null;
    }
  }
);

watch(
  () => props.selectedFurnitureId,
  (val) => {
    localFurnitureId.value = val || null;
    if (val) {
      localRoomId.value = null;
      selectedWallId.value = null;
      selectedOpeningId.value = null;
    }
  }
);

// Clear selection when layout changes
watch(
  () => props.layout.id,
  () => {
    deselectAll();
  }
);

// Zoom and pan state
const zoomLevel = ref(1);
const panOffset = ref({ x: 0, y: 0 });
const isPanning = ref(false);
let panStart = { x: 0, y: 0 };
let panOrigin = { x: 0, y: 0 };

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

// ────────────────────────────────────────────────────────────────
// Uniform Coordinate Scaling & Centering
// ────────────────────────────────────────────────────────────────
const svgWidth = 600;
const svgHeight = 400;

const uniformScale = computed(() => {
  const bw = props.layout.boundary?.width || 1;
  const bh = props.layout.boundary?.height || 1;
  const availW = svgWidth - 40;
  const availH = svgHeight - 40;
  return Math.min(availW / bw, availH / bh);
});

const originX = computed(() => {
  const bw = props.layout.boundary?.width || 1;
  return (svgWidth - bw * uniformScale.value) / 2;
});

const originY = computed(() => {
  const bh = props.layout.boundary?.height || 1;
  return (svgHeight - bh * uniformScale.value) / 2;
});

function mmToSvgX(xMm: number): number {
  return originX.value + xMm * uniformScale.value;
}

function mmToSvgY(yMm: number): number {
  return originY.value + yMm * uniformScale.value;
}

function mmToSvgW(wMm: number): number {
  return wMm * uniformScale.value;
}

function mmToSvgH(hMm: number): number {
  return hMm * uniformScale.value;
}

function svgToMmX(svgX: number): number {
  return Math.max(0, (svgX - originX.value) / uniformScale.value);
}

function svgToMmY(svgY: number): number {
  return Math.max(0, (svgY - originY.value) / uniformScale.value);
}

// Convert mm to display unit string
function formatDisplayDims(wMm: number, hMm: number): string {
  const w = Math.round(fromMillimeters(wMm, props.unit));
  const h = Math.round(fromMillimeters(hMm, props.unit));
  const unitStr = props.unit === MeasurementUnit.Feet ? 'ft' : 'm';
  return `${w} × ${h} ${unitStr}`;
}

function formatSingleDim(mm: number): string {
  const val = Math.round(fromMillimeters(mm, props.unit) * 10) / 10;
  const unitStr = props.unit === MeasurementUnit.Feet ? 'ft' : 'm';
  return `${val} ${unitStr}`;
}

// Dynamic container aspect ratio based on project dimensions
const containerAspectRatio = computed(() => {
  const ratio = (props.lengthFt || 40) / (props.widthFt || 28);
  return Math.min(2.1, Math.max(0.9, ratio));
});

// Currently selected objects
const selectedRoom = computed(() => {
  return props.layout.rooms.find((r) => r.id === localRoomId.value) || null;
});

const selectedFurniture = computed(() => {
  return props.layout.furniture.find((f) => f.id === localFurnitureId.value) || null;
});

const selectedWall = computed(() => {
  return props.layout.walls.find((w) => w.id === selectedWallId.value) || null;
});

const selectedOpening = computed(() => {
  return props.layout.openings.find((o) => o.id === selectedOpeningId.value) || null;
});

function selectRoom(room: Room) {
  if (activeTool.value !== 'select') return;
  localRoomId.value = room.id;
  localFurnitureId.value = null;
  selectedWallId.value = null;
  selectedOpeningId.value = null;
  emit('select-room', room);
  emit('select-furniture', null);
}

function selectFurniture(furn: Furniture) {
  if (activeTool.value !== 'select') return;
  localFurnitureId.value = furn.id;
  localRoomId.value = null;
  selectedWallId.value = null;
  selectedOpeningId.value = null;
  emit('select-furniture', furn);
  emit('select-room', null);
}

function selectWall(wall: Wall) {
  if (activeTool.value !== 'select') return;
  selectedWallId.value = wall.id;
  localRoomId.value = null;
  localFurnitureId.value = null;
  selectedOpeningId.value = null;
  emit('select-room', null);
  emit('select-furniture', null);
}

function selectOpening(op: Opening) {
  if (activeTool.value !== 'select') return;
  selectedOpeningId.value = op.id;
  localRoomId.value = null;
  localFurnitureId.value = null;
  selectedWallId.value = null;
  emit('select-room', null);
  emit('select-furniture', null);
}

function deselectAll() {
  localRoomId.value = null;
  localFurnitureId.value = null;
  selectedWallId.value = null;
  selectedOpeningId.value = null;
  emit('select-room', null);
  emit('select-furniture', null);
}

// ────────────────────────────────────────────────────────────────
// Precise Screen -> SVG Coordinate Transformation
// ────────────────────────────────────────────────────────────────
function getSvgCoords(e: MouseEvent): { x: number; y: number } | null {
  if (!floorPlanSvgRef.value) return null;
  const rect = floorPlanSvgRef.value.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;
  const clickX = ((e.clientX - rect.left) / rect.width) * svgWidth;
  const clickY = ((e.clientY - rect.top) / rect.height) * svgHeight;
  return { x: clickX, y: clickY };
}

// ────────────────────────────────────────────────────────────────
// 1. Furniture Dragging & Transformation
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
  if (!isDraggingFurn.value || !dragFurnId.value || !floorPlanSvgRef.value) return;

  const rect = floorPlanSvgRef.value.getBoundingClientRect();
  const screenToSvgRatio = svgWidth / rect.width;
  const dxMm = ((e.clientX - dragStartClient.x) * screenToSvgRatio) / uniformScale.value;
  const dyMm = ((e.clientY - dragStartClient.y) * screenToSvgRatio) / uniformScale.value;

  const curFurn = props.layout.furniture.find((f) => f.id === dragFurnId.value);
  const halfW = (curFurn?.width || 800) / 2;
  const halfD = (curFurn?.depth || 800) / 2;

  const rawX = dragStartPos.x + dxMm;
  const rawY = dragStartPos.y + dyMm;
  const snappedX = Math.round(rawX / 50) * 50;
  const snappedY = Math.round(rawY / 50) * 50;

  const b = props.layout.boundary;
  const clampedX = Math.max(halfW, Math.min(b.width - halfW, snappedX));
  const clampedY = Math.max(halfD, Math.min(b.height - halfD, snappedY));

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
    f.id === localFurnitureId.value ? { ...f, rotation: newRot } : f
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
      x: Math.min(props.layout.boundary.width - 500, source.position.x + 350),
      y: Math.min(props.layout.boundary.height - 500, source.position.y + 350),
    },
  };

  emit('update:layout', {
    ...props.layout,
    furniture: [...props.layout.furniture, duplicate],
  });
  selectFurniture(duplicate);
}

function deleteSelectedFurniture() {
  if (!localFurnitureId.value) return;
  const filtered = props.layout.furniture.filter((f) => f.id !== localFurnitureId.value);
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
  if (!isResizingRoom.value || !selectedRoom.value || !activeHandle || !floorPlanSvgRef.value) return;

  const rect = floorPlanSvgRef.value.getBoundingClientRect();
  const screenToSvgRatio = svgWidth / rect.width;
  const dxMm = ((e.clientX - resizeStartClient.x) * screenToSvgRatio) / uniformScale.value;
  const dyMm = ((e.clientY - resizeStartClient.y) * screenToSvgRatio) / uniformScale.value;

  let { x, y, width, height } = roomResizeStart;
  const snap = (v: number) => Math.round(v / 50) * 50;

  if (activeHandle.includes('e')) {
    width = Math.max(1000, snap(roomResizeStart.width + dxMm));
  }
  if (activeHandle.includes('s')) {
    height = Math.max(1000, snap(roomResizeStart.height + dyMm));
  }
  if (activeHandle.includes('w')) {
    const rawW = roomResizeStart.width - dxMm;
    const clampedW = Math.max(1000, snap(rawW));
    x = roomResizeStart.x + (roomResizeStart.width - clampedW);
    width = clampedW;
  }
  if (activeHandle.includes('n')) {
    const rawH = roomResizeStart.height - dyMm;
    const clampedH = Math.max(1000, snap(rawH));
    y = roomResizeStart.y + (roomResizeStart.height - clampedH);
    height = clampedH;
  }

  // Clamping within layout boundary
  const b = props.layout.boundary;
  x = Math.max(0, Math.min(b.width - width, x));
  y = Math.max(0, Math.min(b.height - height, y));
  width = Math.min(b.width - x, width);
  height = Math.min(b.height - y, height);

  const updatedRooms = props.layout.rooms.map((r) => {
    if (r.id === localRoomId.value) {
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
// 3. Wall Drawing & Wall Selection/Deletion
// ────────────────────────────────────────────────────────────────
const isDrawingWall = ref(false);
const wallDraftStart = ref<{ x: number; y: number } | null>(null);
const wallDraftEnd = ref<{ x: number; y: number } | null>(null);

const draftWallLength = computed(() => {
  if (!wallDraftStart.value || !wallDraftEnd.value) return 0;
  return Math.hypot(wallDraftEnd.value.x - wallDraftStart.value.x, wallDraftEnd.value.y - wallDraftStart.value.y);
});

function handleCanvasMouseDown(e: MouseEvent) {
  if (isPanning.value) return;

  const coords = getSvgCoords(e);
  if (!coords) return;

  const mmX = Math.round(svgToMmX(coords.x) / 50) * 50;
  const mmY = Math.round(svgToMmY(coords.y) / 50) * 50;

  if (activeTool.value === 'wall') {
    isDrawingWall.value = true;
    wallDraftStart.value = { x: mmX, y: mmY };
    wallDraftEnd.value = { x: mmX, y: mmY };
    window.addEventListener('mousemove', onWallMouseMove);
    window.addEventListener('mouseup', onWallMouseUp);
  } else if (activeTool.value === 'door' || activeTool.value === 'window') {
    handlePlaceOpening(mmX, mmY, activeTool.value === 'door');
    activeTool.value = 'select';
  } else if (activeTool.value === 'furniture') {
    emit('open-catalog');
    activeTool.value = 'select';
  } else if (activeTool.value === 'measure') {
    startMeasure(mmX, mmY);
  } else if (activeTool.value === 'annotate') {
    handlePlaceAnnotation(mmX, mmY);
  } else {
    // Select tool background click
    deselectAll();
  }
}

function onWallMouseMove(e: MouseEvent) {
  if (!isDrawingWall.value || !wallDraftStart.value) return;
  const coords = getSvgCoords(e);
  if (!coords) return;

  let mmX = Math.round(svgToMmX(coords.x) / 50) * 50;
  let mmY = Math.round(svgToMmY(coords.y) / 50) * 50;

  // Orthogonal axis snapping
  const dx = Math.abs(mmX - wallDraftStart.value.x);
  const dy = Math.abs(mmY - wallDraftStart.value.y);
  if (dx > dy * 2.2) {
    mmY = wallDraftStart.value.y;
  } else if (dy > dx * 2.2) {
    mmX = wallDraftStart.value.x;
  }

  wallDraftEnd.value = { x: mmX, y: mmY };
}

function onWallMouseUp() {
  if (isDrawingWall.value && wallDraftStart.value && wallDraftEnd.value) {
    const start = wallDraftStart.value;
    const end = wallDraftEnd.value;
    const len = Math.hypot(end.x - start.x, end.y - start.y);

    if (len >= 300) {
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
      selectedWallId.value = newWall.id;
    }

    isDrawingWall.value = false;
    wallDraftStart.value = null;
    wallDraftEnd.value = null;
    window.removeEventListener('mousemove', onWallMouseMove);
    window.removeEventListener('mouseup', onWallMouseUp);
    activeTool.value = 'select';
  }
}

function deleteSelectedWall() {
  if (!selectedWallId.value) return;
  const filtered = props.layout.walls.filter((w) => w.id !== selectedWallId.value);
  // Also clean up openings that belonged to this wall
  const cleanOpenings = props.layout.openings.filter((o) => o.wallId !== selectedWallId.value);
  emit('update:layout', { ...props.layout, walls: filtered, openings: cleanOpenings });
  selectedWallId.value = null;
}

// ────────────────────────────────────────────────────────────────
// 4. Doors & Windows Placement & Calculation
// ────────────────────────────────────────────────────────────────
function handlePlaceOpening(mmX: number, mmY: number, isDoor: boolean) {
  let closestWall: Wall | null = null;
  let minD = 1200; // max snap distance 1.2m
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
    selectedOpeningId.value = newOpening.id;
  }
}

function getOpeningCoords(op: Opening) {
  const wall = props.layout.walls.find((w) => w.id === op.wallId);
  if (!wall) {
    return { x1: 1000, y1: 0, x2: 1000 + op.width, y2: 0, cx: 1000 + op.width / 2, cy: 0, nx: 0, ny: 1 };
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
  const nx = -uy;
  const ny = ux;

  return {
    cx,
    cy,
    x1: cx - ux * halfW,
    y1: cy - uy * halfW,
    x2: cx + ux * halfW,
    y2: cy + uy * halfW,
    nx,
    ny,
  };
}

function deleteSelectedOpening() {
  if (!selectedOpeningId.value) return;
  const filtered = props.layout.openings.filter((o) => o.id !== selectedOpeningId.value);
  emit('update:layout', { ...props.layout, openings: filtered });
  selectedOpeningId.value = null;
}

// ────────────────────────────────────────────────────────────────
// 5. Measure Tool
// ────────────────────────────────────────────────────────────────
const isMeasuring = ref(false);
const measureStart = ref<{ x: number; y: number } | null>(null);
const measureEnd = ref<{ x: number; y: number } | null>(null);

function startMeasure(mmX: number, mmY: number) {
  isMeasuring.value = true;
  measureStart.value = { x: mmX, y: mmY };
  measureEnd.value = { x: mmX, y: mmY };
  window.addEventListener('mousemove', onMeasureMove);
  window.addEventListener('mouseup', onMeasureUp);
}

function onMeasureMove(e: MouseEvent) {
  if (!isMeasuring.value || !measureStart.value) return;
  const coords = getSvgCoords(e);
  if (!coords) return;
  measureEnd.value = {
    x: Math.round(svgToMmX(coords.x) / 50) * 50,
    y: Math.round(svgToMmY(coords.y) / 50) * 50,
  };
}

function onMeasureUp() {
  isMeasuring.value = false;
  window.removeEventListener('mousemove', onMeasureMove);
  window.removeEventListener('mouseup', onMeasureUp);
}

const measuredDistance = computed(() => {
  if (!measureStart.value || !measureEnd.value) return 0;
  return Math.round(Math.hypot(measureEnd.value.x - measureStart.value.x, measureEnd.value.y - measureStart.value.y));
});

function clearMeasure() {
  measureStart.value = null;
  measureEnd.value = null;
}

// ────────────────────────────────────────────────────────────────
// 6. Annotate Tool
// ────────────────────────────────────────────────────────────────
interface CanvasAnnotation {
  id: string;
  x: number;
  y: number;
  text: string;
}

const annotations = ref<CanvasAnnotation[]>([]);
const activeAnnotateId = ref<string | null>(null);

function handlePlaceAnnotation(mmX: number, mmY: number) {
  const newAnn: CanvasAnnotation = {
    id: `ann-${Date.now()}`,
    x: mmX,
    y: mmY,
    text: 'Note',
  };
  annotations.value.push(newAnn);
  activeAnnotateId.value = newAnn.id;
  activeTool.value = 'select';
}

function removeAnnotation(id: string) {
  annotations.value = annotations.value.filter((a) => a.id !== id);
}

// ────────────────────────────────────────────────────────────────
// 7. Middle Click / Spacebar Canvas Panning
// ────────────────────────────────────────────────────────────────
function handleMouseDownContainer(e: MouseEvent) {
  // Middle click (button 1) or holding spacebar
  if (e.button === 1 || e.shiftKey) {
    isPanning.value = true;
    panStart = { x: e.clientX, y: e.clientY };
    panOrigin = { ...panOffset.value };
    window.addEventListener('mousemove', onPanMove);
    window.addEventListener('mouseup', onPanUp);
    e.preventDefault();
  }
}

function onPanMove(e: MouseEvent) {
  if (!isPanning.value) return;
  const dx = e.clientX - panStart.x;
  const dy = e.clientY - panStart.y;
  panOffset.value = {
    x: panOrigin.x + dx,
    y: panOrigin.y + dy,
  };
}

function onPanUp() {
  isPanning.value = false;
  window.removeEventListener('mousemove', onPanMove);
  window.removeEventListener('mouseup', onPanUp);
}

// ────────────────────────────────────────────────────────────────
// 8. Keyboard Shortcuts
// ────────────────────────────────────────────────────────────────
function handleKeyDown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

  if (e.key === 'Backspace' || e.key === 'Delete') {
    if (localFurnitureId.value) {
      deleteSelectedFurniture();
      e.preventDefault();
    } else if (localRoomId.value) {
      const filtered = props.layout.rooms.filter((r) => r.id !== localRoomId.value);
      emit('update:layout', { ...props.layout, rooms: filtered });
      deselectAll();
      e.preventDefault();
    } else if (selectedWallId.value) {
      deleteSelectedWall();
      e.preventDefault();
    } else if (selectedOpeningId.value) {
      deleteSelectedOpening();
      e.preventDefault();
    }
  } else if (e.key === 'r' || e.key === 'R') {
    if (localFurnitureId.value) {
      rotateSelectedFurniture(90);
      e.preventDefault();
    }
  } else if (e.key === 'Escape') {
    deselectAll();
    clearMeasure();
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
  window.removeEventListener('mousemove', onWallMouseMove);
  window.removeEventListener('mouseup', onWallMouseUp);
  window.removeEventListener('mousemove', onMeasureMove);
  window.removeEventListener('mouseup', onMeasureUp);
  window.removeEventListener('mousemove', onPanMove);
  window.removeEventListener('mouseup', onPanUp);
});
</script>

<template>
  <div
    class="relative flex-1 w-full h-full bg-[#F8FAFC] overflow-hidden flex items-center justify-center p-6 select-none"
    @mousedown="handleMouseDownContainer"
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
            ? 'Click & drag inside floor plan to draw interior partition wall'
            : activeTool === 'door'
            ? 'Click near any wall on plan to place a 900mm door fixture'
            : activeTool === 'window'
            ? 'Click near an exterior wall to place a double-glazed window'
            : activeTool === 'measure'
            ? 'Click & drag between any two points to measure distance'
            : activeTool === 'annotate'
            ? 'Click anywhere to place an architectural note tag'
            : 'Click to open furniture catalog'
        }}
      </span>
      <button
        type="button"
        @click.stop="activeTool = 'select'"
        class="ml-2 hover:opacity-80 cursor-pointer"
        title="Exit Tool (Esc)"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Measure Active Pill Display -->
    <div
      v-if="measureStart && measureEnd && measuredDistance > 0"
      class="absolute top-14 left-4 bg-white/95 backdrop-blur-md rounded-xl shadow-elevation-2 px-3 py-1.5 flex items-center gap-2 z-20 border border-brand-primary text-caption-xs font-semibold"
    >
      <Ruler class="w-4 h-4 text-brand-primary" />
      <span class="text-content-primary">Dimension:</span>
      <span class="font-mono font-bold text-brand-primary">{{ formatSingleDim(measuredDistance) }}</span>
      <button
        type="button"
        @click.stop="clearMeasure"
        class="w-4 h-4 rounded flex items-center justify-center text-content-secondary hover:text-content-primary hover:bg-slate-100 cursor-pointer"
      >
        <X class="w-3 h-3" />
      </button>
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
      class="relative w-full max-w-[620px] my-auto transition-transform duration-75"
      :style="{
        aspectRatio: `${containerAspectRatio}`,
        transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
        cursor: activeTool === 'wall' ? 'crosshair' : activeTool === 'measure' ? 'crosshair' : activeTool === 'annotate' ? 'text' : activeTool === 'select' ? 'default' : 'pointer',
      }"
      @mousedown="handleCanvasMouseDown"
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
          ref="floorPlanSvgRef"
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
                v-if="localRoomId === room.id"
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
                v-if="localFurnitureId === furn.id"
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

          <!-- 3. Interior Walls (Selectable & Deletable) -->
          <g id="interior-walls">
            <g
              v-for="wall in layout.walls.filter(w => w.type !== 'exterior')"
              :key="wall.id"
              class="cursor-pointer group"
              @click.stop="selectWall(wall)"
            >
              <!-- Wider transparent click area -->
              <line
                :x1="mmToSvgX(wall.start.x)"
                :y1="mmToSvgY(wall.start.y)"
                :x2="mmToSvgX(wall.end.x)"
                :y2="mmToSvgY(wall.end.y)"
                stroke="transparent"
                stroke-width="16"
              />
              <line
                :x1="mmToSvgX(wall.start.x)"
                :y1="mmToSvgY(wall.start.y)"
                :x2="mmToSvgX(wall.end.x)"
                :y2="mmToSvgY(wall.end.y)"
                :stroke="selectedWallId === wall.id ? '#2563EB' : '#1E2837'"
                :stroke-width="selectedWallId === wall.id ? 7 : 5"
                stroke-linecap="square"
              />
            </g>
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
          <g v-if="isDrawingWall && wallDraftStart && wallDraftEnd">
            <line
              :x1="mmToSvgX(wallDraftStart.x)"
              :y1="mmToSvgY(wallDraftStart.y)"
              :x2="mmToSvgX(wallDraftEnd.x)"
              :y2="mmToSvgY(wallDraftEnd.y)"
              stroke="#246BFD"
              stroke-width="6"
              stroke-dasharray="6 4"
              stroke-linecap="round"
            />
            <!-- Wall Draft Dimension Callout -->
            <rect
              :x="mmToSvgX((wallDraftStart.x + wallDraftEnd.x) / 2) - 26"
              :y="mmToSvgY((wallDraftStart.y + wallDraftEnd.y) / 2) - 18"
              width="52"
              height="18"
              rx="4"
              fill="#121B2E"
            />
            <text
              :x="mmToSvgX((wallDraftStart.x + wallDraftEnd.x) / 2)"
              :y="mmToSvgY((wallDraftStart.y + wallDraftEnd.y) / 2) - 5"
              fill="#FFFFFF"
              font-family="monospace"
              font-size="10"
              font-weight="bold"
              text-anchor="middle"
            >
              {{ formatSingleDim(draftWallLength) }}
            </text>
          </g>

          <!-- 6. Windows (Exterior Double Glass Lines, Selectable) -->
          <g id="windows-group">
            <g
              v-for="op in layout.openings.filter(o => o.type === 'window')"
              :key="op.id"
              class="cursor-pointer"
              @click.stop="selectOpening(op)"
            >
              <line
                :x1="mmToSvgX(getOpeningCoords(op).x1)"
                :y1="mmToSvgY(getOpeningCoords(op).y1)"
                :x2="mmToSvgX(getOpeningCoords(op).x2)"
                :y2="mmToSvgY(getOpeningCoords(op).y2)"
                :stroke="selectedOpeningId === op.id ? '#2563EB' : '#0052D6'"
                :stroke-width="selectedOpeningId === op.id ? 7 : 5"
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
            </g>
          </g>

          <!-- 7. Doors & Swing Arcs (Oriented to Wall, Selectable) -->
          <g id="doors-group">
            <g
              v-for="op in layout.openings.filter(o => o.type === 'door')"
              :key="op.id"
              class="cursor-pointer"
              @click.stop="selectOpening(op)"
            >
              <line
                :x1="mmToSvgX(getOpeningCoords(op).x1)"
                :y1="mmToSvgY(getOpeningCoords(op).y1)"
                :x2="mmToSvgX(getOpeningCoords(op).x2)"
                :y2="mmToSvgY(getOpeningCoords(op).y2)"
                :stroke="selectedOpeningId === op.id ? '#2563EB' : '#737687'"
                :stroke-width="selectedOpeningId === op.id ? 5 : 3"
                stroke-linecap="round"
              />
              <!-- Swing Arc -->
              <path
                :d="`M ${mmToSvgX(getOpeningCoords(op).x1)} ${mmToSvgY(getOpeningCoords(op).y1)} A ${mmToSvgW(op.width)} ${mmToSvgH(op.width)} 0 0 1 ${mmToSvgX(getOpeningCoords(op).cx + getOpeningCoords(op).nx * (op.width * 0.7))} ${mmToSvgY(getOpeningCoords(op).cy + getOpeningCoords(op).ny * (op.width * 0.7))}`"
                fill="none"
                :stroke="selectedOpeningId === op.id ? '#2563EB' : '#737687'"
                stroke-width="1.2"
                stroke-dasharray="2 2"
              />
            </g>
          </g>

          <!-- 8. Interactive Measure Line Overlay -->
          <g v-if="measureStart && measureEnd && measuredDistance > 0" id="measure-group">
            <line
              :x1="mmToSvgX(measureStart.x)"
              :y1="mmToSvgY(measureStart.y)"
              :x2="mmToSvgX(measureEnd.x)"
              :y2="mmToSvgY(measureEnd.y)"
              stroke="#EA580C"
              stroke-width="2"
              stroke-dasharray="4 2"
            />
            <!-- Start & End Ticks -->
            <circle :cx="mmToSvgX(measureStart.x)" :cy="mmToSvgY(measureStart.y)" r="4" fill="#EA580C" />
            <circle :cx="mmToSvgX(measureEnd.x)" :cy="mmToSvgY(measureEnd.y)" r="4" fill="#EA580C" />
            <!-- Centered Dimension Callout -->
            <rect
              :x="mmToSvgX((measureStart.x + measureEnd.x) / 2) - 30"
              :y="mmToSvgY((measureStart.y + measureEnd.y) / 2) - 16"
              width="60"
              height="20"
              rx="4"
              fill="#EA580C"
            />
            <text
              :x="mmToSvgX((measureStart.x + measureEnd.x) / 2)"
              :y="mmToSvgY((measureStart.y + measureEnd.y) / 2) - 2"
              fill="#FFFFFF"
              font-family="monospace"
              font-size="11"
              font-weight="bold"
              text-anchor="middle"
            >
              {{ formatSingleDim(measuredDistance) }}
            </text>
          </g>

          <!-- 9. Labels & Room Dimensions Text -->
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

          <!-- 10. Interactive Resize Handles for Selected Room -->
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

        <!-- Floating Quick-Actions Pill over Selected Furniture (Percentage Centered) -->
        <div
          v-if="selectedFurniture && !isDraggingFurn"
          class="absolute z-20 pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1 rounded-xl shadow-elevation-3 border border-border-hairline transition-all -translate-x-1/2 -translate-y-full"
          :style="{
            left: `${(mmToSvgX(selectedFurniture.position.x) / svgWidth) * 100}%`,
            top: `${Math.max(6, (mmToSvgY(selectedFurniture.position.y - selectedFurniture.depth / 2) / svgHeight) * 100 - 3)}%`,
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

        <!-- Floating Quick-Actions Pill over Selected Interior Wall -->
        <div
          v-if="selectedWall"
          class="absolute z-20 pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2 py-1 rounded-xl shadow-elevation-3 border border-border-hairline -translate-x-1/2 -translate-y-full"
          :style="{
            left: `${(mmToSvgX((selectedWall.start.x + selectedWall.end.x) / 2) / svgWidth) * 100}%`,
            top: `${Math.max(6, (mmToSvgY((selectedWall.start.y + selectedWall.end.y) / 2) / svgHeight) * 100 - 3)}%`,
          }"
        >
          <span class="text-caption-xs font-semibold text-content-secondary">Partition Wall</span>
          <button
            type="button"
            @click.stop="deleteSelectedWall"
            title="Delete Wall (Backspace)"
            class="w-6 h-6 rounded flex items-center justify-center text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Floating Quick-Actions Pill over Selected Opening -->
        <div
          v-if="selectedOpening"
          class="absolute z-20 pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2 py-1 rounded-xl shadow-elevation-3 border border-border-hairline -translate-x-1/2 -translate-y-full"
          :style="{
            left: `${(mmToSvgX(getOpeningCoords(selectedOpening).cx) / svgWidth) * 100}%`,
            top: `${Math.max(6, (mmToSvgY(getOpeningCoords(selectedOpening).cy) / svgHeight) * 100 - 3)}%`,
          }"
        >
          <span class="text-caption-xs font-semibold text-content-secondary capitalize">
            {{ selectedOpening.type }} ({{ selectedOpening.width }}mm)
          </span>
          <button
            type="button"
            @click.stop="deleteSelectedOpening"
            title="Delete Fixture (Backspace)"
            class="w-6 h-6 rounded flex items-center justify-center text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Annotations Overlay -->
        <div
          v-for="ann in annotations"
          :key="ann.id"
          class="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-auto group"
          :style="{
            left: `${(mmToSvgX(ann.x) / svgWidth) * 100}%`,
            top: `${(mmToSvgY(ann.y) / svgHeight) * 100}%`,
          }"
        >
          <div class="flex items-center gap-1 bg-amber-50 border border-amber-300 rounded-lg shadow-xs px-2 py-1 text-caption-xs">
            <input
              v-if="activeAnnotateId === ann.id"
              v-model="ann.text"
              autofocus
              @keydown.enter="activeAnnotateId = null"
              @blur="activeAnnotateId = null"
              class="w-24 bg-transparent outline-none text-amber-900 font-semibold"
            />
            <span
              v-else
              @click.stop="activeAnnotateId = ann.id"
              class="cursor-text text-amber-900 font-semibold"
            >
              {{ ann.text }}
            </span>
            <button
              type="button"
              @click.stop="removeAnnotation(ann.id)"
              class="text-amber-700 hover:text-rose-600 cursor-pointer"
            >
              <X class="w-3 h-3" />
            </button>
          </div>
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
