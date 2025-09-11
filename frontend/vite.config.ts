import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
     server: {
    allowedHosts: [
      'localhost',
      '7d03f4df8009.ngrok-free.app',
      '4e180dc82875.ngrok-free.app'
    ],
    host: true, // allow external access
    port: 5173,
    proxy: {
      // Proxy API requests to backend server
      '/api': {
        target: 'http://192.168.43.160:3001',
        changeOrigin: true,
        secure: false
      },
      '/health': {
        target: 'http://192.168.43.160:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    
  },
})
