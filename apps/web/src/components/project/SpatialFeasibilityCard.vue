<script setup lang="ts">
import { computed } from 'vue';
import { MeasurementUnit } from '@planora/domain';
import type { RoomProgramEntry } from '@planora/domain';
import { Compass, Sparkles, Bookmark, X, Lightbulb, AlertTriangle } from '@lucide/vue';

const props = defineProps<{
  length: number;
  width: number;
  height: number;
  unit: MeasurementUnit;
  roomProgram: RoomProgramEntry[];
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'save-draft'): void;
  (e: 'cancel'): void;
}>();

const unitLabel = computed(() => (props.unit === MeasurementUnit.Feet ? 'ft' : 'm'));
const areaLabel = computed(() => (props.unit === MeasurementUnit.Feet ? 'sq ft' : 'sq m'));

// Total gross envelope footprint
const grossArea = computed(() => {
  return Math.round(props.length * props.width);
});

// Active allocated rooms (count > 0)
const activeRooms = computed(() => {
  return props.roomProgram.filter((r) => r.count > 0);
});

// Total programmed area
const totalProgrammedArea = computed(() => {
  return activeRooms.value.reduce((sum, r) => sum + (r.targetArea || 0) * r.count, 0);
});

// Remaining circulation & wall buffer area
const circulationArea = computed(() => {
  return Math.max(0, grossArea.value - totalProgrammedArea.value);
});

// Percentages
const programmedPercent = computed(() => {
  if (grossArea.value <= 0) return 0;
  return Math.min(100, Math.round((totalProgrammedArea.value / grossArea.value) * 100));
});

const circulationPercent = computed(() => {
  if (grossArea.value <= 0) return 0;
  return Math.max(0, 100 - programmedPercent.value);
});

const isOverCapacity = computed(() => {
  return totalProgrammedArea.value > grossArea.value;
});

