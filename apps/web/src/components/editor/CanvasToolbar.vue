<script setup lang="ts">
import {
  Layers,
  Box,
  Footprints,
  Undo2,
  Redo2,
  Wand2,
  Trash2,
  Download,
  Sparkles,
} from '@lucide/vue';

export type ViewMode = '2d' | '3d' | 'walkthrough';

const props = defineProps<{
  viewMode: ViewMode;
  canUndo?: boolean;
  canRedo?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:viewMode', mode: ViewMode): void;
  (e: 'undo'): void;
  (e: 'redo'): void;
  (e: 'auto-arrange'): void;
  (e: 'clear'): void;
  (e: 'download'): void;
  (e: 'open-staging'): void;
}>();
</script>

<template>
  <div class="px-4 py-2.5 bg-white border-b border-border-hairline flex flex-wrap items-center justify-between gap-3 z-10 shadow-2xs">
    <!-- View Switcher -->
    <div class="inline-flex p-1 bg-surface-subtle rounded-xl border border-border-hairline gap-1">
      <button
        type="button"
        @click="emit('update:viewMode', '2d')"
        class="px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
        :class="[
          viewMode === '2d'
            ? 'bg-white text-brand-primary shadow-2xs font-bold'
            : 'text-content-secondary hover:text-content-primary'
        ]"
      >
        <Layers class="w-4 h-4" />
        <span>2D Floor Plan</span>
      </button>

      <button
        type="button"
        @click="emit('update:viewMode', '3d')"
        class="px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
        :class="[
          viewMode === '3d'
            ? 'bg-white text-brand-primary shadow-2xs font-bold'
            : 'text-content-secondary hover:text-content-primary'
        ]"
      >
        <Box class="w-4 h-4" />
        <span>3D View</span>
      </button>

      <button
        type="button"
        @click="emit('update:viewMode', 'walkthrough')"
        class="px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
        :class="[
          viewMode === 'walkthrough'
            ? 'bg-white text-brand-primary shadow-2xs font-bold'
            : 'text-content-secondary hover:text-content-primary'
        ]"
      >
        <Footprints class="w-4 h-4" />
        <span>Walkthrough</span>
      </button>
    </div>

    <!-- Canvas Utility Commands -->
    <div class="flex items-center gap-1.5 flex-wrap">
      <button
        type="button"
        @click="emit('undo')"
        title="Undo (⌘Z)"
        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-content-secondary hover:text-content-primary hover:bg-slate-100 transition-colors cursor-pointer text-label-sm font-medium whitespace-nowrap"
      >
        <Undo2 class="w-4 h-4 shrink-0" />
        <span>Undo</span>
      </button>
      <button
        type="button"
        @click="emit('redo')"
        title="Redo (⌘⇧Z)"
        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-content-secondary hover:text-content-primary hover:bg-slate-100 transition-colors cursor-pointer text-label-sm font-medium whitespace-nowrap"
      >
        <Redo2 class="w-4 h-4 shrink-0" />
        <span>Redo</span>
      </button>

      <span class="w-px h-4 bg-border-hairline mx-0.5" />

      <button
        type="button"
        @click="emit('auto-arrange')"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-content-secondary hover:text-brand-primary hover:bg-blue-50 text-label-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
      >
        <Wand2 class="w-4 h-4 text-brand-primary shrink-0" />
        <span>Auto Arrange</span>
      </button>

      <button
        type="button"
        @click="emit('clear')"
        class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-content-secondary hover:text-rose-600 hover:bg-rose-50 text-label-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
      >
        <Trash2 class="w-4 h-4 shrink-0" />
        <span>Clear</span>
      </button>

      <button
        type="button"
        @click="emit('open-staging')"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-primary to-indigo-600 hover:from-brand-primary-hover hover:to-indigo-700 text-white text-label-sm font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap"
      >
        <Sparkles class="w-4 h-4 text-amber-300 shrink-0" />
        <span>Staging & AI</span>
      </button>

      <span class="w-px h-4 bg-border-hairline mx-0.5" />

      <button
        type="button"
        @click="emit('download')"
        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-subtle hover:bg-slate-200/80 text-content-primary text-label-sm font-semibold transition-colors cursor-pointer border border-border-hairline whitespace-nowrap"
      >
        <Download class="w-4 h-4 shrink-0" />
        <span>Download</span>
      </button>
    </div>
  </div>
</template>
