import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  preview: {
    host: '0.0.0.0',
    allowedHosts: ['realview-space.onrender.com'],
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          three: ['three'],
          icons: ['lucide-react'],
          modelviewer: ['@google/model-viewer'],
        },
      },
    },
  },
});
