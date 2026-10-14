<script setup lang="ts">
import { computed } from 'vue';
import type { Project, Room, RoomProgramEntry } from '@planora/domain';
import { ProjectType, MeasurementUnit, DesignStyle, RoomType, toMillimeters } from '@planora/domain';
import {
  Sparkles,
  Plus,
  Trash2,
  GripVertical,
  Armchair,
  Bed,
  UtensilsCrossed,
  Bath,
  Check,
  Briefcase,
  Sun,
  Maximize,
  Compass,
} from '@lucide/vue';

const props = defineProps<{
  project: Project;
  selectedRoomId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:project', p: Project): void;
  (e: 'generate-layout'): void;
  (e: 'select-room', room: Room | null): void;
}>();

const unitLabel = computed(() => (props.project.unit === MeasurementUnit.Feet ? 'ft' : 'm'));
const areaLabel = computed(() => (props.project.unit === MeasurementUnit.Feet ? 'sq ft' : 'sq m'));

const grossArea = computed(() => {
  return Math.round(props.project.dimensions.length * props.project.dimensions.width);
});

// Currently selected layout (or first)
const activeLayout = computed(() => {
  return props.project.layouts.find((l) => l.id === props.project.selectedLayoutId) || props.project.layouts[0];
});

const allocatedArea = computed(() => {
  if (!activeLayout.value) return 0;
  // Convert mm² to display area
  const factor = props.project.unit === MeasurementUnit.Feet ? 0.0000107639 : 0.000001;
  return Math.round(activeLayout.value.rooms.reduce((sum, r) => sum + r.areaSqMm, 0) * factor);
});

const circulationArea = computed(() => {
  return Math.max(0, grossArea.value - allocatedArea.value);
});

const allocationPercent = computed(() => {
  if (grossArea.value <= 0) return 0;
  return Math.min(100, Math.round((allocatedArea.value / grossArea.value) * 100));
});

const ROOM_ICONS: Record<string, any> = {
  [RoomType.LivingRoom]: Armchair,
  [RoomType.Bedroom]: Bed,
  [RoomType.Kitchen]: UtensilsCrossed,
  [RoomType.Bathroom]: Bath,
  [RoomType.HomeOffice]: Briefcase,
  [RoomType.DiningRoom]: UtensilsCrossed,
  [RoomType.Balcony]: Sun,
  [RoomType.Hallway]: Compass,
  [RoomType.Custom]: Maximize,
};

const STYLE_CARDS = [
  { style: DesignStyle.Modern, name: 'Modern', color: '#EAE3D2' },
  { style: DesignStyle.Minimal, name: 'Minimal', color: '#F5F5F0' },
  { style: DesignStyle.Classic, name: 'Classic', color: '#D4AF37' },
  { style: DesignStyle.Industrial, name: 'Industrial', color: '#6C757D' },
];

function setType(t: ProjectType) {
  emit('update:project', { ...props.project, type: t });
}

function setStyle(s: DesignStyle) {
  emit('update:project', {
    ...props.project,
    preferences: { ...props.project.preferences, style: s },
  });
}

function handleDimensionChange(field: 'length' | 'width', rawVal: string) {
  const val = parseFloat(rawVal);
  if (!val || isNaN(val) || val <= 0) return;

  const newLength = field === 'length' ? val : props.project.dimensions.length;
  const newWidth = field === 'width' ? val : props.project.dimensions.width;

  const wMm = toMillimeters(newLength, props.project.unit);
  const hMm = toMillimeters(newWidth, props.project.unit);

  const updatedLayouts = props.project.layouts.map((l) => ({
    ...l,
    boundary: { ...l.boundary, width: wMm, height: hMm },
  }));

  emit('update:project', {
    ...props.project,
    dimensions: {
      ...props.project.dimensions,
      length: newLength,
      width: newWidth,
    },
    layouts: updatedLayouts,
  });
}

function removeRoom(roomId: string) {
  if (!activeLayout.value) return;
  const targetRoom = activeLayout.value.rooms.find((r) => r.id === roomId);
  const newRooms = activeLayout.value.rooms.filter((r) => r.id !== roomId);
  const updatedLayout = { ...activeLayout.value, rooms: newRooms };
  const updatedLayouts = props.project.layouts.map((l) => (l.id === updatedLayout.id ? updatedLayout : l));
  
  const updatedProgram = (props.project.roomProgram || []).filter((rp) => rp.name !== targetRoom?.name);

  emit('update:project', {
    ...props.project,
    layouts: updatedLayouts,
    roomProgram: updatedProgram,
  });

  if (props.selectedRoomId === roomId) {
    emit('select-room', null);
  }
}

