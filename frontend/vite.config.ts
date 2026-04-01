import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/convert': 'http://localhost:8000',
      '/jobs': 'http://localhost:8000',
      '/files': 'http://localhost:8000',
      '/cache': 'http://localhost:8000',
    },
  },
  build: {
    outDir: '../frontend-dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['@tanstack/react-router'],
          'wavesurfer': ['wavesurfer.js'],
        },
      },
    },
  },
})
