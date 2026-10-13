<script setup lang="ts">
import { computed } from 'vue';
import type { Room, Furniture } from '@planora/domain';
import { RoomType, MeasurementUnit, fromMillimeters } from '@planora/domain';
import {
  RotateCw,
  Copy,
  Trash2,
  X,
  Palette,
  Layers,
  Armchair,
} from '@lucide/vue';

const props = defineProps<{
  room?: Room | null;
  furniture?: Furniture | null;
  unit: MeasurementUnit;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:room', updated: Room): void;
  (e: 'update:furniture', updated: Furniture): void;
  (e: 'rotate:furniture', deg: number): void;
  (e: 'duplicate:furniture', item: Furniture): void;
  (e: 'delete:furniture', id: string): void;
  (e: 'delete:room', id: string): void;
}>();

const unitLabel = computed(() => (props.unit === MeasurementUnit.Feet ? 'ft' : 'm'));
const areaLabel = computed(() => (props.unit === MeasurementUnit.Feet ? 'sq ft' : 'sq m'));

const ROOM_COLORS = [
  { name: 'Warm Oak', color: '#F8EEDD' },
  { name: 'Modern Slate', color: '#E2E8F0' },
  { name: 'Nordic Pine', color: '#FAF6EE' },
  { name: 'Minimal White', color: '#FFFFFF' },
  { name: 'Soft Sage', color: '#E3EEDD' },
  { name: 'Ceramic Mist', color: '#E0E7FF' },
  { name: 'Terracotta', color: '#FEE2E2' },
];

function updateRoomColor(c: string) {
  if (!props.room) return;
  emit('update:room', { ...props.room, color: c });
}

function updateRoomName(e: Event) {
  if (!props.room) return;
  const name = (e.target as HTMLInputElement).value;
  emit('update:room', { ...props.room, name });
}

function updateRoomType(e: Event) {
  if (!props.room) return;
  const type = (e.target as HTMLSelectElement).value as RoomType;
  emit('update:room', { ...props.room, type });
}

function updateFurnitureName(e: Event) {
  if (!props.furniture) return;
  const name = (e.target as HTMLInputElement).value;
  emit('update:furniture', { ...props.furniture, name });
}

function formatDimension(mm: number): string {
  const val = Math.round(fromMillimeters(mm, props.unit) * 10) / 10;
  return `${val} ${unitLabel.value}`;
}

const roomAreaFormatted = computed(() => {
  if (!props.room) return 0;
  const factor = props.unit === MeasurementUnit.Feet ? 0.0000107639 : 0.000001;
  return Math.round(props.room.areaSqMm * factor);
});
</script>

