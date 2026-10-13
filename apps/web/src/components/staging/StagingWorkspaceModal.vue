<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import type { Layout, Project } from '@planora/domain';
import { DesignStyle, FurnitureDensity } from '@planora/domain';
import { stageLayout, STAGING_PRESETS } from '@planora/layout-engine';
import {
  X,
  Sparkles,
  Sliders,
  Paintbrush,
  RotateCcw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Upload,
  Layers,
  Eraser,
  Undo2,
  ChevronLeft,
  ChevronRight,
} from '@lucide/vue';

interface HistoryEntry {
  id: string;
  timestamp: string;
  imageUrl: string;
  prompt: string;
  style: string;
  isAi: boolean;
}

const props = defineProps<{
  project: Project;
  layout: Layout;
  initialScreenshot?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'apply-layout', stagedLayout: Layout): void;
}>();

// ── Tab Modes ──────────────────────────────────────────────────
type WorkflowMode = 'procedural' | 'ai';
const activeTab = ref<WorkflowMode>('procedural');

// ── Image & Comparison State ───────────────────────────────────
const originalImage = ref<string>(props.initialScreenshot || '');
const currentImage = ref<string>(props.initialScreenshot || '');
const sliderPosition = ref<number>(50); // 0 to 100%
const isDraggingSlider = ref(false);
const viewMode = ref<'slider' | 'mask'>('slider');

// ── Procedural Staging Options ─────────────────────────────────
const selectedStyle = ref<DesignStyle>(props.project.preferences.style || DesignStyle.Modern);
const selectedDensity = ref<FurnitureDensity>(FurnitureDensity.Balanced);
const preserveExisting = ref<boolean>(false);
const proceduralSuccessMsg = ref<string>('');

// ── AI Inpainting State ────────────────────────────────────────
const prompt = ref<string>('');
const negativePrompt = ref<string>('blurry, low quality, distorted architecture, bad proportions');
const guidanceScale = ref<number>(7.5);
const isGenerating = ref(false);
const generationProgress = ref(0);
const generationStatusText = ref('');
const activeJobId = ref<string | null>(null);
const jobPollingInterval = ref<any>(null);
const generationError = ref<string | null>(null);

// ── Mask Drawing Canvas State ──────────────────────────────────
const maskCanvasRef = ref<HTMLCanvasElement | null>(null);
const isDrawing = ref(false);
const brushSize = ref(30);
const isEraser = ref(false);
const hasMaskStrokes = ref(false);

// ── History Reel ───────────────────────────────────────────────
const history = ref<HistoryEntry[]>([]);

// Pre-fill prompt keywords based on preset
watch(
  selectedStyle,
  (newStyle) => {
    const preset = STAGING_PRESETS[newStyle] || STAGING_PRESETS[DesignStyle.Modern];
    if (preset && !prompt.value) {
      prompt.value = preset.promptKeywords.slice(0, 3).join(', ');
    }
  },
  { immediate: true }
);

onMounted(() => {
  // If no snapshot provided, generate an architectural canvas placeholder
  if (!originalImage.value) {
    createSyntheticFloorPlanPreview();
  } else {
    // Add original to history
    history.value.push({
      id: 'original',
      timestamp: 'Initial Viewport',
      imageUrl: originalImage.value,
      prompt: 'Original 3D Model View',
      style: selectedStyle.value,
      isAi: false,
    });
  }
});

onBeforeUnmount(() => {
  stopJobPolling();
});

function createSyntheticFloorPlanPreview() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Elegant dark architectural blueprint backdrop
    const grad = ctx.createLinearGradient(0, 0, 1024, 768);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(1, '#1E293B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 768);

    // Grid lines
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 768);
      ctx.stroke();
    }
    for (let y = 0; y < 768; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Centered label
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Planora 3D Spatial Canvas', 512, 384);
    ctx.font = '16px Inter, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText(`${props.project.name} • ${props.layout.rooms.length} Rooms`, 512, 415);
  }
  const url = canvas.toDataURL('image/png');
  originalImage.value = url;
  currentImage.value = url;
  history.value.push({
    id: 'original',
    timestamp: 'Base Architecture',
    imageUrl: url,
    prompt: 'Base Layout',
    style: selectedStyle.value,
    isAi: false,
  });
}

