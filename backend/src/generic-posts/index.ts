import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import type { AuthUser } from '../lib/auth-middleware'
import { validationHook } from '../lib/validation-hook'

type Bindings = {
  einao_db: D1Database
}

type Variables = {
  user: AuthUser
}

type GenericPostRow = {
  id: number
  title: string
  slug: string
  subtitle: string
  excerpt: string
  featured_image_url: string
  link_url: string
  link_post_id: number | null
  post_type: string
  status: string
  author_id: number | null
  published_at: string | null
  created_at: string
  updated_at: string
  author_name: string | null
  author_email: string | null
  link_post_title: string | null
  link_post_slug: string | null
}

type CategoryInfo = { id: number; name: string; slug: string }
type TagInfo = { id: number; name: string }

const PostTypeSchema = z.enum(['industry', 'case_study', 'testimonial']).openapi('GenericPostType')
const StatusSchema = z.enum(['draft', 'published', 'archived']).openapi('GenericPostStatus')

const AuthorSchema = z.object({ id: z.number(), name: z.string(), email: z.string() })
const CategoryInfoSchema = z.object({ id: z.number(), name: z.string(), slug: z.string() })
const TagInfoSchema = z.object({ id: z.number(), name: z.string() })

const GenericPostSummarySchema = z
  .object({
    id: z.number(),
    title: z.string(),
    slug: z.string(),
    subtitle: z.string(),
    excerpt: z.string(),
    featured_image_url: z.string(),
    link_url: z.string(),
    link_post: z.object({ id: z.number(), title: z.string(), slug: z.string() }).nullable(),
    post_type: PostTypeSchema,
    status: StatusSchema,
    published_at: z.string().nullable(),
    author: AuthorSchema.nullable(),
    categories: z.array(CategoryInfoSchema),
    tags: z.array(TagInfoSchema),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .openapi('GenericPostSummary')

const GenericPostListSchema = z
  .object({
    items: z.array(GenericPostSummarySchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  })
  .openapi('GenericPostList')

const CreateSchema = z
  .object({
    title: z.string().min(1, 'title is required'),
    slug: z.string().min(1).optional(),
    subtitle: z.string().optional(),
    excerpt: z.string().optional(),
    featured_image_url: z.string().optional(),
    link_url: z.string().optional(),
    link_post_id: z.number().int().positive().nullable().optional(),
    post_type: PostTypeSchema,
    category_ids: z.array(z.number().int().positive()).optional(),
    tag_ids: z.array(z.number().int().positive()).optional(),
  })
  .openapi('GenericPostCreate')

const UpdateSchema = z
  .object({
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    subtitle: z.string().optional(),
    excerpt: z.string().optional(),
    featured_image_url: z.string().optional(),
    link_url: z.string().optional(),
    link_post_id: z.number().int().positive().nullable().optional(),
    category_ids: z.array(z.number().int().positive()).optional(),
    tag_ids: z.array(z.number().int().positive()).optional(),
  })
  .openapi('GenericPostUpdate')

const ErrorSchema = z
  .object({ error: z.union([z.string(), z.record(z.string(), z.array(z.string()))]) })
  .openapi('GenericPostError')

const IdParam = z.object({
  id: z.coerce
    .number()
    .int()
    .positive()
    .openapi({ param: { name: 'id', in: 'path' }, example: '1' }),
})

const ListQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1)
    .openapi({ param: { name: 'page', in: 'query' }, example: '1' }),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(10)
    .openapi({ param: { name: 'pageSize', in: 'query' }, example: '10' }),
  status: StatusSchema.optional().openapi({
    param: { name: 'status', in: 'query' },
    example: 'published',
  }),
  post_type: PostTypeSchema.optional().openapi({
    param: { name: 'post_type', in: 'query' },
    example: 'industry',
  }),
  search: z
    .string()
    .optional()
    .openapi({ param: { name: 'search', in: 'query' }, example: 'web3' }),
})

