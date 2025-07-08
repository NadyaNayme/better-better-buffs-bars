import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import alt1Plugin from './vite-alt1-plugin.js'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  base: '/better-better-buffs-bars/',
  server: {
    host: true,
    cors: true,
  },
  plugins: [
    react(),
    alt1Plugin(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        { src: 'appconfig.json', dest: '.' },
        { src: 'icon.png', dest: '.' },
        { src: './assets/audio/*.mp3', dest: './assets/audio/'}
      ]
    })
  ],
  build: {
    rollupOptions: {
      external: ['sharp', 'canvas', 'electron/common'],
    }
  }
})