function addRoom() {
  if (!activeLayout.value) return;
  const b = activeLayout.value.boundary;
  const count = activeLayout.value.rooms.length;

  const roomW = Math.min(3500, Math.round(b.width * 0.35));
  const roomH = Math.min(3000, Math.round(b.height * 0.35));

  const posX = Math.min(Math.max(0, b.width - roomW), (count * 800) % Math.max(800, b.width - roomW));
  const posY = Math.min(Math.max(0, b.height - roomH), (Math.floor(count / 2) * 800) % Math.max(800, b.height - roomH));

  const newRoom: Room = {
    id: `room-${Date.now()}`,
    name: `Space ${count + 1}`,
    type: RoomType.Custom,
    boundary: { x: posX, y: posY, width: roomW, height: roomH },
    areaSqMm: roomW * roomH,
    color: '#F8FAFC',
  };

  const updatedLayout = { ...activeLayout.value, rooms: [...activeLayout.value.rooms, newRoom] };
  const updatedLayouts = props.project.layouts.map((l) => (l.id === updatedLayout.id ? updatedLayout : l));

  const updatedProgram: RoomProgramEntry[] = [
    ...(props.project.roomProgram || []),
    {
      id: `rp-${Date.now()}`,
      type: RoomType.Custom,
      name: newRoom.name,
      count: 1,
    },
  ];

  emit('update:project', {
    ...props.project,
    layouts: updatedLayouts,
    roomProgram: updatedProgram,
  });

  emit('select-room', newRoom);
}
</script>

