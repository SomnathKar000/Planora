<script setup lang="ts">
import { computed } from 'vue';
import { RoomType, MeasurementUnit } from '@planora/domain';
import type { RoomProgramEntry } from '@planora/domain';
import {
  LayoutGrid,
  Zap,
  Armchair,
  Bed,
  UtensilsCrossed,
  Bath,
  Briefcase,
  SunMedium,
} from '@lucide/vue';

const props = defineProps<{
  program: RoomProgramEntry[];
  unit: MeasurementUnit;
}>();

const emit = defineEmits<{
  (e: 'update:program', program: RoomProgramEntry[]): void;
}>();

const unitAreaLabel = computed(() => (props.unit === MeasurementUnit.Feet ? 'sq ft' : 'sq m'));

interface RoomTypeConfig {
  type: RoomType;
  label: string;
  defaultTargetAreaFeet: number;
  icon: any;
}

const ROOM_CATALOG: RoomTypeConfig[] = [
  {
    type: RoomType.LivingRoom,
    label: 'Living Room',
    defaultTargetAreaFeet: 192,
    icon: Armchair,
  },
  {
    type: RoomType.Bedroom,
    label: 'Primary Bedroom',
    defaultTargetAreaFeet: 144,
    icon: Bed,
  },
  {
    type: RoomType.Kitchen,
    label: 'Kitchen / Dining',
    defaultTargetAreaFeet: 96,
    icon: UtensilsCrossed,
  },
  {
    type: RoomType.Bathroom,
    label: 'Full Bathroom',
    defaultTargetAreaFeet: 48,
    icon: Bath,
  },
  {
    type: RoomType.HomeOffice,
    label: 'Home Office',
    defaultTargetAreaFeet: 110,
    icon: Briefcase,
  },
  {
    type: RoomType.Balcony,
    label: 'Balcony / Terrace',
    defaultTargetAreaFeet: 50,
    icon: SunMedium,
  },
];

function getRoomCount(type: RoomType): number {
  const item = props.program.find((r) => r.type === type);
  return item ? item.count : 0;
}

function getTargetArea(type: RoomType, defaultFt: number): number {
  const item = props.program.find((r) => r.type === type);
  if (item && item.targetArea) return Math.round(item.targetArea);
  // Convert default ft to metric if needed (approx 1 sq m ≈ 10.76 sq ft)
  return props.unit === MeasurementUnit.Feet ? defaultFt : Math.round(defaultFt / 10.76);
}

function updateCount(type: RoomType, defaultLabel: string, defaultFt: number, delta: number) {
  const current = getRoomCount(type);
  const nextCount = Math.max(0, Math.min(8, current + delta));
  const newProgram = [...props.program];
  const idx = newProgram.findIndex((r) => r.type === type);

  const targetArea = props.unit === MeasurementUnit.Feet ? defaultFt : Math.round(defaultFt / 10.76);

  if (idx !== -1) {
    if (nextCount === 0) {
      newProgram[idx] = { ...newProgram[idx], count: 0 };
    } else {
      newProgram[idx] = { ...newProgram[idx], count: nextCount };
    }
  } else if (nextCount > 0) {
    newProgram.push({
      id: `rp-${Date.now()}-${type}`,
      type,
      name: defaultLabel,
      count: nextCount,
      targetArea,
    });
  }

  emit('update:program', newProgram);
}

// Preset configurations
function applyPreset(preset: '1b1b' | '2b2b' | 'studio') {
  const isFt = props.unit === MeasurementUnit.Feet;
  const factor = isFt ? 1 : 1 / 10.76;

  let newProgram: RoomProgramEntry[] = [];
  if (preset === '1b1b') {
    newProgram = [
      { id: `rp-1`, type: RoomType.LivingRoom, name: 'Living Room', count: 1, targetArea: Math.round(192 * factor) },
      { id: `rp-2`, type: RoomType.Bedroom, name: 'Primary Bedroom', count: 1, targetArea: Math.round(144 * factor) },
      { id: `rp-3`, type: RoomType.Kitchen, name: 'Kitchen / Dining', count: 1, targetArea: Math.round(96 * factor) },
      { id: `rp-4`, type: RoomType.Bathroom, name: 'Full Bathroom', count: 1, targetArea: Math.round(48 * factor) },
    ];
  } else if (preset === '2b2b') {
    newProgram = [
      { id: `rp-1`, type: RoomType.LivingRoom, name: 'Living Room', count: 1, targetArea: Math.round(220 * factor) },
      { id: `rp-2`, type: RoomType.Bedroom, name: 'Primary Bedroom', count: 1, targetArea: Math.round(150 * factor) },
      { id: `rp-3`, type: RoomType.Bedroom, name: 'Guest Bedroom', count: 1, targetArea: Math.round(120 * factor) },
      { id: `rp-4`, type: RoomType.Kitchen, name: 'Kitchen / Dining', count: 1, targetArea: Math.round(110 * factor) },
      { id: `rp-5`, type: RoomType.Bathroom, name: 'Primary Bath', count: 1, targetArea: Math.round(55 * factor) },
      { id: `rp-6`, type: RoomType.Bathroom, name: 'Guest Bath', count: 1, targetArea: Math.round(45 * factor) },
    ];
  } else if (preset === 'studio') {
    newProgram = [
      { id: `rp-1`, type: RoomType.LivingRoom, name: 'Open Living & Bed', count: 1, targetArea: Math.round(240 * factor) },
      { id: `rp-2`, type: RoomType.Kitchen, name: 'Kitchenette', count: 1, targetArea: Math.round(70 * factor) },
      { id: `rp-3`, type: RoomType.Bathroom, name: 'Full Bathroom', count: 1, targetArea: Math.round(45 * factor) },
    ];
  }

  emit('update:program', newProgram);
}
</script>

