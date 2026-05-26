import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'pwa-maskable.svg'],
        manifest: {
          name: 'My Wallet',
          short_name: 'My Wallet',
          description: 'Gestão de carteira de investimentos',
          theme_color: '#09090b',
          background_color: '#09090b',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: 'favicon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: 'pwa-maskable.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'maskable',
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          navigateFallback: '/index.html',
          // não cachear rotas de API
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/(firestore|firebase)\.googleapis\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'firebase-cache',
                networkTimeoutSeconds: 10,
                expiration: { maxEntries: 100, maxAgeSeconds: 300 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
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
        '/api/statusinvest': {
          target: 'https://statusinvest.com.br',
          changeOrigin: true,
          rewrite: (path) => {
            const qs = path.split('?')[1] ?? ''
            const p = new URLSearchParams(qs)
            const type = p.get('type') ?? 'acao'
            const start = p.get('start') ?? ''
            const end = p.get('end') ?? ''
            const category = type === 'fii' ? 2 : 1
            return `/${type}/getearnings?Start=${start}&End=${end}&category=${category}`
          },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://statusinvest.com.br/acoes/proventos',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
          },
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
