import { defineConfig, Plugin, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const consoleForwardPlugin = (): Plugin => ({
  name: 'console-forward-plugin',
  apply: 'serve', // dev only; keeps build clean
  configureServer(server) {
    server.middlewares.use('/__console__', async (req, res) => {
      try {
        const chunks: Uint8Array[] = []
        await new Promise<void>((resolve) => {
          req.on('data', (c) => chunks.push(c))
          req.on('end', () => resolve())
        })
        const body = Buffer.concat(chunks).toString('utf8')
        if (body) {
          const payload = JSON.parse(body)
          const { level = 'log', args = [], source = 'client' } = payload || {}
          const prefix = `[${source}]`
          const method = (console as any)[level] ? level : 'log'
          ;(console as any)[method](prefix, ...args)
        }
      } catch (e) {
        console.error('[console-forward] failed to parse log payload', e)
      }
      res.statusCode = 204
      res.end()
    })
  },
})

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react(), consoleForwardPlugin()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  server: {
    // Let anything in during dev. Yes, anything. Try not to cry later.
    host: '0.0.0.0',             // listen on all addresses (important for PM2)
    port: 5173,                  // explicit port
    cors: true,                  // Access-Control-Allow-Origin: *
    allowedHosts: true,          // allow all hosts (disable host check)
    strictPort: true,            // don't change port if 5173 is taken
    proxy: {
      // Proxy API requests to backend server (only in development)
      '/api': {
        target: env.VITE_BACKEND_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,  // proxy websockets
      }
    }
  },
    preview: {
      // Vite preview "prod" server with equally loose gates
      host: true,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    },
  }
})

