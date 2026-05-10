import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { pluggyDevPlugin } from './vite-plugin-pluggy'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env.PLUGGY_CLIENT_ID = env.PLUGGY_CLIENT_ID
  process.env.PLUGGY_CLIENT_SECRET = env.PLUGGY_CLIENT_SECRET

  return {
    plugins: [react(), tailwindcss(), pluggyDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
              return 'firebase'
            }
            if (id.includes('node_modules/pdfjs-dist') || id.includes('node_modules/pdf-lib')) {
              return 'pdf-vendor'
            }
            if (id.includes('node_modules/@radix-ui')) {
              return 'radix'
            }
            if (
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/react-router-dom')
            ) {
              return 'router'
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'icons'
            }
          },
        },
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
        '/api/bcb': {
          target: 'https://api.bcb.gov.br',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/bcb/, ''),
        },
        '/api/yahoo': {
          target: 'https://query1.finance.yahoo.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
          headers: { 'User-Agent': 'Mozilla/5.0' },
        },
        '/api/investidor10': {
          target: 'https://investidor10.com.br',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/investidor10/, ''),
          headers: { 'User-Agent': 'Mozilla/5.0' },
        },
        '/api/tesouro': {
          target: 'https://www.tesourotransparente.gov.br',
          changeOrigin: true,
          rewrite: () =>
            '/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv',
        },
      },
    },
  }
})
