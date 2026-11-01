#!/usr/bin/env node
// Prints a friendly banner with key local dev URLs.
// Runs before `wrangler dev` so the URLs are easy to grab from terminal scrollback.

const PORT = process.env.PORT || 8787
const base = `http://localhost:${PORT}`

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
}

const rows = [
  ['API base', base, 'Hono routes (e.g. /api/v1/users)'],
  ['API docs', `${base}/docs`, 'Scalar UI - works in dev and production'],
  ['OpenAPI spec', `${base}/openapi.json`, 'Raw OpenAPI 3.1 schema'],
  ['Explorer UI', `${base}/cdn-cgi/explorer`, 'Cloudflare local bindings (D1/R2/KV/DO) - local only'],
  ['Explorer API', `${base}/cdn-cgi/explorer/api`, 'OpenAPI for the explorer (for scripts/agents)'],
]

const labelWidth = Math.max(...rows.map(([label]) => label.length))
const divider = '-'.repeat(72)

console.log('')
console.log(`${c.magenta}${c.bold}Einao backend - local dev${c.reset}`)
console.log(`${c.dim}${divider}${c.reset}`)
for (const [label, url, hint] of rows) {
  const labelPad = label.padEnd(labelWidth)
  console.log(`  ${c.yellow}${labelPad}${c.reset}  ${c.green}${url}${c.reset}`)
  console.log(`  ${' '.repeat(labelWidth)}  ${c.dim}${hint}${c.reset}`)
}
console.log(`${c.dim}${divider}${c.reset}`)
console.log('')