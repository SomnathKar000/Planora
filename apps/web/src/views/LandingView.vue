<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  LayoutGrid,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Building2,
  Building,
  Ruler,
  Maximize2,
  Compass,
  Sun,
  Eye,
  GitBranch,
  Palette,
  Share2,
  Check,
  X,
  Star,
  Download,
  PlayCircle,
  Undo2,
  Redo2,
  ZoomIn,
} from '@lucide/vue';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// Interactive state in hero mockup
const activeCategory = ref<'room' | 'apartment' | 'villa'>('apartment');
const activeArchetype = ref<'nordic' | 'japandi' | 'loft' | 'minimal'>('nordic');
const isRegenerating = ref(false);

function triggerRegenerate() {
  isRegenerating.value = true;
  setTimeout(() => {
    isRegenerating.value = false;
  }, 600);
}

function scrollToSandbox() {
  const el = document.getElementById('hero-workspace');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

function handleLaunchWorkspace() {
  if (authStore.isAuthenticated) {
    router.push('/projects');
  } else {
    router.push('/login?redirect=/projects');
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#f9f9ff] text-[#121b2e] antialiased flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
    <!-- Top Global Sticky Header -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e9edff] shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div class="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-6">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3 shrink-0 group">
          <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-[0_2px_8px_rgba(0,82,214,0.3)] group-hover:scale-105 transition-transform">
            <LayoutGrid class="w-5 h-5 text-white" />
          </div>
          <span class="text-[20px] font-bold tracking-tight text-[#121b2e]">
            Planora<span class="text-primary font-bold">.ai</span>
          </span>
        </router-link>

        <!-- Center Nav Anchor Links -->
        <nav class="hidden xl:flex items-center gap-1.5 text-[13px] font-semibold text-[#505f76]">
          <a href="#pipeline" class="px-3 py-1.5 rounded-lg hover:text-[#121b2e] hover:bg-[#f1f3ff] transition-colors">
            Pipeline
          </a>
          <a href="#showcase" class="px-3 py-1.5 rounded-lg hover:text-[#121b2e] hover:bg-[#f1f3ff] transition-colors">
            Studio CAD
          </a>
          <a href="#capabilities" class="px-3 py-1.5 rounded-lg hover:text-[#121b2e] hover:bg-[#f1f3ff] transition-colors">
            Capabilities
          </a>
          <a href="#pricing" class="px-3 py-1.5 rounded-lg hover:text-[#121b2e] hover:bg-[#f1f3ff] transition-colors">
            Pricing
          </a>
        </nav>

        <!-- Right Action Stack -->
        <div class="flex items-center gap-3 shrink-0">
          <template v-if="authStore.isAuthenticated">
            <router-link
              to="/projects"
              class="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#505f76] hover:text-[#121b2e] px-3 py-2 transition-colors"
            >
              <span>{{ authStore.userName }}</span>
            </router-link>
            <button
              type="button"
              class="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary hover:bg-[#0047ba] text-white font-semibold text-[13px] shadow-[0_2px_8px_rgba(0,82,214,0.25)] transition-all cursor-pointer"
              @click="router.push('/projects')"
            >
              <LayoutGrid class="w-4 h-4" />
              <span>Open Workspaces</span>
            </button>
          </template>

          <template v-else>
            <router-link
              to="/login"
              class="hidden sm:inline-flex text-[13px] font-semibold text-[#505f76] hover:text-[#121b2e] px-3 py-2 transition-colors"
            >
              Sign In
            </router-link>
            <button
              type="button"
              class="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary hover:bg-[#0047ba] text-white font-semibold text-[13px] shadow-[0_2px_8px_rgba(0,82,214,0.25)] transition-all cursor-pointer"
              @click="handleLaunchWorkspace"
            >
              <Sparkles class="w-4 h-4" />
              <span>Launch Workspace</span>
            </button>
          </template>
        </div>
      </div>
    </header>

    <!-- Main Container -->
    <main class="w-full pt-16 flex-1">
      <!-- ================= HERO SECTION ================= -->
      <section class="relative w-full overflow-hidden bg-[#f9f9ff] py-12 md:py-20 lg:py-24">
        <!-- Subtle Ambient Blueprint Grid -->
        <div
          class="pointer-events-none absolute inset-0 opacity-40"
          style="background-image: radial-gradient(#c2c6d8 1px, transparent 1px); background-size: 24px 24px;"
        ></div>
        <div class="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]"></div>

        <div class="relative mx-auto max-w-7xl px-6 lg:px-12">
          <!-- Eyebrow Pill -->
          <div class="flex justify-center">
            <div class="inline-flex items-center gap-2 rounded-full bg-white border border-[#e1e8ff] px-4 py-1.5 shadow-xs">
              <span class="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span class="text-[11px] font-bold text-[#121b2e] uppercase tracking-wider">Planora CAD Core v4.2 Active</span>
              <span class="text-[#c2c6d8]">•</span>
              <span class="text-[12px] font-semibold text-[#505f76]">Millimeter-accurate generative floor plans</span>
            </div>
          </div>

          <!-- Main Headline & Subheading -->
          <div class="mt-8 text-center max-w-4xl mx-auto">
            <h1 class="text-[36px] sm:text-[46px] lg:text-[54px] font-bold text-[#121b2e] tracking-tight leading-[1.12]">
              Turn room dimensions into <span class="text-primary">production-grade CAD</span> floor plans in seconds.
            </h1>
            <p class="mt-6 text-[16px] sm:text-[18px] text-[#505f76] max-w-2xl mx-auto leading-relaxed">
              Planora empowers architects, interior designers, and property developers to draft parametric 2D architectural blueprints and real-time isometric 3D spaces powered by spatial AI.
            </p>

            <!-- Dual CTA Buttons -->
            <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-12 px-7 rounded-xl bg-primary hover:bg-[#0047ba] text-white font-semibold text-[14px] shadow-[0_4px_14px_rgba(0,82,214,0.35)] transition-all active:scale-[0.99] cursor-pointer"
                @click="handleLaunchWorkspace"
              >
                <Compass class="w-4 h-4 text-white" />
                <span>Launch Studio Workspace</span>
                <ArrowRight class="w-4 h-4 text-white" />
              </button>

              <button
                type="button"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white border border-[#e1e8ff] text-[#121b2e] hover:bg-[#f1f3ff] font-semibold text-[14px] shadow-xs transition-colors cursor-pointer"
                @click="scrollToSandbox"
              >
                <PlayCircle class="w-4 h-4 text-primary" />
                <span>Explore Interactive Sandbox</span>
              </button>
            </div>

            <!-- Trust Badges -->
            <div class="mt-6 flex flex-wrap items-center justify-center gap-6 text-[13px] text-[#505f76] font-medium">
              <span class="inline-flex items-center gap-1.5">
                <CheckCircle2 class="w-4 h-4 text-primary" />
                No credit card required
              </span>
              <span class="inline-flex items-center gap-1.5">
                <Layers class="w-4 h-4 text-primary" />
                Instant DWG / BIM export
              </span>
              <span class="inline-flex items-center gap-1.5">
                <ShieldCheck class="w-4 h-4 text-primary" />
                SOC2 Type II Certified
              </span>
            </div>
          </div>

          <!-- Hero Workspace Mockup (Interactive Simulation) -->
          <div
            id="hero-workspace"
            class="mt-14 relative rounded-2xl bg-white border border-[#e1e8ff] shadow-[0_20px_50px_rgba(23,32,51,0.08)] overflow-hidden"
          >
            <!-- macOS Window Titlebar -->
            <div class="flex items-center justify-between px-5 py-3.5 bg-[#f1f3ff] border-b border-[#e1e8ff]">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-red-400"></div>
                <div class="w-3 h-3 rounded-full bg-amber-400"></div>
                <div class="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span class="ml-3 text-[12px] font-semibold text-[#505f76]">
                  Downtown Loft Apt. 4B — Planora Studio CAD v4.2
                </span>
              </div>
              <div class="hidden sm:flex items-center gap-3">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  Real-time Dual Synced
                </span>
                <span class="text-[11px] text-[#505f76] font-mono">Scale 1:50 Metric</span>
              </div>
            </div>

            <!-- 3-Column Studio Workspace -->
            <div class="grid grid-cols-1 lg:grid-cols-12 min-h-[560px] bg-[#f9f9ff]">
              <!-- Left Rail: Parametric Controls (3 cols) -->
              <div class="lg:col-span-3 bg-white p-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#e1e8ff]">
                <div class="space-y-5">
                  <!-- Space Category Switch -->
                  <div>
                    <span class="text-[11px] uppercase tracking-wider text-[#505f76] font-bold">
                      1. Space Details
                    </span>
                    <div class="mt-2 grid grid-cols-3 gap-1 bg-[#f1f3ff] p-1 rounded-xl text-center text-[12px]">
                      <button
                        type="button"
                        class="py-1 rounded-lg transition-all cursor-pointer font-semibold"
                        :class="activeCategory === 'room' ? 'bg-white text-primary shadow-xs' : 'text-[#505f76] hover:text-[#121b2e]'"
                        @click="activeCategory = 'room'"
                      >
                        Room
                      </button>
                      <button
                        type="button"
                        class="py-1 rounded-lg transition-all cursor-pointer font-semibold"
                        :class="activeCategory === 'apartment' ? 'bg-white text-primary shadow-xs' : 'text-[#505f76] hover:text-[#121b2e]'"
                        @click="activeCategory = 'apartment'"
                      >
                        Apartment
                      </button>
                      <button
                        type="button"
                        class="py-1 rounded-lg transition-all cursor-pointer font-semibold"
                        :class="activeCategory === 'villa' ? 'bg-white text-primary shadow-xs' : 'text-[#505f76] hover:text-[#121b2e]'"
                        @click="activeCategory = 'villa'"
                      >
                        Villa
                      </button>
                    </div>
                  </div>

                  <!-- Measurement Inputs -->
                  <div class="grid grid-cols-2 gap-3">
                    <div class="bg-[#f1f3ff] p-2.5 rounded-xl border border-[#e1e8ff]/50">
                      <span class="text-[11px] text-[#505f76] font-medium">Length</span>
                      <div class="text-[15px] font-bold text-[#121b2e]">30.0 ft</div>
                    </div>
                    <div class="bg-[#f1f3ff] p-2.5 rounded-xl border border-[#e1e8ff]/50">
                      <span class="text-[11px] text-[#505f76] font-medium">Width</span>
                      <div class="text-[15px] font-bold text-[#121b2e]">20.0 ft</div>
                    </div>
                  </div>

                  <!-- Room Allocation Stack -->
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-[11px] uppercase tracking-wider text-[#505f76] font-bold">
                        2. Allocated Zones
                      </span>
                      <span class="text-[11px] text-primary font-semibold">+ Auto Zone</span>
                    </div>
                    <div class="space-y-2">
                      <div class="flex items-center justify-between p-2 rounded-xl bg-[#f1f3ff] border border-[#e1e8ff]/50">
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Building class="w-3.5 h-3.5" />
                          </div>
                          <span class="text-[12px] font-semibold text-[#121b2e]">Living Room</span>
                        </div>
                        <span class="text-[11px] font-mono text-[#505f76]">12 × 16 ft</span>
                      </div>
                      <div class="flex items-center justify-between p-2 rounded-xl bg-[#f1f3ff] border border-[#e1e8ff]/50">
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Building class="w-3.5 h-3.5" />
                          </div>
                          <span class="text-[12px] font-semibold text-[#121b2e]">Primary Suite</span>
                        </div>
                        <span class="text-[11px] font-mono text-[#505f76]">12 × 12 ft</span>
                      </div>
                      <div class="flex items-center justify-between p-2 rounded-xl bg-[#f1f3ff] border border-[#e1e8ff]/50">
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Building class="w-3.5 h-3.5" />
                          </div>
                          <span class="text-[12px] font-semibold text-[#121b2e]">Chef's Kitchen</span>
                        </div>
                        <span class="text-[11px] font-mono text-[#505f76]">8 × 12 ft</span>
                      </div>
                      <div class="flex items-center justify-between p-2 rounded-xl bg-[#f1f3ff] border border-[#e1e8ff]/50">
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Building class="w-3.5 h-3.5" />
                          </div>
                          <span class="text-[12px] font-semibold text-[#121b2e]">Master Bath</span>
                        </div>
                        <span class="text-[11px] font-mono text-[#505f76]">6 × 8 ft</span>
                      </div>
                    </div>
                  </div>

                  <!-- Material Archetype Selection -->
                  <div>
                    <span class="text-[11px] uppercase tracking-wider text-[#505f76] font-bold">
                      3. Material Archetype
                    </span>
                    <div class="mt-2 grid grid-cols-4 gap-1.5 text-center text-[11px]">
                      <button
                        v-for="arch in ['nordic', 'japandi', 'loft', 'minimal'] as const"
                        :key="arch"
                        type="button"
                        class="p-1.5 rounded-lg border capitalize font-semibold transition-all cursor-pointer"
                        :class="activeArchetype === arch
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-[#f1f3ff] text-[#505f76] border-transparent hover:bg-[#e9edff]'"
                        @click="activeArchetype = arch"
                      >
                        {{ arch }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Generate Action in Mockup -->
                <div class="pt-4 mt-4">
                  <button
                    type="button"
                    class="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-primary hover:bg-[#0047ba] text-white font-semibold text-[13px] shadow-sm transition-all cursor-pointer"
                    :disabled="isRegenerating"
                    @click="triggerRegenerate"
                  >
                    <Sparkles class="w-4 h-4" :class="{ 'animate-spin': isRegenerating }" />
                    <span>{{ isRegenerating ? 'Synthesizing...' : 'Regenerate Space (AI)' }}</span>
                  </button>
                </div>
              </div>

              <!-- Center Canvas: Top-Down Architectural Vector CAD (5 cols) -->
              <div class="lg:col-span-5 relative bg-[#f9f9ff] flex flex-col justify-between p-6">
                <!-- Canvas HUD Bar -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5 bg-white border border-[#e1e8ff] px-2.5 py-1 rounded-xl shadow-xs">
                    <span class="text-[12px] text-primary font-bold">2D Vector CAD</span>
                    <span class="text-[#c2c6d8]">/</span>
                    <span class="text-[11px] text-[#505f76]">Layer 01: Core Loadbearing</span>
                  </div>
                  <div class="flex items-center gap-1 bg-white border border-[#e1e8ff] p-1 rounded-xl shadow-xs">
                    <button class="p-1 text-[#505f76] hover:text-[#121b2e] rounded-lg hover:bg-[#f1f3ff]" title="Undo">
                      <Undo2 class="w-3.5 h-3.5" />
                    </button>
                    <button class="p-1 text-[#505f76] hover:text-[#121b2e] rounded-lg hover:bg-[#f1f3ff]" title="Redo">
                      <Redo2 class="w-3.5 h-3.5" />
                    </button>
                    <button class="p-1 text-[#505f76] hover:text-[#121b2e] rounded-lg hover:bg-[#f1f3ff]" title="Zoom">
                      <ZoomIn class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <!-- Architectural Blueprint Simulation -->
                <div class="relative my-4 flex items-center justify-center">
                  <!-- Dimension Line Top -->
                  <div class="absolute -top-5 left-8 right-8 flex items-center justify-between text-[#505f76]">
                    <span class="text-[10px]">◀</span>
                    <span class="text-[10px] font-mono font-semibold px-2 bg-white rounded-md shadow-xs border border-[#e1e8ff]">
                      30'-0" [9,144 mm]
                    </span>
                    <span class="text-[10px]">▶</span>
                  </div>

                  <!-- Floor Plan Geometry Frame -->
                  <div class="relative w-full aspect-[4/3] max-w-[420px] rounded-2xl bg-white border border-[#e1e8ff] shadow-sm p-3 grid grid-cols-12 grid-rows-12 gap-1.5">
                    <!-- Bedroom (Top Left) -->
                    <div class="col-span-5 row-span-6 rounded-xl bg-[#f3ede4] p-2 flex flex-col justify-between border border-[#e4ded5]">
                      <div class="flex items-center justify-between">
                        <span class="text-[11px] font-bold text-[#121b2e]">BEDROOM</span>
                        <span class="text-[10px] text-[#505f76]">12×12'</span>
                      </div>
                      <div class="w-12 h-14 mx-auto rounded bg-white shadow-xs flex flex-col justify-end p-1 border border-[#e2e8f0]">
                        <div class="w-full h-3 bg-[#e4ded5] rounded-xs"></div>
                      </div>
                      <div class="text-[9px] text-[#505f76] font-mono">WOOD PLANK</div>
                    </div>

                    <!-- Living Room (Top & Mid Right) -->
                    <div class="col-span-7 row-span-7 rounded-xl bg-[#faf6f0] p-2 flex flex-col justify-between border border-[#e8e2d8]">
                      <div class="flex items-center justify-between">
                        <span class="text-[11px] font-bold text-[#121b2e]">GREAT LIVING ROOM</span>
                        <span class="text-[10px] text-[#505f76]">18×14'</span>
                      </div>
                      <div class="flex items-center justify-center gap-2">
                        <div class="w-20 h-9 rounded bg-white shadow-xs flex items-center justify-center text-[9px] font-bold text-[#505f76] border border-[#e2e8f0]">
                          SECTIONAL
                        </div>
                        <div class="w-6 h-6 rounded-full bg-[#e8e2d8]"></div>
                      </div>
                      <div class="flex justify-between items-center text-[9px] text-[#505f76]">
                        <span>OAK PARQUET</span>
                        <span class="text-primary font-bold">EGRESS CLEAR</span>
                      </div>
                    </div>

                    <!-- Kitchen (Bottom Left) -->
                    <div class="col-span-6 row-span-6 rounded-xl bg-[#eff3f8] p-2 flex flex-col justify-between border border-[#dbe5f0]">
                      <div class="flex items-center justify-between">
                        <span class="text-[11px] font-bold text-[#121b2e]">KITCHEN</span>
                        <span class="text-[10px] text-[#505f76]">8×12'</span>
                      </div>
                      <div class="flex justify-around items-center">
                        <div class="w-5 h-7 rounded bg-[#dbe5f0]"></div>
                        <div class="w-10 h-6 rounded bg-white text-[9px] flex items-center justify-center shadow-xs text-[#505f76] border border-[#dbe5f0]">
                          ISLAND
                        </div>
                      </div>
                      <div class="text-[9px] text-[#505f76]">WET WALL ALIGNED</div>
                    </div>

                    <!-- Bathroom (Bottom Right) -->
                    <div class="col-span-6 row-span-5 rounded-xl bg-[#f4f7f6] p-2 flex flex-col justify-between border border-[#dbeae5]">
                      <div class="flex items-center justify-between">
                        <span class="text-[11px] font-bold text-[#121b2e]">BATH</span>
                        <span class="text-[10px] text-[#505f76]">6×8'</span>
                      </div>
                      <div class="flex items-center justify-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-white shadow-xs border border-[#dbeae5]"></div>
                        <div class="w-8 h-8 rounded bg-[#dbeae5]"></div>
                      </div>
                      <div class="text-[9px] text-[#505f76] font-mono">PORCELAIN TILE</div>
                    </div>
                  </div>
                </div>

                <!-- Canvas Bottom Dock Tools -->
                <div class="flex items-center justify-center">
                  <div class="flex items-center gap-1 bg-white border border-[#e1e8ff] px-3 py-1.5 rounded-full shadow-md text-[11px]">
                    <span class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-primary bg-primary/10 font-semibold">
                      <Ruler class="w-3.5 h-3.5" /> Wall
                    </span>
                    <span class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[#505f76]">
                      <Building2 class="w-3.5 h-3.5" /> Door
                    </span>
                    <span class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[#505f76]">
                      <LayoutGrid class="w-3.5 h-3.5" /> Window
                    </span>
                    <span class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[#505f76]">
                      <Building class="w-3.5 h-3.5" /> Furniture
                    </span>
                  </div>
                </div>
              </div>

              <!-- Right Rail: Synced Real-Time 3D Isometric View (4 cols) -->
              <div class="lg:col-span-4 bg-white p-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#e1e8ff]">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-[15px] font-bold text-[#121b2e]">3D Isometric View</span>
                      <span class="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <Maximize2 class="w-4 h-4 text-[#505f76]" />
                  </div>

                  <!-- Photorealistic Isometric Image Frame -->
                  <div class="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#e9edff] shadow-sm group">
                    <img
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80"
                      alt="3D architectural cutaway model"
                    />
                    <div class="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1.5 border border-[#e1e8ff]">
                      <Sun class="w-3.5 h-3.5 text-amber-500" />
                      <span class="text-[11px] font-semibold text-[#121b2e]">Midday Natural Light</span>
                    </div>
                    <div class="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-[#505f76] border border-[#e1e8ff]">
                      60 FPS WebGL
                    </div>
                  </div>

                  <!-- Quick Style Presets -->
                  <div>
                    <span class="text-[11px] uppercase tracking-wider text-[#505f76] font-bold">
                      Alternative Presets
                    </span>
                    <div class="mt-2 grid grid-cols-2 gap-2 text-[12px]">
                      <div class="p-2 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] transition-colors flex items-center gap-2 cursor-pointer border border-[#e1e8ff]/50">
                        <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-primary">
                          <Building2 class="w-4 h-4" />
                        </div>
                        <div>
                          <div class="font-bold text-[#121b2e]">Minimalist</div>
                          <div class="text-[10px] text-[#505f76]">Concrete &amp; Oak</div>
                        </div>
                      </div>
                      <div class="p-2 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] transition-colors flex items-center gap-2 cursor-pointer border border-[#e1e8ff]/50">
                        <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-primary">
                          <Building class="w-4 h-4" />
                        </div>
                        <div>
                          <div class="font-bold text-[#121b2e]">Industrial</div>
                          <div class="text-[10px] text-[#505f76]">Steel &amp; Walnut</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Instant Export Bar -->
                <div class="pt-4 mt-4 bg-[#f1f3ff] p-3 rounded-xl flex items-center justify-between border border-[#e1e8ff]/60">
                  <div>
                    <span class="text-[12px] font-bold text-[#121b2e] block">Production Deliverables</span>
                    <span class="text-[11px] text-[#505f76]">Auto-validated to IBC 2024</span>
                  </div>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#121b2e] hover:bg-white/80 text-[12px] font-semibold shadow-xs border border-[#e1e8ff] cursor-pointer"
                    @click="handleLaunchWorkspace"
                  >
                    <Download class="w-3.5 h-3.5 text-primary" />
                    <span>Export BIM</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Floating Performance Badge -->
            <div class="hidden md:flex absolute bottom-5 left-1/2 -translate-x-1/2 items-center gap-3 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-[#e1e8ff]">
              <span class="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span class="text-[11px] font-semibold text-[#121b2e]">✦ Generated in 2.8s • 100% CAD Compliant • Zero Collisions</span>
              <span class="text-[#c2c6d8]">|</span>
              <button
                type="button"
                class="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                @click="handleLaunchWorkspace"
              >
                Open Full Screen →
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= ARCHITECTURAL LOGOS CREDIBILITY BAR ================= -->
      <section class="w-full bg-white py-10 border-y border-[#e9edff]">
        <div class="max-w-7xl mx-auto px-6 lg:px-12">
          <p class="text-center text-[11px] uppercase tracking-widest text-[#505f76] font-bold">
            Trusted by over 14,200+ architectural studios, BIM engineers, and developers worldwide
          </p>
          <div class="mt-8 flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-75">
            <div class="flex items-center gap-2 text-[16px] text-[#505f76] font-bold tracking-tight">
              <Building2 class="w-5 h-5 text-primary" /> STUDIO FORMA
            </div>
            <div class="flex items-center gap-2 text-[16px] text-[#505f76] font-bold tracking-tight">
              <Building class="w-5 h-5 text-primary" /> FOSTER LABS
            </div>
            <div class="flex items-center gap-2 text-[16px] text-[#505f76] font-bold tracking-tight">
              <LayoutGrid class="w-5 h-5 text-primary" /> APEX URBAN
            </div>
            <div class="flex items-center gap-2 text-[16px] text-[#505f76] font-bold tracking-tight">
              <Compass class="w-5 h-5 text-primary" /> SKYTOWER BIM
            </div>
            <div class="flex items-center gap-2 text-[16px] text-[#505f76] font-bold tracking-tight">
              <Layers class="w-5 h-5 text-primary" /> KROMA INTERIORS
            </div>
            <div class="flex items-center gap-2 text-[16px] text-[#505f76] font-bold tracking-tight">
              <Ruler class="w-5 h-5 text-primary" /> ATELIER V
            </div>
          </div>
        </div>
      </section>

      <!-- ================= 4-STEP PIPELINE ================= -->
      <section id="pipeline" class="w-full bg-[#f9f9ff] py-20 lg:py-28">
        <div class="max-w-7xl mx-auto px-6 lg:px-12">
          <div class="max-w-3xl">
            <span class="text-[11px] uppercase tracking-wider text-primary font-bold">
              End-to-End Generative Pipeline
            </span>
            <h2 class="mt-2 text-[32px] sm:text-[38px] font-bold text-[#121b2e] tracking-tight">
              From rough envelope to buildable schematics in 4 automated stages.
            </h2>
            <p class="mt-4 text-[16px] text-[#505f76] leading-relaxed">
              Planora replaces hundreds of repetitive manual drafting hours with a mathematically sound geometric solver built for production architects.
            </p>
          </div>

          <div class="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Step 1 -->
            <div class="p-6 rounded-2xl bg-white border border-[#e1e8ff] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-6">
                  <span class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-[18px]">
                    01
                  </span>
                  <Ruler class="w-5 h-5 text-[#505f76]" />
                </div>
                <h3 class="text-[16px] font-bold text-[#121b2e]">Parametric Input &amp; Archetype</h3>
                <p class="mt-3 text-[13px] text-[#505f76] leading-relaxed">
                  Define site footprints, ceiling clearances, or import hand-drawn sketches and legacy DWG files for immediate spatial vectorization.
                </p>
              </div>
              <div class="mt-6 pt-4 bg-[#f1f3ff] p-3 rounded-xl text-[#505f76] text-[11px] font-medium border border-[#e1e8ff]/50">
                Supports DXF, PDF, IFC, and manual coordinate input.
              </div>
            </div>

            <!-- Step 2 -->
            <div class="p-6 rounded-2xl bg-white border border-[#e1e8ff] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-6">
                  <span class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-[18px]">
                    02
                  </span>
                  <Sparkles class="w-5 h-5 text-primary" />
                </div>
                <h3 class="text-[16px] font-bold text-[#121b2e]">AI Spatial Synthesis</h3>
                <p class="mt-3 text-[13px] text-[#505f76] leading-relaxed">
                  Our constraint solver auto-routes plumbing stacks, structural columns, and circulation hallways while strictly obeying egress fire codes.
                </p>
              </div>
              <div class="mt-6 pt-4 bg-[#f1f3ff] p-3 rounded-xl text-[#505f76] text-[11px] font-medium border border-[#e1e8ff]/50">
                Considers daylight access, acoustics &amp; HVAC runs.
              </div>
            </div>

            <!-- Step 3 -->
            <div class="p-6 rounded-2xl bg-white border border-[#e1e8ff] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-6">
                  <span class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-[18px]">
                    03
                  </span>
                  <Eye class="w-5 h-5 text-[#505f76]" />
                </div>
                <h3 class="text-[16px] font-bold text-[#121b2e]">Synchronous 2D &amp; 3D Editing</h3>
                <p class="mt-3 text-[13px] text-[#505f76] leading-relaxed">
                  Move a partition wall in the 2D drafting canvas, and the real-time ray-traced 3D isometric cutaway updates at zero latency.
                </p>
              </div>
              <div class="mt-6 pt-4 bg-[#f1f3ff] p-3 rounded-xl text-[#505f76] text-[11px] font-medium border border-[#e1e8ff]/50">
                Bilateral data binding across both viewports.
              </div>
            </div>

            <!-- Step 4 -->
            <div class="p-6 rounded-2xl bg-white border border-[#e1e8ff] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-6">
                  <span class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-[18px]">
                    04
                  </span>
                  <Download class="w-5 h-5 text-[#505f76]" />
                </div>
                <h3 class="text-[16px] font-bold text-[#121b2e]">Production BIM &amp; Export</h3>
                <p class="mt-3 text-[13px] text-[#505f76] leading-relaxed">
                  One-click compilation into layered AutoCAD DWG, Revit-ready IFC, presentation PDFs with schedules, or client-ready WebGL links.
                </p>
              </div>
              <div class="mt-6 pt-4 bg-[#f1f3ff] p-3 rounded-xl text-[#505f76] text-[11px] font-medium border border-[#e1e8ff]/50">
                Directly ready for city permitting &amp; contractor bid packs.
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= DUAL 2D VS 3D SHOWCASE ================= -->
      <section id="showcase" class="w-full bg-[#f1f3ff] py-20 lg:py-24 border-y border-[#e1e8ff]">
        <div class="max-w-7xl mx-auto px-6 lg:px-12">
          <div class="text-center max-w-3xl mx-auto mb-12">
            <span class="text-[11px] uppercase tracking-wider text-primary font-bold">
              Precision Dual Engine
            </span>
            <h2 class="mt-2 text-[32px] sm:text-[38px] font-bold text-[#121b2e] tracking-tight">
              Draft with architectural rigor. Present with photorealistic warmth.
            </h2>
            <p class="mt-4 text-[16px] text-[#505f76]">
              Toggle between production millimeter CAD drafting lines and warm, client-facing 3D interactive spaces.
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <!-- 2D Orthographic Side -->
            <div class="p-8 rounded-2xl bg-white border border-[#e1e8ff] shadow-sm flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between pb-4">
                  <div class="flex items-center gap-2">
                    <Compass class="w-5 h-5 text-primary" />
                    <span class="text-[18px] font-bold text-[#121b2e]">2D Orthographic Vector CAD</span>
                  </div>
                  <span class="px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[11px] font-mono text-[#505f76] font-semibold border border-[#e1e8ff]">
                    DWG Layered
                  </span>
                </div>
                <p class="text-[14px] text-[#505f76] mt-2 leading-relaxed">
                  Full architectural notation with wall thickness standards (4" interior, 8" load-bearing), door clearance arcs, window mullions, and integrated plumbing schedule.
                </p>

                <!-- Vector Drawing Lines Mockup -->
                <div class="mt-6 p-4 rounded-xl bg-[#f9f9ff] border border-[#e1e8ff] shadow-inner relative overflow-hidden">
                  <div class="flex justify-between items-center text-[#505f76] font-mono text-[11px] mb-2">
                    <span>WALL_EXT: 200mm Concrete</span>
                    <span>ZONE: Master Living (32m²)</span>
                  </div>
                  <div class="h-44 rounded-xl bg-white border border-dashed border-[#c2c6d8] p-3 flex flex-col justify-between">
                    <div class="flex justify-between text-[#505f76] font-mono text-[10px]">
                      <span>[0.0, 0.0]</span>
                      <span>DOOR_SWING_90°</span>
                      <span>[9.14, 0.0]</span>
                    </div>
                    <div class="flex items-center justify-center gap-3">
                      <span class="px-3 py-1 bg-primary/10 text-primary text-[11px] font-semibold rounded-lg">
                        Zone 01 • Living Room
                      </span>
                      <span class="px-3 py-1 bg-blue-100 text-blue-900 text-[11px] font-semibold rounded-lg">
                        Zone 02 • Kitchen Wet Wall
                      </span>
                    </div>
                    <div class="flex justify-between text-[#505f76] font-mono text-[10px]">
                      <span>IBC 1004.1.2 Pass</span>
                      <span>1:50 Metric Arch D</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-6 flex flex-wrap gap-2">
                <span class="px-2.5 py-1 rounded-lg bg-[#f1f3ff] text-[#505f76] text-[11px] font-medium border border-[#e1e8ff]/50">
                  Door clearance auto-snapping
                </span>
                <span class="px-2.5 py-1 rounded-lg bg-[#f1f3ff] text-[#505f76] text-[11px] font-medium border border-[#e1e8ff]/50">
                  Live dimensional tolerance
                </span>
                <span class="px-2.5 py-1 rounded-lg bg-[#f1f3ff] text-[#505f76] text-[11px] font-medium border border-[#e1e8ff]/50">
                  Electrical chase indicators
                </span>
              </div>
            </div>

            <!-- 3D Isometric Living Model Side -->
            <div class="p-8 rounded-2xl bg-white border border-[#e1e8ff] shadow-sm flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between pb-4">
                  <div class="flex items-center gap-2">
                    <Building class="w-5 h-5 text-primary" />
                    <span class="text-[18px] font-bold text-[#121b2e]">3D Isometric Spatial Model</span>
                  </div>
                  <span class="px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[11px] font-mono text-[#505f76] font-semibold border border-[#e1e8ff]">
                    Real-Time WebGL
                  </span>
                </div>
                <p class="text-[14px] text-[#505f76] mt-2 leading-relaxed">
                  Transform cold CAD vectors into emotive spatial renders complete with realistic material bounces, bespoke furniture placement, and true sunlight orientations.
                </p>

                <!-- Render Visual -->
                <div class="mt-6 rounded-xl overflow-hidden shadow-sm relative h-44 bg-[#e9edff] border border-[#e1e8ff]">
                  <img
                    class="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80"
                    alt="Isometric Scandinavian apartment perspective"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-[#121b2e]/80 via-transparent to-transparent flex items-end p-4">
                    <div class="text-white">
                      <div class="text-[13px] font-bold">Scandinavian Warm Oak Archetype</div>
                      <div class="text-[11px] text-white/80">Calculated daylight coefficient: 88.4%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-6 flex flex-wrap gap-2">
                <span class="px-2.5 py-1 rounded-lg bg-[#f1f3ff] text-[#505f76] text-[11px] font-medium border border-[#e1e8ff]/50">
                  Direct Web link sharing
                </span>
                <span class="px-2.5 py-1 rounded-lg bg-[#f1f3ff] text-[#505f76] text-[11px] font-medium border border-[#e1e8ff]/50">
                  VR headset ready
                </span>
                <span class="px-2.5 py-1 rounded-lg bg-[#f1f3ff] text-[#505f76] text-[11px] font-medium border border-[#e1e8ff]/50">
                  Furniture catalogue specs
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= CORE CAPABILITIES FEATURE GRID ================= -->
      <section id="capabilities" class="w-full bg-[#f9f9ff] py-20 lg:py-28">
        <div class="max-w-7xl mx-auto px-6 lg:px-12">
          <div class="max-w-3xl">
            <span class="text-[11px] uppercase tracking-wider text-primary font-bold">
              Enterprise Spatial Capabilities
            </span>
            <h2 class="mt-2 text-[32px] sm:text-[38px] font-bold text-[#121b2e] tracking-tight">
              Engineered for architectural studios that demand uncompromising precision.
            </h2>
          </div>

          <div class="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Feature 1 -->
            <div class="p-6 rounded-2xl bg-white border border-[#e1e8ff] shadow-sm hover:shadow-md transition-shadow">
              <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                <Ruler class="w-6 h-6" />
              </div>
              <h3 class="text-[18px] font-bold text-[#121b2e]">Millimeter-Precise Vector CAD</h3>
              <p class="mt-3 text-[14px] text-[#505f76] leading-relaxed">
                Strict geometric snapping, standardized architectural wall-hatching, and continuous dimension tick marks calibrated for real-world construction tolerances.
              </p>
            </div>

            <!-- Feature 2 -->
            <div class="p-6 rounded-2xl bg-white border border-[#e1e8ff] shadow-sm hover:shadow-md transition-shadow">
              <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 border border-amber-200/50">
                <Sun class="w-6 h-6" />
              </div>
              <h3 class="text-[18px] font-bold text-[#121b2e]">Solar &amp; Daylight Studies</h3>
              <p class="mt-3 text-[14px] text-[#505f76] leading-relaxed">
                Simulate true solar geometry for any latitude and longitude. Accurately predict natural illumination in primary living areas across all four seasons.
              </p>
            </div>

            <!-- Feature 3 -->
            <div class="p-6 rounded-2xl bg-white border border-[#e1e8ff] shadow-sm hover:shadow-md transition-shadow">
              <div class="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center mb-5 border border-blue-200/50">
                <GitBranch class="w-6 h-6" />
              </div>
              <h3 class="text-[18px] font-bold text-[#121b2e]">Smart Wet-Wall &amp; Egress Routing</h3>
              <p class="mt-3 text-[14px] text-[#505f76] leading-relaxed">
                Auto-clusters kitchen, bathroom, and utility plumbing runs along common chase walls, cutting mechanical contractor expenses by up to 22%.
              </p>
            </div>

            <!-- Feature 4 -->
            <div class="p-6 rounded-2xl bg-white border border-[#e1e8ff] shadow-sm hover:shadow-md transition-shadow">
              <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 border border-purple-200/50">
                <Palette class="w-6 h-6" />
              </div>
              <h3 class="text-[18px] font-bold text-[#121b2e]">Parametric Material Palettes</h3>
              <p class="mt-3 text-[14px] text-[#505f76] leading-relaxed">
                Swap entire interior archetypes—from Parisian Classic herringbone to Minimalist polished concrete—with a single click while recalculating BOM costs.
              </p>
            </div>

            <!-- Feature 5 -->
            <div class="p-6 rounded-2xl bg-white border border-[#e1e8ff] shadow-sm hover:shadow-md transition-shadow">
              <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-200/50">
                <Share2 class="w-6 h-6" />
              </div>
              <h3 class="text-[18px] font-bold text-[#121b2e]">Interactive Client Portals</h3>
              <p class="mt-3 text-[14px] text-[#505f76] leading-relaxed">
                Send password-protected 3D orbit previews to clients. Let them inspect layouts, leave pin-point feedback, and approve designs in their mobile browser.
              </p>
            </div>

            <!-- Feature 6 -->
            <div class="p-6 rounded-2xl bg-white border border-[#e1e8ff] shadow-sm hover:shadow-md transition-shadow">
              <div class="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-5 border border-cyan-200/50">
                <Building2 class="w-6 h-6" />
              </div>
              <h3 class="text-[18px] font-bold text-[#121b2e]">Multi-Designer Studio Sync</h3>
              <p class="mt-3 text-[14px] text-[#505f76] leading-relaxed">
                Git-like spatial version branching. Work simultaneously with junior drafters and senior partners with role-based access control and rollback states.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= TESTIMONIAL & QUANTIFIABLE STATS ================= -->
      <section class="w-full bg-[#f1f3ff] py-16 lg:py-24 border-y border-[#e1e8ff]">
        <div class="max-w-7xl mx-auto px-6 lg:px-12">
          <!-- Big Quote Card -->
          <div class="p-8 md:p-12 rounded-3xl bg-white border border-[#e1e8ff] shadow-sm flex flex-col md:flex-row items-center gap-10">
            <div class="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-2xl overflow-hidden shadow-md border border-[#e1e8ff]">
              <img
                class="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80"
                alt="Portrait of Principal Architect Elena Rostova"
              />
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-1 text-amber-500 mb-4">
                <Star v-for="i in 5" :key="i" class="w-5 h-5 fill-current" />
              </div>
              <blockquote class="text-[20px] sm:text-[24px] font-bold text-[#121b2e] leading-snug">
                “Planora reduced our initial feasibility drafting phase from 4 days to 20 minutes. It is without question the Figma for architectural spatial planning.”
              </blockquote>
              <div class="mt-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[#505f76] text-[14px]">
                <span class="font-bold text-[#121b2e]">Elena Rostova, AIA</span>
                <span class="hidden sm:inline">•</span>
                <span>Principal Architect at Forma Studio, Copenhagen</span>
              </div>
            </div>
          </div>

          <!-- Stats Bar -->
          <div class="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div class="p-6 rounded-2xl bg-white border border-[#e1e8ff] shadow-xs">
              <div class="text-[36px] font-bold text-primary">48.5 hrs</div>
              <div class="mt-2 text-[14px] text-[#505f76] font-medium">Average drafting time saved per residential project</div>
            </div>
            <div class="p-6 rounded-2xl bg-white border border-[#e1e8ff] shadow-xs">
              <div class="text-[36px] font-bold text-primary">99.4%</div>
              <div class="mt-2 text-[14px] text-[#505f76] font-medium">Dimension accuracy rate matching physical as-built plans</div>
            </div>
            <div class="p-6 rounded-2xl bg-white border border-[#e1e8ff] shadow-xs">
              <div class="text-[36px] font-bold text-primary">1.2M+</div>
              <div class="mt-2 text-[14px] text-[#505f76] font-medium">Production-grade floor plans generated to date</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= TRANSPARENT PRICING ================= -->
      <section id="pricing" class="w-full bg-[#f9f9ff] py-20 lg:py-28">
        <div class="max-w-7xl mx-auto px-6 lg:px-12">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <span class="text-[11px] uppercase tracking-wider text-primary font-bold">
              Transparent Studio Pricing
            </span>
            <h2 class="mt-2 text-[32px] sm:text-[38px] font-bold text-[#121b2e] tracking-tight">
              Predictable scale for solo creators and international firms.
            </h2>
            <p class="mt-4 text-[16px] text-[#505f76]">
              No credit card required to start drafting. Upgrade as your spatial pipeline expands.
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            <!-- Starter Plan -->
            <div class="p-8 rounded-2xl bg-white border border-[#e1e8ff] shadow-sm flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between">
                  <h3 class="text-[16px] font-bold text-[#121b2e]">Community Starter</h3>
                  <span class="px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[11px] text-[#505f76] font-semibold">
                    Free Forever
                  </span>
                </div>
                <p class="mt-2 text-[13px] text-[#505f76]">Essential generative tools for solo interior enthusiasts and students.</p>
                <div class="mt-6 flex items-baseline gap-1">
                  <span class="text-[36px] font-bold text-[#121b2e]">$0</span>
                  <span class="text-[13px] text-[#505f76]">/ month</span>
                </div>
                <ul class="mt-8 space-y-3 text-[13px] text-[#505f76]">
                  <li class="flex items-center gap-2.5"><Check class="w-4 h-4 text-primary shrink-0" /> 3 active spatial projects</li>
                  <li class="flex items-center gap-2.5"><Check class="w-4 h-4 text-primary shrink-0" /> Standard 2D PDF blueprints</li>
                  <li class="flex items-center gap-2.5"><Check class="w-4 h-4 text-primary shrink-0" /> WebGL 3D preview mode</li>
                  <li class="flex items-center gap-2.5 text-[#505f76]/60"><X class="w-4 h-4 text-[#c2c6d8] shrink-0" /> DWG / DXF vector CAD export</li>
                  <li class="flex items-center gap-2.5 text-[#505f76]/60"><X class="w-4 h-4 text-[#c2c6d8] shrink-0" /> Custom material library upload</li>
                </ul>
              </div>
              <div class="mt-8 pt-4">
                <button
                  type="button"
                  class="w-full inline-flex items-center justify-center h-11 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] text-[#121b2e] font-semibold text-[13px] transition-colors cursor-pointer"
                  @click="handleLaunchWorkspace"
                >
                  Start Free Workspace
                </button>
              </div>
            </div>

            <!-- Professional Plan (Highlighted) -->
            <div class="relative p-8 rounded-2xl bg-white border-2 border-primary shadow-xl flex flex-col justify-between">
              <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                Most Popular for Studios
              </div>
              <div>
                <div class="flex items-center justify-between">
                  <h3 class="text-[16px] font-bold text-[#121b2e]">Studio Professional</h3>
                  <span class="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                    v4.2 Engine
                  </span>
                </div>
                <p class="mt-2 text-[13px] text-[#505f76]">Full parametric CAD synthesis for practicing architects and interior firms.</p>
                <div class="mt-6 flex items-baseline gap-1">
                  <span class="text-[36px] font-bold text-[#121b2e]">$49</span>
                  <span class="text-[13px] text-[#505f76]">/ month billed annually</span>
                </div>
                <ul class="mt-8 space-y-3 text-[13px] text-[#121b2e]">
                  <li class="flex items-center gap-2.5"><Check class="w-4 h-4 text-primary shrink-0" /> Unlimited spatial projects</li>
                  <li class="flex items-center gap-2.5"><Check class="w-4 h-4 text-primary shrink-0" /> Layered DWG, DXF &amp; BIM IFC exports</li>
                  <li class="flex items-center gap-2.5"><Check class="w-4 h-4 text-primary shrink-0" /> 60 FPS isometric ray-traced 3D viewports</li>
                  <li class="flex items-center gap-2.5"><Check class="w-4 h-4 text-primary shrink-0" /> Unbranded client presentation web links</li>
                  <li class="flex items-center gap-2.5"><Check class="w-4 h-4 text-primary shrink-0" /> Priority AI constraint solver processing</li>
                </ul>
              </div>
              <div class="mt-8 pt-4">
                <button
                  type="button"
                  class="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-primary hover:bg-[#0047ba] text-white font-semibold text-[13px] shadow-[0_2px_8px_rgba(0,82,214,0.3)] transition-all cursor-pointer"
                  @click="handleLaunchWorkspace"
                >
                  <span>Start 14-Day Free Trial</span>
                  <ArrowRight class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Enterprise Plan -->
            <div class="p-8 rounded-2xl bg-white border border-[#e1e8ff] shadow-sm flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between">
                  <h3 class="text-[16px] font-bold text-[#121b2e]">Enterprise &amp; Developer</h3>
                  <span class="px-2.5 py-0.5 rounded-full bg-[#f1f3ff] text-[11px] text-[#505f76] font-semibold">
                    Custom Scale
                  </span>
                </div>
                <p class="mt-2 text-[13px] text-[#505f76]">High-throughput automated spatial synthesis for major homebuilders.</p>
                <div class="mt-6 flex items-baseline gap-1">
                  <span class="text-[36px] font-bold text-[#121b2e]">Custom</span>
                  <span class="text-[13px] text-[#505f76]">pricing</span>
                </div>
                <ul class="mt-8 space-y-3 text-[13px] text-[#505f76]">
                  <li class="flex items-center gap-2.5"><Check class="w-4 h-4 text-primary shrink-0" /> Dedicated CAD synthesis server cluster</li>
                  <li class="flex items-center gap-2.5"><Check class="w-4 h-4 text-primary shrink-0" /> Programmatic REST API &amp; Revit Webhook</li>
                  <li class="flex items-center gap-2.5"><Check class="w-4 h-4 text-primary shrink-0" /> Custom municipal code rule validation</li>
                  <li class="flex items-center gap-2.5"><Check class="w-4 h-4 text-primary shrink-0" /> SSO (Okta, Azure AD) &amp; SOC2 Type II SLA</li>
                  <li class="flex items-center gap-2.5"><Check class="w-4 h-4 text-primary shrink-0" /> Dedicated architectural BIM specialist</li>
                </ul>
              </div>
              <div class="mt-8 pt-4">
                <button
                  type="button"
                  class="w-full inline-flex items-center justify-center h-11 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] text-[#121b2e] font-semibold text-[13px] transition-colors cursor-pointer"
                  @click="handleLaunchWorkspace"
                >
                  Contact Architecture Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= HIGH CONVERSION BOTTOM CTA BANNER ================= -->
      <section class="w-full bg-[#f9f9ff] pb-20 lg:pb-28">
        <div class="max-w-7xl mx-auto px-6 lg:px-12">
          <div class="relative rounded-3xl bg-[#121b2e] text-white p-10 md:p-16 overflow-hidden shadow-2xl border border-white/10">
            <!-- Blueprint Grid Graphic Underlay -->
            <div
              class="pointer-events-none absolute inset-0 opacity-15"
              style="background-image: linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px); background-size: 32px 32px;"
            ></div>
            <div class="pointer-events-none absolute -right-20 -bottom-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>

            <div class="relative z-10 max-w-2xl">
              <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-[11px] font-bold uppercase tracking-wider mb-6 border border-white/10">
                <Building2 class="w-3.5 h-3.5" /> Instant CAD Synthesis Ready
              </span>
              <h2 class="text-[32px] sm:text-[42px] font-bold text-white tracking-tight leading-[1.15]">
                Ready to elevate your spatial architecture workflow?
              </h2>
              <p class="mt-4 text-[16px] text-white/80 leading-relaxed">
                Synthesize precision millimeter-accurate floor plans and interactive 3D spatial models in under 2 minutes.
              </p>
              <div class="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  type="button"
                  class="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-primary hover:bg-[#0047ba] text-white font-semibold text-[14px] shadow-[0_4px_16px_rgba(0,82,214,0.4)] transition-all cursor-pointer"
                  @click="handleLaunchWorkspace"
                >
                  <Sparkles class="w-4 h-4" />
                  <span>Launch Free CAD Workspace</span>
                </button>
                <button
                  type="button"
                  class="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-[14px] transition-colors border border-white/10 cursor-pointer"
                  @click="scrollToSandbox"
                >
                  <span>Book Studio Walkthrough</span>
                </button>
              </div>
              <div class="mt-8 flex flex-wrap items-center gap-6 text-white/60 text-[12px] font-medium">
                <span class="flex items-center gap-1.5"><CheckCircle2 class="w-4 h-4 text-blue-300" /> No install required</span>
                <span class="flex items-center gap-1.5"><Building class="w-4 h-4 text-blue-300" /> macOS, Windows, iPadOS WebGL</span>
                <span class="flex items-center gap-1.5"><ShieldCheck class="w-4 h-4 text-blue-300" /> ISO 27001</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Global Footer -->
    <footer class="w-full bg-white border-t border-[#e9edff] pt-16 pb-12 shadow-xs">
      <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-16">
          <div class="lg:col-span-2 flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
                <LayoutGrid class="w-4 h-4 text-white" />
              </div>
              <span class="text-[18px] font-bold text-[#121b2e] tracking-tight">
                Planora<span class="text-primary font-bold">.ai</span>
              </span>
            </div>
            <p class="text-[13px] text-[#505f76] max-w-sm leading-relaxed">
              Spatial intelligence and generative architectural CAD synthesis for modern architects, interior designers, and real estate developers.
            </p>
            <div class="flex items-center gap-2 pt-2">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f1f3ff] text-[#505f76] text-[11px] font-semibold border border-[#e1e8ff]">
                <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>v4.2 Live CAD Engine
              </span>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f1f3ff] text-[#505f76] text-[11px] font-semibold border border-[#e1e8ff]">
                <ShieldCheck class="w-3.5 h-3.5 text-primary" />ISO 27001 Certified
              </span>
            </div>
          </div>

          <div class="flex flex-col gap-3 text-[13px]">
            <span class="font-bold text-[#121b2e] uppercase tracking-wider text-[11px]">Product</span>
            <a class="text-[#505f76] hover:text-primary transition-colors" href="#pipeline">Generative Layouts</a>
            <a class="text-[#505f76] hover:text-primary transition-colors" href="#showcase">Studio CAD</a>
            <a class="text-[#505f76] hover:text-primary transition-colors" href="#showcase">3D Spatial Engine</a>
            <a class="text-[#505f76] hover:text-primary transition-colors" href="#capabilities">BIM &amp; DXF Export</a>
          </div>

          <div class="flex flex-col gap-3 text-[13px]">
            <span class="font-bold text-[#121b2e] uppercase tracking-wider text-[11px]">Solutions</span>
            <a class="text-[#505f76] hover:text-primary transition-colors" href="#capabilities">Architectural Studios</a>
            <a class="text-[#505f76] hover:text-primary transition-colors" href="#capabilities">Interior Designers</a>
            <a class="text-[#505f76] hover:text-primary transition-colors" href="#capabilities">Real Estate Staging</a>
            <a class="text-[#505f76] hover:text-primary transition-colors" href="#pricing">Enterprise Teams</a>
          </div>

          <div class="flex flex-col gap-3 text-[13px]">
            <span class="font-bold text-[#121b2e] uppercase tracking-wider text-[11px]">Company</span>
            <a class="text-[#505f76] hover:text-primary transition-colors" href="#">About Us</a>
            <a class="text-[#505f76] hover:text-primary transition-colors" href="#">Careers</a>
            <a class="text-[#505f76] hover:text-primary transition-colors" href="#">AI CAD Research</a>
            <a class="text-[#505f76] hover:text-primary transition-colors" href="#">Contact Sales</a>
          </div>

          <div class="flex flex-col gap-3 text-[13px]">
            <span class="font-bold text-[#121b2e] uppercase tracking-wider text-[11px]">Legal &amp; Security</span>
            <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#505f76] bg-[#f1f3ff] px-2 py-1 rounded-md w-fit border border-[#e1e8ff]">
              <ShieldCheck class="w-3.5 h-3.5 text-primary" />SOC2 Type II
            </span>
            <a class="text-[#505f76] hover:text-primary transition-colors pt-1" href="#">Privacy Policy</a>
            <a class="text-[#505f76] hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a class="text-[#505f76] hover:text-primary transition-colors" href="#">Security Whitepaper</a>
          </div>
        </div>

        <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#e9edff] text-[13px] text-[#505f76]">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span class="font-medium">All AI Spatial Inference Systems Operational</span>
          </div>
          <div>© 2025 Planora.ai Inc. Precision spatial planning engineered for scale.</div>
        </div>
      </div>
    </footer>
  </div>
</template>
