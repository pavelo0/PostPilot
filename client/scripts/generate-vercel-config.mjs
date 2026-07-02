import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Generates client/vercel.json with /api rewrite to Render when RENDER_API_URL is set.
 * Skipped locally so Vite dev proxy continues to handle /api.
 */
const renderApiUrl = process.env.RENDER_API_URL?.trim().replace(/\/+$/, '')

if (!renderApiUrl) {
  if (process.env.VERCEL === '1') {
    console.error(
      '[vercel-config] ERROR: set RENDER_API_URL in Vercel → Settings → Environment Variables, then redeploy.',
    )
    process.exit(1)
  }
  console.log('[vercel-config] RENDER_API_URL not set — skipping vercel.json generation (local dev)')
  process.exit(0)
}

const config = {
  rewrites: [
    {
      source: '/api/:path*',
      destination: `${renderApiUrl}/api/:path*`,
    },
    {
      source: '/((?!api/).*)',
      destination: '/index.html',
    },
  ],
}

const outputPath = resolve(import.meta.dirname, '..', 'vercel.json')
writeFileSync(outputPath, `${JSON.stringify(config, null, 2)}\n`)
console.log(`[vercel-config] Wrote ${outputPath} → ${renderApiUrl}`)
