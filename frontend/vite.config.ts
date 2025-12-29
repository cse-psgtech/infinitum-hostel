import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    allowedHosts: ['hostelinfinitum.psgtech.ac.in'],
  },
  preview: {
    host: true,
    allowedHosts: ['hostelinfinitum.psgtech.ac.in'],
  },
})
