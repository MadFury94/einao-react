import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createRequire } from 'node:module'
import type { DatabaseSync as SQLiteDatabase } from 'node:sqlite'
const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite')
import { readFileSync } from 'node:fs'
import publicRouter, { adminRouter } from '../../../backend/src/einao-content'

let sqlite: SQLiteDatabase
let beforeBatch: (() => void) | undefined
const work = { title: 'Selected work', items: [{ title: 'Existing project', link: { href: '/work/existing/' } }] }
const industry = { items: [{ title: 'Government', link: { href: '/industries/government/' } }] }
function prepared(sql: string, values: any[] = []): any {
  return {
    bind: (...next: any[]) => prepared(sql, next),
    first: async () => sqlite.prepare(sql).get(...values) ?? null,
    all: async () => ({ results: sqlite.prepare(sql).all(...values) }),
    execute: () => {
      const result = sqlite.prepare(sql).run(...values)
      return { success: true, results: [], meta: { changes: Number(result.changes) } }
    },
  }
}
const db = {
  prepare: prepared,
  batch: async (statements: any[]) => {
    beforeBatch?.()
    sqlite.exec('BEGIN')
    try { const results = statements.map(statement => statement.execute()); sqlite.exec('COMMIT'); return results }
    catch (error) { sqlite.exec('ROLLBACK'); throw error }
  },
}
const env = { einao_db: db as unknown as D1Database }
function payload(overrides = {}) { return { blockId: 1, snapshot: JSON.stringify(work), title: 'A New Portal', body: 'Approved project introduction.', label: 'Institutional work', image: '/portal.webp', industry_key: '/industries/government/', tag_ids: [7], ...overrides } }
function create(overrides = {}) { return adminRouter.request('/work', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload(overrides)) }, env) }
function listing() { return JSON.parse(String(sqlite.prepare('SELECT config FROM page_blocks WHERE id=1').get()!.config)) }
beforeEach(() => {
  sqlite = new DatabaseSync(':memory:')
  beforeBatch = undefined
  for (const name of ['0027_einao_content.sql', '0029_einao_page_seo.sql']) sqlite.exec(readFileSync(new URL(`../../../backend/migrations/${name}`, import.meta.url), 'utf8'))
  sqlite.exec(readFileSync(new URL('../../../backend/migrations/0018_page_blocks.sql', import.meta.url), 'utf8').split('-- Seed')[0])
  sqlite.exec("CREATE TABLE tags (id INTEGER PRIMARY KEY, name TEXT); INSERT INTO tags VALUES (7, 'Digital services');")
  sqlite.prepare('INSERT INTO page_blocks (id,page_slug,block_type,config) VALUES (1,?,?,?)').run('work','proof',JSON.stringify(work))
  sqlite.prepare('INSERT INTO page_blocks (id,page_slug,block_type,config) VALUES (2,?,?,?)').run('industries','industries',JSON.stringify(industry))
})
afterEach(() => sqlite.close())
describe('automatic Work detail pages', () => {
  it('creates a public page, matching listing URL and editable blank sections', async () => {
    const response = await create()
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ slug: 'work/a-new-portal', href: '/work/a-new-portal/', index: 1 })
    expect(listing().items[0]).toEqual(work.items[0])
    expect(listing().items[1]).toMatchObject({ industry_key: '/industries/government/', tag_ids: [7], link: { href: '/work/a-new-portal/' } })
    const pageResponse = await publicRouter.request('/pages/work%2Fa-new-portal', {}, env)
    expect(pageResponse.status).toBe(200)
    const page = await pageResponse.json() as any
    expect(page.blocks).toHaveLength(1)
    expect(page.blocks[0].config).toMatchObject({ title: 'A New Portal', body: ['Approved project introduction.'], image: '/portal.webp' })
    const editor = await (await adminRouter.request('/pages/work%2Fa-new-portal', {}, env)).json() as any
    expect(editor.blocks).toHaveLength(8)
    const section = editor.blocks[1]
    const saved = await adminRouter.request(`/blocks/${section.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ config: { ...section.config, body: ['Approved context'] }, visible: true }) }, env)
    expect(saved.status).toBe(200)
    expect((await (await publicRouter.request('/pages/work%2Fa-new-portal', {}, env)).json() as any).blocks).toHaveLength(2)
  })
  it('accepts a chosen slug and rejects duplicate URLs without another listing', async () => {
    expect((await create({ slug: 'custom-url' })).status).toBe(201)
    expect((await create({ slug: 'custom-url', snapshot: JSON.stringify(listing()) })).status).toBe(409)
    expect(listing().items).toHaveLength(2)
  })
  it('rejects stale forms and invalid slugs, categories, tags and image URLs', async () => {
    for (const [change, status] of [[{ snapshot: '{}' },409],[{ slug: '../bad' },400],[{ industry_key: 'unknown' },400],[{ tag_ids: [99] },400],[{ image: 'javascript:alert(1)' },400]] as const) expect((await create(change)).status).toBe(status)
    expect(listing().items).toHaveLength(1)
    expect(sqlite.prepare('SELECT COUNT(*) AS count FROM einao_pages').get()!.count).toBe(0)
  })
  it('does not create an orphan page if another editor saves just before the batch', async () => {
    beforeBatch = () => sqlite.prepare('UPDATE page_blocks SET config=? WHERE id=1').run(JSON.stringify({ ...work, title: 'Changed by another editor' }))
    expect((await create()).status).toBe(409)
    expect(sqlite.prepare('SELECT COUNT(*) AS count FROM einao_pages').get()!.count).toBe(0)
    expect(sqlite.prepare("SELECT COUNT(*) AS count FROM page_blocks WHERE page_slug LIKE 'work/%'").get()!.count).toBe(0)
  })
  it('rolls back the page and blocks when a later write fails', async () => {
    sqlite.exec("CREATE TRIGGER fail_listing BEFORE UPDATE ON page_blocks WHEN NEW.id=1 BEGIN SELECT RAISE(ABORT, 'test failure'); END;")
    expect((await create()).status).toBe(500)
    expect(listing().items).toHaveLength(1)
    expect(sqlite.prepare('SELECT COUNT(*) AS count FROM einao_pages').get()!.count).toBe(0)
    expect(sqlite.prepare("SELECT COUNT(*) AS count FROM page_blocks WHERE page_slug LIKE 'work/%'").get()!.count).toBe(0)
  })
})