// --- Helpers ---

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function ensureUniqueSlug(db: D1Database, base: string, excludeId?: number): Promise<string> {
  const slug = slugify(base)
  let suffix = 0
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix + 1}`
    const existing = await db
      .prepare('SELECT id FROM generic_posts WHERE slug = ?' + (excludeId ? ' AND id != ?' : ''))
      .bind(...(excludeId ? [candidate, excludeId] : [candidate]))
      .first<{ id: number }>()
    if (!existing) return candidate
    suffix++
  }
}

function authorFromRow(row: GenericPostRow) {
  if (row.author_id == null || !row.author_name || !row.author_email) return null
  return { id: row.author_id, name: row.author_name, email: row.author_email }
}

function linkPostFromRow(row: GenericPostRow) {
  if (row.link_post_id == null || !row.link_post_title || !row.link_post_slug) return null
  return { id: row.link_post_id, title: row.link_post_title, slug: row.link_post_slug }
}

function toSummary(row: GenericPostRow, categories: CategoryInfo[] = [], tags: TagInfo[] = []) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle,
    excerpt: row.excerpt,
    featured_image_url: row.featured_image_url,
    link_url: row.link_url,
    link_post: linkPostFromRow(row),
    post_type: row.post_type,
    status: row.status,
    published_at: row.published_at,
    author: authorFromRow(row),
    categories,
    tags,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

async function getCategories(db: D1Database, postIds: number[]) {
  if (postIds.length === 0) return {}
  const ph = postIds.map(() => '?').join(', ')
  const { results } = await db
    .prepare(
      `SELECT gpc.generic_post_id AS post_id, c.id, c.name, c.slug
       FROM generic_post_categories gpc
       JOIN categories c ON c.id = gpc.category_id
       WHERE gpc.generic_post_id IN (${ph})
       ORDER BY c.sort_order ASC, c.id ASC`
    )
    .bind(...postIds)
    .all<CategoryInfo & { post_id: number }>()

  const map: Record<number, CategoryInfo[]> = {}
  for (const r of results) {
    if (!map[r.post_id]) map[r.post_id] = []
    map[r.post_id].push({ id: r.id, name: r.name, slug: r.slug })
  }
  return map
}

async function getTags(db: D1Database, postIds: number[]) {
  if (postIds.length === 0) return {}
  const ph = postIds.map(() => '?').join(', ')
  const { results } = await db
    .prepare(
      `SELECT gpt.generic_post_id AS post_id, t.id, t.name
       FROM generic_post_tags gpt
       JOIN tags t ON t.id = gpt.tag_id
       WHERE gpt.generic_post_id IN (${ph})
       ORDER BY t.name ASC`
    )
    .bind(...postIds)
    .all<TagInfo & { post_id: number }>()

  const map: Record<number, TagInfo[]> = {}
  for (const r of results) {
    if (!map[r.post_id]) map[r.post_id] = []
    map[r.post_id].push({ id: r.id, name: r.name })
  }
  return map
}

async function replaceCategories(db: D1Database, postId: number, ids: number[]) {
  await db.batch([
    db.prepare('DELETE FROM generic_post_categories WHERE generic_post_id = ?').bind(postId),
    ...ids.map((id) =>
      db
        .prepare('INSERT INTO generic_post_categories (generic_post_id, category_id) VALUES (?, ?)')
        .bind(postId, id)
    ),
  ])
}

async function replaceTags(db: D1Database, postId: number, ids: number[]) {
  await db.batch([
    db.prepare('DELETE FROM generic_post_tags WHERE generic_post_id = ?').bind(postId),
    ...ids.map((id) =>
      db
        .prepare('INSERT INTO generic_post_tags (generic_post_id, tag_id) VALUES (?, ?)')
        .bind(postId, id)
    ),
  ])
}

async function getById(db: D1Database, id: number): Promise<GenericPostRow | null> {
  return db
    .prepare(
      `SELECT gp.*, u.name AS author_name, u.email AS author_email,
              lp.title AS link_post_title, lp.slug AS link_post_slug
       FROM generic_posts gp
       LEFT JOIN users u ON u.id = gp.author_id
       LEFT JOIN posts lp ON lp.id = gp.link_post_id
       WHERE gp.id = ?`
    )
    .bind(id)
    .first<GenericPostRow>()
}

async function hydrate(db: D1Database, row: GenericPostRow) {
  const [cats, tags] = await Promise.all([getCategories(db, [row.id]), getTags(db, [row.id])])
  return toSummary(row, cats[row.id] ?? [], tags[row.id] ?? [])
}

// --- Routers ---

const publicRouter = new OpenAPIHono<{ Bindings: Bindings }>({ defaultHook: validationHook })
const adminRouter = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>({
  defaultHook: validationHook,
})

// Public list
const listRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Generic Posts'],
  summary: 'List generic posts',
  request: { query: ListQuerySchema },
  responses: {
    200: {
      description: 'Paginated list',
      content: { 'application/json': { schema: GenericPostListSchema } },
    },
  },
})

publicRouter.openapi(listRoute, async (c) => {
  const q = c.req.valid('query')
  const db = c.env.einao_db
  const where: string[] = ["gp.status = 'published'", 'gp.published_at IS NOT NULL']
  const bindings: unknown[] = []

  if (q.post_type) {
    where.push('gp.post_type = ?')
    bindings.push(q.post_type)
  }
  if (q.search) {
    where.push('(gp.title LIKE ? OR gp.subtitle LIKE ?)')
    bindings.push(`%${q.search}%`, `%${q.search}%`)
  }

  const whereClause = where.length ? ` WHERE ${where.join(' AND ')}` : ''
  const offset = (q.page - 1) * q.pageSize

  const countRow = await db
    .prepare(`SELECT COUNT(*) AS total FROM generic_posts gp${whereClause}`)
    .bind(...bindings)
    .first<{ total: number }>()

  const { results } = await db
    .prepare(
      `SELECT gp.*, u.name AS author_name, u.email AS author_email,
              lp.title AS link_post_title, lp.slug AS link_post_slug
       FROM generic_posts gp
       LEFT JOIN users u ON u.id = gp.author_id
       LEFT JOIN posts lp ON lp.id = gp.link_post_id
       ${whereClause}
       ORDER BY gp.published_at DESC, gp.id DESC
       LIMIT ? OFFSET ?`
    )
    .bind(...bindings, q.pageSize, offset)
    .all<GenericPostRow>()

  const postIds = results.map((r) => r.id)
  const [cats, tags] = await Promise.all([getCategories(db, postIds), getTags(db, postIds)])

  return c.json(
    {
      items: results.map((r) => toSummary(r, cats[r.id] ?? [], tags[r.id] ?? [])),
      total: countRow?.total ?? 0,
      page: q.page,
      pageSize: q.pageSize,
    },
    200
  )
})

// Admin list
const adminListRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Admin - Generic Posts'],
  summary: 'List all generic posts',
  request: { query: ListQuerySchema },
  responses: {
    200: {
      description: 'Paginated list',
      content: { 'application/json': { schema: GenericPostListSchema } },
    },
  },
})

adminRouter.openapi(adminListRoute, async (c) => {
  const q = c.req.valid('query')
  const db = c.env.einao_db
  const where: string[] = []
  const bindings: unknown[] = []

  if (q.status) {
    where.push('gp.status = ?')
    bindings.push(q.status)
  }
  if (q.post_type) {
    where.push('gp.post_type = ?')
    bindings.push(q.post_type)
  }
  if (q.search) {
    where.push('(gp.title LIKE ? OR gp.subtitle LIKE ?)')
    bindings.push(`%${q.search}%`, `%${q.search}%`)
  }

  const whereClause = where.length ? ` WHERE ${where.join(' AND ')}` : ''
  const offset = (q.page - 1) * q.pageSize

  const countRow = await db
    .prepare(`SELECT COUNT(*) AS total FROM generic_posts gp${whereClause}`)
    .bind(...bindings)
    .first<{ total: number }>()

  const { results } = await db
    .prepare(
      `SELECT gp.*, u.name AS author_name, u.email AS author_email,
              lp.title AS link_post_title, lp.slug AS link_post_slug
       FROM generic_posts gp
       LEFT JOIN users u ON u.id = gp.author_id
       LEFT JOIN posts lp ON lp.id = gp.link_post_id
       ${whereClause}
       ORDER BY COALESCE(gp.published_at, gp.updated_at) DESC, gp.id DESC
       LIMIT ? OFFSET ?`
    )
    .bind(...bindings, q.pageSize, offset)
    .all<GenericPostRow>()

  const postIds = results.map((r) => r.id)
  const [cats, tags] = await Promise.all([getCategories(db, postIds), getTags(db, postIds)])

  return c.json(
    {
      items: results.map((r) => toSummary(r, cats[r.id] ?? [], tags[r.id] ?? [])),
      total: countRow?.total ?? 0,
      page: q.page,
      pageSize: q.pageSize,
    },
    200
  )
})

// Admin get by id
const getByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Admin - Generic Posts'],
  summary: 'Get a generic post by ID',
  request: { params: IdParam },
  responses: {
    200: {
      description: 'Generic post',
      content: { 'application/json': { schema: GenericPostSummarySchema } },
    },
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
  },
})

adminRouter.openapi(getByIdRoute, async (c) => {
  const { id } = c.req.valid('param')
  const row = await getById(c.env.einao_db, id)
  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json(await hydrate(c.env.einao_db, row), 200)
})

// Admin create
const createGenericPostRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Admin - Generic Posts'],
  summary: 'Create a generic post',
  request: { body: { content: { 'application/json': { schema: CreateSchema } }, required: true } },
  responses: {
    201: {
      description: 'Created',
      content: { 'application/json': { schema: GenericPostSummarySchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(createGenericPostRoute, async (c) => {
  const body = c.req.valid('json')
  const db = c.env.einao_db
  const user = c.get('user')
  const slug = await ensureUniqueSlug(db, body.slug ?? body.title)

  const created = await db
    .prepare(
      `INSERT INTO generic_posts (title, slug, subtitle, excerpt, featured_image_url, link_url, link_post_id, post_type, author_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`
    )
    .bind(
      body.title,
      slug,
      body.subtitle ?? '',
      body.excerpt ?? '',
      body.featured_image_url ?? '',
      body.link_url ?? '',
      body.link_post_id ?? null,
      body.post_type,
      user?.id ?? null
    )
    .first<GenericPostRow>()

  if (!created) return c.json({ error: 'Creation failed' }, 400)

  const categoryIds = [...new Set(body.category_ids ?? [])]
  const tagIds = [...new Set(body.tag_ids ?? [])]
  if (categoryIds.length) await replaceCategories(db, created.id, categoryIds)
  if (tagIds.length) await replaceTags(db, created.id, tagIds)

  const row = await getById(db, created.id)
  if (!row) return c.json({ error: 'Not found after creation' }, 400)
  return c.json(await hydrate(db, row), 201)
})

// Admin update
const updateGenericPostRoute = createRoute({
  method: 'patch',
  path: '/{id}',
  tags: ['Admin - Generic Posts'],
  summary: 'Update a generic post',
  request: {
    params: IdParam,
    body: { content: { 'application/json': { schema: UpdateSchema } }, required: true },
  },
  responses: {
    200: {
      description: 'Updated',
      content: { 'application/json': { schema: GenericPostSummarySchema } },
    },
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
  },
})

adminRouter.openapi(updateGenericPostRoute, async (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')
  const db = c.env.einao_db
  const existing = await getById(db, id)
  if (!existing) return c.json({ error: 'Not found' }, 404)

  const nextSlug = body.slug ? await ensureUniqueSlug(db, body.slug, id) : existing.slug

  await db
    .prepare(
      `UPDATE generic_posts
       SET title = ?, slug = ?, subtitle = ?, excerpt = ?, featured_image_url = ?, link_url = ?, link_post_id = ?, updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(
      body.title ?? existing.title,
      nextSlug,
      body.subtitle ?? existing.subtitle,
      body.excerpt ?? existing.excerpt,
      body.featured_image_url ?? existing.featured_image_url,
      body.link_url ?? existing.link_url,
      body.link_post_id !== undefined ? body.link_post_id : existing.link_post_id,
      id
    )
    .run()

  if (body.category_ids) await replaceCategories(db, id, [...new Set(body.category_ids)])
  if (body.tag_ids) await replaceTags(db, id, [...new Set(body.tag_ids)])

  const updated = await getById(db, id)
  if (!updated) return c.json({ error: 'Not found' }, 404)
  return c.json(await hydrate(db, updated), 200)
})

