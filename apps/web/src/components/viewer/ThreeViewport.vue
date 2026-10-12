<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import type { Layout } from '@planora/domain';
import { SunMedium, RotateCcw } from '@lucide/vue';

const props = defineProps<{
  layout: Layout;
  heightFt?: number;
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const currentCameraPreset = ref<'ISO' | 'TOP' | 'POV'>('ISO');
const lightingMode = ref<'golden' | 'noon' | 'evening'>('golden');

let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let animFrameId: number | null = null;
let dirLight: THREE.DirectionalLight | null = null;
let hemiLight: THREE.HemisphereLight | null = null;

// Mouse drag state for smooth orbit
let isDragging = false;
let prevMousePos = { x: 0, y: 0 };
let spherical = { radius: 18, theta: Math.PI / 4, phi: Math.PI / 3 };
const target = new THREE.Vector3(0, 1.2, 0);

function initThree() {
  if (!containerRef.value) return;

  const width = containerRef.value.clientWidth || 320;
  const height = containerRef.value.clientHeight || 280;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xF1F5F9);

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  updateCameraPosition();

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  containerRef.value.innerHTML = '';
  containerRef.value.appendChild(renderer.domElement);

  // Lights
  hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xE2E8F0, 0.7);
  scene.add(hemiLight);

  dirLight = new THREE.DirectionalLight(0xFFF7ED, 1.4);
  dirLight.position.set(10, 18, 12);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.bias = -0.001;
  scene.add(dirLight);

  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.4);
  scene.add(ambientLight);

  buildSceneGeometry();
  setupInteractions();
  startRenderLoop();
}

function updateCameraPosition() {
  if (!camera) return;

  if (currentCameraPreset.value === 'ISO') {
    spherical.radius = 16;
    spherical.theta = Math.PI / 4;
    spherical.phi = Math.PI / 3.2;
  } else if (currentCameraPreset.value === 'TOP') {
    spherical.radius = 14;
    spherical.theta = 0;
    spherical.phi = 0.05; // almost straight down
  } else if (currentCameraPreset.value === 'POV') {
    spherical.radius = 8;
    spherical.theta = Math.PI / 3;
    spherical.phi = Math.PI / 2.2;
  }

  applySphericalToCamera();
}

function applySphericalToCamera() {
  if (!camera) return;
  const sinPhi = Math.sin(spherical.phi);
  camera.position.x = target.x + spherical.radius * sinPhi * Math.sin(spherical.theta);
  camera.position.y = target.y + spherical.radius * Math.cos(spherical.phi);
  camera.position.z = target.z + spherical.radius * sinPhi * Math.cos(spherical.theta);
  camera.lookAt(target);
}

function buildSceneGeometry() {
  if (!scene) return;

  // Clear previous meshes (except lights)
  const toRemove: THREE.Object3D[] = [];
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) toRemove.push(obj);
  });
  toRemove.forEach((obj) => scene?.remove(obj));

  const W_mm = props.layout.boundary.width || 9000;
  const H_mm = props.layout.boundary.height || 6000;

  // Convert mm to 3D world meters (1000mm = 1m)
  const W_m = W_mm / 1000;
  const H_m = H_mm / 1000;
  const wallHeight = 2.7; // 2.7m height

  target.set(0, wallHeight * 0.4, 0);

  // 1. Ground / Slab
  const slabGeo = new THREE.BoxGeometry(W_m + 0.4, 0.2, H_m + 0.4);
  const slabMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.8 });
  const slab = new THREE.Mesh(slabGeo, slabMat);
  slab.position.set(0, -0.1, 0);
  slab.receiveShadow = true;
  scene.add(slab);

  // 2. Room floor plates
  for (const room of props.layout.rooms) {
    const rx_m = (room.boundary.x + room.boundary.width / 2 - W_mm / 2) / 1000;
    const rz_m = (room.boundary.y + room.boundary.height / 2 - H_mm / 2) / 1000;
    const rw_m = room.boundary.width / 1000;
    const rh_m = room.boundary.height / 1000;

    const floorGeo = new THREE.BoxGeometry(rw_m - 0.05, 0.02, rh_m - 0.05);
    const floorColor = room.color ? new THREE.Color(room.color).offsetHSL(0, -0.05, 0.05) : new THREE.Color(0xF5EFEB);
    const floorMat = new THREE.MeshStandardMaterial({
      color: floorColor,
      roughness: 0.6,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(rx_m, 0.01, rz_m);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);
  }

  // 3. Walls
  for (const wall of props.layout.walls) {
    const x1 = (wall.start.x - W_mm / 2) / 1000;
    const z1 = (wall.start.y - H_mm / 2) / 1000;
    const x2 = (wall.end.x - W_mm / 2) / 1000;
    const z2 = (wall.end.y - H_mm / 2) / 1000;

    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    if (len < 0.1) continue;

    const angle = Math.atan2(dz, dx);
    const isExt = wall.type === 'exterior';
    const wallThick = isExt ? 0.2 : 0.12;

    const wallGeo = new THREE.BoxGeometry(len, wallHeight, wallThick);
    const wallMat = new THREE.MeshStandardMaterial({
      color: isExt ? 0x273044 : 0xE2E8F0,
      roughness: 0.85,
    });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);

    wallMesh.position.set(x1 + dx / 2, wallHeight / 2, z1 + dz / 2);
    wallMesh.rotation.y = -angle;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    scene.add(wallMesh);
  }

  // 4. Furniture blocks
  for (const furn of props.layout.furniture) {
    const fx = (furn.position.x - W_mm / 2) / 1000;
    const fz = (furn.position.y - H_mm / 2) / 1000;
    const fw = (furn.width || 1000) / 1000;
    const fd = (furn.depth || 800) / 1000;
    const fh = (furn.height || 750) / 1000;

    const furnGeo = new THREE.BoxGeometry(fw, fh, fd);
    const furnMat = new THREE.MeshStandardMaterial({
      color: furn.type === 'bed' ? 0xD9D4C7 : furn.type === 'sofa' ? 0x8C8170 : 0xB39B82,
      roughness: 0.5,
    });
    const furnMesh = new THREE.Mesh(furnGeo, furnMat);
    furnMesh.position.set(fx, fh / 2 + 0.02, fz);
    furnMesh.castShadow = true;
    furnMesh.receiveShadow = true;
    scene.add(furnMesh);
  }
}

