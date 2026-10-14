<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
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
import FurnitureCatalogModal, { type CatalogFurnitureItem } from '@/components/editor/FurnitureCatalogModal.vue';
import ObjectInspector from '@/components/editor/ObjectInspector.vue';
import ExportModal from '@/components/editor/ExportModal.vue';
import StagingWorkspaceModal from '@/components/staging/StagingWorkspaceModal.vue';

import {
  History,
  CheckCircle2,
  FolderOpen,
  Sparkles,
  ArrowLeft,
} from '@lucide/vue';

const route = useRoute();
const store = useProjectsStore();

const projectId = computed(() => route.params.projectId as string);
const project = computed(() => store.getProject(projectId.value));

const viewMode = ref<ViewMode>('2d');
const isCompareOpen = ref(false);
const isCatalogOpen = ref(false);
const isExportOpen = ref(false);
const isStagingOpen = ref(false);
const screenshotDataUrl = ref<string>('');
const threeViewportRef = ref<InstanceType<typeof ThreeViewport> | null>(null);
const selectedRoom = ref<Room | null>(null);
const selectedFurniture = ref<Furniture | null>(null);

// ── Undo / Redo History Stack ────────────────────────────────────
const undoStack = ref<Layout[]>([]);
const redoStack = ref<Layout[]>([]);
const canUndo = computed(() => undoStack.value.length > 0);
const canRedo = computed(() => redoStack.value.length > 0);

function pushUndoState() {
  if (activeLayout.value) {
    undoStack.value.push(JSON.parse(JSON.stringify(activeLayout.value)));
    if (undoStack.value.length > 30) {
      undoStack.value.shift();
    }
    redoStack.value = [];
  }
}

function handleUndo() {
  if (!canUndo.value || !project.value || !activeLayout.value) return;
  const previous = undoStack.value.pop()!;
  redoStack.value.push(JSON.parse(JSON.stringify(activeLayout.value)));
  const updatedLayouts = project.value.layouts.map((l) => (l.id === previous.id ? previous : l));
  store.updateProject(project.value.id, { layouts: updatedLayouts });
  syncSelectedItems(previous);
}

function handleRedo() {
  if (!canRedo.value || !project.value || !activeLayout.value) return;
  const next = redoStack.value.pop()!;
  undoStack.value.push(JSON.parse(JSON.stringify(activeLayout.value)));
  const updatedLayouts = project.value.layouts.map((l) => (l.id === next.id ? next : l));
  store.updateProject(project.value.id, { layouts: updatedLayouts });
  syncSelectedItems(next);
}

function syncSelectedItems(layout: Layout) {
  if (selectedRoom.value) {
    selectedRoom.value = layout.rooms.find((r) => r.id === selectedRoom.value?.id) || null;
  }
  if (selectedFurniture.value) {
    selectedFurniture.value = layout.furniture.find((f) => f.id === selectedFurniture.value?.id) || null;
  }
}

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

  window.addEventListener('keydown', handleGlobalKeyShortcuts);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeyShortcuts);
});

function handleGlobalKeyShortcuts(e: KeyboardEvent) {
  const isCmdOrCtrl = e.metaKey || e.ctrlKey;
  if (isCmdOrCtrl && e.key.toLowerCase() === 'z') {
    if (e.shiftKey) {
      handleRedo();
    } else {
      handleUndo();
    }
    e.preventDefault();
  } else if (isCmdOrCtrl && e.key.toLowerCase() === 'y') {
    handleRedo();
    e.preventDefault();
  }
}

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
  selectedRoom.value = null;
  selectedFurniture.value = null;
  undoStack.value = [];
  redoStack.value = [];
}

function handleUpdateLayout(updatedLayout: Layout) {
  if (!project.value) return;
  pushUndoState();
  const updatedLayouts = project.value.layouts.map((l) =>
    l.id === updatedLayout.id ? updatedLayout : l
  );
  store.updateProject(project.value.id, { layouts: updatedLayouts });
  syncSelectedItems(updatedLayout);
}

function handleGenerateNewLayout() {
  if (!project.value) return;
  pushUndoState();
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
  pushUndoState();
  const cleared: Layout = {
    ...activeLayout.value,
    furniture: [],
  };
  const updatedLayouts = project.value.layouts.map((l) => (l.id === cleared.id ? cleared : l));
  store.updateProject(project.value.id, { layouts: updatedLayouts });
  selectedFurniture.value = null;
}

