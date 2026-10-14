import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing',
    component: () => import('@/views/LandingView.vue'),
    meta: { title: 'Planora — AI Architectural Floor Plan Design' },
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/views/ProjectsView.vue'),
    meta: { title: 'Projects — Planora', requiresAuth: true },
  },
  {
    path: '/projects/new',
    name: 'new-project',
    component: () => import('@/views/NewProjectView.vue'),
    meta: { title: 'New Project — Planora', requiresAuth: true },
  },
  {
    path: '/design/:projectId',
    name: 'design',
    component: () => import('@/views/DesignView.vue'),
    meta: { title: 'Design Workspace — Planora', requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/AuthView.vue'),
    meta: { title: 'Sign In — Planora' },
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/views/AuthView.vue'),
    meta: { title: 'Create Account — Planora' },
  },
  // Extra pages commented out as per requirement:
  // {
  //   path: '/saved',
  //   name: 'saved',
  //   component: () => import('@/views/SavedView.vue'),
  //   meta: { title: 'Saved Designs — Planora' },
  // },
  // {
  //   path: '/settings',
  //   name: 'settings',
  //   component: () => import('@/views/SettingsView.vue'),
  //   meta: { title: 'Settings — Planora' },
  // },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Authentication Navigation Guard
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  // If visiting protected route while unauthenticated, redirect to login
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    });
    return;
  }

  // If already logged in and visiting login or signup, redirect to projects
  if ((to.name === 'login' || to.name === 'signup') && authStore.isAuthenticated) {
    next({ name: 'projects' });
    return;
  }

  next();
});

// Update document title on navigation
router.afterEach((to) => {
  const title = to.meta.title as string | undefined;
  if (title) {
    document.title = title;
  }
});
