<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectsStore } from '@/stores/projects';
import { ARCHITECTURAL_TEMPLATES, type ArchitecturalTemplate } from '@/data/templates';
import { toMillimeters, ProjectStatus } from '@planora/domain';
import type { Project } from '@planora/domain';
import { generateLayout } from '@planora/layout-engine';
import {
  LayoutGrid,
  Search,
  Sparkles,
  Maximize2,
  X,
  Building,
  Home,
  Layers,
  Briefcase,
} from '@lucide/vue';

const router = useRouter();
const store = useProjectsStore();

// Filter & Search State
const selectedCategory = ref<'All' | 'Apartments' | 'Houses' | 'Lofts' | 'Commercial'>('All');
const searchQuery = ref('');
const activeModalTemplate = ref<ArchitecturalTemplate | null>(null);

const categories = [
  { id: 'All', label: 'All Templates', count: ARCHITECTURAL_TEMPLATES.length, icon: LayoutGrid },
  { id: 'Apartments', label: 'Apartments & Studios', count: ARCHITECTURAL_TEMPLATES.filter(t => t.category === 'Apartments').length, icon: Building },
  { id: 'Houses', label: 'Houses & Villas', count: ARCHITECTURAL_TEMPLATES.filter(t => t.category === 'Houses').length, icon: Home },
  { id: 'Lofts', label: 'Lofts & Mezzanines', count: ARCHITECTURAL_TEMPLATES.filter(t => t.category === 'Lofts').length, icon: Layers },
  { id: 'Commercial', label: 'Commercial & Studios', count: ARCHITECTURAL_TEMPLATES.filter(t => t.category === 'Commercial').length, icon: Briefcase },
] as const;

const filteredTemplates = computed(() => {
  return ARCHITECTURAL_TEMPLATES.filter((tpl) => {
    const matchesCategory = selectedCategory.value === 'All' || tpl.category === selectedCategory.value;
    const query = searchQuery.value.trim().toLowerCase();
    if (!query) return matchesCategory;

    const matchesQuery =
      tpl.name.toLowerCase().includes(query) ||
      tpl.tag.toLowerCase().includes(query) ||
      tpl.description.toLowerCase().includes(query) ||
      tpl.details.toLowerCase().includes(query) ||
      tpl.roomProgram.some(r => r.name.toLowerCase().includes(query));

    return matchesCategory && matchesQuery;
  });
});

// Fast Instantiate directly into CAD Studio
function handleUseTemplate(tpl: ArchitecturalTemplate) {
  const projectId = `proj-${Date.now()}`;
  const now = new Date().toISOString();

  const widthMm = toMillimeters(tpl.dimensions.length, tpl.unit);
  const heightMm = toMillimeters(tpl.dimensions.width, tpl.unit);

  const layouts = generateLayout({
    boundary: { x: 0, y: 0, width: widthMm, height: heightMm },
    roomProgram: tpl.roomProgram,
    candidateCount: 3,
  });

  const newProject: Project = {
    id: projectId,
    name: tpl.name,
    tag: `${tpl.tag} Template`,
    type: tpl.archetype,
    status: ProjectStatus.InProgress,
    dimensions: {
      length: tpl.dimensions.length,
      width: tpl.dimensions.width,
      height: tpl.dimensions.height,
    },
    unit: tpl.unit,
    floors: tpl.floors,
    preferences: {
      style: tpl.style,
      furnitureDensity: tpl.density,
      paletteAccents: tpl.paletteAccents,
    },
    layouts,
    selectedLayoutId: layouts[0]?.id,
    roomProgram: tpl.roomProgram,
    version: 1,
    createdAt: now,
    updatedAt: now,
  };

  store.addProject(newProject);
  if (activeModalTemplate.value) {
    activeModalTemplate.value = null;
  }
  router.push(`/design/${projectId}`);
}

// Customize template in Project Wizard
function handleCustomizeTemplate(tpl: ArchitecturalTemplate) {
  if (activeModalTemplate.value) {
    activeModalTemplate.value = null;
  }
  router.push({
    path: '/projects/new',
    query: { template: tpl.id },
  });
}
</script>

