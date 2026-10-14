<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Home,
  HelpCircle,
  Bell,
  Download,
  Triangle,
  LogOut,
  User as UserIcon,
} from '@lucide/vue';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const showUserMenu = ref(false);
const menuRef = ref<HTMLElement | null>(null);

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

function handleLogout() {
  showUserMenu.value = false;
  authStore.logout();
  router.push('/login');
}

function closeMenuOnClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    showUserMenu.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', closeMenuOnClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', closeMenuOnClickOutside);
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
        class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white"
      >
        <Home class="w-4 h-4 text-white" />
      </div>
      <span class="text-title-sm text-content-primary font-bold tracking-tight">
        Planora<span class="text-primary font-bold">.ai</span>
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

      <!-- Authenticated User Avatar & Dropdown -->
      <div v-if="authStore.isAuthenticated" ref="menuRef" class="relative ml-2">
        <button
          type="button"
          class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white text-[12px] font-bold shadow-sm hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer"
          :title="authStore.userName"
          @click.stop="showUserMenu = !showUserMenu"
        >
          {{ authStore.userInitials }}
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="showUserMenu"
          class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#e1e8ff] p-2 z-50 text-[13px]"
        >
          <div class="px-3 py-2 border-b border-[#f1f3ff] mb-1">
            <div class="font-bold text-[#121b2e] truncate">{{ authStore.userName }}</div>
            <div class="text-[11px] text-[#505f76] truncate">{{ authStore.userEmail }}</div>
            <div class="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-primary border border-blue-100">
              {{ authStore.userRole }}
            </div>
          </div>

          <router-link
            to="/settings"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-[#505f76] hover:text-[#121b2e] hover:bg-[#f1f3ff] transition-colors"
            @click="showUserMenu = false"
          >
            <UserIcon class="w-4 h-4" />
            <span>Account Settings</span>
          </router-link>

          <button
            type="button"
            class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left font-medium mt-1"
            @click="handleLogout"
          >
            <LogOut class="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <!-- Guest / Not Authenticated -->
      <router-link
        v-else
        to="/login"
        class="ml-2 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-[#0047ba] text-white font-semibold text-[13px] shadow-sm transition-colors flex items-center gap-1.5"
      >
        <span>Sign In</span>
      </router-link>
    </div>
  </nav>
</template>
