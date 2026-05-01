import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/cvm-dados': {
        target: 'https://dados.cvm.gov.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cvm-dados/, ''),
      },
      '/api/tesouro': {
        target: 'https://www.tesourotransparente.gov.br',
        changeOrigin: true,
        rewrite: () =>
          '/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv',
      },
    },
  },
})
