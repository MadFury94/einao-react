import { createWork } from './create-work'
import { Hono } from 'hono'
import type { AuthUser } from '../lib/auth-middleware'
type Bindings = { einao_db: D1Database }
type Variables = { user: AuthUser }
type PageRow = { slug: string; title: string; description: string; status: 'published' | 'draft'; updated_at: string; seo_title: string; seo_description: string; canonical_url: string; og_image_url: string }
type BlockRow = { id: number; page_slug: string; block_type: string; position: number; config: string; visible: number; updated_at: string }
const publicRouter = new Hono<{ Bindings: Bindings }>()
const adminRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>()
function block(row: BlockRow) { return { id: row.id, page_slug: row.page_slug, block_type: row.block_type, position: row.position, config: JSON.parse(row.config || '{}'), visible: row.visible === 1, updated_at: row.updated_at } }
publicRouter.get('/site', async (c) => { const row = await c.env.einao_db.prepare("SELECT value_json FROM einao_site_content WHERE key = 'site'").first<{ value_json: string }>(); return c.json(row ? JSON.parse(row.value_json) : null) })
publicRouter.get('/pages', async (c) => { const { results } = await c.env.einao_db.prepare("SELECT slug, title, description, status, updated_at, seo_title, seo_description, canonical_url, og_image_url FROM einao_pages WHERE status = 'published' ORDER BY slug").all<PageRow>(); return c.json(results) })
publicRouter.get('/pages/:slug', async (c) => { const slug = c.req.param('slug').replace(/^\/+|\/+$/g, '') || 'home'; const page = await c.env.einao_db.prepare("SELECT slug, title, description, status, updated_at, seo_title, seo_description, canonical_url, og_image_url FROM einao_pages WHERE slug = ? AND status = 'published'").bind(slug).first<PageRow>(); if (!page) return c.json({ error: 'Page not found' }, 404); const { results } = await c.env.einao_db.prepare('SELECT * FROM page_blocks WHERE page_slug = ? AND visible = 1 ORDER BY position').bind(slug).all<BlockRow>(); return c.json({ ...page, blocks: results.map(block) }) })

adminRouter.post('/work', createWork)
adminRouter.delete('/collections/:key/items/:index', async (c) => {
  const key = c.req.param('key')
  const index = Number(c.req.param('index'))
  if (!['solutions', 'capabilities', 'work'].includes(key) || !Number.isInteger(index) || index < 0) return c.json({ error: 'Invalid collection entry' }, 400)
  const body = await c.req.json<{ blockId?: number; snapshot?: string }>().catch(() => ({}))
  if (!Number.isInteger(body.blockId) || typeof body.snapshot !== 'string') return c.json({ error: 'A collection snapshot is required' }, 400)
  const blockType = key === 'capabilities' ? 'services' : key
  const block = await c.env.einao_db.prepare('SELECT id, config FROM page_blocks WHERE id = ? AND page_slug = ? AND block_type = ?').bind(body.blockId, key, blockType).first<{ id: number; config: string }>()
  if (!block) return c.json({ error: 'Collection not found' }, 404)
  if (block.config !== body.snapshot) return c.json({ error: 'This content changed. Reload before deleting.' }, 409)
  const config = JSON.parse(block.config) as { items?: Array<{ link?: { href?: string } }> }
  if (!Array.isArray(config.items) || !config.items[index]) return c.json({ error: 'Entry not found' }, 404)
  const href = config.items[index].link?.href || ''
  const match = href.match(new RegExp('^/' + key + '/([^/?#]+)'))
  const slug = match ? key + '/' + match[1] : ''
  const next = JSON.stringify({ ...config, items: config.items.filter((_, itemIndex) => itemIndex !== index) })
  try {
    const statements = [c.env.einao_db.prepare("UPDATE page_blocks SET config = ?, updated_at = datetime('now') WHERE id = ? AND config = ?").bind(next, block.id, block.config)]
    if (slug) {
      statements.push(c.env.einao_db.prepare('DELETE FROM page_blocks WHERE page_slug = ?').bind(slug))
      statements.push(c.env.einao_db.prepare('DELETE FROM einao_pages WHERE slug = ?').bind(slug))
    }
    const results = await c.env.einao_db.batch(statements)
    if (results[0].meta.changes !== 1) return c.json({ error: 'This content changed. Reload before deleting.' }, 409)
    return c.json({ ok: true, deletedPage: slug || null })
  } catch { return c.json({ error: 'Could not delete the entry. Please retry.' }, 500) }
})

