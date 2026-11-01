#!/usr/bin/env node
// Snapshots the local Miniflare D1 sqlite file to .wrangler/backups/ before dev starts.
// Keeps the last 20 snapshots. Silent no-op if the local DB doesn't exist yet.

import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const backendRoot = resolve(__dirname, '..')
const d1Dir = join(backendRoot, '.wrangler/state/v3/d1/miniflare-D1DatabaseObject')
const backupsDir = join(backendRoot, '.wrangler/backups')
const KEEP = 20

if (!existsSync(d1Dir)) {
  process.exit(0)
}

const sqliteFiles = readdirSync(d1Dir).filter(
  (f) => f.endsWith('.sqlite') && f !== 'metadata.sqlite'
)
if (sqliteFiles.length === 0) {
  process.exit(0)
}

mkdirSync(backupsDir, { recursive: true })

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
for (const f of sqliteFiles) {
  const src = join(d1Dir, f)
  const size = statSync(src).size
  if (size < 4096) continue // empty/fresh DB, not worth snapshotting
  const dest = join(backupsDir, `${stamp}__${f}`)
  copyFileSync(src, dest)
  console.log(
    `\x1b[2m[d1-snapshot]\x1b[0m saved ${dest.replace(backendRoot + '/', '')} (${(size / 1024).toFixed(0)} KB)`
  )
}

// Prune: keep only the newest KEEP backups
const all = readdirSync(backupsDir)
  .filter((f) => f.endsWith('.sqlite'))
  .map((f) => ({ f, t: statSync(join(backupsDir, f)).mtimeMs }))
  .sort((a, b) => b.t - a.t)
for (const { f } of all.slice(KEEP)) {
  unlinkSync(join(backupsDir, f))
}