// ── Slider Dragging Logic ──────────────────────────────────────
const containerRef = ref<HTMLDivElement | null>(null);

function startSliderDrag(e: MouseEvent | TouchEvent) {
  isDraggingSlider.value = true;
  updateSliderFromEvent(e);
  window.addEventListener('mousemove', onSliderMouseMove);
  window.addEventListener('mouseup', stopSliderDrag);
  window.addEventListener('touchmove', onSliderTouchMove);
  window.addEventListener('touchend', stopSliderDrag);
}

function updateSliderFromEvent(e: MouseEvent | TouchEvent) {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const offsetX = clientX - rect.left;
  const percent = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
  sliderPosition.value = Math.round(percent);
}

function onSliderMouseMove(e: MouseEvent) {
  if (isDraggingSlider.value) updateSliderFromEvent(e);
}

function onSliderTouchMove(e: TouchEvent) {
  if (isDraggingSlider.value) updateSliderFromEvent(e);
}

function stopSliderDrag() {
  isDraggingSlider.value = false;
  window.removeEventListener('mousemove', onSliderMouseMove);
  window.removeEventListener('mouseup', stopSliderDrag);
  window.removeEventListener('touchmove', onSliderTouchMove);
  window.removeEventListener('touchend', stopSliderDrag);
}

// ── Mask Drawing Canvas Handlers ───────────────────────────────
function initMaskCanvas() {
  const canvas = maskCanvasRef.value;
  if (!canvas || !containerRef.value) return;
  canvas.width = containerRef.value.clientWidth;
  canvas.height = containerRef.value.clientHeight;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

watch(viewMode, (mode) => {
  if (mode === 'mask') {
    setTimeout(initMaskCanvas, 50);
  }
});

function getCanvasCoordinates(e: MouseEvent | TouchEvent) {
  const canvas = maskCanvasRef.value;
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

function startDrawing(e: MouseEvent | TouchEvent) {
  isDrawing.value = true;
  draw(e);
}

function draw(e: MouseEvent | TouchEvent) {
  if (!isDrawing.value || !maskCanvasRef.value) return;
  const ctx = maskCanvasRef.value.getContext('2d');
  if (!ctx) return;

  const { x, y } = getCanvasCoordinates(e);

  ctx.lineWidth = brushSize.value;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (isEraser.value) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    // Visual semi-transparent neon violet overlay
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.55)';
  }

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);

  hasMaskStrokes.value = true;
}

function stopDrawing() {
  if (!isDrawing.value || !maskCanvasRef.value) return;
  isDrawing.value = false;
  const ctx = maskCanvasRef.value.getContext('2d');
  if (ctx) {
    ctx.beginPath();
  }
}

function clearMask() {
  if (!maskCanvasRef.value) return;
  const ctx = maskCanvasRef.value.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, maskCanvasRef.value.width, maskCanvasRef.value.height);
  }
  hasMaskStrokes.value = false;
}

/**
 * Converts user painted strokes into a binary black/white PNG mask data URL
 * White = Area to inpaint, Black = Preserved area
 */
function exportBinaryMask(): string | undefined {
  if (!hasMaskStrokes.value || !maskCanvasRef.value) return undefined;

  const width = maskCanvasRef.value.width;
  const height = maskCanvasRef.value.height;
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const oCtx = offscreen.getContext('2d');
  if (!oCtx) return undefined;

  // Fill black
  oCtx.fillStyle = '#000000';
  oCtx.fillRect(0, 0, width, height);

  // Draw user strokes as white
  const sourceCtx = maskCanvasRef.value.getContext('2d');
  if (sourceCtx) {
    const imgData = sourceCtx.getImageData(0, 0, width, height);
    const targetData = oCtx.getImageData(0, 0, width, height);

    for (let i = 0; i < imgData.data.length; i += 4) {
      const alpha = imgData.data[i + 3];
      if (alpha > 20) {
        targetData.data[i] = 255;     // R
        targetData.data[i + 1] = 255; // G
        targetData.data[i + 2] = 255; // B
        targetData.data[i + 3] = 255; // A
      }
    }
    oCtx.putImageData(targetData, 0, 0);
  }

  return offscreen.toDataURL('image/png');
}

