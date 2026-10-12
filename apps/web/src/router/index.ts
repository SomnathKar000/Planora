import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/projects',
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/views/ProjectsView.vue'),
    meta: { title: 'Projects — Planora' },
  },
  {
    path: '/projects/new',
    name: 'new-project',
    component: () => import('@/views/NewProjectView.vue'),
    meta: { title: 'New Project — Planora' },
  },
  {
    path: '/design/:projectId',
    name: 'design',
    component: () => import('@/views/DesignView.vue'),
    meta: { title: 'Design Workspace — Planora' },
  },
  {
    path: '/saved',
    name: 'saved',
    component: () => import('@/views/SavedView.vue'),
    meta: { title: 'Saved Designs — Planora' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: 'Settings — Planora' },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Update document title on navigation
router.afterEach((to) => {
  const title = to.meta.title as string | undefined;
  if (title) {
    document.title = title;
  }
});
