import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Allow external access (Docker)
    port: 5173,      // Force Vite to use port 5173
    strictPort: true, // Prevent Vite from switching to another port
    proxy: {
      "/api": {
        target: "http://backend:5000",
        changeOrigin: true
      }
    }

  }
})
