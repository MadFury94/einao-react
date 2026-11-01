import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import type { AuthUser } from '../lib/auth-middleware'
import { validationHook } from '../lib/validation-hook'
import { computeReadingMinutes, deriveExcerpt, ensureUniqueSlug, pruneRevisions, stripHtmlToText } from './lib'

type Bindings = {
  einao_db: D1Database
}

type Variables = {
  user: AuthUser
}

type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived'

type PostRow = {
  id: number
  title: string
  slug: string
  excerpt: string
  content_html: string
  content_json: string
  featured_image_url: string
  author_id: number | null
  status: PostStatus
  reading_minutes: number
  seo_title: string
  seo_description: string
  seo_canonical_url: string
  seo_og_image_url: string
  scheduled_for: string | null
  published_at: string | null
  post_type: string
  subtitle: string
  created_at: string
  updated_at: string
  author_name: string | null
  author_email: string | null
}

type CategoryInfo = {
  id: number
  name: string
  slug: string
}

type TagInfo = {
  id: number
  name: string
}

type AuthorInfo = {
  id: number
  name: string
  email: string
}

type PostSummary = {
  id: number
  title: string
  slug: string
  excerpt: string
  featured_image_url: string
  status: PostStatus
  published_at: string | null
  reading_minutes: number
  post_type: string
  subtitle: string
  author: AuthorInfo | null
  categories: CategoryInfo[]
  tags: TagInfo[]
  created_at: string
  updated_at: string
}

type PostResponse = PostSummary & {
  content_html: string
  content_json: string
  seo_title: string
  seo_description: string
  seo_canonical_url: string
  seo_og_image_url: string
  scheduled_for: string | null
}

type PostRevision = {
  id: number
  post_id: number
  title: string
  content_json: string
  created_at: string
  created_by: number | null
}

type PostCategoryRow = CategoryInfo & {
  post_id: number
}

type PostTagRow = TagInfo & {
  post_id: number
}

type PostQuery = {
  page: number
  pageSize: number
  status?: PostStatus
  category?: string
  tag?: string
  search?: string
  post_type?: string
}

type ListQueryOptions = {
  includeUnpublished: boolean
}

const PostStatusSchema = z
  .enum(['draft', 'scheduled', 'published', 'archived'])
  .openapi('PostStatus')

const AuthorSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
  })
  .openapi('PostAuthor')

const CategoryInfoSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  })
  .openapi('PostCategoryInfo')

const TagInfoSchema = z
  .object({
    id: z.number(),
    name: z.string(),
  })
  .openapi('PostTagInfo')

const PostTypeSchema = z.enum(['blog', 'industry', 'case_study', 'testimonial']).openapi('PostType')

