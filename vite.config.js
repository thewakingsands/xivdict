import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'XIVDict',
      formats: ['iife'],
    },
  },
  publicDir: false,
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true,
      },
      hot: false,
    }),
  ],
})