// Color palettes for room preview blocks in the schematic
const ROOM_BLOCK_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-rose-100 text-rose-800 border-rose-200',
  'bg-teal-100 text-teal-800 border-teal-200',
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Feasibility Card & Live Blueprint Diagram -->
    <div
      class="bg-surface-card rounded-2xl p-6 shadow-elevation-2 border border-border-hairline flex flex-col gap-4"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div
            class="w-7 h-7 rounded-lg bg-blue-50 text-brand-primary flex items-center justify-center"
          >
            <Compass class="w-4 h-4" />
          </div>
          <h3 class="text-title-sm font-semibold text-content-primary">
            Spatial Feasibility Model
          </h3>
        </div>

        <span
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption-xs font-semibold transition-colors"
          :class="[isOverCapacity ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-700']"
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="isOverCapacity ? 'bg-rose-600' : 'bg-emerald-500'"
          />
          {{ isOverCapacity ? 'Exceeds Envelope' : 'CAD Compliant' }}
        </span>
      </div>

      <!-- Live Wireframe Schematic CAD Canvas -->
      <div
        class="relative w-full aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden p-3.5 flex flex-col items-center justify-between shadow-inner select-none"
      >
        <!-- Blueprint Grid Background Pattern -->
        <svg
          class="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="cadGrid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#60A5FA" stroke-width="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cadGrid)" />
        </svg>

        <!-- Top Dimension Callout (Length) -->
        <div class="w-full flex items-center justify-between text-caption-xs text-blue-200/80 z-10">
          <span class="text-[10px]">◀</span>
          <div
            class="flex items-center gap-1 bg-slate-800/90 backdrop-blur px-2.5 py-0.5 rounded-full border border-blue-400/30 text-white font-mono text-[11px] shadow-sm"
          >
            <span>{{ length }} {{ unitLabel }} (Length)</span>
          </div>
          <span class="text-[10px]">▶</span>
        </div>

        <!-- Wireframe Floorplan Partition Layout Grid -->
        <div
          class="relative w-full flex-1 my-1.5 bg-slate-800/80 rounded-lg p-2 border border-blue-500/40 z-10 overflow-hidden flex flex-col"
        >
          <!-- Room Subdivisions -->
          <div v-if="activeRooms.length > 0" class="w-full h-full grid grid-cols-2 gap-1.5">
            <div
              v-for="(room, idx) in activeRooms.slice(0, 4)"
              :key="room.id"
              class="rounded p-2 flex flex-col justify-between border backdrop-blur-sm transition-all"
              :class="ROOM_BLOCK_COLORS[idx % ROOM_BLOCK_COLORS.length]"
            >
              <div class="flex items-center justify-between">
                <span class="text-caption-xs font-bold truncate max-w-[80px]">
                  {{ room.name }}
                </span>
                <span class="text-[10px] font-mono opacity-80"> ×{{ room.count }} </span>
              </div>
              <div class="flex items-center justify-between text-[10px] font-mono">
                <span class="opacity-70">Zone {{ idx + 1 }}</span>
                <span class="font-bold"
                  >{{ (room.targetArea || 0) * room.count }} {{ unitLabel }}²</span
                >
              </div>
            </div>

            <!-- Circulation / Hallway representation if more rooms -->
            <div
              v-if="activeRooms.length < 4"
              class="rounded p-2 flex flex-col justify-between border border-dashed border-blue-400/30 bg-blue-500/10 text-blue-200"
            >
              <span class="text-caption-xs font-medium">Egress / Hallway</span>
              <span class="text-[10px] font-mono text-blue-300">Circulation Zone</span>
            </div>
          </div>

          <div
            v-else
            class="w-full h-full flex flex-col items-center justify-center text-blue-200/60 text-caption-xs"
          >
            <span>Select rooms in program</span>
          </div>
        </div>

        <!-- Bottom Dimension Callout (Width & Height) -->
        <div class="w-full flex items-center justify-between text-caption-xs text-blue-200/80 z-10">
          <div class="flex items-center gap-1 font-mono text-[10px]">
            <span>H: {{ height }} {{ unitLabel }}</span>
          </div>
          <div
            class="flex items-center gap-1 bg-slate-800/90 backdrop-blur px-2.5 py-0.5 rounded-full border border-blue-400/30 text-white font-mono text-[11px] shadow-sm"
          >
            <span>{{ width }} {{ unitLabel }} (Width)</span>
          </div>
          <div class="text-[10px] font-mono text-blue-300/80">{{ grossArea }} {{ areaLabel }}</div>
        </div>
      </div>

      <!-- Area Allocation Progress Meter -->
      <div class="flex flex-col gap-2 pt-1">
        <div class="flex items-center justify-between text-body-sm">
          <span class="text-content-primary font-semibold">Total Gross Footprint</span>
          <span class="text-title-sm font-bold text-brand-primary">
            {{ grossArea.toLocaleString() }} {{ areaLabel }}
          </span>
        </div>

        <!-- Multi-segment Progress Bar -->
        <div
          class="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex border border-border-hairline"
        >
          <div
            class="h-full transition-all duration-300"
            :class="isOverCapacity ? 'bg-rose-500' : 'bg-brand-primary'"
            :style="{ width: `${Math.min(100, programmedPercent)}%` }"
            :title="`Programmed Rooms: ${totalProgrammedArea} ${areaLabel}`"
          />
          <div
            v-if="!isOverCapacity && circulationPercent > 0"
            class="bg-emerald-400 h-full transition-all duration-300"
            :style="{ width: `${circulationPercent}%` }"
            :title="`Circulation & Walls: ${circulationArea} ${areaLabel}`"
          />
        </div>

        <div
          class="flex items-center justify-between text-caption-xs text-content-secondary font-medium"
        >
          <span :class="{ 'text-rose-600 font-bold': isOverCapacity }">
            Programmed: {{ totalProgrammedArea }} {{ areaLabel }} ({{ programmedPercent }}%)
          </span>
          <span>
            Circulation: {{ circulationArea }} {{ areaLabel }} ({{ circulationPercent }}%)
          </span>
        </div>

        <div
          v-if="isOverCapacity"
          class="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-caption-xs"
        >
          <AlertTriangle class="w-4 h-4 shrink-0" />
          <span
            >Programmed rooms exceed footprint by {{ totalProgrammedArea - grossArea }}
            {{ areaLabel }}. Consider enlarging dimensions or reducing room counts.</span
          >
        </div>
      </div>

      <!-- AI Spatial Intelligence Insight Callout -->
      <div
        class="p-3 bg-surface-subtle rounded-xl flex items-start gap-2.5 border border-border-hairline/80"
      >
        <div
          class="w-6 h-6 rounded-md bg-blue-100 text-brand-primary flex items-center justify-center shrink-0 mt-0.5"
        >
          <Lightbulb class="w-3.5 h-3.5" />
        </div>
        <div class="flex flex-col">
          <span class="text-label-sm font-semibold text-content-primary">
            CAD Architectural Assessment
          </span>
          <span class="text-caption-xs text-content-secondary leading-snug">
            Generates compliant egress pathways and clusters wet walls (Kitchen & Bath) to optimize
            plumbing risers.
          </span>
        </div>
      </div>
    </div>

    <!-- Primary Action Execution Dock -->
    <div
      class="bg-surface-card rounded-2xl p-4 shadow-card border border-border-hairline flex flex-col gap-2.5"
    >
      <button
        type="button"
        @click="emit('submit')"
        :disabled="isSubmitting"
        class="w-full h-12 bg-primary hover:bg-primary-hover active:bg-blue-800 text-white rounded-xl font-semibold text-body-md flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer group disabled:opacity-50 disabled:pointer-events-none"
      >
        <Sparkles class="w-5 h-5 group-hover:rotate-12 transition-transform shrink-0" />
        <span class="font-bold tracking-tight">{{
          isSubmitting ? 'Synthesizing CAD Plan...' : 'Launch Workspace & Synthesize CAD Plan'
        }}</span>
      </button>

      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          @click="emit('save-draft')"
          class="h-10 bg-surface-subtle hover:bg-slate-100 text-content-secondary hover:text-content-primary rounded-lg text-label-sm font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-border-hairline/60"
        >
          <Bookmark class="w-4 h-4" />
          <span>Save Blueprint Draft</span>
        </button>
        <button
          type="button"
          @click="emit('cancel')"
          class="h-10 bg-surface-subtle hover:bg-slate-100 text-content-secondary hover:text-content-primary rounded-lg text-label-sm font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-border-hairline/60"
        >
          <X class="w-4 h-4" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  </div>
</template>