const PostSummarySchema = z
  .object({
    id: z.number(),
    title: z.string(),
    slug: z.string(),
    excerpt: z.string(),
    featured_image_url: z.string(),
    status: PostStatusSchema,
    published_at: z.string().nullable(),
    reading_minutes: z.number(),
    post_type: PostTypeSchema,
    subtitle: z.string(),
    author: AuthorSchema.nullable(),
    categories: z.array(CategoryInfoSchema),
    tags: z.array(TagInfoSchema),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .openapi('PostSummary')

const PostSchema = PostSummarySchema.extend({
  content_html: z.string(),
  content_json: z.string(),
  seo_title: z.string(),
  seo_description: z.string(),
  seo_canonical_url: z.string(),
  seo_og_image_url: z.string(),
  scheduled_for: z.string().nullable(),
}).openapi('Post')

const JsonStringSchema = z.string().refine((value) => {
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}, 'content_json must be valid JSON')

const PostCreateSchema = z
  .object({
    title: z.string().min(1, 'title is required'),
    slug: z.string().min(1).optional(),
    excerpt: z.string().optional(),
    content_json: JsonStringSchema.optional(),
    content_html: z.string().optional(),
    featured_image_url: z.string().optional(),
    status: z.literal('draft').optional(),
    seo_title: z.string().optional(),
    seo_description: z.string().optional(),
    seo_canonical_url: z.string().optional(),
    seo_og_image_url: z.string().optional(),
    post_type: PostTypeSchema.optional(),
    subtitle: z.string().optional(),
    category_ids: z.array(z.number().int().positive()).optional(),
    tag_ids: z.array(z.number().int().positive()).optional(),
  })
  .openapi('PostCreate')

const PostUpdateSchema = z
  .object({
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    excerpt: z.string().optional(),
    content_json: JsonStringSchema.optional(),
    content_html: z.string().optional(),
    featured_image_url: z.string().optional(),
    status: z.literal('draft').optional(),
    author_id: z.number().int().positive().nullable().optional(),
    seo_title: z.string().optional(),
    seo_description: z.string().optional(),
    seo_canonical_url: z.string().optional(),
    seo_og_image_url: z.string().optional(),
    post_type: PostTypeSchema.optional(),
    subtitle: z.string().optional(),
    category_ids: z.array(z.number().int().positive()).optional(),
    tag_ids: z.array(z.number().int().positive()).optional(),
  })
  .openapi('PostUpdate')

const PostListSchema = z
  .object({
    items: z.array(PostSummarySchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  })
  .openapi('PostList')

const PostRevisionSchema = z
  .object({
    id: z.number(),
    post_id: z.number(),
    title: z.string(),
    content_json: z.string(),
    created_at: z.string(),
    created_by: z.number().nullable(),
  })
  .openapi('PostRevision')

const SchedulePostSchema = z
  .object({
    scheduled_for: z.string().min(1, 'scheduled_for is required'),
  })
  .openapi('PostSchedule')

const ErrorSchema = z
  .object({
    error: z.union([z.string(), z.record(z.string(), z.array(z.string()))]),
  })
  .openapi('PostError')

const IdParam = z.object({
  id: z.coerce
    .number()
    .int()
    .positive()
    .openapi({
      param: { name: 'id', in: 'path' },
      example: '1',
    }),
})

const RevisionParams = z.object({
  id: z.coerce
    .number()
    .int()
    .positive()
    .openapi({
      param: { name: 'id', in: 'path' },
      example: '1',
    }),
  rid: z.coerce
    .number()
    .int()
    .positive()
    .openapi({
      param: { name: 'rid', in: 'path' },
      example: '2',
    }),
})

const SlugParam = z.object({
  slug: z.string().openapi({
    param: { name: 'slug', in: 'path' },
    example: 'hello-world',
  }),
})

const ListPostsQuerySchema = z.object({
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
  status: PostStatusSchema.optional().openapi({
    param: { name: 'status', in: 'query' },
    example: 'published',
  }),
  category: z
    .string()
    .optional()
    .openapi({
      param: { name: 'category', in: 'query' },
      example: 'engineering',
    }),
  tag: z
    .string()
    .optional()
    .openapi({
      param: { name: 'tag', in: 'query' },
      example: 'cloudflare',
    }),
  search: z
    .string()
    .optional()
    .openapi({
      param: { name: 'search', in: 'query' },
      example: 'workers',
    }),
  post_type: PostTypeSchema.optional().openapi({
    param: { name: 'post_type', in: 'query' },
    example: 'industry',
  }),
})

const publicRouter = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: validationHook,
})

const adminRouter = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>({
  defaultHook: validationHook,
})

const blogRouter = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: validationHook,
})

function toDbDateTime(value: Date): string {
  return value.toISOString().replace('T', ' ').slice(0, 19)
}

function uniqueIds(ids: number[] | undefined): number[] {
  return [...new Set(ids ?? [])]
}

function authorFromRow(row: PostRow): AuthorInfo | null {
  if (row.author_id == null || !row.author_name || !row.author_email) {
    return null
  }

  return {
    id: row.author_id,
    name: row.author_name,
    email: row.author_email,
  }
}

