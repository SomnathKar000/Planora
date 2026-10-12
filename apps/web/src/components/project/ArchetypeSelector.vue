<script setup lang="ts">
import { ProjectType } from '@planora/domain';
import { BedDouble, Building, Home, Store } from '@lucide/vue';

const props = defineProps<{
  modelValue: ProjectType;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: ProjectType): void;
}>();

interface ArchetypeOption {
  type: ProjectType;
  title: string;
  subtitle: string;
  icon: any;
}

const options: ArchetypeOption[] = [
  {
    type: ProjectType.Room,
    title: 'Single Room',
    subtitle: 'Studio / Suite',
    icon: BedDouble,
  },
  {
    type: ProjectType.Apartment,
    title: 'Apartment',
    subtitle: 'Multi-room Unit',
    icon: Building,
  },
  {
    type: ProjectType.House,
    title: 'Detached',
    subtitle: 'Multi-story House',
    icon: Home,
  },
  {
    type: ProjectType.Commercial,
    title: 'Commercial',
    subtitle: 'Custom Envelope',
    icon: Store,
  },
];
</script>

<template>
  <div class="bg-surface-card rounded-2xl p-6 shadow-card border border-border-hairline flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-blue-50 text-brand-primary flex items-center justify-center">
          <Building class="w-4 h-4" />
        </div>
        <h2 class="text-title-sm font-semibold text-content-primary">2. Space Archetype</h2>
      </div>
      <span class="text-caption-xs text-content-secondary font-medium">Select primary structure blueprint</span>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <button
        v-for="opt in options"
        :key="opt.type"
        type="button"
        @click="emit('update:modelValue', opt.type)"
        class="flex flex-col items-start p-4 rounded-xl text-left transition-all duration-150 relative cursor-pointer"
        :class="[
          modelValue === opt.type
            ? 'bg-blue-50/70 border-2 border-brand-primary shadow-sm'
            : 'bg-surface-subtle hover:bg-slate-100/80 border-2 border-transparent'
        ]"
      >
        <div
          class="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 transition-colors"
          :class="[
            modelValue === opt.type
              ? 'bg-brand-primary text-white shadow-sm'
              : 'bg-white text-content-secondary shadow-2xs'
          ]"
        >
          <component :is="opt.icon" class="w-5 h-5" />
        </div>
        <span
          class="text-label-md font-semibold transition-colors"
          :class="modelValue === opt.type ? 'text-brand-primary' : 'text-content-primary'"
        >
          {{ opt.title }}
        </span>
        <span
          class="text-caption-xs transition-colors"
          :class="modelValue === opt.type ? 'text-brand-primary/80' : 'text-content-secondary'"
        >
          {{ opt.subtitle }}
        </span>
        <span
          v-if="modelValue === opt.type"
          class="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-brand-primary"
        />
      </button>
    </div>
  </div>
</template>
