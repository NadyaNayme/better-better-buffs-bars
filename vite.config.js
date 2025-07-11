import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import alt1Plugin from './vite-alt1-plugin.js'
import tailwindcss from '@tailwindcss/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
// https://vite.dev/config/
export default defineConfig({
    base: './',
    server: {
        host: true, // listen on all addresses
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
          ]
        })
    ],
    build: {
      rollupOptions: {
        external: ['sharp', 'canvas', 'electron/common'],
      }
    }
});
