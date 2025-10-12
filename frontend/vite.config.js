import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
  host: '0.0.0.0',
  hmr: { overlay: false },
  port: 5174,
  proxy: {
    '/api': {
      target: 'http://192.168.1.7:5000',
      changeOrigin: true,
      secure: false
    }
  }
 }
})

