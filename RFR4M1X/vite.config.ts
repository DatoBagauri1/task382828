import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }
          if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('\\react\\')) {
            return 'core';
          }
          if (id.includes('framer-motion')) {
            return 'motion';
          }
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('\\zod\\')) {
            return 'forms';
          }
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          if (id.includes('zustand')) {
            return 'state';
          }
          return undefined;
        },
      },
    },
  },
});
