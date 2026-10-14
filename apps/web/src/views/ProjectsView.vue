<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useProjectsStore } from '@/stores/projects';
import ProjectCard from '@/components/dashboard/ProjectCard.vue';
import StatsBar from '@/components/dashboard/StatsBar.vue';
import TemplateGallery from '@/components/dashboard/TemplateGallery.vue';
import {
  Search,
  Sparkles,
  Upload,
  LayoutGrid,
  Grid3x3,
  List,
  SlidersHorizontal,
} from '@lucide/vue';

const router = useRouter();
const store = useProjectsStore();

const filterTabs = [
  { id: 'all', label: 'All Projects', count: 12 },
  { id: 'apartment', label: 'Apartments', count: 6 },
  { id: 'house', label: 'Single Family', count: 4 },
  { id: 'commercial', label: 'Commercial & Studio', count: 2 },
];

const scrollToTemplates = () => {
  const el = document.getElementById('template-gallery');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>

<template>
  <div class="max-w-[1440px] mx-auto px-6 py-6 space-y-8 animate-fade-in">
    <!-- ── Hero Section ─────────────────────────────── -->
    <section class="flex items-start justify-between gap-6">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <span class="badge bg-green-50 text-green-700">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500" />
            Planora CAD Core v4.2 Active
          </span>
          <span class="text-label-sm text-content-muted">Cloud Sync Real-Time</span>
        </div>
        <h1 class="text-headline-xl text-content-primary">Welcome back, Sarah</h1>
        <p class="text-body-lg text-content-secondary mt-1 max-w-lg">
          Pick up where you left off or instantiate a new generative architectural layout with AI-guided spatial constraints.
        </p>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <button class="btn-secondary h-10">
          <Upload class="w-4 h-4" />
          Import CAD / DWG
        </button>
        <button class="btn-secondary h-10" @click="scrollToTemplates">
          <LayoutGrid class="w-4 h-4" />
          Browse Templates
        </button>
        <button
          class="btn-primary h-10"
          @click="router.push('/projects/new')"
        >
          <Sparkles class="w-4 h-4" />
          + New Project
        </button>
      </div>
    </section>

    <!-- ── Stats Bar ────────────────────────────────── -->
    <StatsBar :total-projects="store.totalProjects" />

    <!-- ── Filters & Search ─────────────────────────── -->
    <section>
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-2">
          <!-- Search -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
            <input
              v-model="store.searchQuery"
              type="text"
              placeholder="Search projects by name, address, tag or d..3K"
              class="input-base pl-9 w-80"
            />
          </div>

          <!-- Filter pills -->
          <div class="segment-container ml-3">
            <button
              v-for="tab in filterTabs"
              :key="tab.id"
              class="segment-item"
              :class="{ active: store.activeFilter === tab.id }"
              @click="store.activeFilter = tab.id"
            >
              {{ tab.label }} ({{ tab.count }})
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- View toggle -->
          <div class="segment-container">
            <button class="segment-item active p-1.5">
              <Grid3x3 class="w-4 h-4" />
            </button>
            <button class="segment-item p-1.5">
              <List class="w-4 h-4" />
            </button>
          </div>

          <!-- Sort -->
          <button class="btn-secondary h-9 text-label-sm">
            <SlidersHorizontal class="w-3.5 h-3.5" />
            Modified: Recent
          </button>
        </div>
      </div>
    </section>

    <!-- ── Active Workspaces Grid ───────────────────── -->
    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-headline-lg text-content-primary">Active Workspaces</h2>
        <p class="text-body-sm text-content-secondary">
          Showing {{ store.filteredProjects.length }} of {{ store.totalProjects }} spatial drafts
        </p>
      </div>

      <div
        v-if="store.filteredProjects.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        <ProjectCard
          v-for="project in store.filteredProjects"
          :key="project.id"
          :project="project"
        />
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="panel flex flex-col items-center justify-center py-16 text-center"
      >
        <div class="w-16 h-16 rounded-2xl bg-surface-subtle flex items-center justify-center mb-4">
          <Search class="w-8 h-8 text-content-muted" />
        </div>
        <h3 class="text-headline-md text-content-primary mb-1">No projects found</h3>
        <p class="text-body-md text-content-secondary mb-4">
          Try adjusting your search or filters, or create a new project.
        </p>
        <button class="btn-primary" @click="router.push('/projects/new')">
          <Sparkles class="w-4 h-4" />
          Create New Project
        </button>
      </div>
    </section>

    <!-- ── Template Gallery ─────────────────────────── -->
    <TemplateGallery />
  </div>
</template>