function setPreset(p: 'ISO' | 'TOP' | 'POV') {
  currentCameraPreset.value = p;
  updateCameraPosition();
}

function setLighting(mode: 'golden' | 'noon' | 'evening') {
  lightingMode.value = mode;
  if (!dirLight || !hemiLight) return;

  if (mode === 'golden') {
    dirLight.color.setHex(0xFFE4B5);
    dirLight.intensity = 1.6;
    dirLight.position.set(12, 14, 10);
    hemiLight.color.setHex(0xFFF1E6);
  } else if (mode === 'noon') {
    dirLight.color.setHex(0xFFFFFF);
    dirLight.intensity = 1.8;
    dirLight.position.set(2, 20, 2);
    hemiLight.color.setHex(0xFFFFFF);
  } else if (mode === 'evening') {
    dirLight.color.setHex(0xFDBA74);
    dirLight.intensity = 1.0;
    dirLight.position.set(-14, 8, -10);
    hemiLight.color.setHex(0xE2E8F0);
  }
}

function setupInteractions() {
  const el = containerRef.value;
  if (!el) return;

  el.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMousePos = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevMousePos.x;
    const dy = e.clientY - prevMousePos.y;
    prevMousePos = { x: e.clientX, y: e.clientY };

    spherical.theta -= dx * 0.01;
    spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, spherical.phi - dy * 0.01));
    applySphericalToCamera();
  });

  el.addEventListener('wheel', (e) => {
    e.preventDefault();
    spherical.radius = Math.max(5, Math.min(35, spherical.radius + e.deltaY * 0.015));
    applySphericalToCamera();
  }, { passive: false });
}

function startRenderLoop() {
  function animate() {
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
    animFrameId = requestAnimationFrame(animate);
  }
  animate();
}

watch(
  () => props.layout,
  () => {
    buildSceneGeometry();
  },
  { deep: true },
);

onMounted(() => {
  initThree();
});

onBeforeUnmount(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
  }
  scene?.clear();
});
</script>

<template>
  <div class="bg-surface-card rounded-2xl p-5 shadow-card border border-border-hairline flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h2 class="text-title-sm font-semibold text-content-primary">3D Viewport</h2>
        <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-caption-xs font-semibold">
          Real-time
        </span>
      </div>

      <button
        type="button"
        @click="updateCameraPosition"
        title="Reset Camera"
        class="w-7 h-7 rounded-lg flex items-center justify-center text-content-secondary hover:bg-slate-100 hover:text-content-primary transition-colors cursor-pointer"
      >
        <RotateCcw class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Main 3D Canvas Container -->
    <div
      class="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 shadow-inner group border border-border-hairline"
    >
      <div ref="containerRef" class="w-full h-full cursor-grab active:cursor-grabbing" />

      <!-- 3D Camera Preset Pills (Top Right) -->
      <div class="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md p-1 rounded-xl flex items-center gap-1 shadow-sm border border-border-hairline z-10">
        <button
          v-for="p in (['ISO', 'TOP', 'POV'] as const)"
          :key="p"
          type="button"
          @click="setPreset(p)"
          class="px-2 py-0.5 rounded-lg text-caption-xs font-bold transition-all cursor-pointer"
          :class="[
            currentCameraPreset === p
              ? 'bg-brand-primary text-white shadow-2xs'
              : 'text-content-secondary hover:text-content-primary hover:bg-slate-100'
          ]"
        >
          {{ p }}
        </button>
      </div>

      <!-- Lighting Mode Toggle (Bottom Left) -->
      <div class="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-sm border border-border-hairline z-10">
        <SunMedium class="w-3.5 h-3.5 text-brand-primary" />
        <select
          :value="lightingMode"
          @change="setLighting(($event.target as HTMLSelectElement).value as any)"
          class="text-caption-xs font-semibold text-content-primary bg-transparent outline-none cursor-pointer"
        >
          <option value="golden">Golden Hour (4 PM)</option>
          <option value="noon">Bright Noon</option>
          <option value="evening">Soft Twilight</option>
        </select>
      </div>
    </div>

    <p class="text-caption-xs text-content-secondary pt-0.5 leading-snug">
      Synchronized live with the 2D CAD layout. Click and drag to orbit 360°, scroll wheel to zoom.
    </p>
  </div>
</template>
