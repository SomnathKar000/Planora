<script setup lang="ts">
import { computed } from 'vue';
import type { Project } from '@planora/domain';
import {
  ProjectStatus,
  DesignStyle,
  MeasurementUnit,
} from '@planora/domain';
import { useRouter } from 'vue-router';
import {
  Clock,
  ArrowRight,
} from '@lucide/vue';

const props = defineProps<{
  project: Project;
}>();

const router = useRouter();

// ── Status badge config ──
const statusConfig: Record<string, { label: string; class: string }> = {
  [ProjectStatus.Draft]: { label: 'Draft', class: 'bg-surface-subtle text-content-secondary' },
  [ProjectStatus.InProgress]: { label: 'In Progress', class: 'bg-green-50 text-green-700' },
  [ProjectStatus.ClientReview]: { label: 'Client Review', class: 'bg-amber-50 text-amber-700' },
  [ProjectStatus.StagingReady]: { label: 'Staging Ready', class: 'bg-blue-50 text-blue-700' },
  [ProjectStatus.Approved]: { label: 'Approved', class: 'bg-emerald-50 text-emerald-700' },
  [ProjectStatus.Complete]: { label: 'Complete', class: 'bg-purple-50 text-purple-700' },
};

const status = computed(() => statusConfig[props.project.status] ?? statusConfig[ProjectStatus.Draft]);

// ── Style badge ──
const styleLabel = computed(() => {
  const map: Record<string, string> = {
    [DesignStyle.Modern]: 'Modern',
    [DesignStyle.Minimal]: 'Minimal',
    [DesignStyle.Classic]: 'Classic',
    [DesignStyle.Industrial]: 'Industrial',
    [DesignStyle.Nordic]: 'Nordic',
  };
  return map[props.project.preferences.style] ?? props.project.preferences.style;
});

// ── Dimensions summary ──
const dimsText = computed(() => {
  const d = props.project.dimensions;
  const unitLabel = props.project.unit === MeasurementUnit.Feet ? 'ft' : 'm';
  return `${d.length} × ${d.width} ${unitLabel}`;
});

const areaText = computed(() => {
  const d = props.project.dimensions;
  const area = Math.round(d.length * d.width);
  const unitLabel = props.project.unit === MeasurementUnit.Feet ? 'sq ft' : 'sq m';
  return `${area.toLocaleString()} ${unitLabel}`;
});

// ── Room summary ──
const roomSummary = computed(() => {
  const rp = props.project.roomProgram;
  const beds = rp.filter((r) => r.type === 'bedroom').reduce((sum, r) => sum + r.count, 0);
  const baths = rp.filter((r) => r.type === 'bathroom').reduce((sum, r) => sum + r.count, 0);
  const parts: string[] = [];
  if (beds > 0) parts.push(`${beds} Bed`);
  if (baths > 0) parts.push(`${baths} Bath`);
  return parts.join(', ');
});

// ── Relative time ──
const timeAgo = computed(() => {
  const diff = Date.now() - new Date(props.project.updatedAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `Edited ${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Edited ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Edited yesterday';
  if (days < 7) return `Edited ${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `Edited ${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
});

// ── Room colors for preview ──
const previewRooms = computed(() => {
  const colors = ['#DBEAFE', '#FEF3C7', '#D1FAE5', '#FCE7F3', '#E0E7FF', '#FED7AA'];
  return props.project.roomProgram.map((room, i) => ({
    ...room,
    color: colors[i % colors.length],
  }));
});
</script>

<template>
  <article
    class="panel overflow-hidden group cursor-pointer transition-all duration-200 hover:shadow-level-2 hover:border-border-structural"
    @click="router.push(`/design/${project.id}`)"
  >
    <!-- Thumbnail area -->
    <div class="relative h-52 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      <!-- Status badge -->
      <span class="badge absolute top-3 left-3 z-10" :class="status.class">
        <span
          v-if="project.status === 'in_progress'"
          class="w-1.5 h-1.5 rounded-full bg-green-500"
        />
        {{ status.label }}
      </span>

      <!-- Simple floor plan preview -->
      <svg
        class="w-full h-full"
        viewBox="0 0 300 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Outer boundary -->
        <rect
          x="20" y="15" width="260" height="170"
          fill="none" stroke="#172033" stroke-width="2.5"
          rx="2"
        />
        <!-- Room placeholders -->
        <rect
          v-for="(room, i) in previewRooms.slice(0, 4)"
          :key="room.id"
          :x="20 + (i % 2) * 130"
          :y="15 + Math.floor(i / 2) * 85"
          :width="130"
          :height="85"
          :fill="room.color"
          :stroke="'#94A3B8'"
          stroke-width="0.5"
          opacity="0.7"
        />
        <!-- Room labels -->
        <text
          v-for="(room, i) in previewRooms.slice(0, 4)"
          :key="'label-' + room.id"
          :x="20 + (i % 2) * 130 + 65"
          :y="15 + Math.floor(i / 2) * 85 + 45"
          text-anchor="middle"
          font-size="11"
          fill="#64748B"
          font-family="Plus Jakarta Sans, sans-serif"
        >
          {{ room.name }}
        </text>
      </svg>

      <!-- View toggle -->
      <div class="absolute bottom-3 left-3 right-3 flex justify-between">
        <span class="text-caption-xs text-content-secondary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          2D CAD
        </span>
        <span class="text-caption-xs text-content-secondary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          3D Isometric
        </span>
      </div>
    </div>

    <!-- Card content -->
    <div class="p-4">
      <div class="flex items-start justify-between mb-1">
        <h3 class="text-title-sm text-content-primary truncate pr-2">
          {{ project.name }}
        </h3>
        <span class="badge bg-surface-subtle text-content-secondary shrink-0">
          {{ styleLabel }}
        </span>
      </div>

      <p class="text-body-sm text-content-secondary mb-3">
        {{ dimsText }} • {{ areaText }}
        <template v-if="roomSummary"> • {{ roomSummary }}</template>
      </p>

      <div class="flex items-center justify-between">
        <span class="flex items-center gap-1 text-label-sm text-content-muted">
          <Clock class="w-3.5 h-3.5" />
          {{ timeAgo }}
        </span>
        <button
          class="btn-secondary h-8 text-label-sm px-3 opacity-0 group-hover:opacity-100 transition-opacity"
          @click.stop="router.push(`/design/${project.id}`)"
        >
          Open in CAD
          <ArrowRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </article>
</template>