// Admin publish
const publishRoute = createRoute({
  method: 'post',
  path: '/{id}/publish',
  tags: ['Admin - Generic Posts'],
  summary: 'Publish a generic post',
  request: { params: IdParam },
  responses: {
    200: {
      description: 'Published',
      content: { 'application/json': { schema: GenericPostSummarySchema } },
    },
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
  },
})

adminRouter.openapi(publishRoute, async (c) => {
  const { id } = c.req.valid('param')
  const db = c.env.einao_db
  const existing = await getById(db, id)
  if (!existing) return c.json({ error: 'Not found' }, 404)

  await db
    .prepare(
      `UPDATE generic_posts SET status = 'published', published_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
    )
    .bind(id)
    .run()

  const updated = await getById(db, id)
  if (!updated) return c.json({ error: 'Not found' }, 404)
  return c.json(await hydrate(db, updated), 200)
})

// Admin unpublish
const unpublishRoute = createRoute({
  method: 'post',
  path: '/{id}/unpublish',
  tags: ['Admin - Generic Posts'],
  summary: 'Unpublish a generic post',
  request: { params: IdParam },
  responses: {
    200: {
      description: 'Unpublished',
      content: { 'application/json': { schema: GenericPostSummarySchema } },
    },
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
  },
})

adminRouter.openapi(unpublishRoute, async (c) => {
  const { id } = c.req.valid('param')
  const db = c.env.einao_db
  const existing = await getById(db, id)
  if (!existing) return c.json({ error: 'Not found' }, 404)

  await db
    .prepare(`UPDATE generic_posts SET status = 'draft', updated_at = datetime('now') WHERE id = ?`)
    .bind(id)
    .run()

  const updated = await getById(db, id)
  if (!updated) return c.json({ error: 'Not found' }, 404)
  return c.json(await hydrate(db, updated), 200)
})

// Admin archive
const archiveRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Admin - Generic Posts'],
  summary: 'Archive a generic post',
  request: { params: IdParam },
  responses: {
    200: {
      description: 'Archived',
      content: { 'application/json': { schema: GenericPostSummarySchema } },
    },
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
  },
})

adminRouter.openapi(archiveRoute, async (c) => {
  const { id } = c.req.valid('param')
  const db = c.env.einao_db
  const existing = await getById(db, id)
  if (!existing) return c.json({ error: 'Not found' }, 404)

  await db
    .prepare(
      `UPDATE generic_posts SET status = 'archived', updated_at = datetime('now') WHERE id = ?`
    )
    .bind(id)
    .run()

  const updated = await getById(db, id)
  if (!updated) return c.json({ error: 'Not found' }, 404)
  return c.json(await hydrate(db, updated), 200)
})

export { adminRouter }
export default publicRouter
