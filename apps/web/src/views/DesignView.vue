<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectsStore } from '@/stores/projects';
import type { Layout, Room, Furniture } from '@planora/domain';
import { toMillimeters } from '@planora/domain';
import { generateLayout } from '@planora/layout-engine';

import CanvasToolbar, { type ViewMode } from '@/components/editor/CanvasToolbar.vue';
import FloorPlanCanvas from '@/components/editor/FloorPlanCanvas.vue';
import ThreeViewport from '@/components/viewer/ThreeViewport.vue';
import LayoutVariationsBar from '@/components/editor/LayoutVariationsBar.vue';
import CompareModal from '@/components/editor/CompareModal.vue';
import WorkspaceLeftPanel from '@/components/editor/WorkspaceLeftPanel.vue';

import {
  History,
  CheckCircle2,
  FolderOpen,
} from '@lucide/vue';

const route = useRoute();
const store = useProjectsStore();

const projectId = computed(() => route.params.projectId as string);
const project = computed(() => store.getProject(projectId.value));

const viewMode = ref<ViewMode>('2d');
const isCompareOpen = ref(false);
const selectedRoom = ref<Room | null>(null);
const selectedFurniture = ref<Furniture | null>(null);

// Ensure layouts exist for this project
onMounted(() => {
  if (!project.value) return;

  if (!project.value.layouts || project.value.layouts.length === 0) {
    const wMm = toMillimeters(project.value.dimensions.length, project.value.unit);
    const hMm = toMillimeters(project.value.dimensions.width, project.value.unit);

    const generated = generateLayout({
      boundary: { x: 0, y: 0, width: wMm, height: hMm },
      roomProgram: project.value.roomProgram || [],
      candidateCount: 3,
    });

    store.updateProject(project.value.id, {
      layouts: generated,
      selectedLayoutId: generated[0]?.id,
    });
  }
});

// Currently active layout
const activeLayout = computed<Layout | null>(() => {
  if (!project.value || !project.value.layouts.length) return null;
  return (
    project.value.layouts.find((l) => l.id === project.value?.selectedLayoutId) ||
    project.value.layouts[0]
  );
});

function handleSelectLayout(layoutId: string) {
  if (!project.value) return;
  store.updateProject(project.value.id, { selectedLayoutId: layoutId });
}

function handleGenerateNewLayout() {
  if (!project.value) return;
  const wMm = toMillimeters(project.value.dimensions.length, project.value.unit);
  const hMm = toMillimeters(project.value.dimensions.width, project.value.unit);

  const generated = generateLayout({
    boundary: { x: 0, y: 0, width: wMm, height: hMm },
    roomProgram: project.value.roomProgram || [],
    candidateCount: 3,
  });

  store.updateProject(project.value.id, {
    layouts: generated,
    selectedLayoutId: generated[0]?.id,
  });
}

function handleAutoArrange() {
  handleGenerateNewLayout();
}

function handleClear() {
  if (!project.value || !activeLayout.value) return;
  const cleared: Layout = {
    ...activeLayout.value,
    furniture: [],
  };
  const updatedLayouts = project.value.layouts.map((l) => (l.id === cleared.id ? cleared : l));
  store.updateProject(project.value.id, { layouts: updatedLayouts });
}

