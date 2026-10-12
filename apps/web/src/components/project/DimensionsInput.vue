<script setup lang="ts">
import { computed } from 'vue';
import { MeasurementUnit } from '@planora/domain';
import { Maximize2, Layers } from '@lucide/vue';

const props = defineProps<{
  length: number;
  width: number;
  height: number;
  floors: number;
  unit: MeasurementUnit;
}>();

const emit = defineEmits<{
  (e: 'update:length', val: number): void;
  (e: 'update:width', val: number): void;
  (e: 'update:height', val: number): void;
  (e: 'update:floors', val: number): void;
}>();

const unitLabel = computed(() => (props.unit === MeasurementUnit.Feet ? 'ft' : 'm'));

// Compute simplified aspect ratio (e.g., 3:2, 4:3, or 1.5:1)
const aspectRatioText = computed(() => {
  if (!props.length || !props.width) return 'Custom Ratio';
  const ratio = props.length / props.width;
  if (Math.abs(ratio - 1.5) < 0.08) return '3:2 Standard Ratio';
  if (Math.abs(ratio - 1.33) < 0.08) return '4:3 Standard Ratio';
  if (Math.abs(ratio - 1.0) < 0.08) return '1:1 Square Ratio';
  if (Math.abs(ratio - 2.0) < 0.08) return '2:1 Linear Ratio';
  return `${ratio.toFixed(1)}:1 Ratio`;
});

function adjustFloors(delta: number) {
  const next = Math.max(1, Math.min(10, props.floors + delta));
  emit('update:floors', next);
}
</script>

<template>
  <div class="bg-surface-card rounded-2xl p-6 shadow-card border border-border-hairline flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-blue-50 text-brand-primary flex items-center justify-center">
          <Maximize2 class="w-4 h-4" />
        </div>
        <h2 class="text-title-sm font-semibold text-content-primary">3. Overall Boundary Dimensions</h2>
      </div>
      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-caption-xs font-semibold text-brand-primary">
        <span>{{ aspectRatioText }}</span>
      </div>
    </div>

    <!-- Length, Width, Height 3-column Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label class="block text-label-sm font-medium text-content-secondary mb-1">
          Length (X-axis)
        </label>
        <div class="relative flex items-center">
          <input
            :value="length"
            @input="emit('update:length', Math.max(1, parseFloat(($event.target as HTMLInputElement).value) || 0))"
            type="number"
            min="1"
            step="1"
            class="w-full h-10 pl-3 pr-9 bg-surface-subtle hover:bg-slate-100/70 focus:bg-white rounded-lg text-body-md text-content-primary font-medium outline-none border border-border-hairline focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
          <span class="absolute right-3 text-label-sm text-content-secondary pointer-events-none font-medium">
            {{ unitLabel }}
          </span>
        </div>
      </div>

      <div>
        <label class="block text-label-sm font-medium text-content-secondary mb-1">
          Width (Y-axis)
        </label>
        <div class="relative flex items-center">
          <input
            :value="width"
            @input="emit('update:width', Math.max(1, parseFloat(($event.target as HTMLInputElement).value) || 0))"
            type="number"
            min="1"
            step="1"
            class="w-full h-10 pl-3 pr-9 bg-surface-subtle hover:bg-slate-100/70 focus:bg-white rounded-lg text-body-md text-content-primary font-medium outline-none border border-border-hairline focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
          <span class="absolute right-3 text-label-sm text-content-secondary pointer-events-none font-medium">
            {{ unitLabel }}
          </span>
        </div>
      </div>

      <div>
        <label class="block text-label-sm font-medium text-content-secondary mb-1">
          Ceiling Height
        </label>
        <div class="relative flex items-center">
          <input
            :value="height"
            @input="emit('update:height', Math.max(1, parseFloat(($event.target as HTMLInputElement).value) || 0))"
            type="number"
            min="1"
            step="0.5"
            class="w-full h-10 pl-3 pr-9 bg-surface-subtle hover:bg-slate-100/70 focus:bg-white rounded-lg text-body-md text-content-primary font-medium outline-none border border-border-hairline focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
          <span class="absolute right-3 text-label-sm text-content-secondary pointer-events-none font-medium">
            {{ unitLabel }}
          </span>
        </div>
      </div>
    </div>

    <!-- Vertical Levels (Floors) Card -->
    <div class="p-3.5 rounded-xl bg-surface-subtle flex items-center justify-between border border-border-hairline/60">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-white text-content-secondary flex items-center justify-center shadow-2xs">
          <Layers class="w-4 h-4 text-brand-primary" />
        </div>
        <div>
          <span class="text-label-sm font-semibold text-content-primary block">Vertical Levels</span>
          <span class="text-caption-xs text-content-secondary">
            {{ floors === 1 ? 'Single story loft partition' : `${floors} vertical connected stories` }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-border-hairline shadow-2xs">
        <button
          type="button"
          @click="adjustFloors(-1)"
          :disabled="floors <= 1"
          class="w-6 h-6 flex items-center justify-center rounded text-content-secondary hover:text-content-primary hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          -
        </button>
        <span class="text-label-md font-bold text-content-primary px-2 min-w-[50px] text-center">
          {{ floors }} Floor{{ floors > 1 ? 's' : '' }}
        </span>
        <button
          type="button"
          @click="adjustFloors(1)"
          class="w-6 h-6 flex items-center justify-center rounded text-content-secondary hover:text-content-primary hover:bg-slate-100 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  </div>
</template>
