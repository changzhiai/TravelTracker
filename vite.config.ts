import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// For GitHub Pages: if repo name is 'travel-tracker', base should be '/travel-tracker/'
// If repo is at root (username.github.io), base should be '/'
export default defineConfig({
  plugins: [react()],
  base: '/TravelTracker/', // GitHub Pages base path
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