function handleDownload() {
  if (!project.value) return;
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project.value, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${project.value.name.replace(/\s+/g, '_')}_blueprint.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
</script>

<template>
  <div v-if="project && activeLayout" class="flex-1 flex flex-col bg-surface-canvas min-h-screen">
    <!-- Top CAD Project Context Bar -->
    <div class="w-full bg-white border-b border-border-hairline px-6 py-2.5 shadow-2xs">
      <div class="max-w-[1680px] mx-auto flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand-primary text-caption-xs font-semibold shadow-2xs">
            <span class="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            Live CAD Engine v4.2
          </span>
          <span class="text-border-hairline hidden sm:inline">•</span>
          <span class="text-caption-xs text-content-secondary hidden sm:inline">
            Automatic dimension snapping enabled (1/4" precision)
          </span>
        </div>

        <div class="flex items-center gap-3">
          <span class="inline-flex items-center gap-1 text-content-secondary text-caption-xs font-medium">
            <History class="w-3.5 h-3.5" />
            <span>Version History (Updated just now)</span>
          </span>
          <span class="w-px h-3.5 bg-border-hairline" />
          <span class="inline-flex items-center gap-1 text-emerald-600 text-caption-xs font-semibold">
            <CheckCircle2 class="w-3.5 h-3.5" />
            <span>Synced with Local Cache</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Main 3-Column Studio Workspace Grid -->
    <div class="w-full max-w-[1680px] mx-auto p-4 sm:p-6 flex-1">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <!-- COLUMN 1: LEFT CONFIGURATION & PARAMETERS (Col 3) -->
        <div class="lg:col-span-4 xl:col-span-3">
          <WorkspaceLeftPanel
            :project="project"
            @update:project="store.updateProject(project.id, $event)"
            @generate-layout="handleGenerateNewLayout"
          />
        </div>

        <!-- COLUMN 2: CENTER CAD FLOOR PLAN CANVAS (Col 6) -->
        <section class="lg:col-span-8 xl:col-span-6 flex flex-col bg-white rounded-2xl shadow-card border border-border-hairline relative overflow-hidden min-h-[680px]">
          <!-- Canvas Top Bar Controls -->
          <CanvasToolbar
            v-model:viewMode="viewMode"
            @auto-arrange="handleAutoArrange"
            @clear="handleClear"
            @download="handleDownload"
          />

          <!-- Viewport Switching (2D Floor Plan vs Full 3D vs Walkthrough) -->
          <div class="flex-1 w-full relative flex items-center justify-center">
            <!-- 2D View -->
            <FloorPlanCanvas
              v-if="viewMode === '2d'"
              :layout="activeLayout"
              :unit="project.unit"
              :lengthFt="project.dimensions.length"
              :widthFt="project.dimensions.width"
              @select-room="selectedRoom = $event"
              @select-furniture="selectedFurniture = $event"
            />

            <!-- 3D Full Viewport Mode -->
            <div v-else class="w-full h-full p-4 flex flex-col">
              <ThreeViewport
                :layout="activeLayout"
                :heightFt="project.dimensions.height"
                class="flex-1 w-full"
              />
            </div>
          </div>
        </section>

        <!-- COLUMN 3: RIGHT 3D PREVIEW & VARIATIONS (Col 3) -->
        <aside class="lg:col-span-12 xl:col-span-3 flex flex-col gap-5">
          <!-- 3D Synchronized Viewport (shows mini preview when in 2D mode) -->
          <ThreeViewport
            :layout="activeLayout"
            :heightFt="project.dimensions.height"
          />

          <!-- Alternate Design Variations Bar -->
          <LayoutVariationsBar
            :layouts="project.layouts"
            :selectedLayoutId="project.selectedLayoutId"
            @select-layout="handleSelectLayout"
            @compare="isCompareOpen = true"
          />
        </aside>
      </div>
    </div>

    <!-- Side-by-Side Comparison Modal -->
    <CompareModal
      v-if="isCompareOpen"
      :layouts="project.layouts"
      :activeLayoutId="project.selectedLayoutId"
      @close="isCompareOpen = false"
      @select-layout="handleSelectLayout"
    />
  </div>

  <!-- Empty / Not Found State -->
  <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center">
    <FolderOpen class="w-12 h-12 text-content-secondary/40 mb-3" />
    <h2 class="text-headline-md font-bold text-content-primary mb-1">Project Not Found</h2>
    <p class="text-body-md text-content-secondary mb-6">
      The requested architectural project could not be found or was deleted.
    </p>
    <router-link
      to="/projects"
      class="px-5 py-2.5 rounded-xl bg-brand-primary text-white font-label-md shadow-md hover:bg-brand-primary-hover transition-colors"
    >
      Back to Projects
    </router-link>
  </div>
</template>