// ── Procedural Staging Execution ───────────────────────────────
function handleApplyProceduralStaging() {
  proceduralSuccessMsg.value = '';
  try {
    const result = stageLayout(props.layout, {
      style: selectedStyle.value,
      density: selectedDensity.value,
      preserveExistingFurniture: preserveExisting.value,
    });

    emit('apply-layout', result.layout);
    proceduralSuccessMsg.value = `Procedural staging applied: ${result.stagedItemCount} furniture assets staged in ${result.appliedPreset.name} style!`;

    // Also update history
    history.value.unshift({
      id: `proc-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: currentImage.value,
      prompt: `Procedural Staging: ${result.appliedPreset.name} (${result.stagedItemCount} items)`,
      style: selectedStyle.value,
      isAi: false,
    });
  } catch (err: any) {
    alert(`Staging failed: ${err.message}`);
  }
}

// ── AI Inpainting Request & Polling ────────────────────────────
async function handleGenerateAiEdit() {
  if (isGenerating.value) return;
  generationError.value = null;
  isGenerating.value = true;
  generationProgress.value = 5;
  generationStatusText.value = 'Preparing architectural image & mask...';

  try {
    const maskDataUrl = exportBinaryMask();

    const payload = {
      projectId: props.project.id,
      image: currentImage.value || originalImage.value,
      mask: maskDataUrl,
      prompt: prompt.value,
      negativePrompt: negativePrompt.value,
      style: selectedStyle.value,
      guidanceScale: guidanceScale.value,
    };

    generationStatusText.value = 'Submitting job to inpainting engine...';
    generationProgress.value = 15;

    const res = await fetch('/api/staging/ai/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': `client-${props.project.id}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || errJson.message || `Request failed with code ${res.status}`);
    }

    const json = await res.json();
    const job = json.data;
    activeJobId.value = job.id;

    startJobPolling(job.id);
  } catch (err: any) {
    generationError.value = err.message || 'Failed to submit inpainting job.';
    isGenerating.value = false;
    generationProgress.value = 0;
  }
}

function startJobPolling(jobId: string) {
  stopJobPolling();
  jobPollingInterval.value = setInterval(async () => {
    try {
      const res = await fetch(`/api/staging/ai/jobs/${jobId}`);
      if (!res.ok) throw new Error('Polling failed');
      const json = await res.json();
      const job = json.data;

      generationProgress.value = job.progress || 50;
      generationStatusText.value =
        job.status === 'processing' ? 'Synthesizing photorealistic materials & lighting...' : 'Processing...';

      if (job.status === 'succeeded') {
        stopJobPolling();
        isGenerating.value = false;
        generationProgress.value = 100;
        generationStatusText.value = 'Completed!';

        const newResultUrl = job.resultImageUrl || job.originalImageUrl;
        currentImage.value = newResultUrl;
        viewMode.value = 'slider';
        sliderPosition.value = 50;

        // Record in history
        history.value.unshift({
          id: job.id,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          imageUrl: newResultUrl,
          prompt: prompt.value,
          style: selectedStyle.value,
          isAi: true,
        });
      } else if (job.status === 'failed' || job.status === 'cancelled') {
        stopJobPolling();
        isGenerating.value = false;
        generationError.value = job.error || 'Generation was cancelled or encountered an error.';
      }
    } catch (err: any) {
      stopJobPolling();
      isGenerating.value = false;
      generationError.value = err.message || 'Error checking generation status.';
    }
  }, 1200);
}

function stopJobPolling() {
  if (jobPollingInterval.value) {
    clearInterval(jobPollingInterval.value);
    jobPollingInterval.value = null;
  }
}

async function handleCancelGeneration() {
  if (!activeJobId.value) return;
  try {
    await fetch(`/api/staging/ai/jobs/${activeJobId.value}/cancel`, { method: 'POST' });
  } catch {
    // Ignore error
  }
  stopJobPolling();
  isGenerating.value = false;
  generationStatusText.value = 'Generation cancelled.';
}