<template>
  <div
    v-if="room || furniture"
    class="bg-white/95 backdrop-blur-md rounded-2xl shadow-elevation-3 border border-border-hairline p-4 animate-scale-up"
  >
    <!-- Inspector Header -->
    <div class="flex items-center justify-between pb-3 border-b border-border-hairline mb-3">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-blue-50 text-brand-primary flex items-center justify-center">
          <Layers v-if="room" class="w-4 h-4" />
          <Armchair v-else class="w-4 h-4" />
        </div>
        <span class="text-caption-xs font-bold uppercase tracking-wider text-content-secondary">
          {{ room ? 'Room Inspector' : 'Furniture Inspector' }}
        </span>
      </div>

      <button
        type="button"
        @click="emit('close')"
        class="w-6 h-6 rounded flex items-center justify-center text-content-secondary hover:text-content-primary hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- ── ROOM INSPECTOR CONTROLS ── -->
    <div v-if="room" class="flex flex-col gap-3">
      <div>
        <label class="block text-caption-xs font-bold text-content-secondary uppercase mb-1">Room Label</label>
        <input
          :value="room.name"
          @change="updateRoomName"
          class="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-border-hairline text-body-sm font-semibold text-content-primary outline-none focus:border-brand-primary"
        />
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-caption-xs font-bold text-content-secondary uppercase mb-1">Type</label>
          <select
            :value="room.type"
            @change="updateRoomType"
            class="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-border-hairline text-caption-xs font-semibold text-content-primary outline-none focus:border-brand-primary"
          >
            <option :value="RoomType.LivingRoom">Living Room</option>
            <option :value="RoomType.Bedroom">Bedroom</option>
            <option :value="RoomType.Kitchen">Kitchen</option>
            <option :value="RoomType.Bathroom">Bathroom</option>
            <option :value="RoomType.Balcony">Balcony</option>
            <option :value="RoomType.Hallway">Hallway</option>
            <option :value="RoomType.Custom">Custom Space</option>
          </select>
        </div>

        <div>
          <label class="block text-caption-xs font-bold text-content-secondary uppercase mb-1">Total Area</label>
          <div class="px-3 py-1.5 rounded-xl bg-slate-100/70 border border-border-hairline/60 text-body-sm font-mono font-bold text-brand-primary">
            {{ roomAreaFormatted }} {{ areaLabel }}
          </div>
        </div>
      </div>

      <!-- Dimensions Readout -->
      <div class="p-2.5 rounded-xl bg-slate-50 border border-border-hairline flex items-center justify-between text-caption-xs font-mono text-content-secondary">
        <span>Dimensions:</span>
        <span class="font-bold text-content-primary">
          {{ formatDimension(room.boundary.width) }} × {{ formatDimension(room.boundary.height) }}
        </span>
      </div>

      <!-- Floor Material Color Picker -->
      <div>
        <div class="flex items-center gap-1.5 mb-2">
          <Palette class="w-3.5 h-3.5 text-content-secondary" />
          <span class="text-caption-xs font-bold text-content-secondary uppercase">Floor Finish Tone</span>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button
            v-for="swatch in ROOM_COLORS"
            :key="swatch.color"
            type="button"
            @click="updateRoomColor(swatch.color)"
            class="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer shadow-2xs"
            :class="[
              room.color === swatch.color ? 'border-brand-primary scale-110 shadow-xs' : 'border-slate-300'
            ]"
            :style="{ backgroundColor: swatch.color }"
            :title="swatch.name"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="pt-2 border-t border-border-hairline flex items-center justify-end">
        <button
          type="button"
          @click="emit('delete:room', room.id)"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-caption-xs font-semibold transition-colors cursor-pointer"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>Delete Room</span>
        </button>
      </div>
    </div>

    <!-- ── FURNITURE INSPECTOR CONTROLS ── -->
    <div v-else-if="furniture" class="flex flex-col gap-3">
      <div>
        <label class="block text-caption-xs font-bold text-content-secondary uppercase mb-1">Item Label</label>
        <input
          :value="furniture.name"
          @change="updateFurnitureName"
          class="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-border-hairline text-body-sm font-semibold text-content-primary outline-none focus:border-brand-primary"
        />
      </div>

      <!-- Dimensions & Orientation -->
      <div class="grid grid-cols-2 gap-2 text-caption-xs font-mono">
        <div class="p-2.5 rounded-xl bg-slate-50 border border-border-hairline flex flex-col">
          <span class="text-content-secondary text-[10px] uppercase font-bold">Footprint</span>
          <span class="font-bold text-content-primary">
            {{ formatDimension(furniture.width) }} × {{ formatDimension(furniture.depth) }}
          </span>
        </div>

        <div class="p-2.5 rounded-xl bg-slate-50 border border-border-hairline flex flex-col">
          <span class="text-content-secondary text-[10px] uppercase font-bold">Rotation</span>
          <span class="font-bold text-content-primary">
            {{ furniture.rotation ?? 0 }}°
          </span>
        </div>
      </div>

      <!-- Quick Actions (Rotate, Duplicate, Delete) -->
      <div class="pt-2 border-t border-border-hairline grid grid-cols-3 gap-1.5">
        <button
          type="button"
          @click="emit('rotate:furniture', 90)"
          class="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-brand-primary text-content-primary text-caption-xs font-semibold transition-colors cursor-pointer"
          title="Rotate 90 degrees clockwise (R key)"
        >
          <RotateCw class="w-3.5 h-3.5" />
          <span>Rotate</span>
        </button>

        <button
          type="button"
          @click="emit('duplicate:furniture', furniture)"
          class="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-content-primary text-caption-xs font-semibold transition-colors cursor-pointer"
          title="Duplicate item"
        >
          <Copy class="w-3.5 h-3.5" />
          <span>Copy</span>
        </button>

        <button
          type="button"
          @click="emit('delete:furniture', furniture.id)"
          class="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-caption-xs font-semibold transition-colors cursor-pointer"
          title="Delete item (Backspace)"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  </div>
</template>
