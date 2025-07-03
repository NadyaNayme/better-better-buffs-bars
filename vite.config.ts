import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  server: {
    host: true, // listen on all addresses
    cors: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        { src: 'appconfig.json', dest: '.' },
        { src: 'icon.png', dest: '.' },
      ]
    })
  ],
})
