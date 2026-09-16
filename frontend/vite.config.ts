import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Lets local icon files (src/assets/icons/*.svg) be imported as React components via a
    // `?react` suffix, e.g. `import MapPin from "../assets/icons/map-pin.svg?react"` — keeps
    // the currentColor/className styling behavior our components already rely on.
    svgr(),
    VitePWA({
      registerType: 'autoUpdate',
      // Custom service worker (src/sw.ts) instead of the fully auto-generated default — needed
      // for push/notificationclick handlers, which generateSW mode has no room for. Caching
      // rules (precache + NetworkOnly for /api and /socket.io) now live there instead of in a
      // `workbox` option here.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'icon-source.svg'],
      manifest: {
        name: 'Thai Weather',
        short_name: 'Weather',
        description: 'Realtime weather for every Thai province and district',
        theme_color: '#232c3d',
        background_color: '#232c3d',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
  },
})