function handleDownload() {
  if (!project.value) return;
  if (threeViewportRef.value) {
    try {
      screenshotDataUrl.value = threeViewportRef.value.captureScreenshot();
    } catch {
      screenshotDataUrl.value = '';
    }
  }
  isExportOpen.value = true;
}

function handleOpenStaging() {
  if (!project.value) return;
  if (threeViewportRef.value) {
    try {
      screenshotDataUrl.value = threeViewportRef.value.captureScreenshot();
    } catch {
      screenshotDataUrl.value = '';
    }
  }
  isStagingOpen.value = true;
}

function handleApplyStagedLayout(stagedLayout: Layout) {
  handleUpdateLayout(stagedLayout);
}

// ── Furniture Catalog Insertion ──────────────────────────────────
function handleAddCatalogFurniture(item: CatalogFurnitureItem) {
  if (!activeLayout.value || !project.value) return;
  pushUndoState();

  const b = activeLayout.value.boundary;
  let posX = b.width / 2;
  let posY = b.height / 2;

  if (selectedRoom.value) {
    posX = selectedRoom.value.boundary.x + selectedRoom.value.boundary.width / 2;
    posY = selectedRoom.value.boundary.y + selectedRoom.value.boundary.height / 2;
  }

  const newFurn: Furniture = {
    id: `furn-${Date.now()}`,
    type: item.type,
    name: item.name,
    width: item.widthMm,
    depth: item.depthMm,
    height: item.heightMm,
    position: { x: Math.round(posX), y: Math.round(posY) },
    rotation: 0,
  };

  const updatedLayout: Layout = {
    ...activeLayout.value,
    furniture: [...activeLayout.value.furniture, newFurn],
  };

  handleUpdateLayout(updatedLayout);
  selectedFurniture.value = newFurn;
  selectedRoom.value = null;
  isCatalogOpen.value = false;
}

// ── Object Inspector Handlers ────────────────────────────────────
function handleUpdateRoom(updated: Room) {
  if (!activeLayout.value) return;
  const updatedRooms = activeLayout.value.rooms.map((r) => (r.id === updated.id ? updated : r));
  handleUpdateLayout({ ...activeLayout.value, rooms: updatedRooms });
  selectedRoom.value = updated;
}

function handleUpdateFurniture(updated: Furniture) {
  if (!activeLayout.value) return;
  const updatedFurn = activeLayout.value.furniture.map((f) => (f.id === updated.id ? updated : f));
  handleUpdateLayout({ ...activeLayout.value, furniture: updatedFurn });
  selectedFurniture.value = updated;
}

function handleRotateFurniture(deg: number) {
  if (!selectedFurniture.value || !activeLayout.value) return;
  const curRot = selectedFurniture.value.rotation || 0;
  const newRot = (curRot + deg) % 360;
  const updated = { ...selectedFurniture.value, rotation: newRot };
  handleUpdateFurniture(updated);
}

function handleDuplicateFurniture(furn: Furniture) {
  if (!activeLayout.value) return;
  const newFurn: Furniture = {
    ...furn,
    id: `furn-${Date.now()}`,
    name: `${furn.name} (Copy)`,
    position: {
      x: Math.min(activeLayout.value.boundary.width - 500, furn.position.x + 350),
      y: Math.min(activeLayout.value.boundary.height - 500, furn.position.y + 350),
    },
  };
  handleUpdateLayout({
    ...activeLayout.value,
    furniture: [...activeLayout.value.furniture, newFurn],
  });
  selectedFurniture.value = newFurn;
}

function handleDeleteFurniture(id: string) {
  if (!activeLayout.value) return;
  const filtered = activeLayout.value.furniture.filter((f) => f.id !== id);
  handleUpdateLayout({ ...activeLayout.value, furniture: filtered });
  selectedFurniture.value = null;
}

