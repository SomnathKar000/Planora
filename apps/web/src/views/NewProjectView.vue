<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectsStore } from '@/stores/projects';
import {
  ProjectType,
  MeasurementUnit,
  DesignStyle,
  FurnitureDensity,
  ProjectStatus,
  RoomType,
  toMillimeters,
} from '@planora/domain';
import type { Project, RoomProgramEntry } from '@planora/domain';
import { generateLayout } from '@planora/layout-engine';

import ArchetypeSelector from '@/components/project/ArchetypeSelector.vue';
import DimensionsInput from '@/components/project/DimensionsInput.vue';
import RoomProgramConfig from '@/components/project/RoomProgramConfig.vue';
import StylePicker from '@/components/project/StylePicker.vue';
import SpatialFeasibilityCard from '@/components/project/SpatialFeasibilityCard.vue';

import {
  ArrowLeft,
  ChevronRight,
  FileText,
  Tag,
} from '@lucide/vue';

const router = useRouter();
const store = useProjectsStore();

// Form State
const projectName = ref('Downtown Loft Apt. 4B');
const projectTag = ref('Residential Remodel & Staging');
const unit = ref<MeasurementUnit>(MeasurementUnit.Feet);
const archetype = ref<ProjectType>(ProjectType.Apartment);

const length = ref(30);
const width = ref(20);
const height = ref(10);
const floors = ref(1);

const roomProgram = ref<RoomProgramEntry[]>([
  { id: 'rp-1', type: RoomType.LivingRoom, name: 'Living Room', count: 1, targetArea: 192 },
  { id: 'rp-2', type: RoomType.Bedroom, name: 'Primary Bedroom', count: 1, targetArea: 144 },
  { id: 'rp-3', type: RoomType.Kitchen, name: 'Kitchen / Dining', count: 1, targetArea: 96 },
  { id: 'rp-4', type: RoomType.Bathroom, name: 'Full Bathroom', count: 1, targetArea: 48 },
]);

const style = ref<DesignStyle>(DesignStyle.Modern);
const density = ref<FurnitureDensity>(FurnitureDensity.Balanced);
const paletteAccents = ref<string[]>(['#EAE3D2', '#A88B68', '#587B95']);

const isSubmitting = ref(false);

// Active Wizard Step
const activeStep = ref(1);

// Switch Unit between Feet and Meters
function setUnit(newUnit: MeasurementUnit) {
  if (unit.value === newUnit) return;
  if (newUnit === MeasurementUnit.Meters) {
    // ft -> m
    length.value = Math.round((length.value * 0.3048) * 10) / 10;
    width.value = Math.round((width.value * 0.3048) * 10) / 10;
    height.value = Math.round((height.value * 0.3048) * 10) / 10;
    roomProgram.value = roomProgram.value.map((r) => ({
      ...r,
      targetArea: Math.round((r.targetArea || 0) / 10.764),
    }));
  } else {
    // m -> ft
    length.value = Math.round(length.value / 0.3048);
    width.value = Math.round(width.value / 0.3048);
    height.value = Math.round(height.value / 0.3048);
    roomProgram.value = roomProgram.value.map((r) => ({
      ...r,
      targetArea: Math.round((r.targetArea || 0) * 10.764),
    }));
  }
  unit.value = newUnit;
}

// Create Project and Generate Layout
async function handleLaunchWorkspace() {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    const projectId = `proj-${Date.now()}`;
    const now = new Date().toISOString();

    // Convert boundaries to internal integer millimeters
    const widthMm = toMillimeters(length.value, unit.value);
    const heightMm = toMillimeters(width.value, unit.value);

    // Generate initial candidate layouts
    const layouts = generateLayout({
      boundary: { x: 0, y: 0, width: widthMm, height: heightMm },
      roomProgram: roomProgram.value,
      candidateCount: 3,
    });

    const newProject: Project = {
      id: projectId,
      name: projectName.value || 'Untitled Space',
      tag: projectTag.value || 'New Concept',
      type: archetype.value,
      status: ProjectStatus.InProgress,
      dimensions: {
        length: length.value,
        width: width.value,
        height: height.value,
      },
      unit: unit.value,
      floors: floors.value,
      preferences: {
        style: style.value,
        furnitureDensity: density.value,
        paletteAccents: paletteAccents.value,
      },
      layouts,
      selectedLayoutId: layouts[0]?.id,
      roomProgram: roomProgram.value,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    store.addProject(newProject);
    router.push(`/design/${projectId}`);
  } finally {
    isSubmitting.value = false;
  }
}

