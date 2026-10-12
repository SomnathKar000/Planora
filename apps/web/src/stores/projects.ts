import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  ProjectType,
  MeasurementUnit,
  DesignStyle,
  FurnitureDensity,
  ProjectStatus,
  RoomType,
} from '@planora/domain';
import type { Project, Layout, RoomProgramEntry } from '@planora/domain';

// ── Seed data for development ────────────────────────────

function createSeedProjects(): Project[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'proj-1',
      name: 'Downtown Loft Apt. 4B',
      type: ProjectType.Apartment,
      status: ProjectStatus.InProgress,
      dimensions: { length: 30, width: 20, height: 10 },
      unit: MeasurementUnit.Feet,
      floors: 1,
      preferences: {
        style: DesignStyle.Modern,
        furnitureDensity: FurnitureDensity.Balanced,
        paletteAccents: ['#EAE3D2', '#A88B68', '#7E9A82', '#587B95', '#222933'],
      },
      selectedLayoutId: 'layout-1',
      layouts: [],
      roomProgram: [
        { id: 'rp-1', type: RoomType.LivingRoom, name: 'Living Room', count: 1, targetArea: 192 },
        { id: 'rp-2', type: RoomType.Bedroom, name: 'Bedroom', count: 1, targetArea: 144 },
        { id: 'rp-3', type: RoomType.Kitchen, name: 'Kitchen', count: 1, targetArea: 96 },
        { id: 'rp-4', type: RoomType.Bathroom, name: 'Bathroom', count: 1, targetArea: 48 },
      ],
      tag: 'Residential Remodel & Staging',
      version: 1,
      createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    },
    {
      id: 'proj-2',
      name: 'Pacific Heights Penthouse',
      type: ProjectType.Apartment,
      status: ProjectStatus.ClientReview,
      dimensions: { length: 45, width: 32, height: 10 },
      unit: MeasurementUnit.Feet,
      floors: 1,
      preferences: {
        style: DesignStyle.Minimal,
        furnitureDensity: FurnitureDensity.Balanced,
        paletteAccents: ['#EAE3D2', '#A88B68'],
      },
      selectedLayoutId: undefined,
      layouts: [],
      roomProgram: [
        { id: 'rp-5', type: RoomType.LivingRoom, name: 'Living Room', count: 1, targetArea: 300 },
        { id: 'rp-6', type: RoomType.Bedroom, name: 'Primary Bedroom', count: 1, targetArea: 200 },
        { id: 'rp-7', type: RoomType.Bedroom, name: 'Guest Bedroom', count: 2, targetArea: 150 },
        { id: 'rp-8', type: RoomType.Bathroom, name: 'Bathroom', count: 2, targetArea: 60 },
        { id: 'rp-9', type: RoomType.Kitchen, name: 'Kitchen', count: 1, targetArea: 120 },
      ],
      tag: 'Luxury Residential',
      version: 1,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'proj-3',
      name: 'Oakland Modernist ADU',
      type: ProjectType.Room,
      status: ProjectStatus.Approved,
      dimensions: { length: 24, width: 18, height: 9 },
      unit: MeasurementUnit.Feet,
      floors: 1,
      preferences: {
        style: DesignStyle.Nordic,
        furnitureDensity: FurnitureDensity.Sparse,
        paletteAccents: ['#EAE3D2', '#7E9A82'],
      },
      selectedLayoutId: undefined,
      layouts: [],
      roomProgram: [
        { id: 'rp-10', type: RoomType.Bedroom, name: 'Bedroom', count: 1, targetArea: 144 },
        { id: 'rp-11', type: RoomType.Bathroom, name: 'Bathroom', count: 1, targetArea: 48 },
      ],
      version: 1,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'proj-4',
      name: 'Soma Creative Studio Suite',
      type: ProjectType.Commercial,
      status: ProjectStatus.Draft,
      dimensions: { length: 36, width: 28, height: 12 },
      unit: MeasurementUnit.Feet,
      floors: 1,
      preferences: {
        style: DesignStyle.Industrial,
        furnitureDensity: FurnitureDensity.Sparse,
        paletteAccents: ['#222933', '#587B95'],
      },
      selectedLayoutId: undefined,
      layouts: [],
      roomProgram: [],
      tag: 'Open Studio Space',
      version: 1,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'proj-5',
      name: 'Sunset District Duplex Unit A',
      type: ProjectType.Apartment,
      status: ProjectStatus.StagingReady,
      dimensions: { length: 28, width: 22, height: 10 },
      unit: MeasurementUnit.Feet,
      floors: 1,
      preferences: {
        style: DesignStyle.Classic,
        furnitureDensity: FurnitureDensity.Balanced,
        paletteAccents: ['#EAE3D2', '#A88B68', '#222933'],
      },
      selectedLayoutId: undefined,
      layouts: [],
      roomProgram: [
        { id: 'rp-12', type: RoomType.Bedroom, name: 'Bedroom', count: 2, targetArea: 120 },
        { id: 'rp-13', type: RoomType.Bathroom, name: 'Bathroom', count: 1, targetArea: 48 },
      ],
      version: 1,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'proj-6',
      name: 'Mission District Townhouse',
      type: ProjectType.House,
      status: ProjectStatus.Complete,
      dimensions: { length: 50, width: 24, height: 10 },
      unit: MeasurementUnit.Feet,
      floors: 1,
      preferences: {
        style: DesignStyle.Modern,
        furnitureDensity: FurnitureDensity.Dense,
        paletteAccents: ['#EAE3D2', '#A88B68', '#7E9A82', '#587B95', '#222933'],
      },
      selectedLayoutId: undefined,
      layouts: [],
      roomProgram: [
        { id: 'rp-14', type: RoomType.LivingRoom, name: 'Living Room', count: 1, targetArea: 250 },
        { id: 'rp-15', type: RoomType.Bedroom, name: 'Bedroom', count: 3, targetArea: 150 },
        { id: 'rp-16', type: RoomType.Bathroom, name: 'Bathroom', count: 3, targetArea: 60 },
        { id: 'rp-17', type: RoomType.Kitchen, name: 'Kitchen', count: 1, targetArea: 150 },
      ],
      version: 1,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

// ── Store ────────────────────────────────────────────────

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>(createSeedProjects());
  const searchQuery = ref('');
  const activeFilter = ref<string>('all');
  const sortBy = ref<'recent' | 'name' | 'size'>('recent');

  const filteredProjects = computed(() => {
    let result = [...projects.value];

    // Search
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tag?.toLowerCase().includes(q),
      );
    }

    // Filter by type
    if (activeFilter.value !== 'all') {
      result = result.filter((p) => p.type === activeFilter.value);
    }

    // Sort
    switch (sortBy.value) {
      case 'recent':
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  });

  const totalProjects = computed(() => projects.value.length);

  function getProject(id: string): Project | undefined {
    return projects.value.find((p) => p.id === id);
  }

  function deleteProject(id: string) {
    projects.value = projects.value.filter((p) => p.id !== id);
  }

  function duplicateProject(id: string) {
    const source = getProject(id);
    if (!source) return;
    const now = new Date().toISOString();
    const newProject: Project = {
      ...structuredClone(source),
      id: `proj-${Date.now()}`,
      name: `${source.name} (Copy)`,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    projects.value.unshift(newProject);
  }

  return {
    projects,
    searchQuery,
    activeFilter,
    sortBy,
    filteredProjects,
    totalProjects,
    getProject,
    deleteProject,
    duplicateProject,
  };
});