<template>
  <section id="template-gallery" class="space-y-6 pt-4">
    <!-- Header & Pitch -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-hairline pb-4">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-caption-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles class="w-3 h-3 text-blue-600" />
            Parametric Blueprint Library
          </span>
          <span class="text-caption-xs text-content-muted">11 Validated Presets</span>
        </div>
        <h2 class="text-headline-lg text-content-primary font-bold">Proven Architectural Blueprints</h2>
        <p class="text-body-md text-content-secondary mt-1 max-w-2xl">
          Instantly generate precision CAD floor plans with pre-calibrated room programs, boundary geometries, and architectural proportions.
        </p>
      </div>

      <!-- Search bar inside gallery -->
      <div class="relative w-full md:w-72 shrink-0">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filter templates by room, style..."
          class="input-base pl-9 w-full h-10 text-body-sm"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-primary"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Category Filter Tabs -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        @click="selectedCategory = cat.id as any"
        class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-label-sm font-medium transition-all shrink-0 cursor-pointer"
        :class="
          selectedCategory === cat.id
            ? 'bg-primary text-white shadow-sm'
            : 'bg-surface-card text-content-secondary hover:text-content-primary hover:bg-surface-subtle border border-border-hairline'
        "
      >
        <component :is="cat.icon" class="w-3.5 h-3.5" />
        <span>{{ cat.label }}</span>
        <span
          class="px-1.5 py-0.2 rounded-full text-[10px] font-mono"
          :class="selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-surface-subtle text-content-muted'"
        >
          {{ cat.count }}
        </span>
      </button>
    </div>

    <!-- Template Cards Grid -->
    <div
      v-if="filteredTemplates.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <article
        v-for="tpl in filteredTemplates"
        :key="tpl.id"
        class="panel group flex flex-col justify-between overflow-hidden border border-border-hairline hover:border-border-default hover:shadow-level-2 transition-all duration-200"
      >
        <div>
          <!-- Blueprint SVG Preview Card Header -->
          <div
            class="relative h-44 bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/30 p-3.5 border-b border-border-hairline overflow-hidden cursor-pointer"
            @click="activeModalTemplate = tpl"
          >
            <!-- Tag Badges -->
            <div class="flex items-center justify-between absolute top-2.5 left-2.5 right-2.5 pointer-events-none z-10">
              <span class="badge bg-white/95 text-content-primary shadow-xs font-semibold backdrop-blur-xs text-[11px] px-2 py-0.5 rounded-md border border-border-hairline">
                {{ tpl.tag }}
              </span>
              <span class="badge bg-slate-900/80 text-white font-mono text-[11px] px-2 py-0.5 rounded-md backdrop-blur-xs">
                {{ tpl.areaSqFt }} sq ft
              </span>
            </div>

            <!-- SVG Blueprint Visualization -->
            <svg
              class="w-full h-full transform group-hover:scale-[1.02] transition-transform duration-300 drop-shadow-xs"
              :viewBox="tpl.svgPreview.viewBox"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                v-for="room in tpl.svgPreview.rooms"
                :key="room.name"
                :x="room.x"
                :y="room.y"
                :width="room.w"
                :height="room.h"
                :fill="room.color"
                stroke="#94A3B8"
                stroke-width="0.75"
                rx="2"
              />
              <text
                v-for="room in tpl.svgPreview.rooms"
                :key="'t-' + room.name"
                :x="room.x + room.w / 2"
                :y="room.y + room.h / 2 + 3.5"
                text-anchor="middle"
                font-size="9"
                font-weight="600"
                fill="#334155"
                font-family="Plus Jakarta Sans, sans-serif"
              >
                {{ room.name }}
              </text>
            </svg>

            <!-- Quick View overlay button -->
            <button
              type="button"
              @click.stop="activeModalTemplate = tpl"
              class="absolute bottom-2.5 right-2.5 bg-white/90 hover:bg-white text-content-primary text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
            >
              <Maximize2 class="w-3 h-3" />
              <span>Inspect</span>
            </button>
          </div>

          <!-- Card Content Body -->
          <div class="p-4 space-y-3">
            <div>
              <div class="flex items-center justify-between">
                <h3 class="text-title-sm text-content-primary font-bold group-hover:text-primary transition-colors">
                  {{ tpl.name }}
                </h3>
              </div>
              <p class="text-caption-sm text-content-secondary mt-0.5 flex items-center gap-1.5">
                <span>{{ tpl.details }}</span>
              </p>
            </div>

            <p class="text-body-sm text-content-secondary line-clamp-2 leading-relaxed">
              {{ tpl.description }}
            </p>

            <!-- Room Program Summary Pills -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              <span
                v-for="r in tpl.roomProgram.slice(0, 3)"
                :key="r.id"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-subtle border border-border-hairline text-caption-xs text-content-secondary font-medium"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-primary/60" />
                {{ r.name }}
              </span>
              <span
                v-if="tpl.roomProgram.length > 3"
                class="px-1.5 py-0.5 rounded bg-surface-subtle text-caption-xs text-content-muted font-mono"
              >
                +{{ tpl.roomProgram.length - 3 }} more
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons Footer -->
        <div class="p-4 pt-0 grid grid-cols-2 gap-2 mt-2">
          <button
            type="button"
            @click="handleCustomizeTemplate(tpl)"
            class="h-9 rounded-lg bg-surface-card hover:bg-surface-subtle active:bg-slate-100 text-content-primary border border-border-hairline font-label-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Customize</span>
          </button>

          <button
            type="button"
            @click="handleUseTemplate(tpl)"
            class="h-9 rounded-lg bg-primary hover:bg-primary-hover active:bg-blue-700 text-white font-label-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Sparkles class="w-3.5 h-3.5" />
            <span>Use Template</span>
          </button>
        </div>
      </article>
    </div>

    <!-- Empty Filter State -->
    <div
      v-else
      class="panel flex flex-col items-center justify-center py-12 text-center border border-dashed border-border-default"
    >
      <div class="w-12 h-12 rounded-xl bg-surface-subtle flex items-center justify-center mb-3">
        <Search class="w-6 h-6 text-content-muted" />
      </div>
      <h3 class="text-title-md text-content-primary font-bold">No templates match criteria</h3>
      <p class="text-body-sm text-content-secondary mt-1 mb-4 max-w-sm">
        Try clearing your search query or selecting a different architectural category.
      </p>
      <button
        type="button"
        @click="searchQuery = ''; selectedCategory = 'All'"
        class="h-9 px-4 rounded-lg bg-surface-card hover:bg-surface-subtle border border-border-hairline text-content-primary text-label-sm font-semibold"
      >
        Reset Filters
      </button>
    </div>

    <!-- ── Detailed Template Modal ──────────────────────────────────────── -->
    <div
      v-if="activeModalTemplate"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      @click.self="activeModalTemplate = null"
    >
      <div
        class="bg-surface-card rounded-2xl max-w-2xl w-full border border-border-hairline shadow-level-3 overflow-hidden flex flex-col animate-scale-in"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-border-hairline flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="px-2 py-0.5 rounded text-caption-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {{ activeModalTemplate.category }}
            </span>
            <h3 class="text-headline-md font-bold text-content-primary">
              {{ activeModalTemplate.name }}
            </h3>
          </div>
          <button
            type="button"
            @click="activeModalTemplate = null"
            class="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-subtle"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          <!-- Large Blueprint Visualization -->
          <div class="w-full h-56 bg-slate-50 rounded-xl p-4 border border-border-hairline flex items-center justify-center">
            <svg
              class="w-full h-full drop-shadow-sm"
              :viewBox="activeModalTemplate.svgPreview.viewBox"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                v-for="room in activeModalTemplate.svgPreview.rooms"
                :key="room.name"
                :x="room.x"
                :y="room.y"
                :width="room.w"
                :height="room.h"
                :fill="room.color"
                stroke="#64748B"
                stroke-width="0.8"
                rx="3"
              />
              <text
                v-for="room in activeModalTemplate.svgPreview.rooms"
                :key="'t-' + room.name"
                :x="room.x + room.w / 2"
                :y="room.y + room.h / 2 + 4"
                text-anchor="middle"
                font-size="10"
                font-weight="bold"
                fill="#1E293B"
                font-family="Plus Jakarta Sans, sans-serif"
              >
                {{ room.name }}
              </text>
            </svg>
          </div>

          <!-- Description & Details -->
          <div>
            <h4 class="text-label-md font-semibold text-content-primary mb-1">Architectural Brief</h4>
            <p class="text-body-md text-content-secondary leading-relaxed">
              {{ activeModalTemplate.description }}
            </p>
          </div>

          <!-- Dimension & Spec Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-subtle p-3.5 rounded-xl border border-border-hairline">
            <div>
              <span class="text-caption-xs text-content-muted block">Footprint Area</span>
              <span class="text-title-sm font-bold text-content-primary font-mono">
                {{ activeModalTemplate.areaSqFt }} sq ft
              </span>
              <span class="text-[11px] text-content-muted block">({{ activeModalTemplate.areaSqM }} m²)</span>
            </div>
            <div>
              <span class="text-caption-xs text-content-muted block">Outer Dimensions</span>
              <span class="text-title-sm font-bold text-content-primary font-mono">
                {{ activeModalTemplate.dimensions.length }}' × {{ activeModalTemplate.dimensions.width }}'
              </span>
              <span class="text-[11px] text-content-muted block">Clearance: {{ activeModalTemplate.dimensions.height }}'</span>
            </div>
            <div>
              <span class="text-caption-xs text-content-muted block">Aesthetic Preset</span>
              <span class="text-title-sm font-bold text-content-primary capitalize">
                {{ activeModalTemplate.style }}
              </span>
              <span class="text-[11px] text-content-muted block">{{ activeModalTemplate.density }} Staging</span>
            </div>
            <div>
              <span class="text-caption-xs text-content-muted block">Vertical Levels</span>
              <span class="text-title-sm font-bold text-content-primary">
                {{ activeModalTemplate.floors }} Floor{{ activeModalTemplate.floors > 1 ? 's' : '' }}
              </span>
              <span class="text-[11px] text-content-muted block">{{ activeModalTemplate.tag }} Class</span>
            </div>
          </div>

          <!-- Room Program Breakdown -->
          <div>
            <h4 class="text-label-md font-semibold text-content-primary mb-2.5">
              Room Program Allocation ({{ activeModalTemplate.roomProgram.length }} Spaces)
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                v-for="room in activeModalTemplate.roomProgram"
                :key="room.id"
                class="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-card border border-border-hairline text-body-sm"
              >
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-primary" />
                  <span class="font-medium text-content-primary">{{ room.name }}</span>
                </div>
                <span class="text-content-secondary font-mono text-caption-sm">
                  {{ room.targetArea }} sq ft
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-border-hairline bg-surface-card flex items-center justify-end gap-3">
          <button
            type="button"
            @click="activeModalTemplate = null"
            class="h-10 px-4 rounded-xl text-content-secondary hover:text-content-primary font-label-md font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleCustomizeTemplate(activeModalTemplate)"
            class="h-10 px-4 rounded-xl bg-surface-subtle hover:bg-slate-200 text-content-primary border border-border-hairline font-label-md font-semibold cursor-pointer"
          >
            Customize in Wizard
          </button>
          <button
            type="button"
            @click="handleUseTemplate(activeModalTemplate)"
            class="h-10 px-5 rounded-xl bg-primary hover:bg-primary-hover active:bg-blue-700 text-white font-label-md font-semibold flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Sparkles class="w-4 h-4" />
            <span>Launch CAD Studio</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
