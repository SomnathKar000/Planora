<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  LayoutGrid,
  User,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  Building2,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building,
  Ruler,
  Maximize2,
  Wand2,
  Compass,
} from '@lucide/vue';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Modes: 'signin' | 'signup'
const authMode = ref<'signin' | 'signup'>('signin');

// Form state
const fullName = ref('');
const email = ref('sarah.lin@forma-studio.com');
const password = ref('PrecisionDraft#2025');
const spatialFocus = ref('Architectural Practice / BIM CAD');
const rememberMe = ref(true);
const showPassword = ref(false);
const formError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Right showcase interactive state
const activeCadView = ref<'2d' | '3d' | 'vr'>('2d');
const activeThemeIndex = ref(0);
const themes = [
  { name: 'Cream Oak', color: '#EAE3D2' },
  { name: 'Warm Timber', color: '#A88B68' },
  { name: 'Sage Mineral', color: '#7E9A82' },
  { name: 'Nordic Slate', color: '#587B95' },
  { name: 'Industrial Noir', color: '#222933' },
];

onMounted(() => {
  if (route.path.includes('signup') || route.query.mode === 'signup') {
    authMode.value = 'signup';
    email.value = '';
    password.value = '';
  }
});

function switchMode(mode: 'signin' | 'signup') {
  authMode.value = mode;
  formError.value = null;
  successMessage.value = null;
  if (mode === 'signup' && email.value === 'sarah.lin@forma-studio.com') {
    email.value = '';
    password.value = '';
  } else if (mode === 'signin' && !email.value) {
    email.value = 'sarah.lin@forma-studio.com';
    password.value = 'PrecisionDraft#2025';
  }
}

function fillDemoSarah() {
  authMode.value = 'signin';
  email.value = 'sarah.lin@forma-studio.com';
  password.value = 'PrecisionDraft#2025';
  formError.value = null;
}

// Password strength calculation
const passwordStrength = computed(() => {
  const p = password.value;
  if (!p) return { score: 0, label: 'Enter a strong workstation key' };
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) score++;

  if (score <= 1) return { score: 1, label: 'CAD Security Tier: Weak (add length & symbols)' };
  if (score === 2) return { score: 2, label: 'CAD Security Tier: Moderate' };
  if (score === 3) return { score: 3, label: 'CAD Security Tier: Good (meets studio standard)' };
  return { score: 4, label: 'CAD Security Tier: High (14+ chars, alphanumeric + symbols)' };
});

async function handleSubmit() {
  formError.value = null;
  successMessage.value = null;

  if (!email.value || !email.value.includes('@')) {
    formError.value = 'Please enter a valid work email address.';
    return;
  }
  if (!password.value || password.value.length < 6) {
    formError.value = 'Master workstation password must be at least 6 characters.';
    return;
  }

  if (authMode.value === 'signup') {
    if (!fullName.value.trim()) {
      formError.value = 'Please enter your full name or architectural studio title.';
      return;
    }

    const success = await authStore.register(
      email.value,
      password.value,
      fullName.value,
      spatialFocus.value
    );

    if (success) {
      successMessage.value = 'CAD workspace initialized successfully! Redirecting to projects...';
      setTimeout(() => {
        const redirect = (route.query.redirect as string) || '/projects';
        router.push(redirect);
      }, 700);
    } else {
      formError.value = authStore.error || 'Failed to create CAD workspace account.';
    }
  } else {
    const success = await authStore.login(email.value, password.value, rememberMe.value);
    if (success) {
      const redirect = (route.query.redirect as string) || '/projects';
      router.push(redirect);
    } else {
      formError.value = authStore.error || 'Invalid workstation email or password.';
    }
  }
}

function handleSso(provider: string) {
  formError.value = null;
  successMessage.value = `Authenticating through ${provider} Enterprise Identity...`;
  setTimeout(() => {
    email.value = 'sarah.lin@forma-studio.com';
    password.value = 'PrecisionDraft#2025';
    handleSubmit();
  }, 600);
}
</script>

