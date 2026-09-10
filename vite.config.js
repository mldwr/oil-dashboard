import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const pkgDir = (id) => {
  const m = id.split('node_modules/')
  return m[m.length - 1]
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Split vendor libraries by their real dependency boundaries using
        // precise package paths (a naive `id.includes('/react')` also matches
        // `react-redux` — a recharts dependency — and creates circular chunks).
        manualChunks(id) {
          // Precomputed pricing lookup data -> own cacheable chunk (it barely
          // changes, so splitting it out keeps the runtime entry small and lets
          // browsers cache it across deploys).
          if (id.includes('data/generated/lookup.json')) {
            return 'data'
          }

          if (!id.includes('node_modules')) return undefined
          const p = pkgDir(id)

          // recharts + its own dependencies. This is the only package in the app
          // that outweighs everything else and is NOT otherwise code-split, so
          // splitting it out shrinks the initial entry. React/react-dom are left
          // to the default layout to avoid circular-chunk advisories (recharts
          // imports react, so forcing both into separate manual chunks creates a
          // react <-> charts cycle).
          if (
            p.startsWith('recharts') ||
            p.startsWith('victory-vendor') ||
            p.startsWith('@reduxjs/') ||
            p.startsWith('reselect') ||
            p.startsWith('immer') ||
            p.startsWith('es-toolkit') ||
            p.startsWith('decimal.js-light') ||
            p.startsWith('eventemitter3') ||
            p.startsWith('tiny-invariant') ||
            p.startsWith('use-sync-external-store') ||
            p.startsWith('clsx')
          ) {
            return 'charts'
          }
        },
      },
    },
  },
})
