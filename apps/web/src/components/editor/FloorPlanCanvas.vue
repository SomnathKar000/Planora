<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Layout, Room, Furniture } from '@planora/domain';
import { MeasurementUnit, fromMillimeters, FurnitureType } from '@planora/domain';
import ToolDock, { type EditorTool } from '@/components/editor/ToolDock.vue';
import { Plus, Minus, Maximize2 } from '@lucide/vue';

const props = defineProps<{
  layout: Layout;
  unit: MeasurementUnit;
  lengthFt: number;
  widthFt: number;
}>();

const emit = defineEmits<{
  (e: 'select-room', room: Room | null): void;
  (e: 'select-furniture', furniture: Furniture | null): void;
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

// Coordinate scaling: map boundary mm to SVG viewBox (e.g. 600 x 400 default view coordinate space)
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

// Convert mm to display unit string
function formatDisplayDims(wMm: number, hMm: number): string {
  const w = Math.round(fromMillimeters(wMm, props.unit));
  const h = Math.round(fromMillimeters(hMm, props.unit));
  const unitStr = props.unit === MeasurementUnit.Feet ? 'ft' : 'm';
  return `${w} × ${h} ${unitStr}`;
}

function selectRoom(room: Room) {
  selectedRoomId.value = room.id;
  selectedFurnitureId.value = null;
  emit('select-room', room);
}

function selectFurniture(furn: Furniture) {
  selectedFurnitureId.value = furn.id;
  emit('select-furniture', furn);
}

function handleCanvasClick(e: MouseEvent) {
  if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'cad-canvas-bg') {
    selectedRoomId.value = null;
    selectedFurnitureId.value = null;
    emit('select-room', null);
    emit('select-furniture', null);
  }
}
</script>

<template>
  <div
    class="relative flex-1 w-full h-full bg-[#F8FAFC] overflow-hidden flex items-center justify-center p-6 select-none"
    @click="handleCanvasClick"
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

    <!-- Zoom HUD Pill (Top right overlay on canvas) -->
    <div class="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-xl shadow-elevation-2 px-2.5 py-1 flex items-center gap-1.5 z-20 text-content-secondary border border-border-hairline">
      <button
        type="button"
        @click="zoomIn"
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
        @click="zoomOut"
        class="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded cursor-pointer transition-colors"
        title="Zoom Out"
      >
        <Minus class="w-3.5 h-3.5" />
      </button>
      <span class="w-px h-3.5 bg-border-hairline mx-0.5" />
      <button
        type="button"
        @click="resetZoom"
        class="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded text-brand-primary cursor-pointer transition-colors"
        title="Fit to Screen"
      >
        <Maximize2 class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Scaled Drafting Board Container -->
    <div
      class="relative w-full max-w-[620px] aspect-[1.45/1] my-auto transition-transform duration-200"
      :style="{
        transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
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
                class="transition-colors group-hover:opacity-90"
              />

              <!-- Active Selection Highlight Halo -->
              <rect
                v-if="selectedRoomId === room.id"
                :x="mmToSvgX(room.boundary.x) + 4"
                :y="mmToSvgY(room.boundary.y) + 4"
                :width="mmToSvgW(room.boundary.width) - 8"
                :height="mmToSvgH(room.boundary.height) - 8"
                fill="none"
                stroke="#246BFD"
                stroke-width="2"
                stroke-dasharray="5 3"
                rx="4"
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

          <!-- 2. Furniture Silhouettes & CAD Symbols -->
          <g id="furniture-group">
            <g
              v-for="furn in layout.furniture"
              :key="furn.id"
              class="cursor-pointer"
              @click.stop="selectFurniture(furn)"
            >
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
                <!-- Cushions -->
                <rect
                  :x="mmToSvgX(furn.position.x - furn.width / 2) + 4"
                  :y="mmToSvgY(furn.position.y - furn.depth / 2) + 4"
                  :width="mmToSvgW(furn.width) - 8"
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
                  :height="8"
                  rx="2"
                  fill="#5F574B"
                />
                <!-- Pillows -->
                <rect
                  :x="mmToSvgX(furn.position.x - furn.width / 2) + 8"
                  :y="mmToSvgY(furn.position.y - furn.depth / 2) + 12"
                  :width="mmToSvgW(furn.width) * 0.4"
                  :height="16"
                  rx="3"
                  fill="#FFFFFF"
                  stroke="#C2BDB2"
                  stroke-width="0.8"
                />
                <rect
                  :x="mmToSvgX(furn.position.x - furn.width / 2) + mmToSvgW(furn.width) * 0.52"
                  :y="mmToSvgY(furn.position.y - furn.depth / 2) + 12"
                  :width="mmToSvgW(furn.width) * 0.4"
                  :height="16"
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
              stroke-width="6"
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
              stroke-width="10"
              stroke-linecap="square"
            />
          </g>

          <!-- 5. Windows (Exterior Double Glass Lines) -->
          <g id="windows-group">
            <template v-for="op in layout.openings.filter(o => o.type === 'window')" :key="op.id">
              <!-- Window glass slot -->
              <line
                x1="80"
                y1="15"
                x2="150"
                y2="15"
                stroke="#0052D6"
                stroke-width="4"
              />
              <line
                x1="80"
                y1="13"
                x2="150"
                y2="13"
                stroke="#89CEFF"
                stroke-width="2"
              />
            </template>
          </g>

          <!-- 6. Doors & Swing Arcs -->
          <g id="doors-group">
            <template v-for="op in layout.openings.filter(o => o.type === 'door')" :key="op.id">
              <path
                d="M 245 160 A 30 30 0 0 1 215 130"
                fill="none"
                stroke="#737687"
                stroke-width="1.2"
                stroke-dasharray="2 2"
              />
              <line
                x1="245"
                y1="160"
                x2="245"
                y2="130"
                stroke="#737687"
                stroke-width="2.5"
                stroke-linecap="round"
              />
            </template>
          </g>

          <!-- 7. Labels & Room Dimensions Text -->
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
        </svg>
      </div>
    </div>

    <!-- Floating CAD Toolbar at the bottom -->
    <ToolDock v-model:activeTool="activeTool" />
  </div>
</template>