adminRouter.get('/pages', async (c) => { const { results } = await c.env.einao_db.prepare('SELECT slug, title, description, status, updated_at, seo_title, seo_description, canonical_url, og_image_url FROM einao_pages ORDER BY slug').all<PageRow>(); return c.json(results) })
// The slug may contain nested paths (for example work/ipo-nigeria-portal), so
// this wildcard endpoint is the canonical admin read model for a page and its
// editable blocks. The older page-blocks/:slug endpoint cannot represent those
// slugs reliably because a slash is interpreted as another URL segment.
adminRouter.get('/pages/*', async (c) => {
  const marker = '/pages/'
  const index = c.req.path.indexOf(marker)
  const slug = index === -1 ? '' : decodeURIComponent(c.req.path.slice(index + marker.length)).replace(/^\/+|\/+$/g, '')
  if (!slug) return c.json({ error: 'Page not found' }, 404)
  const page = await c.env.einao_db.prepare('SELECT slug, title, description, status, updated_at, seo_title, seo_description, canonical_url, og_image_url FROM einao_pages WHERE slug = ?').bind(slug).first<PageRow>()
  if (!page) return c.json({ error: 'Page not found' }, 404)
  const { results } = await c.env.einao_db.prepare('SELECT * FROM page_blocks WHERE page_slug = ? ORDER BY position').bind(slug).all<BlockRow>()
  return c.json({ ...page, blocks: results.map(block) })
})
adminRouter.delete('/pages/*', async (c) => {
  const marker = '/pages/'
  const index = c.req.path.indexOf(marker)
  const slug = index === -1 ? '' : decodeURIComponent(c.req.path.slice(index + marker.length)).replace(/^\/+|\/+$/g, '')
  if (!slug || !/^(solutions|capabilities|work)\//.test(slug)) return c.json({ error: 'Invalid detail page' }, 400)
  const page = await c.env.einao_db.prepare('SELECT slug FROM einao_pages WHERE slug = ?').bind(slug).first<{ slug: string }>()
  if (!page) return c.json({ error: 'Page not found' }, 404)
  try { await c.env.einao_db.batch([c.env.einao_db.prepare('DELETE FROM page_blocks WHERE page_slug = ?').bind(slug), c.env.einao_db.prepare('DELETE FROM einao_pages WHERE slug = ?').bind(slug)]); return c.json({ ok: true }) } catch { return c.json({ error: 'Could not delete the page. Please retry.' }, 500) }
})
adminRouter.patch('/pages/:slug', async (c) => { const slug = c.req.param('slug'); const body = await c.req.json<Partial<Pick<PageRow, 'title' | 'description' | 'status' | 'seo_title' | 'seo_description' | 'canonical_url' | 'og_image_url'>>>(); const current = await c.env.einao_db.prepare('SELECT * FROM einao_pages WHERE slug = ?').bind(slug).first<PageRow>(); if (!current) return c.json({ error: 'Page not found' }, 404); const next = { title: body.title ?? current.title, description: body.description ?? current.description, status: body.status ?? current.status, seo_title: body.seo_title ?? current.seo_title, seo_description: body.seo_description ?? current.seo_description, canonical_url: body.canonical_url ?? current.canonical_url, og_image_url: body.og_image_url ?? current.og_image_url }; if (!['published', 'draft'].includes(next.status)) return c.json({ error: 'Invalid status' }, 400); const row = await c.env.einao_db.prepare("UPDATE einao_pages SET title = ?, description = ?, status = ?, seo_title = ?, seo_description = ?, canonical_url = ?, og_image_url = ?, updated_at = datetime('now') WHERE slug = ? RETURNING *").bind(next.title, next.description, next.status, next.seo_title, next.seo_description, next.canonical_url, next.og_image_url, slug).first<PageRow>(); return c.json(row) })
// Only approved content fields are editable. Position, block type, creation and deletion stay code-owned.
adminRouter.patch('/blocks/:id', async (c) => { const id = Number(c.req.param('id')); if (!Number.isInteger(id)) return c.json({ error: 'Invalid block id' }, 400); const body = await c.req.json<{ config?: Record<string, unknown>; visible?: boolean }>(); if (body.config === undefined && body.visible === undefined) return c.json({ error: 'No editable fields supplied' }, 400); const sets: string[] = []; const values: unknown[] = []; if (body.config !== undefined) { sets.push('config = ?'); values.push(JSON.stringify(body.config)) } if (body.visible !== undefined) { sets.push('visible = ?'); values.push(body.visible ? 1 : 0) } sets.push("updated_at = datetime('now')"); values.push(id); const row = await c.env.einao_db.prepare(`UPDATE page_blocks SET ${sets.join(', ')} WHERE id = ? RETURNING *`).bind(...values).first<BlockRow>(); if (!row) return c.json({ error: 'Block not found' }, 404); return c.json(block(row)) })
export { adminRouter }
export default publicRouter



