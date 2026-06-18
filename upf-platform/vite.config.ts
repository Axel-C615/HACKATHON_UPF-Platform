import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Même origine que le front → plus de blocage CORS en dev (Authorization, etc.)
      "/api": {
        target: "http://localhost:5292",
        changeOrigin: true,
      },
    },
  },
})
