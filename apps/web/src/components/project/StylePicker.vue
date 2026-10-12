<script setup lang="ts">
import { DesignStyle, FurnitureDensity } from '@planora/domain';
import { Palette, Check } from '@lucide/vue';

const props = defineProps<{
  style: DesignStyle;
  density: FurnitureDensity;
  paletteAccents: string[];
}>();

const emit = defineEmits<{
  (e: 'update:style', style: DesignStyle): void;
  (e: 'update:density', density: FurnitureDensity): void;
  (e: 'update:paletteAccents', accents: string[]): void;
}>();

interface StyleOption {
  style: DesignStyle;
  name: string;
  subtitle: string;
  bgGradient: string;
  paletteColors: string[];
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    style: DesignStyle.Modern,
    name: 'Modern',
    subtitle: 'Warm & Sleek',
    bgGradient: 'from-amber-100/60 via-slate-100 to-sky-100/40',
    paletteColors: ['#EAE3D2', '#A88B68', '#587B95'],
  },
  {
    style: DesignStyle.Minimal,
    name: 'Minimal',
    subtitle: 'Pure & Airy',
    bgGradient: 'from-stone-100 via-neutral-50 to-slate-100',
    paletteColors: ['#F5F5F0', '#D8D4D0', '#8C857B'],
  },
  {
    style: DesignStyle.Classic,
    name: 'Classic',
    subtitle: 'Timeless Elegance',
    bgGradient: 'from-amber-200/40 via-orange-100/30 to-amber-100/50',
    paletteColors: ['#D4AF37', '#8B5A2B', '#2C1D11'],
  },
  {
    style: DesignStyle.Industrial,
    name: 'Industrial',
    subtitle: 'Urban Raw',
    bgGradient: 'from-slate-200 via-zinc-200 to-slate-300',
    paletteColors: ['#3A3D40', '#6C757D', '#B07D62'],
  },
  {
    style: DesignStyle.Nordic,
    name: 'Nordic',
    subtitle: 'Cozy Hygge',
    bgGradient: 'from-emerald-50 via-teal-50 to-stone-100',
    paletteColors: ['#E2E8F0', '#94A3B8', '#475569'],
  },
];

const PRESET_PALETTES = [
  { hex: '#EAE3D2', title: 'Neutral Warm' },
  { hex: '#A88B68', title: 'Warm Oak' },
  { hex: '#7E9A82', title: 'Sage Earth' },
  { hex: '#587B95', title: 'Slate Mist' },
  { hex: '#222933', title: 'Dark Graphite' },
];

function toggleColor(color: string) {
  let list = [...props.paletteAccents];
  if (list.includes(color)) {
    if (list.length > 1) {
      list = list.filter((c) => c !== color);
    }
  } else {
    list.push(color);
  }
  emit('update:paletteAccents', list);
}

const densityOptions: { value: FurnitureDensity; label: string }[] = [
  { value: FurnitureDensity.Sparse, label: 'Sparse' },
  { value: FurnitureDensity.Balanced, label: 'Balanced' },
  { value: FurnitureDensity.Dense, label: 'Dense' },
];
</script>

<template>
  <div class="bg-surface-card rounded-2xl p-6 shadow-card border border-border-hairline flex flex-col gap-5">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-blue-50 text-brand-primary flex items-center justify-center">
          <Palette class="w-4 h-4" />
        </div>
        <h2 class="text-title-sm font-semibold text-content-primary">5. Interior Style & Atmosphere</h2>
      </div>
      <span class="text-caption-xs text-brand-primary font-semibold">Architectural Finishes</span>
    </div>

    <!-- Style Selection Cards with Top-Down Architectural Preview Styling -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <button
        v-for="opt in STYLE_OPTIONS"
        :key="opt.style"
        type="button"
        @click="emit('update:style', opt.style)"
        class="flex flex-col p-2 rounded-xl text-center transition-all cursor-pointer relative"
        :class="[
          style === opt.style
            ? 'bg-blue-50/80 ring-2 ring-brand-primary shadow-sm'
            : 'bg-surface-subtle hover:bg-slate-100/70 border border-border-hairline/60'
        ]"
      >
        <!-- Stylized Architectural Miniature -->
        <div
          class="w-full aspect-[4/3] rounded-lg mb-2 relative overflow-hidden bg-gradient-to-br flex items-center justify-center border border-white/60 shadow-2xs"
          :class="opt.bgGradient"
        >
          <!-- Geometric Plan Silhouette Graphic -->
          <svg class="w-12 h-10 opacity-70" viewBox="0 0 60 40" fill="none">
            <rect x="5" y="5" width="50" height="30" rx="3" stroke="#172033" stroke-width="1.5" stroke-dasharray="2 2" />
            <rect x="8" y="8" width="24" height="24" rx="2" :fill="opt.paletteColors[0]" opacity="0.8" />
            <rect x="35" y="8" width="16" height="12" rx="2" :fill="opt.paletteColors[1]" opacity="0.8" />
            <rect x="35" y="23" width="16" height="9" rx="1.5" :fill="opt.paletteColors[2]" opacity="0.8" />
          </svg>

          <!-- Checkmark Badge -->
          <div
            v-if="style === opt.style"
            class="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] shadow-sm"
          >
            <Check class="w-3 h-3 stroke-[3]" />
          </div>
        </div>

        <span
          class="text-label-md font-semibold block transition-colors"
          :class="style === opt.style ? 'text-brand-primary' : 'text-content-primary'"
        >
          {{ opt.name }}
        </span>
        <span
          class="text-caption-xs block transition-colors"
          :class="style === opt.style ? 'text-brand-primary/80 font-medium' : 'text-content-secondary'"
        >
          {{ opt.subtitle }}
        </span>
      </button>
    </div>

    <!-- Color Palette Swatches & Furniture Density -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
      <div>
        <span class="block text-label-sm font-medium text-content-secondary mb-2.5">
          Palette Accents
        </span>
        <div class="flex items-center gap-3">
          <button
            v-for="color in PRESET_PALETTES"
            :key="color.hex"
            type="button"
            :title="color.title"
            @click="toggleColor(color.hex)"
            class="w-7 h-7 rounded-full transition-transform cursor-pointer relative"
            :style="{ backgroundColor: color.hex }"
            :class="[
              paletteAccents.includes(color.hex)
                ? 'ring-2 ring-offset-2 ring-brand-primary scale-110 shadow-sm'
                : 'hover:scale-105 border border-black/10'
            ]"
          >
            <span
              v-if="paletteAccents.includes(color.hex)"
              class="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
              :class="color.hex === '#222933' ? 'text-white' : 'text-slate-800'"
            >
              •
            </span>
          </button>
        </div>
      </div>

      <div>
        <span class="block text-label-sm font-medium text-content-secondary mb-2.5">
          Furniture Density
        </span>
        <div class="grid grid-cols-3 gap-1 bg-surface-subtle p-1 rounded-xl border border-border-hairline">
          <button
            v-for="opt in densityOptions"
            :key="opt.value"
            type="button"
            @click="emit('update:density', opt.value)"
            class="py-1.5 text-center text-label-sm rounded-lg transition-all font-medium"
            :class="[
              density === opt.value
                ? 'bg-white text-brand-primary font-bold shadow-2xs'
                : 'text-content-secondary hover:text-content-primary'
            ]"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