function handleDeleteRoom(id: string) {
  if (!activeLayout.value) return;
  const filtered = activeLayout.value.rooms.filter((r) => r.id !== id);
  handleUpdateLayout({ ...activeLayout.value, rooms: filtered });
  selectedRoom.value = null;
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
            Live CAD Studio Engine v4.3
          </span>
          <span class="text-border-hairline hidden sm:inline">•</span>
          <span class="text-caption-xs text-content-secondary hidden sm:inline">
            Interactive CAD: Drag furniture, resize rooms, draw walls, live 3D sync
          </span>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="handleOpenStaging"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-brand-primary to-indigo-600 hover:from-brand-primary-hover hover:to-indigo-700 text-white text-caption-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles class="w-3.5 h-3.5 text-amber-300" />
            <span>Staging & AI Inpainting</span>
          </button>
          <span class="w-px h-3.5 bg-border-hairline" />
          <span class="inline-flex items-center gap-1 text-content-secondary text-caption-xs font-medium">
            <History class="w-3.5 h-3.5" />
            <span>{{ canUndo ? `${undoStack.length} edits in session` : 'Clean canvas' }}</span>
          </span>
          <span class="w-px h-3.5 bg-border-hairline" />
          <span class="inline-flex items-center gap-1 text-emerald-600 text-caption-xs font-semibold">
            <CheckCircle2 class="w-3.5 h-3.5" />
            <span>Synced with 3D Viewport</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Main 3-Column Studio Workspace Grid -->
    <div class="w-full max-w-[1680px] mx-auto p-4 sm:p-6 flex-1">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <!-- COLUMN 1: LEFT CONFIGURATION & PARAMETERS (Col 3) -->
        <div class="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
          <!-- Active Object Property Inspector (Shown when Room or Furniture is selected) -->
          <ObjectInspector
            v-if="selectedRoom || selectedFurniture"
            :room="selectedRoom"
            :furniture="selectedFurniture"
            :unit="project.unit"
            @close="selectedRoom = null; selectedFurniture = null"
            @update:room="handleUpdateRoom"
            @update:furniture="handleUpdateFurniture"
            @rotate:furniture="handleRotateFurniture"
            @duplicate:furniture="handleDuplicateFurniture"
            @delete:furniture="handleDeleteFurniture"
            @delete:room="handleDeleteRoom"
          />

          <!-- General Workspace Left Panel -->
          <WorkspaceLeftPanel
            :project="project"
            @update:project="store.updateProject(project.id, $event)"
            @generate-layout="handleGenerateNewLayout"
          />
        </div>

        <!-- COLUMN 2: CENTER CAD FLOOR PLAN CANVAS (Col 6) -->
        <section class="lg:col-span-8 xl:col-span-6 flex flex-col bg-white rounded-2xl shadow-card border border-border-hairline relative overflow-hidden min-h-[680px]">
          <!-- Canvas Top Bar Controls with Undo / Redo -->
          <CanvasToolbar
            v-model:viewMode="viewMode"
            :canUndo="canUndo"
            :canRedo="canRedo"
            @undo="handleUndo"
            @redo="handleRedo"
            @auto-arrange="handleAutoArrange"
            @clear="handleClear"
            @download="handleDownload"
            @open-staging="handleOpenStaging"
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
              @update:layout="handleUpdateLayout"
              @select-room="selectedRoom = $event; selectedFurniture = null"
              @select-furniture="selectedFurniture = $event; selectedRoom = null"
              @open-catalog="isCatalogOpen = true"
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
            ref="threeViewportRef"
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

    <!-- Architectural Furniture Catalog Modal -->
    <FurnitureCatalogModal
      v-if="isCatalogOpen"
      :unit="project.unit"
      @close="isCatalogOpen = false"
      @select="handleAddCatalogFurniture"
    />

    <!-- Architectural Deliverables Export Modal -->
    <ExportModal
      v-if="isExportOpen"
      :project="project"
      :layout="activeLayout"
      :screenshotDataUrl="screenshotDataUrl"
      @close="isExportOpen = false"
    />

    <!-- Phase 8: Procedural Staging & AI Inpainting Workspace Modal -->
    <StagingWorkspaceModal
      v-if="isStagingOpen"
      :project="project"
      :layout="activeLayout"
      :initialScreenshot="screenshotDataUrl"
      @close="isStagingOpen = false"
      @apply-layout="handleApplyStagedLayout"
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
      class="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-primary hover:bg-primary-hover active:bg-blue-800 text-white font-semibold text-body-md shadow-md hover:shadow-lg transition-all cursor-pointer group"
    >
      <ArrowLeft class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform shrink-0 text-white" />
      <span class="font-bold tracking-tight text-white">Back to Projects</span>
    </router-link>
  </div>
</template>
