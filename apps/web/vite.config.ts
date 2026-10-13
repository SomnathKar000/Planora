import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@planora/domain': fileURLToPath(new URL('../../packages/domain/src/index.ts', import.meta.url)),
      '@planora/layout-engine': fileURLToPath(new URL('../../packages/layout-engine/src/index.ts', import.meta.url)),
      '@planora/shared-types': fileURLToPath(new URL('../../packages/shared-types/src/index.ts', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three/')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/jspdf/') || id.includes('node_modules/html2canvas/')) {
            return 'vendor-pdf';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
