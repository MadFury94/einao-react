import type { Context } from 'hono'
import { z } from 'zod'

const inputSchema = z.object({
  blockId: z.number().int().positive(), snapshot: z.string(),
  title: z.string().trim().min(1).max(200), body: z.string().trim().max(20000).default(''),
  label: z.string().trim().max(200).default(''), image: z.string().trim().max(2000).default(''),
  slug: z.string().trim().max(100).default(''), year: z.string().regex(/^(?:[0-9]{4})?$/).default(''),
  industry_key: z.string().min(1), tag_ids: z.array(z.number().int().positive()).max(100).default([]),
})
type Item = { title?: string; industry_id?: string; link?: { href?: string }; [key: string]: unknown }
type Config = { items?: Item[]; [key: string]: unknown }

export async function createWork(c: Context<{ Bindings: { einao_db: D1Database } }>) {
  const parsed = inputSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: 'Enter a title, valid category and valid case-study fields.' }, 400)
  const input = parsed.data
  if (input.image && !/^(\/(?!\/)|https?:\/\/)/i.test(input.image)) return c.json({ error: 'Use a website image path or an HTTP image URL.' }, 400)
  const name = input.slug || input.title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100).replace(/-$/, '')
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) return c.json({ error: 'Enter a page slug using lowercase letters, numbers and hyphens.' }, 400)
  const slug = `work/${name}`
  const db = c.env.einao_db
  const row = await db.prepare("SELECT id, config FROM page_blocks WHERE id = ? AND page_slug = 'work' AND block_type = 'proof'").bind(input.blockId).first<{ id: number; config: string }>()
  if (!row) return c.json({ error: 'Work listing not found.' }, 404)
  const config = JSON.parse(row.config) as Config
  if (!Array.isArray(config.items)) return c.json({ error: 'Work listing has not been configured.' }, 400)
  if (JSON.stringify(config) !== input.snapshot) return c.json({ error: 'This content changed. Reload before creating the case study.' }, 409)
  const industry = await db.prepare("SELECT config FROM page_blocks WHERE page_slug = 'industries' AND block_type = 'industries' ORDER BY position LIMIT 1").first<{ config: string }>()
  const industries = industry ? (JSON.parse(industry.config) as Config).items ?? [] : []
  if (!industries.some(item => (item.industry_id || item.link?.href || String(item.title || '').trim().toLowerCase()) === input.industry_key)) return c.json({ error: 'Choose an existing industry category.' }, 400)
  const tags = [...new Set(input.tag_ids)]
  if (tags.length) {
    const found = await db.prepare(`SELECT id FROM tags WHERE id IN (${tags.map(() => '?').join(',')})`).bind(...tags).all()
    if (found.results.length !== tags.length) return c.json({ error: 'A selected tag no longer exists.' }, 400)
  }
  if (await db.prepare('SELECT slug FROM einao_pages WHERE slug = ?').bind(slug).first()) return c.json({ error: 'That page URL already exists. Choose a different page slug.' }, 409)
  const item = { year: input.year, title: input.title, body: input.body, label: input.label, image: input.image, industry_key: input.industry_key, tag_ids: tags, link: { label: 'Read the case study', href: `/${slug}/` } }
  const next = JSON.stringify({ ...config, items: [...config.items, item] })
  const cta = { label: 'Discuss a similar requirement', href: '/contact/' }
  const blocks = [
    { type: 'hero', visible: 1, config: { title: input.title, eyebrow: input.label || 'Selected work', body: input.body ? [input.body] : [], image: input.image, imageAlt: input.title, cta } },
    ...['The context', 'The challenge', "Einao's role", 'The approach', 'The system or intervention', 'The evidence', 'What continued after implementation'].map(title => ({ type: 'editorial', visible: 0, config: { title, body: [] } })),
  ]
  // All writes share the same snapshot guard. A stale request creates nothing;
  // a duplicate URL or any other SQL failure rolls the whole D1 batch back.
  const guard = "EXISTS (SELECT 1 FROM page_blocks WHERE id = ? AND config = ?)"
  try {
    const results = await db.batch([
      db.prepare(`INSERT INTO einao_pages (slug, title, description, status, og_image_url) SELECT ?, ?, ?, 'published', ? WHERE ${guard}`).bind(slug, input.title, input.body, input.image, row.id, row.config),
      ...blocks.map((block, position) => db.prepare(`INSERT INTO page_blocks (page_slug, block_type, position, config, visible) SELECT ?, ?, ?, ?, ? WHERE ${guard}`).bind(slug, block.type, position, JSON.stringify(block.config), block.visible, row.id, row.config)),
      db.prepare("UPDATE page_blocks SET config = ?, updated_at = datetime('now') WHERE id = ? AND config = ?").bind(next, row.id, row.config),
    ])
    if (results[results.length - 1].meta.changes !== 1) return c.json({ error: 'This content changed. Reload before creating the case study.' }, 409)
  } catch (error) {
    if (String(error).includes('UNIQUE constraint failed')) return c.json({ error: 'That page URL already exists. Choose a different page slug.' }, 409)
    return c.json({ error: 'Could not create the case study. Please retry.' }, 500)
  }
  return c.json({ slug, href: `/${slug}/`, index: config.items.length }, 201)
}