function toPostSummary(
  row: PostRow,
  categories: CategoryInfo[] = [],
  tags: TagInfo[] = []
): PostSummary {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    featured_image_url: row.featured_image_url,
    status: row.status,
    published_at: row.published_at,
    reading_minutes: row.reading_minutes,
    post_type: row.post_type,
    subtitle: row.subtitle,
    author: authorFromRow(row),
    categories,
    tags,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function toPost(row: PostRow, categories: CategoryInfo[] = [], tags: TagInfo[] = []): PostResponse {
  return {
    ...toPostSummary(row, categories, tags),
    content_html: row.content_html,
    content_json: row.content_json,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    seo_canonical_url: row.seo_canonical_url,
    seo_og_image_url: row.seo_og_image_url,
    scheduled_for: row.scheduled_for,
  }
}

async function getPostCategories(
  db: D1Database,
  postIds: number[]
): Promise<Record<number, CategoryInfo[]>> {
  if (postIds.length === 0) return {}

  const placeholders = postIds.map(() => '?').join(', ')
  const { results } = await db
    .prepare(
      `SELECT pc.post_id, c.id, c.name, c.slug
       FROM post_categories pc
       JOIN categories c ON c.id = pc.category_id
       WHERE pc.post_id IN (${placeholders}) AND c.type = 'blog'
       ORDER BY c.sort_order ASC, c.id ASC`
    )
    .bind(...postIds)
    .all<PostCategoryRow>()

  const map: Record<number, CategoryInfo[]> = {}
  for (const row of results) {
    if (!map[row.post_id]) map[row.post_id] = []
    map[row.post_id].push({ id: row.id, name: row.name, slug: row.slug })
  }

  return map
}

async function getPostTags(db: D1Database, postIds: number[]): Promise<Record<number, TagInfo[]>> {
  if (postIds.length === 0) return {}

  const placeholders = postIds.map(() => '?').join(', ')
  const { results } = await db
    .prepare(
      `SELECT pt.post_id, t.id, t.name
       FROM post_tags pt
       JOIN tags t ON t.id = pt.tag_id
       WHERE pt.post_id IN (${placeholders})
       ORDER BY t.name ASC, t.id ASC`
    )
    .bind(...postIds)
    .all<PostTagRow>()

  const map: Record<number, TagInfo[]> = {}
  for (const row of results) {
    if (!map[row.post_id]) map[row.post_id] = []
    map[row.post_id].push({ id: row.id, name: row.name })
  }

  return map
}

async function listBlogCategories(db: D1Database): Promise<CategoryInfo[]> {
  const { results } = await db
    .prepare(
      `SELECT id, name, slug
       FROM categories
       WHERE type = 'blog'
       ORDER BY sort_order ASC, id ASC`
    )
    .all<CategoryInfo>()

  return results
}

async function validateCategoryIds(db: D1Database, categoryIds: number[]) {
  if (categoryIds.length === 0) {
    return null
  }

  const placeholders = categoryIds.map(() => '?').join(', ')
  const { results } = await db
    .prepare(`SELECT id FROM categories WHERE type = 'blog' AND id IN (${placeholders})`)
    .bind(...categoryIds)
    .all<{ id: number }>()

  return results.length === categoryIds.length
    ? null
    : 'One or more category_ids are invalid or not of type blog'
}

async function validateTagIds(db: D1Database, tagIds: number[]) {
  if (tagIds.length === 0) {
    return null
  }

  const placeholders = tagIds.map(() => '?').join(', ')
  const { results } = await db
    .prepare(`SELECT id FROM tags WHERE id IN (${placeholders})`)
    .bind(...tagIds)
    .all<{ id: number }>()

  return results.length === tagIds.length ? null : 'One or more tag_ids are invalid'
}

async function replacePostCategories(db: D1Database, postId: number, categoryIds: number[]) {
  const stmts = [
    db.prepare('DELETE FROM post_categories WHERE post_id = ?').bind(postId),
    ...categoryIds.map((categoryId) =>
      db
        .prepare('INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)')
        .bind(postId, categoryId)
    ),
  ]

  await db.batch(stmts)
}

async function replacePostTags(db: D1Database, postId: number, tagIds: number[]) {
  const stmts = [
    db.prepare('DELETE FROM post_tags WHERE post_id = ?').bind(postId),
    ...tagIds.map((tagId) =>
      db.prepare('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)').bind(postId, tagId)
    ),
  ]

  await db.batch(stmts)
}

async function syncPostFts(
  db: D1Database,
  postId: number,
  title: string,
  excerpt: string,
  contentHtml: string
) {
  const contentText = stripHtmlToText(contentHtml)

  await db.batch([
    db
      .prepare(
        `INSERT INTO posts_fts(posts_fts, rowid, title, excerpt, content_text)
         VALUES ('delete', ?, ?, ?, '')`
      )
      .bind(postId, title, excerpt),
    db
      .prepare('INSERT INTO posts_fts(rowid, title, excerpt, content_text) VALUES (?, ?, ?, ?)')
      .bind(postId, title, excerpt, contentText),
  ])
}

async function createRevision(
  db: D1Database,
  post: Pick<PostRow, 'id' | 'title' | 'content_json'>,
  createdBy: number | null
) {
  await db
    .prepare(
      `INSERT INTO post_revisions (post_id, title, content_json, created_by)
       VALUES (?, ?, ?, ?)`
    )
    .bind(post.id, post.title, post.content_json, createdBy)
    .run()
}

async function resolveAuthorId(db: D1Database, user?: AuthUser): Promise<number | null> {
  if (!user?.id) {
    return null
  }

  return user.id
}

/**
 * Convert a raw user search string into a safe FTS5 MATCH query.
 * Each word becomes a double-quoted prefix token (e.g. `"can"*`), which avoids
 * FTS5 syntax errors from special characters (apostrophes, hyphens, operators)
 * while keeping partial-word matching. Returns null when no usable tokens remain.
 */
function toFtsMatchQuery(raw: string): string | null {
  const tokens = raw
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length > 0)
    .map((token) => `"${token.replace(/"/g, '""')}"*`)

  return tokens.length > 0 ? tokens.join(' ') : null
}