<template>
  <aside class="flex flex-col gap-4">
    <!-- CARD 1: Space Details -->
    <div class="bg-surface-card rounded-2xl p-5 shadow-card border border-border-hairline flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h2 class="text-title-sm font-semibold text-content-primary flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center text-caption-xs font-bold">1</span>
          <span>Enter Space Details</span>
        </h2>
        <span class="px-2 py-0.5 rounded-full bg-surface-subtle text-caption-xs font-semibold text-content-secondary border border-border-hairline">
          Parametric
        </span>
      </div>

      <!-- Segmented Space Category -->
      <div class="grid grid-cols-3 p-1 bg-surface-subtle rounded-xl border border-border-hairline gap-1">
        <button
          type="button"
          @click="setType(ProjectType.Room)"
          class="py-1.5 text-center text-label-sm rounded-lg transition-all cursor-pointer"
          :class="project.type === ProjectType.Room ? 'bg-white text-brand-primary font-bold shadow-2xs' : 'text-content-secondary hover:text-content-primary'"
        >
          Room
        </button>
        <button
          type="button"
          @click="setType(ProjectType.Apartment)"
          class="py-1.5 text-center text-label-sm rounded-lg transition-all cursor-pointer"
          :class="project.type === ProjectType.Apartment ? 'bg-white text-brand-primary font-bold shadow-2xs' : 'text-content-secondary hover:text-content-primary'"
        >
          Apartment
        </button>
        <button
          type="button"
          @click="setType(ProjectType.House)"
          class="py-1.5 text-center text-label-sm rounded-lg transition-all cursor-pointer"
          :class="project.type === ProjectType.House ? 'bg-white text-brand-primary font-bold shadow-2xs' : 'text-content-secondary hover:text-content-primary'"
        >
          House
        </button>
      </div>

      <!-- Dimension Inputs (Editable Parametric Control) -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-caption-xs font-medium text-content-secondary mb-1">Length ({{ unitLabel }})</label>
          <div class="relative flex items-center">
            <input
              type="number"
              :value="project.dimensions.length"
              min="5"
              max="500"
              step="1"
              @change="handleDimensionChange('length', ($event.target as HTMLInputElement).value)"
              class="w-full h-9 px-3 bg-surface-subtle focus:bg-white rounded-lg text-body-md text-content-primary font-semibold outline-none border border-border-hairline focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all"
            />
            <span class="absolute right-2.5 text-caption-xs font-mono text-content-secondary uppercase pointer-events-none">{{ unitLabel }}</span>
          </div>
        </div>

        <div>
          <label class="block text-caption-xs font-medium text-content-secondary mb-1">Width ({{ unitLabel }})</label>
          <div class="relative flex items-center">
            <input
              type="number"
              :value="project.dimensions.width"
              min="5"
              max="500"
              step="1"
              @change="handleDimensionChange('width', ($event.target as HTMLInputElement).value)"
              class="w-full h-9 px-3 bg-surface-subtle focus:bg-white rounded-lg text-body-md text-content-primary font-semibold outline-none border border-border-hairline focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all"
            />
            <span class="absolute right-2.5 text-caption-xs font-mono text-content-secondary uppercase pointer-events-none">{{ unitLabel }}</span>
          </div>
        </div>
      </div>

      <!-- Total Gross Floor Area Meter -->
      <div class="bg-surface-subtle rounded-xl p-3 flex flex-col gap-2 border border-border-hairline">
        <div class="flex items-center justify-between text-caption-xs font-semibold">
          <span class="text-content-primary">Total Gross Area</span>
          <span class="text-brand-primary font-bold font-mono">{{ grossArea }} {{ areaLabel }}</span>
        </div>
        <div class="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden flex">
          <div class="h-full bg-brand-primary transition-all duration-300" :style="{ width: `${allocationPercent}%` }" />
          <div class="h-full bg-emerald-400 transition-all duration-300" :style="{ width: `${100 - allocationPercent}%` }" />
        </div>
        <div class="flex items-center justify-between text-[11px] text-content-secondary">
          <span>Allocated: {{ allocatedArea }} {{ areaLabel }} ({{ allocationPercent }}%)</span>
          <span class="text-emerald-700 font-semibold">{{ circulationArea }} {{ areaLabel }} circulation</span>
        </div>
      </div>
    </div>

    <!-- CARD 2: Select Rooms -->
    <div class="bg-surface-card rounded-2xl p-5 shadow-card border border-border-hairline flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h2 class="text-title-sm font-semibold text-content-primary flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center text-caption-xs font-bold">2</span>
          <span>Configured Rooms</span>
        </h2>
        <button
          type="button"
          @click="addRoom"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-brand-primary text-caption-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add Room</span>
        </button>
      </div>

      <!-- Room List with Interactive Selection -->
      <div class="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
        <div
          v-for="room in activeLayout?.rooms || []"
          :key="room.id"
          @click="emit('select-room', room)"
          class="flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group"
          :class="[
            selectedRoomId === room.id
              ? 'bg-blue-50/90 border-brand-primary shadow-xs ring-1 ring-brand-primary/20'
              : 'bg-surface-subtle border-border-hairline/80 hover:border-brand-primary/50'
          ]"
        >
          <div class="flex items-center gap-2.5">
            <GripVertical class="w-3.5 h-3.5 text-content-secondary/40 group-hover:text-content-secondary transition-colors cursor-grab" />
            <div
              class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              :class="selectedRoomId === room.id ? 'bg-brand-primary text-white' : 'bg-blue-100/60 text-brand-primary'"
            >
              <component :is="ROOM_ICONS[room.type] || Armchair" class="w-4 h-4" />
            </div>
            <div class="flex flex-col">
              <span
                class="text-label-sm font-semibold leading-tight transition-colors"
                :class="selectedRoomId === room.id ? 'text-brand-primary' : 'text-content-primary'"
              >
                {{ room.name }}
              </span>
              <span class="text-[11px] text-content-secondary font-mono">
                {{ Math.round(room.areaSqMm * (project.unit === MeasurementUnit.Feet ? 0.0000107639 : 0.000001)) }} {{ areaLabel }}
              </span>
            </div>
          </div>

          <button
            type="button"
            @click.stop="removeRoom(room.id)"
            class="w-6 h-6 rounded-md flex items-center justify-center text-content-secondary/60 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Remove room"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- CARD 3: Design Preferences & Trigger -->
    <div class="bg-surface-card rounded-2xl p-5 shadow-card border border-border-hairline flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h2 class="text-title-sm font-semibold text-content-primary flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center text-caption-xs font-bold">3</span>
          <span>Design Preferences</span>
        </h2>
        <span class="text-caption-xs font-semibold text-brand-primary">AI Theme</span>
      </div>

      <!-- Style Preset Cards -->
      <div class="grid grid-cols-4 gap-2">
        <div
          v-for="st in STYLE_CARDS"
          :key="st.style"
          @click="setStyle(st.style)"
          class="flex flex-col items-center gap-1.5 cursor-pointer group"
        >
          <div
            class="w-full aspect-square rounded-xl flex items-center justify-center relative transition-all border"
            :style="{ backgroundColor: st.color }"
            :class="[
              project.preferences.style === st.style
                ? 'ring-2 ring-brand-primary border-brand-primary shadow-xs'
                : 'border-border-hairline opacity-80 hover:opacity-100'
            ]"
          >
            <span
              v-if="project.preferences.style === st.style"
              class="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-brand-primary text-white flex items-center justify-center text-[8px]"
            >
              <Check class="w-2.5 h-2.5 stroke-[3]" />
            </span>
          </div>
          <span
            class="text-[11px] font-semibold text-center transition-colors"
            :class="project.preferences.style === st.style ? 'text-brand-primary' : 'text-content-secondary'"
          >
            {{ st.name }}
          </span>
        </div>
      </div>

      <!-- Main Generate Trigger -->
      <button
        type="button"
        @click="emit('generate-layout')"
        class="w-full h-11 bg-primary hover:bg-primary-hover active:bg-blue-800 text-white rounded-xl font-semibold text-body-md flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer group mt-1"
      >
        <Sparkles class="w-4 h-4 group-hover:rotate-12 transition-transform shrink-0" />
        <span class="font-bold tracking-tight text-white">Generate New Layout</span>
      </button>
    </div>
  </aside>
</template>