<template>
  <div class="min-h-screen bg-[#f9f9ff] text-[#121b2e] antialiased flex flex-col font-sans">
    <!-- Top Global Header -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-[#f9f9ff]/85 backdrop-blur-xl border-b border-[#e9edff] shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div class="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        <div class="flex items-center gap-6">
          <router-link to="/" class="flex items-center gap-2 group">
            <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <LayoutGrid class="w-4 h-4 text-white" />
            </div>
            <span class="text-[18px] font-bold tracking-tight text-[#121b2e]">
              Planora<span class="text-primary font-bold">.ai</span>
            </span>
          </router-link>

          <div class="h-4 w-px bg-[#c2c6d8]/40 hidden sm:block"></div>

          <router-link
            to="/"
            class="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold text-[#505f76] hover:text-[#121b2e] transition-colors"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>Back to website</span>
          </router-link>
        </div>

        <!-- Compliance & Security Status Badges -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f1f3ff] border border-[#e1e8ff] shadow-sm">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span class="text-[11px] font-semibold text-[#505f76] uppercase tracking-wider">SOC2 Certified</span>
          </div>
          <div class="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f1f3ff] border border-[#e1e8ff] shadow-sm">
            <ShieldCheck class="w-3.5 h-3.5 text-primary" />
            <span class="text-[11px] font-semibold text-[#505f76]">ISO/IEC 27001 Workspace</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="flex-1 pt-16 flex flex-col justify-center relative">
      <div class="relative w-full min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <!-- Ambient subtle CAD grid pattern -->
        <div
          class="absolute inset-0 pointer-events-none opacity-[0.035]"
          style="background-image: linear-gradient(to right, #0052d6 1px, transparent 1px), linear-gradient(to bottom, #0052d6 1px, transparent 1px); background-size: 32px 32px;"
        ></div>

        <!-- Main Auth Master Card -->
        <div class="relative z-10 w-full max-w-6xl bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(18,27,46,0.08),0_1px_3px_rgba(18,27,46,0.04)] border border-[#e1e8ff] overflow-hidden flex flex-col lg:flex-row">
          
          <!-- ================= LEFT PANEL: AUTH FORM ================= -->
          <div class="w-full lg:w-[500px] xl:w-[520px] p-8 sm:p-10 lg:p-12 flex flex-col justify-between bg-white shrink-0">
            <div>
              <!-- Header: App identity & context -->
              <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-[0_4px_12px_rgba(0,82,214,0.3)]">
                    <LayoutGrid class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span class="text-[20px] font-bold tracking-tight text-[#121b2e]">
                      Planora<span class="text-primary">.ai</span>
                    </span>
                    <span class="block text-[11px] text-[#505f76] font-semibold tracking-wide">
                      CAD &amp; Spatial Synthesis
                    </span>
                  </div>
                </div>

                <!-- Precision version status tag -->
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f1f3ff] border border-[#e1e8ff]">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  <span class="text-[11px] font-bold text-[#505f76] tracking-wider">v4.2 PRO</span>
                </div>
              </div>

              <!-- Interactive Mode Segmented Pill -->
              <div class="w-full p-1 bg-[#e9edff] rounded-xl flex items-center mb-6 shadow-inner">
                <button
                  type="button"
                  id="tab-signin"
                  class="flex-1 py-2 text-center rounded-lg text-[13px] transition-all duration-200"
                  :class="authMode === 'signin'
                    ? 'bg-white text-primary shadow-[0_2px_6px_rgba(0,0,0,0.06)] font-bold'
                    : 'text-[#505f76] hover:text-[#121b2e] font-medium'"
                  @click="switchMode('signin')"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  id="tab-signup"
                  class="flex-1 py-2 text-center rounded-lg text-[13px] transition-all duration-200"
                  :class="authMode === 'signup'
                    ? 'bg-white text-primary shadow-[0_2px_6px_rgba(0,0,0,0.06)] font-bold'
                    : 'text-[#505f76] hover:text-[#121b2e] font-medium'"
                  @click="switchMode('signup')"
                >
                  Create Account
                </button>
              </div>

              <!-- Quick Demo Autofill Notice -->
              <div
                v-if="authMode === 'signin'"
                class="mb-4 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 flex items-center justify-between text-[12px] text-blue-900 cursor-pointer hover:bg-blue-100/70 transition-colors"
                @click="fillDemoSarah"
              >
                <div class="flex items-center gap-2">
                  <Sparkles class="w-4 h-4 text-primary shrink-0" />
                  <span>Demo Architect: <strong>sarah.lin@forma-studio.com</strong></span>
                </div>
                <span class="text-primary font-semibold text-[11px] underline shrink-0">Auto-fill</span>
              </div>

              <!-- Error & Success Alerts -->
              <div
                v-if="formError"
                class="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px] flex items-start gap-2.5"
              >
                <AlertCircle class="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <span>{{ formError }}</span>
              </div>
              <div
                v-if="successMessage"
                class="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] flex items-start gap-2.5"
              >
                <CheckCircle2 class="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>{{ successMessage }}</span>
              </div>

              <!-- SSO Options Stack -->
              <div class="space-y-2.5 mb-6">
                <!-- Google SSO -->
                <button
                  type="button"
                  class="w-full h-11 px-4 rounded-xl bg-white hover:bg-[#f1f3ff] text-[#121b2e] text-[13px] font-semibold flex items-center justify-center gap-3 transition-colors border border-[#e1e8ff] shadow-sm active:scale-[0.99] cursor-pointer"
                  @click="handleSso('Google')"
                >
                  <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <!-- Dual Row: Apple + Autodesk SSO -->
                <div class="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    class="h-10 px-3 rounded-xl bg-white hover:bg-[#f1f3ff] text-[#121b2e] text-[12px] font-semibold flex items-center justify-center gap-2 transition-colors border border-[#e1e8ff] shadow-sm active:scale-[0.99] cursor-pointer"
                    @click="handleSso('Apple')"
                  >
                    <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.76 1.05-1.82.93-2.88-1 .04-2.19.67-2.88 1.48-.56.65-1.05 1.73-.92 2.76 1.12.09 2.25-.6 2.87-1.36"></path>
                    </svg>
                    <span>Apple</span>
                  </button>
                  <button
                    type="button"
                    class="h-10 px-3 rounded-xl bg-white hover:bg-[#f1f3ff] text-[#121b2e] text-[12px] font-semibold flex items-center justify-center gap-2 transition-colors border border-[#e1e8ff] shadow-sm active:scale-[0.99] cursor-pointer"
                    @click="handleSso('Autodesk')"
                  >
                    <svg class="w-4 h-4 text-[#00638e]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <span>Autodesk / BIM</span>
                  </button>
                </div>
              </div>

              <!-- Hairline Divider -->
              <div class="relative flex items-center justify-center my-6">
                <div class="w-full h-px bg-[#e1e8ff]"></div>
                <span class="absolute px-3 bg-white text-[11px] uppercase tracking-wider text-[#505f76] font-semibold">
                  or architectural work email
                </span>
              </div>

              <!-- Form Area -->
              <form class="space-y-4" @submit.prevent="handleSubmit">
                <!-- Full Name (Sign Up only) -->
                <div v-if="authMode === 'signup'" class="transition-all duration-200">
                  <label class="block text-[12px] font-semibold text-[#121b2e] mb-1.5">
                    Full Name &amp; Studio Credentials
                  </label>
                  <div class="relative flex items-center">
                    <User class="w-4 h-4 text-[#505f76] absolute left-3.5 pointer-events-none" />
                    <input
                      v-model="fullName"
                      type="text"
                      placeholder="Sarah Lin, AIA"
                      class="w-full h-11 pl-10 pr-4 rounded-xl bg-[#f1f3ff] text-[#121b2e] placeholder:text-[#505f76]/60 text-[14px] border border-transparent focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <!-- Email Address Input -->
                <div>
                  <label class="block text-[12px] font-semibold text-[#121b2e] mb-1.5">
                    Work Email Address
                  </label>
                  <div class="relative flex items-center">
                    <AtSign class="w-4 h-4 text-[#505f76] absolute left-3.5 pointer-events-none" />
                    <input
                      v-model="email"
                      type="email"
                      placeholder="architect@studio.design"
                      class="w-full h-11 pl-10 pr-4 rounded-xl bg-[#f1f3ff] text-[#121b2e] placeholder:text-[#505f76]/60 text-[14px] border border-transparent focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <!-- Primary Spatial Focus (Sign Up only) -->
                <div v-if="authMode === 'signup'" class="transition-all duration-200">
                  <label class="block text-[12px] font-semibold text-[#121b2e] mb-1.5">
                    Primary Spatial Focus
                  </label>
                  <div class="relative flex items-center">
                    <Building2 class="w-4 h-4 text-[#505f76] absolute left-3.5 pointer-events-none" />
                    <select
                      v-model="spatialFocus"
                      class="w-full h-11 pl-10 pr-8 rounded-xl bg-[#f1f3ff] text-[#121b2e] text-[14px] border border-transparent appearance-none focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
                    >
                      <option value="Architectural Practice / BIM CAD">Architectural Practice / BIM CAD</option>
                      <option value="Interior Designer & Space Planner">Interior Designer &amp; Space Planner</option>
                      <option value="Real Estate Development / Staging">Real Estate Development / Staging</option>
                      <option value="Homeowner / Residential Renovation">Homeowner / Residential Renovation</option>
                    </select>
                    <ChevronDown class="w-4 h-4 text-[#505f76] absolute right-3 pointer-events-none" />
                  </div>
                </div>

                <!-- Password Input -->
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="text-[12px] font-semibold text-[#121b2e]">
                      Master Workstation Password
                    </label>
                    <button
                      v-if="authMode === 'signin'"
                      type="button"
                      class="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                      @click="fillDemoSarah"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div class="relative flex items-center">
                    <Lock class="w-4 h-4 text-[#505f76] absolute left-3.5 pointer-events-none" />
                    <input
                      v-model="password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="Enter secure key"
                      class="w-full h-11 pl-10 pr-10 rounded-xl bg-[#f1f3ff] text-[#121b2e] placeholder:text-[#505f76]/60 text-[14px] tracking-wide border border-transparent focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      class="absolute right-3 text-[#505f76] hover:text-[#121b2e] p-1 flex items-center justify-center transition-colors cursor-pointer"
                      @click="showPassword = !showPassword"
                    >
                      <EyeOff v-if="showPassword" class="w-4 h-4" />
                      <Eye v-else class="w-4 h-4" />
                    </button>
                  </div>

                  <!-- Password strength meter for sign up -->
                  <div v-if="authMode === 'signup'" class="mt-2 pt-1">
                    <div class="flex items-center gap-1.5 mb-1">
                      <div
                        class="h-1 flex-1 rounded-full transition-colors"
                        :class="passwordStrength.score >= 1 ? 'bg-primary' : 'bg-[#e1e8ff]'"
                      ></div>
                      <div
                        class="h-1 flex-1 rounded-full transition-colors"
                        :class="passwordStrength.score >= 2 ? 'bg-primary' : 'bg-[#e1e8ff]'"
                      ></div>
                      <div
                        class="h-1 flex-1 rounded-full transition-colors"
                        :class="passwordStrength.score >= 3 ? 'bg-primary' : 'bg-[#e1e8ff]'"
                      ></div>
                      <div
                        class="h-1 flex-1 rounded-full transition-colors"
                        :class="passwordStrength.score >= 4 ? 'bg-primary' : 'bg-[#e1e8ff]'"
                      ></div>
                    </div>
                    <span class="text-[11px] font-semibold text-primary">
                      {{ passwordStrength.label }}
                    </span>
                  </div>
                </div>

                <!-- Remember me row (Sign In) -->
                <div v-if="authMode === 'signin'" class="flex items-center justify-between pt-1">
                  <label class="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      v-model="rememberMe"
                      type="checkbox"
                      class="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                    />
                    <span class="text-[13px] text-[#505f76]">Keep active CAD session (30 days)</span>
                  </label>
                </div>

                <!-- Terms Disclaimer (Sign Up only) -->
                <div v-if="authMode === 'signup'" class="pt-1">
                  <p class="text-[11px] text-[#505f76] leading-relaxed">
                    By creating a CAD workspace, you agree to Planora's
                    <a class="text-primary hover:underline font-semibold" href="#">Terms of Precision</a> and
                    <a class="text-primary hover:underline font-semibold" href="#">Spatial Privacy Standards</a>.
                  </p>
                </div>

                <!-- Primary Action CTA Button -->
                <div class="pt-2">
                  <button
                    type="submit"
                    id="btn-submit"
                    :disabled="authStore.isLoading"
                    class="w-full h-11 px-5 rounded-xl bg-primary hover:bg-[#0047ba] active:bg-[#003ea6] text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-[0_8px_20px_-4px_rgba(0,82,214,0.45)] transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
                  >
                    <Compass
                      v-if="!authStore.isLoading"
                      class="w-4 h-4 group-hover:rotate-45 transition-transform duration-300 shrink-0 text-white"
                    />
                    <span v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>

                    <span class="text-white font-semibold">
                      {{ authMode === 'signup' ? 'Create Professional CAD Account' : 'Sign In to CAD Workspace' }}
                    </span>

                    <ArrowRight
                      v-if="!authStore.isLoading"
                      class="w-4 h-4 group-hover:translate-x-0.5 transition-transform shrink-0 text-white"
                    />
                  </button>
                </div>
              </form>
            </div>

            <!-- Security & Compliance Footer Footnote -->
            <div class="mt-8 pt-6 flex items-center justify-between border-t border-[#e9edff]">
              <div class="flex items-center gap-2">
                <ShieldCheck class="w-4 h-4 text-primary" />
                <span class="text-[11px] font-semibold text-[#505f76]">AES-256 Vector Vault</span>
              </div>
              <div class="flex items-center gap-1.5 text-[#505f76]">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span class="text-[11px] font-semibold">All Systems Nominal</span>
              </div>
            </div>
          </div>

          <!-- ================= RIGHT PANEL: ARCHITECTURAL CAD SHOWCASE ================= -->
          <div class="flex-1 bg-[#f1f3ff] p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden border-t lg:border-t-0 lg:border-l border-[#e1e8ff]">
            <!-- Subtle Top Blueprint Specs HUD -->
            <div class="flex flex-wrap items-center justify-between gap-3 relative z-10 mb-6">
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-md shadow-sm border border-[#e1e8ff]">
                <Building class="w-3.5 h-3.5 text-primary" />
                <span class="text-[12px] font-semibold text-[#121b2e]">Downtown Loft 4B</span>
                <span class="text-[#505f76]/50 text-[11px]">•</span>
                <span class="text-[11px] text-[#505f76]">30 × 20 ft (600 sq ft)</span>
              </div>

              <!-- Ortho / 3D / VR switcher -->
              <div class="flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-lg shadow-sm border border-[#e1e8ff]">
                <button
                  type="button"
                  class="px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer"
                  :class="activeCadView === '2d'
                    ? 'font-semibold bg-primary text-white shadow-sm'
                    : 'font-medium text-[#505f76] hover:text-[#121b2e]'"
                  @click="activeCadView = '2d'"
                >
                  2D Ortho
                </button>
                <button
                  type="button"
                  class="px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer"
                  :class="activeCadView === '3d'
                    ? 'font-semibold bg-primary text-white shadow-sm'
                    : 'font-medium text-[#505f76] hover:text-[#121b2e]'"
                  @click="activeCadView = '3d'"
                >
                  Isometric 3D
                </button>
                <button
                  type="button"
                  class="px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer"
                  :class="activeCadView === 'vr'
                    ? 'font-semibold bg-primary text-white shadow-sm'
                    : 'font-medium text-[#505f76] hover:text-[#121b2e]'"
                  @click="activeCadView = 'vr'"
                >
                  VR Tour
                </button>
              </div>
            </div>

            <!-- Center Visual Stage: Synchronized 2D Plan & Isometric 3D Mockup -->
            <div class="relative z-10 my-auto py-4">
              <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                <!-- Left: High Precision 2D CAD Plan View -->
                <div class="md:col-span-7 bg-white rounded-xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-[#e1e8ff] relative group">
                  <!-- Dimension markers -->
                  <div class="flex items-center justify-between text-[11px] text-[#505f76] mb-2 px-2">
                    <Ruler class="w-3.5 h-3.5" />
                    <span class="font-mono tracking-tight font-semibold text-[#121b2e]">30 ft — PRIMARY SPAN</span>
                    <Ruler class="w-3.5 h-3.5" />
                  </div>

                  <!-- Architectural CAD Floor Plan Visual -->
                  <div class="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#f4f6fb] border border-[#d9e2fc] flex items-center justify-center p-2">
                    <!-- Clean Vector AutoCAD schematic blueprint of 4-room apartment -->
                    <svg class="w-full h-full" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <!-- Outer boundary walls -->
                      <rect x="10" y="10" width="280" height="180" rx="4" fill="#ffffff" stroke="#121b2e" stroke-width="4"/>
                      <!-- Interior dividing walls -->
                      <line x1="160" y1="10" x2="160" y2="190" stroke="#121b2e" stroke-width="3"/>
                      <line x1="10" y1="110" x2="160" y2="110" stroke="#121b2e" stroke-width="3"/>
                      <line x1="160" y1="100" x2="290" y2="100" stroke="#121b2e" stroke-width="3"/>

                      <!-- Living Room (Top-Left) -->
                      <rect x="12" y="12" width="146" height="96" fill="#e8f0fe" fill-opacity="0.5"/>
                      <text x="85" y="55" fill="#1e3a8a" font-size="11" font-weight="700" text-anchor="middle" font-family="system-ui">LIVING ROOM</text>
                      <text x="85" y="70" fill="#64748b" font-size="8" text-anchor="middle" font-family="system-ui">16' × 11' • 176 sq ft</text>
                      <!-- Sofa schematic -->
                      <rect x="25" y="25" width="45" height="18" rx="2" fill="#cbd5e1" stroke="#94a3b8"/>
                      <rect x="35" y="50" width="25" height="14" rx="2" fill="#e2e8f0" stroke="#94a3b8"/>

                      <!-- Kitchen & Dining (Bottom-Left) -->
                      <rect x="12" y="112" width="146" height="76" fill="#fef3c7" fill-opacity="0.4"/>
                      <text x="85" y="148" fill="#92400e" font-size="11" font-weight="700" text-anchor="middle" font-family="system-ui">KITCHEN / DINING</text>
                      <text x="85" y="162" fill="#64748b" font-size="8" text-anchor="middle" font-family="system-ui">16' × 9' • 144 sq ft</text>
                      <!-- Island Counter -->
                      <rect x="40" y="120" width="50" height="12" rx="1" fill="#fcd34d" stroke="#d97706"/>

                      <!-- Primary Bedroom (Top-Right) -->
                      <rect x="162" y="12" width="126" height="86" fill="#f3e8ff" fill-opacity="0.5"/>
                      <text x="225" y="50" fill="#6b21a8" font-size="11" font-weight="700" text-anchor="middle" font-family="system-ui">BEDROOM</text>
                      <text x="225" y="65" fill="#64748b" font-size="8" text-anchor="middle" font-family="system-ui">14' × 10' • 140 sq ft</text>
                      <!-- Bed schematic -->
                      <rect x="200" y="20" width="36" height="42" rx="2" fill="#e9d5ff" stroke="#a855f7"/>

                      <!-- Bathroom & Storage (Bottom-Right) -->
                      <rect x="162" y="102" width="126" height="86" fill="#e0f2fe" fill-opacity="0.5"/>
                      <text x="225" y="142" fill="#0369a1" font-size="11" font-weight="700" text-anchor="middle" font-family="system-ui">BATHROOM</text>
                      <text x="225" y="156" fill="#64748b" font-size="8" text-anchor="middle" font-family="system-ui">14' × 9' • 126 sq ft</text>
                      <!-- Vanity & Tub -->
                      <rect x="175" y="112" width="24" height="16" rx="2" fill="#bae6fd" stroke="#0284c7"/>
                      <rect x="235" y="112" width="40" height="20" rx="3" fill="#bae6fd" stroke="#0284c7"/>

                      <!-- Dimension lines -->
                      <line x1="10" y1="5" x2="290" y2="5" stroke="#0052d6" stroke-width="1" stroke-dasharray="2 2"/>
                      <circle cx="10" cy="5" r="2" fill="#0052d6"/>
                      <circle cx="290" cy="5" r="2" fill="#0052d6"/>
                    </svg>

                    <!-- Floating Canvas CAD HUD Dock -->
                    <div class="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-[#e1e8ff] flex items-center gap-3">
                      <span class="flex items-center gap-1.5 text-[11px] text-primary font-semibold">
                        <Wand2 class="w-3.5 h-3.5" />
                        Auto-Arranged
                      </span>
                      <div class="w-px h-3 bg-[#c2c6d8]/60"></div>
                      <span class="flex items-center gap-1.5 text-[11px] text-[#505f76] font-medium">
                        <Ruler class="w-3.5 h-3.5" />
                        4 Rooms
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Right: Synchronized 3D Isometric View & Style Swatches -->
                <div class="md:col-span-5 flex flex-col gap-4">
                  <!-- Active 3D Render Perspective Card -->
                  <div class="bg-white rounded-xl p-3 shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-[#e1e8ff]">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-[12px] font-semibold text-[#121b2e]">Spatial 3D Model</span>
                      <Maximize2 class="w-3.5 h-3.5 text-[#505f76]" />
                    </div>
                    <div class="relative aspect-square rounded-lg overflow-hidden bg-[#e9edff]">
                      <img
                        class="w-full h-full object-cover"
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=80"
                        alt="3D isometric interior rendering"
                        loading="lazy"
                      />
                      <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-white/90 backdrop-blur-sm text-[11px] text-[#121b2e] font-semibold shadow-xs">
                        Ray-traced • 60 FPS
                      </div>
                    </div>
                  </div>

                  <!-- Aesthetic Theme Swatches -->
                  <div class="bg-white rounded-xl p-3 shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-[#e1e8ff]">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-[11px] text-[#505f76] font-semibold uppercase tracking-wider">Aesthetic Theme</span>
                      <span class="text-[11px] text-primary font-semibold">{{ themes[activeThemeIndex].name }}</span>
                    </div>
                    <div class="flex items-center justify-between gap-1.5">
                      <button
                        v-for="(t, idx) in themes"
                        :key="t.name"
                        type="button"
                        :title="t.name"
                        :style="{ backgroundColor: t.color }"
                        class="w-7 h-7 rounded-full shadow-sm transition-transform cursor-pointer"
                        :class="activeThemeIndex === idx
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-white scale-110'
                          : 'hover:scale-110'"
                        @click="activeThemeIndex = idx"
                      ></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Showcase Footer: Social Proof & Parametric Spec Stats -->
            <div class="relative z-10 pt-6 border-t border-[#e1e8ff] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 class="text-[16px] font-bold text-[#121b2e]">Spatial intelligence for modern architecture.</h4>
                <p class="text-[13px] text-[#505f76]">Turn room boundaries into millimeter-precise CAD layouts in under 3 seconds.</p>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <!-- User Avatars Cluster -->
                <div class="flex -space-x-2">
                  <div class="w-8 h-8 rounded-full bg-[#b3c5ff] text-primary flex items-center justify-center font-bold text-xs ring-2 ring-[#f1f3ff]">AK</div>
                  <div class="w-8 h-8 rounded-full bg-[#d3e4fe] text-[#505f76] flex items-center justify-center font-bold text-xs ring-2 ring-[#f1f3ff]">TL</div>
                  <div class="w-8 h-8 rounded-full bg-[#c9e6ff] text-[#00638e] flex items-center justify-center font-bold text-xs ring-2 ring-[#f1f3ff]">RM</div>
                </div>
                <div>
                  <span class="block text-[12px] font-bold text-[#121b2e]">14,200+</span>
                  <span class="block text-[11px] text-[#505f76]">Licensed Studios</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>

    <!-- Bottom Global Footer -->
    <footer class="w-full bg-white border-t border-[#e9edff] py-6 shadow-xs">
      <div class="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-center sm:text-left">
          <span class="text-[13px] text-[#505f76]">© 2025 Planora AI Spatial Technologies Inc.</span>
          <span class="hidden sm:inline text-[#505f76]/40">•</span>
          <span class="text-[11px] text-[#505f76] font-semibold uppercase tracking-wide">Architectural CAD/BIM Grade Compliance</span>
        </div>
        <nav class="flex items-center gap-6 flex-wrap justify-center text-[12px] font-semibold text-[#505f76]">
          <a class="hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a class="hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a class="hover:text-primary transition-colors" href="#">Security Architecture</a>
          <a class="hover:text-primary transition-colors" href="#">System Status</a>
        </nav>
      </div>
    </footer>
  </div>
</template>
