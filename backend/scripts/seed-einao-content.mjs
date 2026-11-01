import { pages, site } from '../../packages/content/src/seed.ts'
import { writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { once } from 'node:events'

const remote = process.argv.includes('--remote')
const target = remote ? '--remote' : '--local'
const db = 'einao_db'
const esc = (value) => String(value).replaceAll("'", "''")
const statements = []
statements.push(`INSERT OR REPLACE INTO einao_site_content (key, value_json, updated_at) VALUES ('site', '${esc(JSON.stringify(site))}', datetime('now'));`)
for (const page of pages) {
  statements.push(`INSERT OR REPLACE INTO einao_pages (slug, title, description, status, updated_at) VALUES ('${esc(page.slug)}', '${esc(page.title)}', '${esc(page.description)}', '${page.status}', datetime('now'));`)
  for (const block of page.blocks) {
    statements.push(`INSERT OR REPLACE INTO page_blocks (id, page_slug, block_type, position, config, visible) VALUES (${block.id}, '${esc(block.page_slug)}', '${esc(block.block_type)}', ${block.position}, '${esc(JSON.stringify(block.config))}', ${block.visible ? 1 : 0});`)
  }
}
const sqlFile = '.local-einao-content.sql'
await writeFile(sqlFile, statements.join('\n'))
const proc = spawn('npx', ['wrangler', 'd1', 'execute', db, target, '--file', sqlFile], { stdio: 'inherit', shell: true })
const [code] = await once(proc, 'close')
process.exit(code ?? 1)