function handleRestoreOriginal() {
  currentImage.value = originalImage.value;
  sliderPosition.value = 100;
  clearMask();
}

function handleDownloadImage() {
  const link = document.createElement('a');
  link.href = currentImage.value;
  link.download = `planora-${props.project.name.toLowerCase().replace(/\s+/g, '-')}-staged.png`;
  link.click();
}

function handleSelectHistory(entry: HistoryEntry) {
  currentImage.value = entry.imageUrl;
  prompt.value = entry.prompt;
  sliderPosition.value = 50;
}

function handleUploadImage(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    alert('Image file exceeds the 10MB limit.');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      originalImage.value = reader.result;
      currentImage.value = reader.result;
      clearMask();
    }
  };
  reader.readAsDataURL(file);
}

const currentPreset = computed(() => {
  return STAGING_PRESETS[selectedStyle.value] || STAGING_PRESETS[DesignStyle.Modern];
});
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
    <div class="bg-white w-full max-w-7xl max-h-[96vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
      <!-- ── Header ─────────────────────────────────────────────── -->
      <header class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-primary/20">
            <Sparkles class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-headline-sm font-bold text-slate-900">Interior Staging & AI Studio</h2>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                Phase 8 Active
              </span>
            </div>
            <p class="text-caption-xs text-slate-500">
              Procedural CAD spatial layout staging & optional photorealistic neural inpainting
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Workflow Tab Switcher -->
          <div class="inline-flex p-1 bg-slate-200/80 rounded-xl text-label-xs font-semibold">
            <button
              type="button"
              @click="activeTab = 'procedural'"
              class="px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              :class="activeTab === 'procedural' ? 'bg-white text-brand-primary shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'"
            >
              <Layers class="w-3.5 h-3.5" />
              <span>Procedural Staging</span>
            </button>
            <button
              type="button"
              @click="activeTab = 'ai'"
              class="px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              :class="activeTab === 'ai' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'"
            >
              <Sparkles class="w-3.5 h-3.5" />
              <span>AI Inpainting & Styling</span>
            </button>
          </div>

          <button
            type="button"
            @click="emit('close')"
            class="w-9 h-9 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </header>

      <!-- ── Architectural Disclaimer Banner ───────────────────── -->
      <div class="bg-amber-50/90 border-b border-amber-200/80 px-6 py-2 flex items-center justify-between text-caption-xs text-amber-900">
        <div class="flex items-center gap-2">
          <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Architectural Notice:</strong> Procedural staging preserves authoritative CAD dimensions. AI inpainting generates photorealistic concept visualizations and may stylize non-structural details.
          </span>
        </div>
        <span class="text-amber-700/80 font-medium">100% Offline Procedural Engine Ready</span>
      </div>

      <!-- ── Main Workspace Body (2 Columns) ───────────────────── -->
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        <!-- ── LEFT VIEWPORT & COMPARISON CANVAS (Col 7) ────────── -->
        <div class="lg:col-span-7 bg-slate-950 p-4 sm:p-6 flex flex-col justify-between overflow-hidden relative">
          <!-- Canvas Top Overlay Controls -->
          <div class="flex items-center justify-between z-20 mb-3">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-lg bg-black/60 text-white text-[12px] font-medium backdrop-blur-md border border-white/10">
                {{ viewMode === 'mask' ? 'Mask Drawing Mode' : 'Before / After Comparison' }}
              </span>

              <button
                v-if="activeTab === 'ai'"
                type="button"
                @click="viewMode = viewMode === 'slider' ? 'mask' : 'slider'"
                class="px-3 py-1 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md border"
                :class="viewMode === 'mask' ? 'bg-pink-600 text-white border-pink-400' : 'bg-white/10 text-slate-200 border-white/20 hover:bg-white/20'"
              >
                <Paintbrush class="w-3.5 h-3.5" />
                <span>{{ viewMode === 'mask' ? 'Back to Slider' : 'Paint Inpaint Mask' }}</span>
              </button>
            </div>

            <div class="flex items-center gap-2">
              <label class="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[12px] font-medium transition-colors cursor-pointer border border-white/10 flex items-center gap-1.5">
                <Upload class="w-3.5 h-3.5" />
                <span>Upload Photo</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="handleUploadImage" />
              </label>

              <button
                type="button"
                @click="handleRestoreOriginal"
                title="Restore Original Image"
                class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center transition-colors cursor-pointer border border-white/10"
              >
                <RotateCcw class="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                @click="handleDownloadImage"
                title="Download Visual Render"
                class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center transition-colors cursor-pointer border border-white/10"
              >
                <Download class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Main Interactive Viewport Container -->
          <div
            ref="containerRef"
            class="flex-1 w-full relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center select-none shadow-inner"
            @mousedown="viewMode === 'slider' ? startSliderDrag($event) : null"
            @touchstart="viewMode === 'slider' ? startSliderDrag($event) : null"
          >
            <!-- 1. Background / Underneath: Before (Original Image) -->
            <img
              :src="originalImage"
              alt="Original Floor Plan / 3D State"
              class="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            <!-- 2. Foreground / Top layer: After (Staged / Inpainted Result) clipped by slider -->
            <div
              v-if="viewMode === 'slider'"
              class="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
              :style="{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }"
            >
              <img
                :src="currentImage"
                alt="Staged Interior Design Result"
                class="absolute inset-0 w-full h-full object-contain"
              />
            </div>

            <!-- 3. Mask Drawing Canvas Overlay (when in mask mode) -->
            <canvas
              v-if="viewMode === 'mask'"
              ref="maskCanvasRef"
              class="absolute inset-0 w-full h-full z-20 cursor-crosshair touch-none"
              @mousedown="startDrawing"
              @mousemove="draw"
              @mouseup="stopDrawing"
              @mouseleave="stopDrawing"
              @touchstart.prevent="startDrawing"
              @touchmove.prevent="draw"
              @touchend.prevent="stopDrawing"
            />

            <!-- 4. Interactive Split Slider Bar -->
            <div
              v-if="viewMode === 'slider'"
              class="absolute top-0 bottom-0 z-30 flex items-center justify-center pointer-events-none"
              :style="{ left: `${sliderPosition}%` }"
            >
              <!-- Vertical divider line -->
              <div class="w-0.5 h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />

              <!-- Circular handle button -->
              <div class="absolute w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center border-2 border-slate-300 pointer-events-auto cursor-ew-resize hover:scale-110 active:scale-95 transition-transform">
                <div class="flex items-center -space-x-1">
                  <ChevronLeft class="w-3.5 h-3.5 text-slate-600" />
                  <ChevronRight class="w-3.5 h-3.5 text-slate-600" />
                </div>
              </div>
            </div>

            <!-- Corner Labels -->
            <div v-if="viewMode === 'slider'" class="absolute bottom-3 left-3 z-20 pointer-events-none">
              <span class="px-2.5 py-1 rounded bg-black/70 text-white text-[11px] font-bold backdrop-blur-xs">
                BEFORE (Original CAD)
              </span>
            </div>
            <div v-if="viewMode === 'slider'" class="absolute bottom-3 right-3 z-20 pointer-events-none">
              <span class="px-2.5 py-1 rounded bg-brand-primary/80 text-white text-[11px] font-bold backdrop-blur-xs">
                AFTER (Staged)
              </span>
            </div>
          </div>

          <!-- Mask Tool Palette Bar (Shown only in Mask mode) -->
          <div v-if="viewMode === 'mask'" class="mt-3 p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between gap-4 z-20">
            <div class="flex items-center gap-3">
              <button
                type="button"
                @click="isEraser = false"
                class="px-3 py-1.5 rounded-lg text-label-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                :class="!isEraser ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
              >
                <Paintbrush class="w-3.5 h-3.5" />
                <span>Brush</span>
              </button>
              <button
                type="button"
                @click="isEraser = true"
                class="px-3 py-1.5 rounded-lg text-label-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                :class="isEraser ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
              >
                <Eraser class="w-3.5 h-3.5" />
                <span>Eraser</span>
              </button>

              <div class="flex items-center gap-2 text-slate-400 text-caption-xs ml-2">
                <span>Size:</span>
                <input
                  type="range"
                  min="10"
                  max="80"
                  v-model.number="brushSize"
                  class="w-24 accent-pink-500 cursor-pointer"
                />
                <span class="text-white w-6 font-mono">{{ brushSize }}px</span>
              </div>
            </div>

            <button
              type="button"
              @click="clearMask"
              class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 text-caption-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Undo2 class="w-3.5 h-3.5" />
              <span>Clear Mask</span>
            </button>
          </div>

          <!-- History Thumbnails Reel -->
          <div class="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1">
            <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              History:
            </span>
            <button
              v-for="entry in history"
              :key="entry.id"
              type="button"
              @click="handleSelectHistory(entry)"
              class="w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 relative transition-transform hover:scale-105 cursor-pointer"
              :class="currentImage === entry.imageUrl ? 'border-brand-primary ring-2 ring-brand-primary/40' : 'border-slate-700 opacity-60 hover:opacity-100'"
            >
              <img :src="entry.imageUrl" class="w-full h-full object-cover" />
              <span
                v-if="entry.isAi"
                class="absolute bottom-0 right-0 px-1 py-0.2 bg-indigo-600 text-[8px] font-bold text-white rounded-tl"
              >
                AI
              </span>
            </button>
          </div>
        </div>

        <!-- ── RIGHT CONTROL SIDEBAR (Col 5) ─────────────────────── -->
        <div class="lg:col-span-5 p-6 flex flex-col justify-between overflow-y-auto bg-white border-l border-slate-100">
          <div class="flex flex-col gap-6">
            <!-- 1. Architectural Style Preset Picker (Common to both) -->
            <div>
              <div class="flex items-center justify-between mb-2.5">
                <label class="text-label-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders class="w-4 h-4 text-brand-primary" />
                  <span>Curated Architectural Style Preset</span>
                </label>
                <span class="text-caption-xs font-semibold text-brand-primary capitalize">
                  {{ currentPreset.name }}
                </span>
              </div>

              <!-- 5 Core Presets Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  v-for="preset in Object.values(STAGING_PRESETS).slice(0, 5)"
                  :key="preset.id"
                  @click="selectedStyle = preset.style"
                  class="p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer"
                  :class="selectedStyle === preset.style
                    ? 'border-brand-primary bg-blue-50/60 ring-2 ring-brand-primary/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-label-xs font-bold text-slate-900 leading-tight">
                      {{ preset.name.split(' ')[0] }}
                    </span>
                    <span
                      class="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                      :style="{ backgroundColor: preset.floorTone }"
                    />
                  </div>
                  <span class="text-[10px] text-slate-500 line-clamp-1">
                    {{ preset.primaryMaterial.replace(/_/g, ' ') }}
                  </span>
                </button>
              </div>

              <!-- Preset Details Card -->
              <div class="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5 text-caption-xs text-slate-600">
                <p class="text-slate-700 italic">"{{ currentPreset.description }}"</p>
                <div class="flex flex-wrap items-center gap-2 mt-1">
                  <span class="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                    Material: {{ currentPreset.primaryMaterial.replace(/_/g, ' ') }}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                    Mood: {{ currentPreset.lightingMood }}
                  </span>
                </div>
              </div>
            </div>

            <!-- ── TAB 1 CONTENT: PROCEDURAL STAGING CONTROLS ───── -->
            <div v-if="activeTab === 'procedural'" class="flex flex-col gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-label-xs font-semibold text-slate-700">Furniture Density</label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    v-for="d in [FurnitureDensity.Sparse, FurnitureDensity.Balanced, FurnitureDensity.Dense]"
                    :key="d"
                    @click="selectedDensity = d"
                    class="py-2 px-3 rounded-lg border text-caption-xs font-semibold capitalize cursor-pointer transition-colors"
                    :class="selectedDensity === d
                      ? 'border-brand-primary bg-blue-50 text-brand-primary'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
                  >
                    {{ d }}
                  </button>
                </div>
              </div>

              <label class="flex items-center gap-2 cursor-pointer text-caption-xs text-slate-700">
                <input
                  type="checkbox"
                  v-model="preserveExisting"
                  class="rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                />
                <span>Preserve already placed custom furniture in rooms</span>
              </label>

              <!-- Success Notification -->
              <div
                v-if="proceduralSuccessMsg"
                class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-caption-xs flex items-center gap-2"
              >
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{{ proceduralSuccessMsg }}</span>
              </div>
            </div>

            <!-- ── TAB 2 CONTENT: AI INPAINTING & STYLING ───────── -->
            <div v-else class="flex flex-col gap-4">
              <!-- Prompt Input -->
              <div class="flex flex-col gap-1.5">
                <label class="text-label-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Photorealistic Inpainting Prompt</span>
                  <span class="text-[10px] text-slate-400">FLUX.1 Kontext Pro</span>
                </label>
                <textarea
                  v-model="prompt"
                  rows="3"
                  placeholder="e.g. Scandinavian light oak dining table, linen chairs, warm architectural lighting"
                  class="w-full px-3 py-2 text-body-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400"
                />
              </div>

              <!-- Suggested Keyword Pills -->
              <div class="flex flex-wrap gap-1.5">
                <span class="text-[11px] text-slate-400 font-medium mr-1">Inspirations:</span>
                <button
                  type="button"
                  v-for="kw in currentPreset.promptKeywords.slice(0, 4)"
                  :key="kw"
                  @click="prompt = prompt ? `${prompt}, ${kw}` : kw"
                  class="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 text-[10px] font-medium transition-colors cursor-pointer"
                >
                  + {{ kw }}
                </button>
              </div>

              <!-- Mask Status Badge -->
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-caption-xs">
                <span class="text-slate-600">Selected Inpaint Region:</span>
                <span
                  class="font-semibold"
                  :class="hasMaskStrokes ? 'text-pink-600' : 'text-slate-400'"
                >
                  {{ hasMaskStrokes ? 'Custom Mask Painted' : 'Full Image Re-Style' }}
                </span>
              </div>

              <!-- Error Alert -->
              <div
                v-if="generationError"
                class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-caption-xs flex items-center gap-2"
              >
                <AlertTriangle class="w-4 h-4 text-rose-600 shrink-0" />
                <span>{{ generationError }}</span>
              </div>

              <!-- Generation Progress State -->
              <div v-if="isGenerating" class="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200 flex flex-col gap-2">
                <div class="flex items-center justify-between text-caption-xs font-semibold text-indigo-900">
                  <div class="flex items-center gap-2">
                    <Loader2 class="w-4 h-4 animate-spin text-indigo-600" />
                    <span>{{ generationStatusText }}</span>
                  </div>
                  <span>{{ generationProgress }}%</span>
                </div>
                <!-- Progress Bar -->
                <div class="w-full bg-indigo-200/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    class="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    :style="{ width: `${generationProgress}%` }"
                  />
                </div>
                <button
                  type="button"
                  @click="handleCancelGeneration"
                  class="text-[11px] text-rose-600 hover:text-rose-800 font-semibold self-end cursor-pointer"
                >
                  Cancel Generation
                </button>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="pt-6 border-t border-slate-100 flex flex-col gap-2">
            <!-- Procedural Button -->
            <button
              v-if="activeTab === 'procedural'"
              type="button"
              @click="handleApplyProceduralStaging"
              class="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-label-md font-bold shadow-md shadow-brand-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Layers class="w-4 h-4" />
              <span>Apply Procedural Staging to CAD</span>
            </button>

            <!-- AI Generate Button -->
            <button
              v-else
              type="button"
              :disabled="isGenerating"
              @click="handleGenerateAiEdit"
              class="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-brand-primary hover:from-indigo-700 hover:to-brand-primary-hover text-white font-label-md font-bold shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles class="w-4 h-4" />
              <span>{{ isGenerating ? 'Generating Staging Preview...' : 'Generate Photorealistic AI Inpaint' }}</span>
            </button>

            <button
              type="button"
              @click="emit('close')"
              class="w-full py-2 rounded-xl text-slate-500 hover:text-slate-800 text-caption-xs font-semibold transition-colors cursor-pointer"
            >
              Done & Return to CAD Viewport
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
