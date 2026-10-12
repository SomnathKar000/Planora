<script setup lang="ts">
import type { Layout } from '@planora/domain';
import { Columns, Check } from '@lucide/vue';

const props = defineProps<{
  layouts: Layout[];
  selectedLayoutId?: string;
}>();

const emit = defineEmits<{
  (e: 'select-layout', layoutId: string): void;
  (e: 'compare'): void;
}>();

const variantLabels = ['Modern Concept', 'Minimal Flow', 'Classic Partition', 'Open Loft'];
</script>

<template>
  <div class="bg-surface-card rounded-2xl p-5 shadow-card border border-border-hairline flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h2 class="text-title-sm font-semibold text-content-primary">Alternate Layouts</h2>
        <span class="px-2 py-0.5 rounded-full bg-blue-50 text-brand-primary font-caption-xs font-semibold">
          {{ layouts.length }} Generated
        </span>
      </div>

      <button
        type="button"
        @click="emit('compare')"
        class="text-caption-xs font-semibold text-brand-primary hover:underline cursor-pointer"
      >
        Compare ({{ layouts.length }})
      </button>
    </div>

    <!-- 2x2 Grid of alternate layout variations -->
    <div class="grid grid-cols-2 gap-3">
      <div
        v-for="(layout, idx) in layouts"
        :key="layout.id"
        @click="emit('select-layout', layout.id)"
        class="flex flex-col gap-1.5 cursor-pointer group"
      >
        <!-- Stylized Miniature Blueprint Thumbnail -->
        <div
          class="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 relative shadow-2xs border transition-all p-2 flex flex-col justify-between"
          :class="[
            selectedLayoutId === layout.id
              ? 'border-brand-primary ring-2 ring-brand-primary shadow-sm'
              : 'border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
          ]"
        >
          <!-- SVG Wireframe Mini Preview -->
          <div class="w-full h-full grid grid-cols-2 gap-1 pointer-events-none">
            <div
              v-for="room in layout.rooms.slice(0, 4)"
              :key="room.id"
              class="rounded bg-blue-500/20 border border-blue-400/40 p-1 flex items-center justify-center text-center"
            >
              <span class="text-[9px] font-mono text-blue-200 truncate">
                {{ room.name.split(' ')[0] }}
              </span>
            </div>
          </div>

          <!-- Active Selection Badge -->
          <span
            v-if="selectedLayoutId === layout.id"
            class="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-xs"
          >
            <Check class="w-2.5 h-2.5 stroke-[3]" />
          </span>

          <span
            v-else
            class="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded bg-slate-800/80 text-[9px] font-mono text-slate-300"
          >
            {{ layout.score || 90 }}%
          </span>
        </div>

        <div class="flex items-center justify-between">
          <span
            class="text-label-sm font-semibold transition-colors"
            :class="selectedLayoutId === layout.id ? 'text-brand-primary' : 'text-content-primary group-hover:text-brand-primary'"
          >
            {{ variantLabels[idx] || `Variant ${idx + 1}` }}
          </span>
          <span class="text-caption-xs text-content-secondary font-mono">
            {{ selectedLayoutId === layout.id ? 'Active' : `Alt ${String.fromCharCode(65 + idx)}` }}
          </span>
        </div>
      </div>
    </div>

    <!-- Side-by-Side Compare CTA -->
    <button
      type="button"
      @click="emit('compare')"
      class="w-full py-2.5 px-3 rounded-xl bg-surface-subtle hover:bg-slate-200/80 text-content-primary font-label-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer border border-border-hairline"
    >
      <Columns class="w-4 h-4 text-brand-primary" />
      <span>Compare Variations Side-by-Side</span>
    </button>
  </div>
</template>
