import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/agent': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/users': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/collections': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/documents': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/folders': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/comments': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/reactions': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})