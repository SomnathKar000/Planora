<script setup lang="ts">
import {
  Square,
  DoorOpen,
  AppWindow,
  Armchair,
  PenTool,
  Ruler,
  MousePointer,
} from '@lucide/vue';

export type EditorTool = 'select' | 'wall' | 'door' | 'window' | 'furniture' | 'annotate' | 'measure';

const props = defineProps<{
  activeTool: EditorTool;
}>();

const emit = defineEmits<{
  (e: 'update:activeTool', tool: EditorTool): void;
  (e: 'open-catalog'): void;
}>();

function handleClick(toolId: EditorTool) {
  emit('update:activeTool', toolId);
  if (toolId === 'furniture') {
    emit('open-catalog');
  }
}

interface ToolItem {
  id: EditorTool;
  label: string;
  icon: any;
}

const tools: ToolItem[] = [
  { id: 'select', label: 'Select', icon: MousePointer },
  { id: 'wall', label: 'Add Wall', icon: Square },
  { id: 'door', label: 'Add Door', icon: DoorOpen },
  { id: 'window', label: 'Add Window', icon: AppWindow },
  { id: 'furniture', label: 'Furniture', icon: Armchair },
  { id: 'annotate', label: 'Annotate', icon: PenTool },
  { id: 'measure', label: 'Measure', icon: Ruler },
];
</script>

<template>
  <div class="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-2xl shadow-elevation-3 px-3 py-1.5 flex items-center gap-1 z-20 border border-border-hairline">
    <button
      v-for="t in tools"
      :key="t.id"
      type="button"
      @click="handleClick(t.id)"
      class="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
      :class="[
        activeTool === t.id
          ? 'bg-blue-50 text-brand-primary font-bold shadow-2xs'
          : 'text-content-secondary hover:text-content-primary hover:bg-slate-100/70'
      ]"
    >
      <component :is="t.icon" class="w-4 h-4" />
      <span class="text-[11px] leading-tight">{{ t.label }}</span>
    </button>
  </div>
</template>
