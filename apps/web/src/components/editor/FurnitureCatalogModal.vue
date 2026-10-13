<script setup lang="ts">
import { ref, computed } from 'vue';
import { FurnitureType, MeasurementUnit, fromMillimeters } from '@planora/domain';
import {
  X,
  Search,
  Armchair,
  Bed,
  UtensilsCrossed,
  Briefcase,
  Bath,
  Plus,
} from '@lucide/vue';

export interface CatalogFurnitureItem {
  type: FurnitureType;
  name: string;
  category: 'living' | 'bedroom' | 'dining' | 'office' | 'bathroom';
  widthMm: number;
  depthMm: number;
  heightMm: number;
  description: string;
}

const props = defineProps<{
  unit: MeasurementUnit;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select', item: CatalogFurnitureItem): void;
}>();

const selectedCategory = ref<string>('all');
const searchQuery = ref('');

const CATALOG_ITEMS: CatalogFurnitureItem[] = [
  // Living Room
  {
    type: FurnitureType.Sofa,
    name: '3-Seater Comfort Sofa',
    category: 'living',
    widthMm: 2100,
    depthMm: 900,
    heightMm: 850,
    description: 'Deep cushioned contemporary three-seater sofa with structured armrests.',
  },
  {
    type: FurnitureType.Sofa,
    name: 'Sectional L-Sofa',
    category: 'living',
    widthMm: 2600,
    depthMm: 1600,
    heightMm: 850,
    description: 'Spacious modular sectional sofa ideal for family living rooms.',
  },
  {
    type: FurnitureType.Chair,
    name: 'Lounge Armchair',
    category: 'living',
    widthMm: 850,
    depthMm: 850,
    heightMm: 800,
    description: 'Ergonomic upholstered single accent armchair with timber legs.',
  },
  {
    type: FurnitureType.Custom,
    name: 'Low Coffee Table',
    category: 'living',
    widthMm: 1100,
    depthMm: 600,
    heightMm: 420,
    description: 'Minimalist low coffee table with rounded safety corners.',
  },
  {
    type: FurnitureType.Custom,
    name: 'Media Console',
    category: 'living',
    widthMm: 1800,
    depthMm: 450,
    heightMm: 500,
    description: 'Low-profile entertainment unit with integrated cable passages.',
  },
  {
    type: FurnitureType.Bookshelf,
    name: 'Storage Bookshelf',
    category: 'living',
    widthMm: 1200,
    depthMm: 350,
    heightMm: 1900,
    description: 'Floor-to-ceiling 5-tier open display shelving unit.',
  },

  // Bedroom
  {
    type: FurnitureType.Bed,
    name: 'King Size Bed',
    category: 'bedroom',
    widthMm: 2000,
    depthMm: 2100,
    heightMm: 1100,
    description: 'Standard 200×210cm king size bed frame with padded headboard.',
  },
  {
    type: FurnitureType.Bed,
    name: 'Queen Size Bed',
    category: 'bedroom',
    widthMm: 1600,
    depthMm: 2000,
    heightMm: 1000,
    description: 'Standard 160×200cm queen size bed frame with upholstered back.',
  },
  {
    type: FurnitureType.Bed,
    name: 'Single / Twin Bed',
    category: 'bedroom',
    widthMm: 1000,
    depthMm: 1900,
    heightMm: 900,
    description: 'Compact single bed ideal for guest rooms or studio lofts.',
  },
  {
    type: FurnitureType.Custom,
    name: 'Bedside Nightstand',
    category: 'bedroom',
    widthMm: 500,
    depthMm: 450,
    heightMm: 550,
    description: 'Two-drawer bedside table with soft-close mechanisms.',
  },
  {
    type: FurnitureType.Wardrobe,
    name: 'Triple Wardrobe Closet',
    category: 'bedroom',
    widthMm: 1800,
    depthMm: 600,
    heightMm: 2200,
    description: 'Full-height 3-door wardrobe with internal shelving and hangers.',
  },

  // Dining & Kitchen
  {
    type: FurnitureType.DiningTable,
    name: '6-Seater Dining Table',
    category: 'dining',
    widthMm: 1800,
    depthMm: 900,
    heightMm: 750,
    description: 'Solid timber dining table comfortably accommodating 6 chairs.',
  },
  {
    type: FurnitureType.DiningTable,
    name: 'Round 4-Seater Table',
    category: 'dining',
    widthMm: 1100,
    depthMm: 1100,
    heightMm: 750,
    description: 'Circular pedestal dining table for compact breakfast nooks.',
  },
  {
    type: FurnitureType.KitchenCounter,
    name: 'Kitchen Prep Island',
    category: 'dining',
    widthMm: 2000,
    depthMm: 900,
    heightMm: 900,
    description: 'Counter-height kitchen island with prep surface and bar overhang.',
  },

  // Office & Work
  {
    type: FurnitureType.Desk,
    name: 'Executive Workstation Desk',
    category: 'office',
    widthMm: 1600,
    depthMm: 800,
    heightMm: 750,
    description: 'Ergonomic dual-monitor workspace desk with cable management port.',
  },
  {
    type: FurnitureType.Chair,
    name: 'Ergonomic Task Chair',
    category: 'office',
    widthMm: 650,
    depthMm: 650,
    heightMm: 1000,
    description: 'High-back mesh swivel office chair with lumbar adjustment.',
  },

  // Bathroom
  {
    type: FurnitureType.Bathtub,
    name: 'Freestanding Soaking Tub',
    category: 'bathroom',
    widthMm: 1700,
    depthMm: 800,
    heightMm: 600,
    description: 'Seamless acrylic freestanding oval bathtub.',
  },
  {
    type: FurnitureType.Shower,
    name: 'Walk-In Glass Shower',
    category: 'bathroom',
    widthMm: 1000,
    depthMm: 1000,
    heightMm: 2100,
    description: 'Square frameless glass shower enclosure with floor drain.',
  },
  {
    type: FurnitureType.Toilet,
    name: 'Wall-Hung Toilet Unit',
    category: 'bathroom',
    widthMm: 450,
    depthMm: 650,
    heightMm: 450,
    description: 'Compact elongated ceramic water closet fixture.',
  },
  {
    type: FurnitureType.Sink,
    name: 'Double Vanity Sink',
    category: 'bathroom',
    widthMm: 1400,
    depthMm: 550,
    heightMm: 850,
    description: 'Twin basin vanity console with integrated storage drawers.',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: Armchair },
  { id: 'living', label: 'Living', icon: Armchair },
  { id: 'bedroom', label: 'Bedroom', icon: Bed },
  { id: 'dining', label: 'Dining & Kitchen', icon: UtensilsCrossed },
  { id: 'office', label: 'Work & Office', icon: Briefcase },
  { id: 'bathroom', label: 'Bathroom', icon: Bath },
];

