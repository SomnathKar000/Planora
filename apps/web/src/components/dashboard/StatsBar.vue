<script setup lang="ts">
import { Briefcase, Clock, HardDrive, Cpu } from 'lucide-vue-next';

defineProps<{
  totalProjects: number;
}>();
</script>

<template>
  <div class="flex items-center gap-4 flex-wrap">
    <!-- Active Projects -->
    <div class="stat-card">
      <div class="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
        <Briefcase class="w-5 h-5 text-primary" />
      </div>
      <div>
        <p class="text-caption-xs text-content-muted uppercase tracking-wider">Active Projects</p>
        <p class="text-headline-md text-content-primary">
          {{ totalProjects }}
          <span class="text-label-sm text-green-600 font-medium">+2 this week</span>
        </p>
      </div>
    </div>

    <!-- Drafting Time -->
    <div class="stat-card">
      <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
        <Clock class="w-5 h-5 text-amber-600" />
      </div>
      <div>
        <p class="text-caption-xs text-content-muted uppercase tracking-wider">Drafting Time Saved</p>
        <p class="text-headline-md text-content-primary">
          48.5 <span class="text-body-sm text-content-secondary font-normal">hrs</span>
        </p>
      </div>
    </div>

    <!-- Storage -->
    <div class="stat-card">
      <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
        <HardDrive class="w-5 h-5 text-emerald-600" />
      </div>
      <div>
        <p class="text-caption-xs text-content-muted uppercase tracking-wider">Storage</p>
        <div class="flex items-center gap-2">
          <p class="text-body-md text-content-primary font-medium">1.4 / 25 GB</p>
          <div class="w-16 h-1.5 bg-surface-subtle rounded-full overflow-hidden">
            <div class="h-full w-[6%] bg-primary rounded-full" />
          </div>
        </div>
      </div>
    </div>

    <!-- AI Engine -->
    <div class="stat-card">
      <div class="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
        <Cpu class="w-5 h-5 text-purple-600" />
      </div>
      <div>
        <p class="text-caption-xs text-content-muted uppercase tracking-wider">AI Floor Engine</p>
        <p class="text-body-md text-content-primary font-medium">
          CAD Core
          <span class="badge bg-surface-subtle text-content-secondary ml-1">v4.2</span>
        </p>
      </div>
    </div>
  </div>
</template>
