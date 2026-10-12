<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Home,
  HelpCircle,
  Bell,
  Download,
  Triangle,
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const navItems = [
  { label: 'Design', route: '/projects' },
  { label: 'Inspiration', route: '/saved' },
  { label: 'Saved', route: '/saved' },
];

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/');
};

const activeProject = computed(() => {
  if (route.name === 'design') {
    return {
      name: 'Downtown Loft Apt. 4B',
      dims: '30 × 20 ft',
    };
  }
  return null;
});
</script>

<template>
  <nav
    class="sticky top-0 z-50 bg-surface-card border-b border-border-hairline h-14 flex items-center px-5 gap-4"
  >
    <!-- Logo -->
    <button
      class="flex items-center gap-2 mr-1 hover:opacity-80 transition-opacity"
      @click="router.push('/projects')"
    >
      <div
        class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"
      >
        <Home class="w-4 h-4 text-white" />
      </div>
      <span class="text-title-sm text-content-primary font-bold tracking-tight">
        Planora
      </span>
    </button>

    <!-- Active project breadcrumb -->
    <div
      v-if="activeProject"
      class="flex items-center gap-2 px-3 py-1.5 bg-surface-subtle rounded-full text-body-sm"
    >
      <Triangle class="w-3 h-3 text-content-secondary" />
      <span class="text-content-primary font-medium">{{ activeProject.name }}</span>
      <span class="text-content-muted text-label-sm">({{ activeProject.dims }})</span>
    </div>

    <!-- Spacer -->
    <div class="flex-1" />

    <!-- Center nav -->
    <div class="segment-container">
      <button
        v-for="item in navItems"
        :key="item.label"
        class="segment-item"
        :class="{ active: isActive(item.route) }"
        @click="router.push(item.route)"
      >
        {{ item.label }}
      </button>
    </div>

    <!-- Spacer -->
    <div class="flex-1" />

    <!-- Right actions -->
    <div class="flex items-center gap-1">
      <button class="btn-ghost" title="Help">
        <HelpCircle class="w-5 h-5" />
      </button>
      <button class="btn-ghost relative" title="Notifications">
        <Bell class="w-5 h-5" />
        <span
          class="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"
        />
      </button>
      <button class="btn-primary text-body-sm h-9 px-4 ml-2">
        <Download class="w-4 h-4" />
        Export
      </button>
      <!-- Avatar -->
      <div
        class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-brand ml-2 flex items-center justify-center text-white text-label-sm font-bold"
      >
        S
      </div>
    </div>
  </nav>
</template>