const filteredItems = computed(() => {
  return CATALOG_ITEMS.filter((item) => {
    const matchesCat = selectedCategory.value === 'all' || item.category === selectedCategory.value;
    const matchesSearch =
      !searchQuery.value ||
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCat && matchesSearch;
  });
});

function formatDim(mm: number): string {
  const val = Math.round(fromMillimeters(mm, props.unit) * 10) / 10;
  return `${val} ${props.unit === MeasurementUnit.Feet ? 'ft' : 'm'}`;
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
    <div
      class="bg-white rounded-3xl shadow-elevation-4 border border-border-hairline w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-up"
    >
      <!-- Modal Header -->
      <div class="px-6 py-5 border-b border-border-hairline flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-50 text-brand-primary flex items-center justify-center shadow-2xs">
            <Armchair class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-title-md font-bold text-content-primary">Architectural Furniture Catalog</h2>
            <p class="text-caption-sm text-content-secondary">
              Select furniture or fixtures to insert directly into your 2D plan and 3D scene.
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="w-9 h-9 rounded-xl flex items-center justify-center text-content-secondary hover:text-content-primary hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Filter Controls Bar -->
      <div class="px-6 py-3.5 bg-surface-subtle border-b border-border-hairline flex flex-wrap items-center justify-between gap-3">
        <!-- Categories Tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            v-for="cat in CATEGORIES"
            :key="cat.id"
            type="button"
            @click="selectedCategory = cat.id"
            class="px-3.5 py-1.5 rounded-xl text-caption-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            :class="[
              selectedCategory === cat.id
                ? 'bg-brand-primary text-white shadow-2xs'
                : 'bg-white text-content-secondary hover:text-content-primary hover:bg-slate-100 border border-border-hairline'
            ]"
          >
            <component :is="cat.icon" class="w-3.5 h-3.5" />
            <span>{{ cat.label }}</span>
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative w-full sm:w-64">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-secondary" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search catalog..."
            class="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-white border border-border-hairline text-caption-sm text-content-primary placeholder:text-content-secondary/60 outline-none focus:border-brand-primary transition-colors"
          />
        </div>
      </div>

      <!-- Items Grid Scroll Area -->
      <div class="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="item in filteredItems"
          :key="item.name"
          class="group bg-white rounded-2xl border border-border-hairline p-4.5 hover:border-brand-primary/60 hover:shadow-card transition-all flex flex-col justify-between"
        >
          <div>
            <!-- Item Preview CAD Wireframe -->
            <div class="w-full h-28 rounded-xl bg-slate-50 border border-border-hairline/60 flex items-center justify-center p-3 mb-3 relative overflow-hidden group-hover:bg-blue-50/40 transition-colors">
              <svg
                class="w-24 h-20 text-slate-700"
                viewBox="0 0 100 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <!-- Simplified CAD symbol -->
                <rect x="10" y="10" width="80" height="60" rx="4" fill="#FAF6EE" stroke="#64748B" stroke-width="2" />
                <rect x="15" y="15" width="70" height="30" rx="2" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1" />
                <circle cx="50" cy="55" r="4" fill="#64748B" />
              </svg>

              <!-- Category Badge -->
              <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/90 text-content-secondary font-mono text-[10px] font-bold uppercase tracking-wider border border-border-hairline">
                {{ item.category }}
              </span>
            </div>

            <!-- Title & Dimensions -->
            <h3 class="text-body-md font-bold text-content-primary mb-1 group-hover:text-brand-primary transition-colors">
              {{ item.name }}
            </h3>
            <p class="text-caption-xs text-content-secondary line-clamp-2 mb-3">
              {{ item.description }}
            </p>
          </div>

          <div class="pt-3 border-t border-border-hairline/60 flex items-center justify-between">
            <span class="text-caption-xs font-mono font-semibold text-content-secondary">
              {{ formatDim(item.widthMm) }} × {{ formatDim(item.depthMm) }}
            </span>

            <button
              type="button"
              @click="emit('select', item)"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-caption-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Add to Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
