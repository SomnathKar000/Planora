<script setup lang="ts">
import { ref } from 'vue';
import type { Project, Layout } from '@planora/domain';
import {
  generateBlueprintPdf,
  generateBlueprintSvg,
  exportProjectJson,
  downloadSvgFile,
  downloadDataUrl,
  type ExportTheme,
} from '@/utils/exportBlueprint';
import {
  X,
  FileText,
  FileCode,
  Image,
  Database,
  Download,
  Printer,
  Sparkles,
} from '@lucide/vue';

const props = defineProps<{
  project: Project;
  layout: Layout;
  screenshotDataUrl?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

type ExportTab = 'pdf' | 'svg' | 'png' | 'json';
const activeTab = ref<ExportTab>('pdf');

// PDF & SVG options
const selectedTheme = ref<ExportTheme>('clean');
const includeFurniture = ref(true);
const includeDimensions = ref(true);
const includeSchedule = ref(true);

const isExporting = ref(false);
const exportSuccess = ref(false);

async function handleExportPdf() {
  isExporting.value = true;
  try {
    await generateBlueprintPdf(props.project, props.layout, {
      theme: selectedTheme.value,
      includeFurniture: includeFurniture.value,
      includeDimensions: includeDimensions.value,
      includeSchedule: includeSchedule.value,
    });
    showSuccessToast();
  } catch (err) {
    console.error('Failed to export PDF:', err);
  } finally {
    isExporting.value = false;
  }
}

function handleExportSvg() {
  const svgStr = generateBlueprintSvg(props.project, props.layout, {
    theme: selectedTheme.value,
    includeFurniture: includeFurniture.value,
    includeDimensions: includeDimensions.value,
  });
  const fileName = `${props.project.name.replace(/\s+/g, '_')}_floorplan.svg`;
  downloadSvgFile(svgStr, fileName);
  showSuccessToast();
}

function handleExportPng() {
  if (!props.screenshotDataUrl) return;
  const fileName = `${props.project.name.replace(/\s+/g, '_')}_3D_Render.png`;
  downloadDataUrl(props.screenshotDataUrl, fileName);
  showSuccessToast();
}

function handleExportJson() {
  exportProjectJson(props.project);
  showSuccessToast();
}

function showSuccessToast() {
  exportSuccess.value = true;
  setTimeout(() => {
    exportSuccess.value = false;
    emit('close');
  }, 1200);
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
    <div class="bg-white rounded-3xl shadow-elevation-4 border border-border-hairline w-full max-w-2xl overflow-hidden flex flex-col animate-scale-up">
      <!-- Modal Header -->
      <div class="px-6 py-5 border-b border-border-hairline flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-50 text-brand-primary flex items-center justify-center shadow-2xs">
            <Printer class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-title-md font-bold text-content-primary">Export Architectural Deliverables</h2>
            <p class="text-caption-sm text-content-secondary">
              Generate presentation-ready blueprints, vector CAD drawings, or 3D scene renders.
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="w-9 h-9 rounded-xl flex items-center justify-center text-content-secondary hover:text-content-primary hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Format Selection Tabs -->
      <div class="px-6 pt-4 bg-surface-subtle border-b border-border-hairline flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          @click="activeTab = 'pdf'"
          class="px-4 py-2.5 rounded-t-xl text-caption-sm font-semibold flex items-center gap-2 transition-all cursor-pointer border-b-2"
          :class="[
            activeTab === 'pdf'
              ? 'border-brand-primary text-brand-primary bg-white shadow-2xs'
              : 'border-transparent text-content-secondary hover:text-content-primary'
          ]"
        >
          <FileText class="w-4 h-4" />
          <span>Blueprint PDF</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'svg'"
          class="px-4 py-2.5 rounded-t-xl text-caption-sm font-semibold flex items-center gap-2 transition-all cursor-pointer border-b-2"
          :class="[
            activeTab === 'svg'
              ? 'border-brand-primary text-brand-primary bg-white shadow-2xs'
              : 'border-transparent text-content-secondary hover:text-content-primary'
          ]"
        >
          <FileCode class="w-4 h-4" />
          <span>Vector SVG</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'png'"
          class="px-4 py-2.5 rounded-t-xl text-caption-sm font-semibold flex items-center gap-2 transition-all cursor-pointer border-b-2"
          :class="[
            activeTab === 'png'
              ? 'border-brand-primary text-brand-primary bg-white shadow-2xs'
              : 'border-transparent text-content-secondary hover:text-content-primary'
          ]"
        >
          <Image class="w-4 h-4" />
          <span>3D Viewport PNG</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'json'"
          class="px-4 py-2.5 rounded-t-xl text-caption-sm font-semibold flex items-center gap-2 transition-all cursor-pointer border-b-2"
          :class="[
            activeTab === 'json'
              ? 'border-brand-primary text-brand-primary bg-white shadow-2xs'
              : 'border-transparent text-content-secondary hover:text-content-primary'
          ]"
        >
          <Database class="w-4 h-4" />
          <span>Project JSON</span>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="p-6 flex-1">
        <!-- ── TAB 1: BLUEPRINT PDF ── -->
        <div v-if="activeTab === 'pdf'" class="flex flex-col gap-5">
          <div>
            <label class="block text-caption-xs font-bold uppercase text-content-secondary mb-2">Architectural Style Theme</label>
            <div class="grid grid-cols-2 gap-3">
              <label
                class="p-3.5 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all"
                :class="[
                  selectedTheme === 'clean'
                    ? 'border-brand-primary bg-blue-50/30 shadow-2xs'
                    : 'border-border-hairline hover:bg-slate-50'
                ]"
              >
                <input type="radio" v-model="selectedTheme" value="clean" class="hidden" />
                <div class="w-6 h-6 rounded-full border border-slate-300 bg-white flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-slate-900" />
                </div>
                <div>
                  <div class="text-caption-sm font-bold text-content-primary">Clean Architectural</div>
                  <div class="text-caption-xs text-content-secondary">High-contrast black-on-white line drawing</div>
                </div>
              </label>

              <label
                class="p-3.5 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all"
                :class="[
                  selectedTheme === 'blueprint'
                    ? 'border-brand-primary bg-blue-50/30 shadow-2xs'
                    : 'border-border-hairline hover:bg-slate-50'
                ]"
              >
                <input type="radio" v-model="selectedTheme" value="blueprint" class="hidden" />
                <div class="w-6 h-6 rounded-full border border-blue-900 bg-[#0D1B2A] flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-[#E0E1DD]" />
                </div>
                <div>
                  <div class="text-caption-sm font-bold text-content-primary">Navy Blueprint</div>
                  <div class="text-caption-xs text-content-secondary">Classic engineering drafting style</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Layer Inclusions Checkboxes -->
          <div>
            <label class="block text-caption-xs font-bold uppercase text-content-secondary mb-2">Drawing Content & Layout</label>
            <div class="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-border-hairline">
              <label class="flex items-center gap-2.5 text-caption-sm text-content-primary cursor-pointer select-none">
                <input type="checkbox" v-model="includeSchedule" class="rounded accent-brand-primary w-4 h-4" />
                <span>Include Room Schedule & Area Breakdown Table</span>
              </label>
              <label class="flex items-center gap-2.5 text-caption-sm text-content-primary cursor-pointer select-none">
                <input type="checkbox" v-model="includeDimensions" class="rounded accent-brand-primary w-4 h-4" />
                <span>Include Exterior Perimeter Dimension Ticks</span>
              </label>
              <label class="flex items-center gap-2.5 text-caption-sm text-content-primary cursor-pointer select-none">
                <input type="checkbox" v-model="includeFurniture" class="rounded accent-brand-primary w-4 h-4" />
                <span>Include Furniture & Fixture Wireframe Outlines</span>
              </label>
            </div>
          </div>

          <!-- Feature Note -->
          <div class="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-2.5 text-caption-xs text-blue-900">
            <Sparkles class="w-4 h-4 text-brand-primary shrink-0" />
            <span>Generates a standardized A4 landscape printable sheet with an official Title Block, North arrow, and 1:50 scale.</span>
          </div>

          <button
            type="button"
            @click="handleExportPdf"
            :disabled="isExporting"
            class="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-label-md font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download class="w-4 h-4" />
            <span>{{ isExporting ? 'Generating PDF Blueprint...' : 'Download Blueprint PDF' }}</span>
          </button>
        </div>

        <!-- ── TAB 2: VECTOR SVG ── -->
        <div v-else-if="activeTab === 'svg'" class="flex flex-col gap-5">
          <p class="text-caption-sm text-content-secondary">
            Download raw scalable vector graphics (SVG) containing precise vector lines for walls, room boundaries, furniture, and dimension arrows. Fully editable in CAD software, Adobe Illustrator, or Figma.
          </p>

          <div class="p-4 rounded-2xl bg-slate-50 border border-border-hairline space-y-2">
            <div class="text-caption-xs font-mono text-content-secondary">
              Boundary: <span class="font-bold text-content-primary">{{ layout.boundary.width }} × {{ layout.boundary.height }} mm</span>
            </div>
            <div class="text-caption-xs font-mono text-content-secondary">
              Elements: <span class="font-bold text-content-primary">{{ layout.rooms.length }} Rooms, {{ layout.walls.length }} Walls, {{ layout.furniture.length }} Furniture Items</span>
            </div>
          </div>

          <button
            type="button"
            @click="handleExportSvg"
            class="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-label-md font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download class="w-4 h-4" />
            <span>Download Vector SVG (.svg)</span>
          </button>
        </div>

        <!-- ── TAB 3: 3D VIEWPORT PNG ── -->
        <div v-else-if="activeTab === 'png'" class="flex flex-col gap-4">
          <p class="text-caption-sm text-content-secondary">
            Capture the current synchronized 3D perspective from WebGL directly as a high-resolution PNG image.
          </p>

          <!-- 3D Snapshot Preview Thumbnail -->
          <div class="w-full h-48 rounded-2xl bg-slate-100 border border-border-hairline overflow-hidden flex items-center justify-center relative">
            <img
              v-if="screenshotDataUrl"
              :src="screenshotDataUrl"
              alt="3D Scene Preview"
              class="w-full h-full object-contain"
            />
            <div v-else class="text-caption-xs text-content-secondary">
              Loading viewport snapshot...
            </div>
          </div>

          <button
            type="button"
            @click="handleExportPng"
            :disabled="!screenshotDataUrl"
            class="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-label-md font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download class="w-4 h-4" />
            <span>Download 3D Render PNG</span>
          </button>
        </div>

        <!-- ── TAB 4: PROJECT JSON ── -->
        <div v-else class="flex flex-col gap-4">
          <p class="text-caption-sm text-content-secondary">
            Export the complete project database schema and layout geometry as canonical JSON.
          </p>

          <pre class="w-full h-36 rounded-2xl bg-slate-900 text-slate-100 p-3.5 text-[11px] font-mono overflow-auto select-all">{{ JSON.stringify({ id: project.id, name: project.name, type: project.type, dimensions: project.dimensions, activeLayout: layout }, null, 2) }}</pre>

          <button
            type="button"
            @click="handleExportJson"
            class="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-label-md font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download class="w-4 h-4" />
            <span>Download Canonical JSON</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
