import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = 'http://localhost:8090'
const SIMULATEUR = 'http://localhost:8050'

const proxyEntry = {
  target: BACKEND,
  changeOrigin: true,
  configure: (proxy) => {
    proxy.on('proxyReq', (proxyReq) => {
      proxyReq.setHeader('origin', BACKEND)
      proxyReq.removeHeader('referer')
    })
  },
}

const simEntry = { target: SIMULATEUR, changeOrigin: true }

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': proxyEntry,
      '/users': proxyEntry,
      '/audit': proxyEntry,
      '/pays': proxyEntry,
      '/api/simulation': simEntry,
      '/api/capteur': simEntry,
      '/api/pays': simEntry,
      '/api': proxyEntry,
    },
  },
})
