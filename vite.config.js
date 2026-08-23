import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // StoreContext.jsx intentionally exports both StoreProvider (component) and
      // useStore (hook) — exclude it from Fast Refresh component-only check.
      exclude: [/StoreContext\.jsx/]
    }),
    tailwindcss()
  ],
  build: {
    sourcemap: false, // Prevents exposing raw source code & logic in production
    chunkSizeWarningLimit: 2000
  }
})
