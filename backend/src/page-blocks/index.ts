import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import type { AuthUser } from '../lib/auth-middleware'
import { validationHook } from '../lib/validation-hook'

type Bindings = { einao_db: D1Database }
type Variables = { user: AuthUser }

type BlockRow = {
  id: number
  page_slug: string
  block_type: string
  position: number
  config: string
  visible: number
  created_at: string
  updated_at: string
}

function rowToResponse(r: BlockRow) {
  return {
    id: r.id,
    page_slug: r.page_slug,
    block_type: r.block_type,
    position: r.position,
    config: JSON.parse(r.config || '{}'),
    visible: r.visible === 1,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Schemas ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

const BlockResponseSchema = z
  .object({
    id: z.number(),
    page_slug: z.string(),
    block_type: z.string(),
    position: z.number(),
    config: z.record(z.string(), z.unknown()),
    visible: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .openapi('PageBlockResponse')

const CreateBlockSchema = z
  .object({
    page_slug: z.string().min(1),
    block_type: z.string().min(1),
    position: z.number().int().min(0).optional(),
    config: z.record(z.string(), z.unknown()).optional().default({}),
    visible: z.boolean().optional().default(true),
  })
  .openapi('CreatePageBlockRequest')

const UpdateBlockSchema = z
  .object({
    block_type: z.string().min(1).optional(),
    position: z.number().int().min(0).optional(),
    config: z.record(z.string(), z.unknown()).optional(),
    visible: z.boolean().optional(),
  })
  .openapi('UpdatePageBlockRequest')

const ReorderSchema = z
  .object({
    block_ids: z.array(z.number()).min(1),
  })
  .openapi('ReorderPageBlocksRequest')

const IdParam = z.object({
  id: z
    .string()
    .regex(/^\d+$/)
    .openapi({ param: { name: 'id', in: 'path' } }),
})
const PageParam = z.object({
  page_slug: z.string().openapi({ param: { name: 'page_slug', in: 'path' } }),
})

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Public router ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

const publicRouter = new OpenAPIHono<{ Bindings: Bindings }>({ defaultHook: validationHook })

const listByPage = createRoute({
  method: 'get',
  path: '/{page_slug}',
  tags: ['Page Blocks'],
  summary: 'List visible blocks for a page',
  request: { params: PageParam },
  responses: {
    200: {
      description: 'Ordered array of visible blocks',
      content: { 'application/json': { schema: z.array(BlockResponseSchema) } },
    },
  },
})

publicRouter.openapi(listByPage, async (c) => {
  const { page_slug } = c.req.valid('param')
  const { results } = await c.env.einao_db
    .prepare('SELECT * FROM page_blocks WHERE page_slug = ? AND visible = 1 ORDER BY position ASC')
    .bind(page_slug)
    .all<BlockRow>()

  return c.json(results.map(rowToResponse), 200)
})

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Admin router ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

const adminRouter = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>({
  defaultHook: validationHook,
})

const adminListByPage = createRoute({
  method: 'get',
  path: '/{page_slug}',
  tags: ['Admin - Page Blocks'],
  summary: 'List all blocks for a page (admin)',
  request: { params: PageParam },
  responses: {
    200: {
      description: 'Ordered array of all blocks',
      content: { 'application/json': { schema: z.array(BlockResponseSchema) } },
    },
  },
})

adminRouter.openapi(adminListByPage, async (c) => {
  const { page_slug } = c.req.valid('param')
  const { results } = await c.env.einao_db
    .prepare('SELECT * FROM page_blocks WHERE page_slug = ? ORDER BY position ASC')
    .bind(page_slug)
    .all<BlockRow>()

  return c.json(results.map(rowToResponse), 200)
})

const createBlock = createRoute({
  method: 'post',
  path: '/',
  tags: ['Admin - Page Blocks'],
  summary: 'Create a page block',
  request: { body: { content: { 'application/json': { schema: CreateBlockSchema } } } },
  responses: {
    201: {
      description: 'Created block',
      content: { 'application/json': { schema: BlockResponseSchema } },
    },
  },
})

adminRouter.openapi(createBlock, async (c) => {
  const body = c.req.valid('json')

  let position = body.position
  if (position === undefined) {
    const max = await c.env.einao_db
      .prepare('SELECT COALESCE(MAX(position), -1) as max_pos FROM page_blocks WHERE page_slug = ?')
      .bind(body.page_slug)
      .first<{ max_pos: number }>()
    position = (max?.max_pos ?? -1) + 1
  }

  const row = await c.env.einao_db
    .prepare(
      `INSERT INTO page_blocks (page_slug, block_type, position, config, visible)
       VALUES (?, ?, ?, ?, ?)
       RETURNING *`
    )
    .bind(
      body.page_slug,
      body.block_type,
      position,
      JSON.stringify(body.config),
      body.visible ? 1 : 0
    )
    .first<BlockRow>()

  return c.json(rowToResponse(row!), 201)
})

const updateBlock = createRoute({
  method: 'patch',
  path: '/{id}',
  tags: ['Admin - Page Blocks'],
  summary: 'Update a page block',
  request: {
    params: IdParam,
    body: { content: { 'application/json': { schema: UpdateBlockSchema } } },
  },
  responses: {
    200: {
      description: 'Updated block',
      content: { 'application/json': { schema: BlockResponseSchema } },
    },
    404: { description: 'Block not found' },
  },
})

adminRouter.openapi(updateBlock, async (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')

  const sets: string[] = []
  const vals: unknown[] = []

  if (body.block_type !== undefined) {
    sets.push('block_type = ?')
    vals.push(body.block_type)
  }
  if (body.position !== undefined) {
    sets.push('position = ?')
    vals.push(body.position)
  }
  if (body.config !== undefined) {
    sets.push('config = ?')
    vals.push(JSON.stringify(body.config))
  }
  if (body.visible !== undefined) {
    sets.push('visible = ?')
    vals.push(body.visible ? 1 : 0)
  }

  if (sets.length === 0) {
    const existing = await c.env.einao_db
      .prepare('SELECT * FROM page_blocks WHERE id = ?')
      .bind(Number(id))
      .first<BlockRow>()
    if (!existing) return c.json({ error: 'Block not found' }, 404)
    return c.json(rowToResponse(existing), 200)
  }

  sets.push("updated_at = datetime('now')")
  vals.push(Number(id))

  const row = await c.env.einao_db
    .prepare(`UPDATE page_blocks SET ${sets.join(', ')} WHERE id = ? RETURNING *`)
    .bind(...vals)
    .first<BlockRow>()

  if (!row) return c.json({ error: 'Block not found' }, 404)
  return c.json(rowToResponse(row), 200)
})

const deleteBlock = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Admin - Page Blocks'],
  summary: 'Delete a page block',
  request: { params: IdParam },
  responses: {
    200: { description: 'Deleted' },
    404: { description: 'Block not found' },
  },
})

adminRouter.openapi(deleteBlock, async (c) => {
  const { id } = c.req.valid('param')
  const { meta } = await c.env.einao_db
    .prepare('DELETE FROM page_blocks WHERE id = ?')
    .bind(Number(id))
    .run()

  if (!meta.changes) return c.json({ error: 'Block not found' }, 404)
  return c.json({ ok: true }, 200)
})

const reorderBlocks = createRoute({
  method: 'post',
  path: '/{page_slug}/reorder',
  tags: ['Admin - Page Blocks'],
  summary: 'Reorder blocks for a page',
  request: {
    params: PageParam,
    body: { content: { 'application/json': { schema: ReorderSchema } } },
  },
  responses: {
    200: {
      description: 'Reordered blocks',
      content: { 'application/json': { schema: z.array(BlockResponseSchema) } },
    },
  },
})

adminRouter.openapi(reorderBlocks, async (c) => {
  const { page_slug } = c.req.valid('param')
  const { block_ids } = c.req.valid('json')

  const stmts = block_ids.map((id, i) =>
    c.env.einao_db
      .prepare(
        "UPDATE page_blocks SET position = ?, updated_at = datetime('now') WHERE id = ? AND page_slug = ?"
      )
      .bind(i, id, page_slug)
  )

  await c.env.einao_db.batch(stmts)

  const { results } = await c.env.einao_db
    .prepare('SELECT * FROM page_blocks WHERE page_slug = ? ORDER BY position ASC')
    .bind(page_slug)
    .all<BlockRow>()

  return c.json(results.map(rowToResponse), 200)
})

export { adminRouter }
export default publicRouter
