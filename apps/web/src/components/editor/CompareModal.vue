<script setup lang="ts">
import { ref } from 'vue';
import type { Layout } from '@planora/domain';
import { X, Check } from '@lucide/vue';

const props = defineProps<{
  layouts: Layout[];
  activeLayoutId?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select-layout', id: string): void;
}>();

const layoutAId = ref(props.layouts[0]?.id || '');
const layoutBId = ref(props.layouts[1]?.id || props.layouts[0]?.id || '');

const layoutA = () => props.layouts.find((l) => l.id === layoutAId.value) || props.layouts[0];
const layoutB = () => props.layouts.find((l) => l.id === layoutBId.value) || props.layouts[1] || props.layouts[0];

function selectAndClose(id: string) {
  emit('select-layout', id);
  emit('close');
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
    <div class="bg-white rounded-3xl shadow-elevation-3 max-w-5xl w-full border border-border-hairline overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-border-hairline flex items-center justify-between">
        <div>
          <h2 class="text-headline-md font-bold text-content-primary">Compare Layout Variations</h2>
          <p class="text-caption-xs text-content-secondary">
            Inspect alternative spatial partitions, circulation pathways, and efficiency scores.
          </p>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="w-8 h-8 rounded-full flex items-center justify-center text-content-secondary hover:bg-slate-100 hover:text-content-primary transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Comparison Body (Side-by-Side 2 Columns) -->
      <div class="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        <!-- Variant A Column -->
        <div class="flex flex-col gap-4 p-5 rounded-2xl bg-surface-subtle border border-border-hairline">
          <div class="flex items-center justify-between">
            <span class="text-label-md font-bold text-content-primary">Variation A</span>
            <span class="px-2.5 py-0.5 rounded-full bg-blue-100 text-brand-primary text-caption-xs font-bold font-mono">
              Score {{ layoutA()?.score || 92 }}%
            </span>
          </div>

          <!-- Mini Canvas Wireframe -->
          <div class="w-full aspect-[4/3] bg-slate-900 rounded-xl p-3 grid grid-cols-2 gap-2 border border-slate-800">
            <div
              v-for="room in layoutA()?.rooms || []"
              :key="room.id"
              class="rounded bg-blue-500/20 border border-blue-400/40 p-2 flex flex-col justify-between"
            >
              <span class="text-caption-xs font-bold text-blue-200 truncate">{{ room.name }}</span>
              <span class="text-[10px] font-mono text-blue-300">{{ Math.round(room.areaSqMm / 1000000) }} m²</span>
            </div>
          </div>

          <!-- Metrics -->
          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="bg-white p-2.5 rounded-xl border border-border-hairline">
              <span class="text-caption-xs text-content-secondary block">Rooms</span>
              <span class="text-label-md font-bold text-content-primary">{{ layoutA()?.rooms.length }}</span>
            </div>
            <div class="bg-white p-2.5 rounded-xl border border-border-hairline">
              <span class="text-caption-xs text-content-secondary block">Walls</span>
              <span class="text-label-md font-bold text-content-primary">{{ layoutA()?.walls.length }}</span>
            </div>
            <div class="bg-white p-2.5 rounded-xl border border-border-hairline">
              <span class="text-caption-xs text-content-secondary block">Openings</span>
              <span class="text-label-md font-bold text-content-primary">{{ layoutA()?.openings.length }}</span>
            </div>
          </div>

          <button
            type="button"
            @click="selectAndClose(layoutA().id)"
            class="w-full py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-label-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Check class="w-4 h-4" />
            <span>Select Variation A</span>
          </button>
        </div>

        <!-- Variant B Column -->
        <div class="flex flex-col gap-4 p-5 rounded-2xl bg-surface-subtle border border-border-hairline">
          <div class="flex items-center justify-between">
            <span class="text-label-md font-bold text-content-primary">Variation B</span>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-caption-xs font-bold font-mono">
              Score {{ layoutB()?.score || 88 }}%
            </span>
          </div>

          <!-- Mini Canvas Wireframe -->
          <div class="w-full aspect-[4/3] bg-slate-900 rounded-xl p-3 grid grid-cols-2 gap-2 border border-slate-800">
            <div
              v-for="room in layoutB()?.rooms || []"
              :key="room.id"
              class="rounded bg-emerald-500/20 border border-emerald-400/40 p-2 flex flex-col justify-between"
            >
              <span class="text-caption-xs font-bold text-emerald-200 truncate">{{ room.name }}</span>
              <span class="text-[10px] font-mono text-emerald-300">{{ Math.round(room.areaSqMm / 1000000) }} m²</span>
            </div>
          </div>

          <!-- Metrics -->
          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="bg-white p-2.5 rounded-xl border border-border-hairline">
              <span class="text-caption-xs text-content-secondary block">Rooms</span>
              <span class="text-label-md font-bold text-content-primary">{{ layoutB()?.rooms.length }}</span>
            </div>
            <div class="bg-white p-2.5 rounded-xl border border-border-hairline">
              <span class="text-caption-xs text-content-secondary block">Walls</span>
              <span class="text-label-md font-bold text-content-primary">{{ layoutB()?.walls.length }}</span>
            </div>
            <div class="bg-white p-2.5 rounded-xl border border-border-hairline">
              <span class="text-caption-xs text-content-secondary block">Openings</span>
              <span class="text-label-md font-bold text-content-primary">{{ layoutB()?.openings.length }}</span>
            </div>
          </div>

          <button
            type="button"
            @click="selectAndClose(layoutB().id)"
            class="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-content-primary border border-border-hairline font-label-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Check class="w-4 h-4 text-brand-primary" />
            <span>Select Variation B</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
