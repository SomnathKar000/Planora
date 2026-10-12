<script setup lang="ts">
import { useRoute } from 'vue-router';
import { PenTool, Box, Footprints } from 'lucide-vue-next';

const route = useRoute();
const projectId = route.params.projectId as string;
</script>

<template>
  <div class="flex-1 flex flex-col animate-fade-in">
    <!-- Sub-navigation (editor toolbar area) -->
    <div class="bg-surface-card border-b border-border-hairline px-5 py-2 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="badge bg-green-50 text-green-700">
          <span class="w-1.5 h-1.5 rounded-full bg-green-500" />
          Live CAD Engine v4.2
        </span>
        <span class="text-body-sm text-content-muted">
          • Automatic dimension snapping enabled (1/4" precision)
        </span>
      </div>
      <div class="flex items-center gap-3 text-label-sm text-content-muted">
        <span>Version History (4 mins ago)</span>
        <span class="flex items-center gap-1 text-green-600">
          <span class="w-1.5 h-1.5 rounded-full bg-green-500" />
          Synced with Cloud
        </span>
      </div>
    </div>

    <!-- Three-panel workspace placeholder -->
    <div class="flex-1 flex">
      <!-- Left panel placeholder -->
      <aside class="w-[360px] border-r border-border-hairline bg-surface-card p-5 overflow-y-auto">
        <div class="flex flex-col items-center justify-center h-full text-center">
          <div class="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-3">
            <PenTool class="w-6 h-6 text-primary" />
          </div>
          <h3 class="text-headline-md text-content-primary mb-1">Editor Controls</h3>
          <p class="text-body-sm text-content-secondary">
            Space details, room configuration, and design preferences will be implemented in Phase 4.
          </p>
        </div>
      </aside>

      <!-- Center canvas placeholder -->
      <main class="flex-1 bg-surface flex flex-col items-center justify-center">
        <div class="segment-container mb-6">
          <button class="segment-item active">
            <PenTool class="w-4 h-4 inline mr-1" />
            2D Floor Plan
          </button>
          <button class="segment-item">
            <Box class="w-4 h-4 inline mr-1" />
            3D View
          </button>
          <button class="segment-item">
            <Footprints class="w-4 h-4 inline mr-1" />
            Walkthrough
          </button>
        </div>

        <div class="panel px-12 py-16 text-center">
          <h3 class="text-headline-md text-content-primary mb-2">2D Floor Plan Editor</h3>
          <p class="text-body-md text-content-secondary max-w-sm">
            The SVG-based floor plan editor with grid, zoom/pan, room drawing, and snap-to-grid will be implemented in Phase 4.
          </p>
          <p class="text-body-sm text-content-muted mt-2">Project: {{ projectId }}</p>
        </div>
      </main>

      <!-- Right panel placeholder -->
      <aside class="w-[380px] border-l border-border-hairline bg-surface-card p-5 overflow-y-auto">
        <div class="flex flex-col items-center justify-center h-full text-center">
          <div class="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-3">
            <Box class="w-6 h-6 text-primary" />
          </div>
          <h3 class="text-headline-md text-content-primary mb-1">3D Preview</h3>
          <p class="text-body-sm text-content-secondary">
            Real-time 3D preview and design variations will be implemented in Phase 5.
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>
