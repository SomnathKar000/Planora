<script setup lang="ts">
import type { Layout } from '@planora/domain';
import { Columns, Check } from '@lucide/vue';

defineProps<{
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

    <!-- 2x2 Grid of alternate layout variations with realistic mini blueprint renderings -->
    <div class="grid grid-cols-2 gap-3">
      <div
        v-for="(layout, idx) in layouts"
        :key="layout.id"
        tabindex="0"
        role="button"
        @click="emit('select-layout', layout.id)"
        @keydown.enter="emit('select-layout', layout.id)"
        class="flex flex-col gap-1.5 cursor-pointer group outline-none"
      >
        <!-- Stylized Miniature Blueprint Thumbnail with Actual Vector Floor Plan -->
        <div
          class="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 relative shadow-2xs border transition-all p-1.5 flex flex-col justify-between"
          :class="[
            selectedLayoutId === layout.id
              ? 'border-brand-primary ring-2 ring-brand-primary shadow-sm'
              : 'border-slate-800 hover:border-slate-700 opacity-85 hover:opacity-100'
          ]"
        >
          <!-- SVG Miniature Vector Floor Plan Preview -->
          <div class="w-full h-full relative pointer-events-none flex items-center justify-center">
            <svg
              class="w-full h-full max-h-[110px]"
              :viewBox="`0 0 ${layout.boundary?.width || 10000} ${layout.boundary?.height || 7000}`"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
            >
              <!-- Outer Floor Plate -->
              <rect
                :x="0"
                :y="0"
                :width="layout.boundary?.width || 10000"
                :height="layout.boundary?.height || 7000"
                fill="#0B132B"
                stroke="#1E293B"
                stroke-width="120"
                rx="60"
              />

              <!-- Rooms -->
              <g v-for="room in layout.rooms" :key="room.id">
                <rect
                  :x="room.boundary.x"
                  :y="room.boundary.y"
                  :width="room.boundary.width"
                  :height="room.boundary.height"
                  :fill="room.color || '#1E293B'"
                  fill-opacity="0.3"
                  stroke="#38BDF8"
                  stroke-width="50"
                  stroke-opacity="0.4"
                />
                <text
                  :x="room.boundary.x + room.boundary.width / 2"
                  :y="room.boundary.y + room.boundary.height / 2 + 100"
                  fill="#93C5FD"
                  font-size="320"
                  font-weight="700"
                  font-family="sans-serif"
                  text-anchor="middle"
                  opacity="0.85"
                >
                  {{ room.name.slice(0, 7) }}
                </text>
              </g>

              <!-- Interior & Exterior Walls -->
              <line
                v-for="wall in layout.walls"
                :key="wall.id"
                :x1="wall.start.x"
                :y1="wall.start.y"
                :x2="wall.end.x"
                :y2="wall.end.y"
                :stroke="wall.type === 'exterior' ? '#60A5FA' : '#94A3B8'"
                :stroke-width="wall.type === 'exterior' ? '180' : '100'"
                stroke-linecap="round"
                opacity="0.9"
              />

              <!-- Furniture Dots -->
              <circle
                v-for="f in layout.furniture"
                :key="f.id"
                :cx="f.position.x"
                :cy="f.position.y"
                r="140"
                fill="#FBBF24"
                opacity="0.85"
              />
            </svg>
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
            class="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-slate-800/80 text-[9px] font-mono text-slate-300"
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
