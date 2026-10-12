<script setup lang="ts">
import { LayoutGrid } from '@lucide/vue';

interface Template {
  id: string;
  name: string;
  tag: string;
  area: string;
  details: string;
  rooms: { name: string; w: number; h: number; x: number; y: number; color: string }[];
}

const templates: Template[] = [
  {
    id: 'tpl-1',
    name: 'Studio Flat (Micro CAD)',
    tag: 'Compact',
    area: '450 sq ft',
    details: '1 Bath • Efficiency Kitchen',
    rooms: [
      { name: 'Studio', w: 180, h: 140, x: 10, y: 10, color: '#DBEAFE' },
      { name: 'Bath', w: 60, h: 60, x: 130, y: 90, color: '#D1FAE5' },
    ],
  },
  {
    id: 'tpl-2',
    name: '2-Bedroom Urban Flat',
    tag: 'Popular',
    area: '850 sq ft',
    details: '2 Bed, 1.5 Bath • Balcony',
    rooms: [
      { name: 'Living', w: 100, h: 100, x: 10, y: 10, color: '#DBEAFE' },
      { name: 'Bed 1', w: 80, h: 60, x: 110, y: 10, color: '#FEF3C7' },
      { name: 'Bed 2', w: 80, h: 60, x: 110, y: 80, color: '#FEF3C7' },
    ],
  },
  {
    id: 'tpl-3',
    name: 'Suburban Single-Story',
    tag: 'Family',
    area: '1,800 sq ft',
    details: '3 Bed, 2 Bath • Garage',
    rooms: [
      { name: 'Primary', w: 90, h: 80, x: 10, y: 10, color: '#FEF3C7' },
      { name: 'Great Rm', w: 90, h: 60, x: 10, y: 90, color: '#DBEAFE' },
      { name: 'Bed', w: 70, h: 70, x: 110, y: 10, color: '#FEF3C7' },
    ],
  },
  {
    id: 'tpl-4',
    name: 'Open Loft & Mezzanine',
    tag: 'Loft',
    area: '1,100 sq ft',
    details: 'High Ceiling • 1.5 Bath',
    rooms: [
      { name: 'Mezzanine', w: 100, h: 50, x: 50, y: 10, color: '#E0E7FF' },
      { name: 'Open Double-Height', w: 120, h: 80, x: 40, y: 65, color: '#DBEAFE' },
    ],
  },
];
</script>

<template>
  <section>
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-headline-lg text-content-primary">Proven Architectural Blueprints</h2>
        <p class="text-body-md text-content-secondary mt-1">
          Accelerate workflow by populating validated structural floor layouts with customizable parametric parameters.
        </p>
      </div>
      <button class="text-primary text-label-md hover:underline flex items-center gap-1">
        Explore All 24 Templates
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <article
        v-for="tpl in templates"
        :key="tpl.id"
        class="panel overflow-hidden group cursor-pointer hover:shadow-level-2 transition-all duration-200"
      >
        <!-- Template preview -->
        <div class="relative h-40 bg-gradient-to-br from-slate-50 to-slate-100 p-3">
          <span class="badge bg-surface-card text-content-secondary absolute top-2 right-2">
            {{ tpl.tag }}
          </span>
          <svg class="w-full h-full" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
            <rect
              v-for="room in tpl.rooms"
              :key="room.name"
              :x="room.x" :y="room.y" :width="room.w" :height="room.h"
              :fill="room.color" stroke="#CBD5E1" stroke-width="0.5" rx="2"
            />
            <text
              v-for="room in tpl.rooms"
              :key="'t-' + room.name"
              :x="room.x + room.w / 2"
              :y="room.y + room.h / 2 + 4"
              text-anchor="middle"
              font-size="10"
              fill="#64748B"
              font-family="Plus Jakarta Sans, sans-serif"
            >
              {{ room.name }}
            </text>
          </svg>
        </div>

        <!-- Template info -->
        <div class="p-4">
          <h3 class="text-title-sm text-content-primary mb-0.5">{{ tpl.name }}</h3>
          <p class="text-body-sm text-content-secondary">{{ tpl.area }} • {{ tpl.details }}</p>
          <button class="btn-secondary w-full mt-3 h-9 text-label-sm">
            <LayoutGrid class="w-4 h-4" />
            Use Template
          </button>
        </div>
      </article>
    </div>
  </section>
</template>
