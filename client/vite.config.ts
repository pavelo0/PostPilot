import path from 'node:path'
import type { ServerResponse } from 'node:http'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const isProxyErrorResponse = (
  response: unknown,
): response is ServerResponse => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'writeHead' in response &&
    'end' in response
  )
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (_error, _request, response) => {
            if (!isProxyErrorResponse(response) || response.headersSent) {
              return
            }

            response.writeHead(503, { 'Content-Type': 'application/json' })
            response.end(
              JSON.stringify({ message: 'API temporarily unavailable' }),
            )
          })
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