function buildListQueryParts(filters: PostQuery, options: ListQueryOptions) {
  let fromClause = ' FROM posts p LEFT JOIN users u ON u.id = p.author_id'
  const joinBindings: unknown[] = []
  const whereBindings: unknown[] = []
  const where: string[] = []

  const ftsQuery = filters.search ? toFtsMatchQuery(filters.search) : null
  if (ftsQuery) {
    fromClause +=
      ' JOIN (SELECT rowid FROM posts_fts WHERE posts_fts MATCH ?) fts ON fts.rowid = p.id'
    joinBindings.push(ftsQuery)
  }

  if (filters.category) {
    fromClause +=
      ' JOIN post_categories pc_filter ON pc_filter.post_id = p.id JOIN categories c_filter ON c_filter.id = pc_filter.category_id'
    where.push('c_filter.type = ?', 'c_filter.slug = ?')
    whereBindings.push('blog', filters.category)
  }

  if (filters.tag) {
    fromClause +=
      ' JOIN post_tags pt_filter ON pt_filter.post_id = p.id JOIN tags t_filter ON t_filter.id = pt_filter.tag_id'
    where.push('t_filter.name = ?')
    whereBindings.push(filters.tag)
  }

  if (!options.includeUnpublished) {
    where.push(
      "p.status = 'published'",
      'p.published_at IS NOT NULL',
      "p.published_at <= datetime('now')"
    )
  }

  if (filters.status) {
    where.push('p.status = ?')
    whereBindings.push(filters.status)
  }

  if (filters.post_type) {
    where.push('p.post_type = ?')
    whereBindings.push(filters.post_type)
  }

  const whereClause = where.length > 0 ? ` WHERE ${where.join(' AND ')}` : ''

  return { fromClause, whereClause, bindings: [...joinBindings, ...whereBindings] }
}

async function listPosts(db: D1Database, filters: PostQuery, options: ListQueryOptions) {
  const { fromClause, whereClause, bindings } = buildListQueryParts(filters, options)
  const offset = (filters.page - 1) * filters.pageSize
  const orderBy = options.includeUnpublished
    ? ` ORDER BY COALESCE(p.published_at, p.scheduled_for, p.updated_at) DESC, p.id DESC`
    : ' ORDER BY p.published_at DESC, p.id DESC'

  const countRow = await db
    .prepare(`SELECT COUNT(DISTINCT p.id) AS total${fromClause}${whereClause}`)
    .bind(...bindings)
    .first<{ total: number }>()

  const { results } = await db
    .prepare(
      `SELECT DISTINCT
         p.id,
         p.title,
         p.slug,
         p.excerpt,
         p.content_html,
         p.content_json,
         p.featured_image_url,
         p.author_id,
         p.status,
         p.reading_minutes,
         p.post_type,
         p.subtitle,
         p.seo_title,
         p.seo_description,
         p.seo_canonical_url,
         p.seo_og_image_url,
         p.scheduled_for,
         p.published_at,
         p.created_at,
         p.updated_at,
         u.name AS author_name,
         u.email AS author_email
       ${fromClause}${whereClause}${orderBy}
       LIMIT ? OFFSET ?`
    )
    .bind(...bindings, filters.pageSize, offset)
    .all<PostRow>()

  const postIds = results.map((row) => row.id)
  const [categories, tags] = await Promise.all([
    getPostCategories(db, postIds),
    getPostTags(db, postIds),
  ])

  return {
    items: results.map((row) => toPostSummary(row, categories[row.id] ?? [], tags[row.id] ?? [])),
    total: countRow?.total ?? 0,
    page: filters.page,
    pageSize: filters.pageSize,
  }
}

async function getPostById(db: D1Database, id: number): Promise<PostRow | null> {
  return db
    .prepare(
      `SELECT
         p.id,
         p.title,
         p.slug,
         p.excerpt,
         p.content_html,
         p.content_json,
         p.featured_image_url,
         p.author_id,
         p.status,
         p.reading_minutes,
         p.post_type,
         p.subtitle,
         p.seo_title,
         p.seo_description,
         p.seo_canonical_url,
         p.seo_og_image_url,
         p.scheduled_for,
         p.published_at,
         p.created_at,
         p.updated_at,
         u.name AS author_name,
         u.email AS author_email
       FROM posts p
       LEFT JOIN users u ON u.id = p.author_id
       WHERE p.id = ?`
    )
    .bind(id)
    .first<PostRow>()
}

async function getPublishedPostBySlug(db: D1Database, slug: string): Promise<PostRow | null> {
  return db
    .prepare(
      `SELECT
         p.id,
         p.title,
         p.slug,
         p.excerpt,
         p.content_html,
         p.content_json,
         p.featured_image_url,
         p.author_id,
         p.status,
         p.reading_minutes,
         p.post_type,
         p.subtitle,
         p.seo_title,
         p.seo_description,
         p.seo_canonical_url,
         p.seo_og_image_url,
         p.scheduled_for,
         p.published_at,
         p.created_at,
         p.updated_at,
         u.name AS author_name,
         u.email AS author_email
       FROM posts p
       LEFT JOIN users u ON u.id = p.author_id
       WHERE p.slug = ?
         AND p.status = 'published'
         AND p.published_at IS NOT NULL
         AND p.published_at <= datetime('now')`
    )
    .bind(slug)
    .first<PostRow>()
}

async function hydratePost(db: D1Database, row: PostRow): Promise<PostResponse> {
  const [categories, tags] = await Promise.all([
    getPostCategories(db, [row.id]),
    getPostTags(db, [row.id]),
  ])

  return toPost(row, categories[row.id] ?? [], tags[row.id] ?? [])
}

