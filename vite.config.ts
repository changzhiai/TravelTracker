import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// For GitHub Pages: if repo name is 'travel-tracker', base should be '/travel-tracker/'
// If repo is at root (username.github.io), base should be '/'
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_APP_TARGET === 'mobile' ? './' : '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    reportCompressedSize: false,
  },
})
