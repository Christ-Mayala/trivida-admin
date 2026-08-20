/**
 * Vite Config — Trivida Admin Panel
 * 
 * Configure le build pour produire une SPA statique
 * qui sera servie par le backend DRY via /admin/
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Base path /admin/ uniquement en production (build)
  // En dev, on sert depuis la racine pour éviter l'erreur "did you mean /admin/"
  base: process.env.NODE_ENV === 'production' ? '/admin/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Séparer les chunks pour un cache optimal
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
        },
      },
    },
  },
  server: {
    // En dev, proxy les API vers le backend DRY
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