function handleSaveDraft() {
  const projectId = `proj-${Date.now()}`;
  const now = new Date().toISOString();

  const newProject: Project = {
    id: projectId,
    name: projectName.value || 'Untitled Draft',
    tag: projectTag.value || 'Draft',
    type: archetype.value,
    status: ProjectStatus.Draft,
    dimensions: {
      length: length.value,
      width: width.value,
      height: height.value,
    },
    unit: unit.value,
    floors: floors.value,
    preferences: {
      style: style.value,
      furnitureDensity: density.value,
      paletteAccents: paletteAccents.value,
    },
    layouts: [],
    selectedLayoutId: undefined,
    roomProgram: roomProgram.value,
    version: 1,
    createdAt: now,
    updatedAt: now,
  };

  store.addProject(newProject);
  router.push('/projects');
}

function handleCancel() {
  router.push('/projects');
}

// Keyboard shortcut: Cmd/Ctrl + Enter to launch
function handleKeyDown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    handleLaunchWorkspace();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="flex-1 flex flex-col bg-surface-canvas min-h-screen">
    <!-- Interactive Top Stepper & Workflow Sub-header -->
    <div class="w-full bg-white border-b border-border-hairline px-6 py-3 shadow-2xs">
      <div class="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <!-- Back Link & Title -->
        <div class="flex items-center gap-3">
          <router-link
            to="/projects"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-content-secondary hover:bg-slate-100 hover:text-content-primary transition-colors"
          >
            <ArrowLeft class="w-4 h-4" />
          </router-link>
          <div class="flex flex-col">
            <span class="text-caption-xs text-content-secondary uppercase tracking-wider font-semibold">
              New Project Workflow
            </span>
            <span class="text-title-sm font-bold text-content-primary">
              Space Archetype & Spatial Parameters
            </span>
          </div>
        </div>

        <!-- Stepper Pill Trail -->
        <div class="flex items-center gap-1.5 bg-surface-subtle px-3 py-1.5 rounded-full border border-border-hairline/80">
          <div
            @click="activeStep = 1"
            class="flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-semibold transition-all cursor-pointer"
            :class="[
              activeStep >= 1
                ? 'bg-brand-primary text-white shadow-2xs'
                : 'text-content-secondary hover:text-content-primary'
            ]"
          >
            <span>1. Space & Footprint</span>
          </div>

          <ChevronRight class="w-3.5 h-3.5 text-content-secondary/50" />

          <div
            @click="activeStep = 2"
            class="flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-semibold transition-all cursor-pointer"
            :class="[
              activeStep >= 2
                ? 'bg-brand-primary text-white shadow-2xs'
                : 'text-content-secondary hover:text-content-primary'
            ]"
          >
            <span>2. Room Program</span>
          </div>

          <ChevronRight class="w-3.5 h-3.5 text-content-secondary/50" />

          <div
            @click="activeStep = 3"
            class="flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-semibold transition-all cursor-pointer"
            :class="[
              activeStep >= 3
                ? 'bg-brand-primary text-white shadow-2xs'
                : 'text-content-secondary hover:text-content-primary'
            ]"
          >
            <span>3. Style & Atmosphere</span>
          </div>
        </div>

        <!-- Quick Status Indicator -->
        <div class="hidden lg:flex items-center gap-2 text-caption-xs text-content-secondary font-medium">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Auto-syncing CAD constraints</span>
        </div>
      </div>
    </div>

    <!-- Primary Workspace Content: Split 2-Column Desktop Grid -->
    <div class="max-w-[1440px] w-full mx-auto px-6 py-6 flex-1">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- LEFT COLUMN: Parametric Configuration (Col 7) -->
        <div class="lg:col-span-7 flex flex-col gap-5">
          <!-- 1. Project Metadata Card -->
          <div class="bg-surface-card rounded-2xl p-6 shadow-card border border-border-hairline flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-blue-50 text-brand-primary flex items-center justify-center">
                  <FileText class="w-4 h-4" />
                </div>
                <h2 class="text-title-sm font-semibold text-content-primary">1. Project Metadata</h2>
              </div>

              <!-- Imperial vs Metric Segmented Control -->
              <div class="flex items-center bg-surface-subtle p-1 rounded-lg border border-border-hairline text-caption-xs font-semibold">
                <button
                  type="button"
                  @click="setUnit(MeasurementUnit.Feet)"
                  class="px-3 py-1 rounded-md transition-all cursor-pointer"
                  :class="[
                    unit === MeasurementUnit.Feet
                      ? 'bg-white text-brand-primary font-bold shadow-2xs'
                      : 'text-content-secondary hover:text-content-primary'
                  ]"
                >
                  Imperial (ft / in)
                </button>
                <button
                  type="button"
                  @click="setUnit(MeasurementUnit.Meters)"
                  class="px-3 py-1 rounded-md transition-all cursor-pointer"
                  :class="[
                    unit === MeasurementUnit.Meters
                      ? 'bg-white text-brand-primary font-bold shadow-2xs'
                      : 'text-content-secondary hover:text-content-primary'
                  ]"
                >
                  Metric (m / cm)
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-label-sm font-medium text-content-secondary mb-1">
                  Project Name
                </label>
                <input
                  v-model="projectName"
                  type="text"
                  placeholder="e.g. Modern Sunset Loft"
                  class="w-full h-10 px-3.5 bg-surface-subtle hover:bg-slate-100/70 focus:bg-white rounded-lg text-body-md text-content-primary font-medium outline-none border border-border-hairline focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                />
              </div>

              <div>
                <label class="block text-label-sm font-medium text-content-secondary mb-1">
                  Tag / Category
                </label>
                <div class="relative flex items-center">
                  <input
                    v-model="projectTag"
                    type="text"
                    placeholder="e.g. Residential Remodel"
                    class="w-full h-10 pl-3.5 pr-9 bg-surface-subtle hover:bg-slate-100/70 focus:bg-white rounded-lg text-body-md text-content-primary font-medium outline-none border border-border-hairline focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                  />
                  <Tag class="w-4 h-4 text-content-secondary absolute right-3 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Space Archetype Selection -->
          <ArchetypeSelector v-model="archetype" />

          <!-- 3. Overall Boundary Dimensions -->
          <DimensionsInput
            v-model:length="length"
            v-model:width="width"
            v-model:height="height"
            v-model:floors="floors"
            :unit="unit"
          />

          <!-- 4. Desired Room Program -->
          <RoomProgramConfig
            v-model:program="roomProgram"
            :unit="unit"
          />

          <!-- 5. Interior Style & Atmosphere -->
          <StylePicker
            v-model:style="style"
            v-model:density="density"
            v-model:paletteAccents="paletteAccents"
          />
        </div>

        <!-- RIGHT COLUMN: Real-Time Feasibility Calculator & CAD Schematic Dock (Col 5) -->
        <div class="lg:col-span-5 lg:sticky lg:top-20">
          <SpatialFeasibilityCard
            :length="length"
            :width="width"
            :height="height"
            :unit="unit"
            :roomProgram="roomProgram"
            :isSubmitting="isSubmitting"
            @submit="handleLaunchWorkspace"
            @save-draft="handleSaveDraft"
            @cancel="handleCancel"
          />
        </div>
      </div>
    </div>
  </div>
</template>