function hasPublishableContent(post: Pick<PostRow, 'title' | 'content_html'>) {
  return post.title.trim().length > 0 && stripHtmlToText(post.content_html).length > 0
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const listPostsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Posts'],
  summary: 'List blog posts',
  request: { query: ListPostsQuerySchema },
  responses: {
    200: {
      description: 'Paginated blog posts',
      content: { 'application/json': { schema: PostListSchema } },
    },
  },
})

publicRouter.openapi(listPostsRoute, async (c) => {
  const query = c.req.valid('query')
  const response = await listPosts(c.env.einao_db, query, { includeUnpublished: false })
  return c.json(response, 200)
})

const listPostCategoriesRoute = createRoute({
  method: 'get',
  path: '/categories',
  tags: ['Posts'],
  summary: 'List blog categories',
  responses: {
    200: {
      description: 'Blog categories',
      content: { 'application/json': { schema: z.array(CategoryInfoSchema) } },
    },
  },
})

publicRouter.openapi(listPostCategoriesRoute, async (c) => {
  const categories = await listBlogCategories(c.env.einao_db)
  return c.json(categories, 200)
})

const getPostBySlugRoute = createRoute({
  method: 'get',
  path: '/{slug}',
  tags: ['Posts'],
  summary: 'Get a published blog post by slug',
  request: { params: SlugParam },
  responses: {
    200: {
      description: 'Blog post',
      content: { 'application/json': { schema: PostSchema } },
    },
    404: {
      description: 'Post not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

publicRouter.openapi(getPostBySlugRoute, async (c) => {
  const { slug } = c.req.valid('param')
  const row = await getPublishedPostBySlug(c.env.einao_db, slug)

  if (!row) {
    return c.json({ error: 'Post not found' }, 404)
  }

  return c.json(await hydratePost(c.env.einao_db, row), 200)
})

const adminListPostsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Admin - Posts'],
  summary: 'List all blog posts',
  request: { query: ListPostsQuerySchema },
  responses: {
    200: {
      description: 'Paginated blog posts',
      content: { 'application/json': { schema: PostListSchema } },
    },
  },
})

adminRouter.openapi(adminListPostsRoute, async (c) => {
  const query = c.req.valid('query')
  const response = await listPosts(c.env.einao_db, query, { includeUnpublished: true })
  return c.json(response, 200)
})

const getPostByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Admin - Posts'],
  summary: 'Get a blog post by ID',
  request: { params: IdParam },
  responses: {
    200: {
      description: 'Blog post',
      content: { 'application/json': { schema: PostSchema } },
    },
    404: {
      description: 'Post not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(getPostByIdRoute, async (c) => {
  const { id } = c.req.valid('param')
  const row = await getPostById(c.env.einao_db, id)

  if (!row) {
    return c.json({ error: 'Post not found' }, 404)
  }

  return c.json(await hydratePost(c.env.einao_db, row), 200)
})

const createPostRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Admin - Posts'],
  summary: 'Create a draft blog post',
  request: {
    body: {
      content: { 'application/json': { schema: PostCreateSchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'Created post',
      content: { 'application/json': { schema: PostSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(createPostRoute, async (c) => {
  const body = c.req.valid('json')
  const db = c.env.einao_db
  const categoryIds = uniqueIds(body.category_ids)
  const tagIds = uniqueIds(body.tag_ids)

  const categoryError = await validateCategoryIds(db, categoryIds)
  if (categoryError) {
    return c.json({ error: categoryError }, 400)
  }

  const tagError = await validateTagIds(db, tagIds)
  if (tagError) {
    return c.json({ error: tagError }, 400)
  }

  const slug = await ensureUniqueSlug(db, body.slug ?? body.title)
  const contentHtml = body.content_html ?? ''
  const contentText = stripHtmlToText(contentHtml)
  const excerptInput = body.excerpt ?? ''
  const excerpt = excerptInput.trim() ? excerptInput : deriveExcerpt(contentText)
  const readingMinutes = computeReadingMinutes(stripHtmlToText(contentHtml))
  const authorId = await resolveAuthorId(db, c.get('user'))

  const created = await db
    .prepare(
      `INSERT INTO posts (
         title,
         slug,
         excerpt,
         content_html,
         content_json,
         featured_image_url,
         author_id,
         status,
         reading_minutes,
         seo_title,
         seo_description,
         seo_canonical_url,
         seo_og_image_url,
         post_type,
         subtitle
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?)
       RETURNING
         id,
         title,
         slug,
         excerpt,
         content_html,
         content_json,
         featured_image_url,
         author_id,
         status,
         reading_minutes,
         post_type,
         subtitle,
         seo_title,
         seo_description,
         seo_canonical_url,
         seo_og_image_url,
         scheduled_for,
         published_at,
         created_at,
         updated_at`
    )
    .bind(
      body.title,
      slug,
      excerpt,
      contentHtml,
      body.content_json ?? '{}',
      body.featured_image_url ?? '',
      authorId,
      readingMinutes,
      body.seo_title ?? '',
      body.seo_description ?? '',
      body.seo_canonical_url ?? '',
      body.seo_og_image_url ?? '',
      body.post_type ?? 'blog',
      body.subtitle ?? ''
    )
    .first<Omit<PostRow, 'author_name' | 'author_email'>>()

  if (!created) {
    return c.json({ error: 'Post creation failed' }, 400)
  }

  await replacePostCategories(db, created.id, categoryIds)
  await replacePostTags(db, created.id, tagIds)
  await syncPostFts(db, created.id, created.title, created.excerpt, created.content_html)

  const row = await getPostById(db, created.id)
  if (!row) {
    return c.json({ error: 'Post not found after creation' }, 404)
  }

  return c.json(await hydratePost(db, row), 201)
})

const updatePostRoute = createRoute({
  method: 'patch',
  path: '/{id}',
  tags: ['Admin - Posts'],
  summary: 'Update a blog post',
  request: {
    params: IdParam,
    body: {
      content: { 'application/json': { schema: PostUpdateSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Updated post',
      content: { 'application/json': { schema: PostSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    404: {
      description: 'Post not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(updatePostRoute, async (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')
  const db = c.env.einao_db
  const existing = await getPostById(db, id)

  if (!existing) {
    return c.json({ error: 'Post not found' }, 404)
  }

  const categoryIds = body.category_ids ? uniqueIds(body.category_ids) : undefined
  const tagIds = body.tag_ids ? uniqueIds(body.tag_ids) : undefined

  if (categoryIds) {
    const categoryError = await validateCategoryIds(db, categoryIds)
    if (categoryError) {
      return c.json({ error: categoryError }, 400)
    }
  }

  if (tagIds) {
    const tagError = await validateTagIds(db, tagIds)
    if (tagError) {
      return c.json({ error: tagError }, 400)
    }
  }

  const createdBy = await resolveAuthorId(db, c.get('user'))
  await createRevision(db, existing, createdBy)

  const nextTitle = body.title ?? existing.title
  const nextSlug = body.slug ? await ensureUniqueSlug(db, body.slug, id) : existing.slug
  const nextContentHtml = body.content_html ?? existing.content_html
  const nextContentText = stripHtmlToText(nextContentHtml)
  const nextExcerpt =
    body.excerpt !== undefined
      ? body.excerpt.trim()
        ? body.excerpt
        : deriveExcerpt(nextContentText)
      : existing.excerpt.trim()
        ? existing.excerpt
        : deriveExcerpt(nextContentText)
  const nextContentJson = body.content_json ?? existing.content_json
  const nextScheduledFor = body.status === 'draft' ? null : existing.scheduled_for
  const nextReadingMinutes =
    body.content_html !== undefined || body.content_json !== undefined
      ? computeReadingMinutes(stripHtmlToText(nextContentHtml))
      : existing.reading_minutes

  await db
    .prepare(
      `UPDATE posts
       SET title = ?,
           slug = ?,
           excerpt = ?,
           content_html = ?,
           content_json = ?,
           featured_image_url = ?,
           author_id = ?,
           status = ?,
           reading_minutes = ?,
           seo_title = ?,
           seo_description = ?,
           seo_canonical_url = ?,
           seo_og_image_url = ?,
           post_type = ?,
           subtitle = ?,
           scheduled_for = ?,
           updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(
      nextTitle,
      nextSlug,
      nextExcerpt,
      nextContentHtml,
      nextContentJson,
      body.featured_image_url ?? existing.featured_image_url,
      body.author_id !== undefined ? body.author_id : existing.author_id,
      body.status ?? existing.status,
      nextReadingMinutes,
      body.seo_title ?? existing.seo_title,
      body.seo_description ?? existing.seo_description,
      body.seo_canonical_url ?? existing.seo_canonical_url,
      body.seo_og_image_url ?? existing.seo_og_image_url,
      body.post_type ?? existing.post_type,
      body.subtitle ?? existing.subtitle,
      nextScheduledFor,
      id
    )
    .run()

  if (categoryIds) {
    await replacePostCategories(db, id, categoryIds)
  }

  if (tagIds) {
    await replacePostTags(db, id, tagIds)
  }

  const updated = await getPostById(db, id)
  if (!updated) {
    return c.json({ error: 'Post not found' }, 404)
  }

  await syncPostFts(db, id, updated.title, updated.excerpt, updated.content_html)
  await pruneRevisions(db, id)

  return c.json(await hydratePost(db, updated), 200)
})

const PublishPostSchema = z
  .object({
    published_at: z.string().optional(),
  })
  .openapi('PostPublish')

const publishPostRoute = createRoute({
  method: 'post',
  path: '/{id}/publish',
  tags: ['Admin - Posts'],
  summary: 'Publish a blog post',
  request: {
    params: IdParam,
    body: {
      content: { 'application/json': { schema: PublishPostSchema } },
      required: false,
    },
  },
  responses: {
    200: {
      description: 'Published post',
      content: { 'application/json': { schema: PostSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    404: {
      description: 'Post not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(publishPostRoute, async (c) => {
  const { id } = c.req.valid('param')
  const body = await c.req.json().catch(() => ({}))
  const db = c.env.einao_db
  const existing = await getPostById(db, id)

  if (!existing) {
    return c.json({ error: 'Post not found' }, 404)
  }

  if (!hasPublishableContent(existing)) {
    return c.json({ error: 'Post must have a title and non-empty content before publishing' }, 400)
  }

  let publishedAtSql = "datetime('now')"
  const binds: (string | number)[] = [id]

  if (body.published_at) {
    const parsed = new Date(body.published_at)
    if (Number.isNaN(parsed.getTime())) {
      return c.json({ error: 'published_at must be a valid datetime' }, 400)
    }
    publishedAtSql = '?'
    binds.unshift(toDbDateTime(parsed))
  }

  await db
    .prepare(
      `UPDATE posts
       SET status = 'published',
           published_at = ${publishedAtSql},
           scheduled_for = NULL,
           updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(...binds)
    .run()

  const updated = await getPostById(db, id)
  if (!updated) {
    return c.json({ error: 'Post not found' }, 404)
  }

  await syncPostFts(db, id, updated.title, updated.excerpt, updated.content_html)
  return c.json(await hydratePost(db, updated), 200)
})

const schedulePostRoute = createRoute({
  method: 'post',
  path: '/{id}/schedule',
  tags: ['Admin - Posts'],
  summary: 'Schedule a blog post',
  request: {
    params: IdParam,
    body: {
      content: { 'application/json': { schema: SchedulePostSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Scheduled post',
      content: { 'application/json': { schema: PostSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    404: {
      description: 'Post not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(schedulePostRoute, async (c) => {
  const { id } = c.req.valid('param')
  const { scheduled_for } = c.req.valid('json')
  const db = c.env.einao_db
  const existing = await getPostById(db, id)

  if (!existing) {
    return c.json({ error: 'Post not found' }, 404)
  }

  const scheduledFor = new Date(scheduled_for)
  if (Number.isNaN(scheduledFor.getTime())) {
    return c.json({ error: 'scheduled_for must be a valid datetime' }, 400)
  }

  if (scheduledFor.getTime() <= Date.now()) {
    return c.json({ error: 'scheduled_for must be in the future' }, 400)
  }

  await db
    .prepare(
      `UPDATE posts
       SET status = 'scheduled',
           scheduled_for = ?,
           updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(toDbDateTime(scheduledFor), id)
    .run()

  const updated = await getPostById(db, id)
  if (!updated) {
    return c.json({ error: 'Post not found' }, 404)
  }

  await syncPostFts(db, id, updated.title, updated.excerpt, updated.content_html)
  return c.json(await hydratePost(db, updated), 200)
})

const unpublishPostRoute = createRoute({
  method: 'post',
  path: '/{id}/unpublish',
  tags: ['Admin - Posts'],
  summary: 'Unpublish a blog post',
  request: { params: IdParam },
  responses: {
    200: {
      description: 'Unpublished post',
      content: { 'application/json': { schema: PostSchema } },
    },
    404: {
      description: 'Post not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(unpublishPostRoute, async (c) => {
  const { id } = c.req.valid('param')
  const db = c.env.einao_db
  const existing = await getPostById(db, id)

  if (!existing) {
    return c.json({ error: 'Post not found' }, 404)
  }

  await db
    .prepare(
      `UPDATE posts
       SET status = 'draft',
           scheduled_for = NULL,
           updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(id)
    .run()

  const updated = await getPostById(db, id)
  if (!updated) {
    return c.json({ error: 'Post not found' }, 404)
  }

  await syncPostFts(db, id, updated.title, updated.excerpt, updated.content_html)
  return c.json(await hydratePost(db, updated), 200)
})

const deletePostRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Admin - Posts'],
  summary: 'Archive a blog post',
  request: { params: IdParam },
  responses: {
    200: {
      description: 'Archived post',
      content: { 'application/json': { schema: PostSchema } },
    },
    404: {
      description: 'Post not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(deletePostRoute, async (c) => {
  const { id } = c.req.valid('param')
  const db = c.env.einao_db
  const existing = await getPostById(db, id)

  if (!existing) {
    return c.json({ error: 'Post not found' }, 404)
  }

  await db
    .prepare(
      `UPDATE posts
       SET status = 'archived',
           scheduled_for = NULL,
           updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(id)
    .run()

  const updated = await getPostById(db, id)
  if (!updated) {
    return c.json({ error: 'Post not found' }, 404)
  }

  await syncPostFts(db, id, updated.title, updated.excerpt, updated.content_html)
  return c.json(await hydratePost(db, updated), 200)
})

const listRevisionsRoute = createRoute({
  method: 'get',
  path: '/{id}/revisions',
  tags: ['Admin - Posts'],
  summary: 'List post revisions',
  request: { params: IdParam },
  responses: {
    200: {
      description: 'Post revisions',
      content: { 'application/json': { schema: z.array(PostRevisionSchema) } },
    },
    404: {
      description: 'Post not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(listRevisionsRoute, async (c) => {
  const { id } = c.req.valid('param')
  const db = c.env.einao_db
  const existing = await getPostById(db, id)

  if (!existing) {
    return c.json({ error: 'Post not found' }, 404)
  }

  const { results } = await db
    .prepare(
      `SELECT id, post_id, title, content_json, created_at, created_by
       FROM post_revisions
       WHERE post_id = ?
       ORDER BY created_at DESC, id DESC`
    )
    .bind(id)
    .all<PostRevision>()

  return c.json(results, 200)
})

const restoreRevisionRoute = createRoute({
  method: 'post',
  path: '/{id}/revisions/{rid}/restore',
  tags: ['Admin - Posts'],
  summary: 'Restore a post revision',
  request: { params: RevisionParams },
  responses: {
    200: {
      description: 'Restored post',
      content: { 'application/json': { schema: PostSchema } },
    },
    404: {
      description: 'Post or revision not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(restoreRevisionRoute, async (c) => {
  const { id, rid } = c.req.valid('param')
  const db = c.env.einao_db
  const existing = await getPostById(db, id)

  if (!existing) {
    return c.json({ error: 'Post not found' }, 404)
  }

  const revision = await db
    .prepare(
      `SELECT id, post_id, title, content_json, created_at, created_by
       FROM post_revisions
       WHERE id = ? AND post_id = ?`
    )
    .bind(rid, id)
    .first<PostRevision>()

  if (!revision) {
    return c.json({ error: 'Revision not found' }, 404)
  }

  const createdBy = await resolveAuthorId(db, c.get('user'))
  await createRevision(db, existing, createdBy)

  await db
    .prepare(
      `UPDATE posts
       SET title = ?,
           content_json = ?,
           reading_minutes = ?,
           updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(
      revision.title,
      revision.content_json,
      computeReadingMinutes(stripHtmlToText(existing.content_html)),
      id
    )
    .run()

  const updated = await getPostById(db, id)
  if (!updated) {
    return c.json({ error: 'Post not found' }, 404)
  }

  await syncPostFts(db, id, updated.title, updated.excerpt, updated.content_html)
  await pruneRevisions(db, id)

  return c.json(await hydratePost(db, updated), 200)
})

const blogCategoriesRoute = createRoute({
  method: 'get',
  path: '/categories',
  tags: ['Blog'],
  summary: 'List blog categories',
  responses: {
    200: {
      description: 'Blog categories',
      content: { 'application/json': { schema: z.array(CategoryInfoSchema) } },
    },
  },
})

blogRouter.openapi(blogCategoriesRoute, async (c) => {
  const categories = await listBlogCategories(c.env.einao_db)
  return c.json(categories, 200)
})

const rssRoute = createRoute({
  method: 'get',
  path: '/rss.xml',
  tags: ['Blog'],
  summary: 'Get blog RSS feed',
  responses: {
    200: {
      description: 'RSS feed',
      content: { 'application/rss+xml': { schema: z.string() } },
    },
  },
})

blogRouter.openapi(rssRoute, async (c) => {
  const { results } = await c.env.einao_db
    .prepare(
      `SELECT
         id,
         title,
         slug,
         excerpt,
         content_html,
         published_at,
         updated_at
       FROM posts
       WHERE status = 'published'
         AND published_at IS NOT NULL
         AND published_at <= datetime('now')
       ORDER BY published_at DESC, id DESC
       LIMIT 20`
    )
    .all<{
      id: number
      title: string
      slug: string
      excerpt: string
      content_html: string
      published_at: string
      updated_at: string
    }>()

  const url = new URL(c.req.url)
  const siteOrigin = url.origin
  const feedUrl = `${siteOrigin}/api/v1/blog/rss.xml`
  const lastBuildDate = results[0]?.updated_at ?? toDbDateTime(new Date())

  const items = results
    .map((post) => {
      const link = `${siteOrigin}/blog/${post.slug}`
      const description = post.excerpt || stripHtmlToText(post.content_html)
      return `
    <item>
      <title>${xmlEscape(post.title)}</title>
      <link>${xmlEscape(link)}</link>
      <guid>${xmlEscape(link)}</guid>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
      <description><![CDATA[${description}]]></description>
    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Einao Blog</title>
    <link>${xmlEscape(siteOrigin)}</link>
    <description>Latest posts from Einao</description>
    <lastBuildDate>${new Date(lastBuildDate).toUTCString()}</lastBuildDate>
    <atom:link href="${xmlEscape(feedUrl)}" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom" />${items}
  </channel>
</rss>`

  return c.body(xml, 200, {
    'content-type': 'application/rss+xml; charset=utf-8',
  })
})

export { adminRouter, blogRouter }
export default publicRouter
