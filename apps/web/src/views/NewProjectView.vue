<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next';
</script>

<template>
  <div class="max-w-[1440px] mx-auto px-6 py-6 animate-fade-in">
    <div class="flex items-center gap-3 mb-6">
      <router-link to="/projects" class="text-content-secondary hover:text-content-primary transition-colors">
        ←
      </router-link>
      <div>
        <p class="text-caption-xs text-content-muted uppercase tracking-wider">New Project Workflow</p>
        <h1 class="text-headline-lg text-content-primary">Space Archetype & Spatial Parameters</h1>
      </div>
    </div>

    <!-- Placeholder for Phase 2 -->
    <div class="panel flex flex-col items-center justify-center py-24">
      <div class="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mb-4">
        <Sparkles class="w-8 h-8 text-primary" />
      </div>
      <h2 class="text-headline-md text-content-primary mb-2">Project Creation Wizard</h2>
      <p class="text-body-md text-content-secondary text-center max-w-md">
        The multi-step project creation flow — space archetype, dimensions, room program, and style preferences — will be implemented in Phase 2.
      </p>
    </div>
  </div>
</template>