<template>
  <div class="bg-surface-card rounded-2xl p-6 shadow-card border border-border-hairline flex flex-col gap-4">
    <div class="flex items-center justify-between flex-wrap gap-2">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-blue-50 text-brand-primary flex items-center justify-center">
          <LayoutGrid class="w-4 h-4" />
        </div>
        <h2 class="text-title-sm font-semibold text-content-primary">4. Desired Room Program</h2>
      </div>

      <!-- Quick Preset Buttons -->
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          @click="applyPreset('studio')"
          class="flex items-center gap-1 px-2.5 py-1 rounded-md text-caption-xs font-semibold text-content-secondary hover:text-brand-primary hover:bg-blue-50 transition-colors"
        >
          Studio
        </button>
        <button
          type="button"
          @click="applyPreset('1b1b')"
          class="flex items-center gap-1 px-2.5 py-1 rounded-md text-caption-xs font-semibold text-brand-primary bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <Zap class="w-3 h-3 fill-brand-primary" />
          1B1B Preset
        </button>
        <button
          type="button"
          @click="applyPreset('2b2b')"
          class="flex items-center gap-1 px-2.5 py-1 rounded-md text-caption-xs font-semibold text-content-secondary hover:text-brand-primary hover:bg-blue-50 transition-colors"
        >
          2B2B Preset
        </button>
      </div>
    </div>

    <!-- Room Program Checklist with +/- Steppers -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div
        v-for="room in ROOM_CATALOG"
        :key="room.type"
        class="flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all border"
        :class="[
          getRoomCount(room.type) > 0
            ? 'bg-surface-subtle border-border-hairline shadow-2xs'
            : 'bg-surface-subtle/50 border-transparent opacity-60 hover:opacity-100'
        ]"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            :class="[
              getRoomCount(room.type) > 0
                ? 'bg-blue-100 text-brand-primary'
                : 'bg-white text-content-secondary'
            ]"
          >
            <component :is="room.icon" class="w-4 h-4" />
          </div>
          <div>
            <span class="text-label-md font-semibold text-content-primary block leading-tight">
              {{ room.label }}
            </span>
            <span class="text-caption-xs text-content-secondary">
              <template v-if="getRoomCount(room.type) > 0">
                Target ~{{ getTargetArea(room.type, room.defaultTargetAreaFeet) }} {{ unitAreaLabel }}
              </template>
              <template v-else>
                Unallocated
              </template>
            </span>
          </div>
        </div>

        <!-- +/- Counter -->
        <div class="flex items-center gap-1 bg-white rounded-lg px-1.5 py-0.5 border border-border-hairline shadow-2xs">
          <button
            type="button"
            @click="updateCount(room.type, room.label, room.defaultTargetAreaFeet, -1)"
            :disabled="getRoomCount(room.type) === 0"
            class="w-5 h-5 flex items-center justify-center text-content-secondary hover:text-content-primary hover:bg-slate-100 rounded disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            -
          </button>
          <span
            class="text-label-sm px-2 min-w-[20px] text-center font-bold"
            :class="getRoomCount(room.type) > 0 ? 'text-content-primary' : 'text-content-secondary'"
          >
            {{ getRoomCount(room.type) }}
          </span>
          <button
            type="button"
            @click="updateCount(room.type, room.label, room.defaultTargetAreaFeet, 1)"
            class="w-5 h-5 flex items-center justify-center text-content-secondary hover:text-content-primary hover:bg-slate-100 rounded transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
