import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { validationHook } from '../lib/validation-hook'

type Bindings = {
  einao_db: D1Database
}

type ProjectRow = {
  id: number
  name: string
  slug: string
  description: string
  tags: string
  main_image_url: string
  overlay_images: string
  link_url: string
  sort_order: number
  is_featured: number
  genre: string
  platform: string
  status: string
  status_label: string
  features: string
  stats: string
  primary_action_label: string
  primary_action_href: string
  secondary_action_label: string
  secondary_action_href: string
  hero_bg: string
  hero_svg_fill: string
  hero_badges: string
  hero_video_src: string
  hero_image_src: string
  hero_coming_soon: number
  title_pre: string
  title_accent: string
  created_at: string
  updated_at: string
}

type CategoryInfo = {
  id: number
  name: string
  slug: string
}

type ProjectResponse = {
  id: number
  name: string
  slug: string
  description: string
  tags: string[]
  main_image_url: string
  overlay_images: string[]
  link_url: string
  sort_order: number
  is_featured: boolean
  genre: string
  platform: string
  status: string
  status_label: string
  features: string[]
  stats: Array<{ num: string; label: string }>
  primary_action_label: string
  primary_action_href: string
  secondary_action_label: string
  secondary_action_href: string
  hero_bg: string
  hero_svg_fill: string
  hero_badges: string[]
  hero_video_src: string
  hero_image_src: string
  hero_coming_soon: boolean
  title_pre: string
  title_accent: string
  categories: CategoryInfo[]
  created_at: string
  updated_at: string
}

async function getProjectCategories(
  db: D1Database,
  projectIds: number[]
): Promise<Record<number, CategoryInfo[]>> {
  if (projectIds.length === 0) return {}
  const placeholders = projectIds.map(() => '?').join(', ')
  const { results } = await db
    .prepare(
      `SELECT pc.project_id, c.id, c.name, c.slug
       FROM project_categories pc
       JOIN categories c ON c.id = pc.category_id
       WHERE pc.project_id IN (${placeholders})
       ORDER BY c.sort_order ASC, c.id ASC`
    )
    .bind(...projectIds)
    .all<{ project_id: number; id: number; name: string; slug: string }>()

  const map: Record<number, CategoryInfo[]> = {}
  for (const row of results) {
    if (!map[row.project_id]) map[row.project_id] = []
    map[row.project_id].push({ id: row.id, name: row.name, slug: row.slug })
  }
  return map
}

function rowToResponse(row: ProjectRow, categories: CategoryInfo[] = []): ProjectResponse {
  return {
    ...row,
    tags: JSON.parse(row.tags),
    overlay_images: JSON.parse(row.overlay_images),
    is_featured: row.is_featured === 1,
    features: JSON.parse(row.features || '[]'),
    stats: JSON.parse(row.stats || '[]'),
    hero_badges: JSON.parse(row.hero_badges || '[]'),
    hero_coming_soon: row.hero_coming_soon === 1,
    categories,
  }
}

function requireProject(row: ProjectRow | null) {
  if (!row) {
    throw new Error('Project mutation failed')
  }

  return row
}

async function validateProjectCategoryIds(db: D1Database, categoryIds: number[]) {
  if (categoryIds.length === 0) {
    return null
  }

  const placeholders = categoryIds.map(() => '?').join(', ')
  const { results } = await db
    .prepare(`SELECT id FROM categories WHERE id IN (${placeholders}) AND type = 'project'`)
    .bind(...categoryIds)
    .all<{ id: number }>()

  return results.length === categoryIds.length
    ? null
    : 'One or more category_ids are invalid or not of type project'
}

async function replaceProjectCategories(db: D1Database, projectId: number, categoryIds: number[]) {
  const stmts = [
    db.prepare('DELETE FROM project_categories WHERE project_id = ?').bind(projectId),
    ...categoryIds.map((categoryId) =>
      db
        .prepare('INSERT INTO project_categories (project_id, category_id) VALUES (?, ?)')
        .bind(projectId, categoryId)
    ),
  ]

  await db.batch(stmts)
}

const CategoryInfoSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  })
  .openapi('CategoryInfo')

const ProjectSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    main_image_url: z.string(),
    overlay_images: z.array(z.string()),
    link_url: z.string(),
    sort_order: z.number(),
    is_featured: z.boolean(),
    genre: z.string(),
    platform: z.string(),
    status: z.string(),
    status_label: z.string(),
    features: z.array(z.string()),
    stats: z.array(z.object({ num: z.string(), label: z.string() })),
    primary_action_label: z.string(),
    primary_action_href: z.string(),
    secondary_action_label: z.string(),
    secondary_action_href: z.string(),
    hero_bg: z.string(),
    hero_svg_fill: z.string(),
    hero_badges: z.array(z.string()),
    hero_video_src: z.string(),
    hero_image_src: z.string(),
    hero_coming_soon: z.boolean(),
    title_pre: z.string(),
    title_accent: z.string(),
    categories: z.array(CategoryInfoSchema),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .openapi('Project')

const CreateProjectSchema = z
  .object({
    name: z.string().min(1, 'name is required'),
    slug: z
      .string()
      .min(1, 'slug is required')
      .regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens'),
    description: z.string().default(''),
    tags: z.array(z.string()).default([]),
    main_image_url: z.string().default(''),
    overlay_images: z.array(z.string().url('each must be a valid URL')).default([]),
    link_url: z.string().default(''),
    sort_order: z.number().int().default(0),
    is_featured: z.boolean().default(true),
    category_ids: z.array(z.number().int()).default([]),
    genre: z.string().default(''),
    platform: z.string().default(''),
    status: z.string().default('live'),
    status_label: z.string().default(''),
    features: z.array(z.string()).default([]),
    stats: z.array(z.object({ num: z.string(), label: z.string() })).default([]),
    primary_action_label: z.string().default(''),
    primary_action_href: z.string().default(''),
    secondary_action_label: z.string().default(''),
    secondary_action_href: z.string().default(''),
    hero_bg: z.string().default(''),
    hero_svg_fill: z.string().default(''),
    hero_badges: z.array(z.string()).default([]),
    hero_video_src: z.string().default(''),
    hero_image_src: z.string().default(''),
    hero_coming_soon: z.boolean().default(false),
    title_pre: z.string().default(''),
    title_accent: z.string().default(''),
  })
  .openapi('CreateProjectRequest')

const UpdateProjectSchema = z
  .object({
    name: z.string().min(1, 'name is required').optional(),
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens')
      .optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    main_image_url: z.string().optional(),
    overlay_images: z.array(z.string().url('each must be a valid URL')).optional(),
    link_url: z.string().optional(),
    sort_order: z.number().int().optional(),
    is_featured: z.boolean().optional(),
    category_ids: z.array(z.number().int()).optional(),
    genre: z.string().optional(),
    platform: z.string().optional(),
    status: z.string().optional(),
    status_label: z.string().optional(),
    features: z.array(z.string()).optional(),
    stats: z.array(z.object({ num: z.string(), label: z.string() })).optional(),
    primary_action_label: z.string().optional(),
    primary_action_href: z.string().optional(),
    secondary_action_label: z.string().optional(),
    secondary_action_href: z.string().optional(),
    hero_bg: z.string().optional(),
    hero_svg_fill: z.string().optional(),
    hero_badges: z.array(z.string()).optional(),
    hero_video_src: z.string().optional(),
    hero_image_src: z.string().optional(),
    hero_coming_soon: z.boolean().optional(),
    title_pre: z.string().optional(),
    title_accent: z.string().optional(),
  })
  .openapi('UpdateProjectRequest')

const ErrorSchema = z
  .object({
    error: z.union([z.string(), z.record(z.string(), z.array(z.string()))]),
  })
  .openapi('ProjectError')

const SlugParam = z.object({
  slug: z.string().openapi({
    param: { name: 'slug', in: 'path' },
    example: 'illustrations-set',
  }),
})

const publicRouter = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: validationHook,
})

const adminRouter = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: validationHook,
})

const listProjects = createRoute({
  method: 'get',
  path: '/',
  tags: ['Projects'],
  summary: 'List projects',
  request: {
    query: z.object({
      featured: z
        .string()
        .optional()
        .openapi({
          param: { name: 'featured', in: 'query' },
          example: 'true',
        }),
      category: z
        .string()
        .optional()
        .openapi({
          param: { name: 'category', in: 'query' },
          description: 'Filter by category slug',
          example: 'web-design',
        }),
    }),
  },
  responses: {
    200: {
      description: 'Array of projects',
      content: { 'application/json': { schema: z.array(ProjectSchema) } },
    },
  },
})

publicRouter.openapi(listProjects, async (c) => {
  const { featured, category } = c.req.valid('query')

  let query = 'SELECT DISTINCT p.* FROM projects p'
  const bindings: unknown[] = []
  const conditions: string[] = []

  if (category) {
    query +=
      ' JOIN project_categories pc ON pc.project_id = p.id JOIN categories cat ON cat.id = pc.category_id'
    conditions.push('cat.slug = ? AND cat.type = ?')
    bindings.push(category, 'project')
  }

  if (featured === 'true') {
    conditions.push('p.is_featured = 1')
  } else if (featured === 'false') {
    conditions.push('p.is_featured = 0')
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`
  }

  query += ' ORDER BY p.sort_order ASC, p.id ASC'

  const { results } = await c.env.einao_db
    .prepare(query)
    .bind(...bindings)
    .all<ProjectRow>()

  const projectIds = results.map((r) => r.id)
  const catMap = await getProjectCategories(c.env.einao_db, projectIds)

  return c.json(
    results.map((r) => rowToResponse(r, catMap[r.id] ?? [])),
    200
  )
})

const getProject = createRoute({
  method: 'get',
  path: '/{slug}',
  tags: ['Projects'],
  summary: 'Get a project by slug',
  request: { params: SlugParam },
  responses: {
    200: {
      description: 'Project found',
      content: { 'application/json': { schema: ProjectSchema } },
    },
    404: {
      description: 'Project not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

publicRouter.openapi(getProject, async (c) => {
  const { slug } = c.req.valid('param')

  const row = await c.env.einao_db
    .prepare('SELECT * FROM projects WHERE slug = ?')
    .bind(slug)
    .first<ProjectRow>()

  if (!row) {
    return c.json({ error: 'Project not found' }, 404)
  }

  const catMap = await getProjectCategories(c.env.einao_db, [row.id])
  return c.json(rowToResponse(row, catMap[row.id] ?? []), 200)
})

const createProject = createRoute({
  method: 'post',
  path: '/',
  tags: ['Admin - Projects'],
  summary: 'Create a project',
  request: {
    body: {
      content: { 'application/json': { schema: CreateProjectSchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'Project created',
      content: { 'application/json': { schema: ProjectSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    409: {
      description: 'Slug already exists',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(createProject, async (c) => {
  const body = c.req.valid('json')

  const existing = await c.env.einao_db
    .prepare('SELECT id FROM projects WHERE slug = ?')
    .bind(body.slug)
    .first()

  if (existing) {
    return c.json({ error: 'A project with this slug already exists' }, 409)
  }

  const validationError = await validateProjectCategoryIds(c.env.einao_db, body.category_ids)
  if (validationError) {
    return c.json({ error: validationError }, 400)
  }

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)

  const result = await c.env.einao_db
    .prepare(
      `INSERT INTO projects (name, slug, description, tags, main_image_url, overlay_images, link_url, sort_order, is_featured, genre, platform, status, status_label, features, stats, primary_action_label, primary_action_href, secondary_action_label, secondary_action_href, hero_bg, hero_svg_fill, hero_badges, hero_video_src, hero_image_src, hero_coming_soon, title_pre, title_accent, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
    )
    .bind(
      body.name,
      body.slug,
      body.description,
      JSON.stringify(body.tags),
      body.main_image_url,
      JSON.stringify(body.overlay_images),
      body.link_url,
      body.sort_order,
      body.is_featured ? 1 : 0,
      body.genre,
      body.platform,
      body.status,
      body.status_label,
      JSON.stringify(body.features),
      JSON.stringify(body.stats),
      body.primary_action_label,
      body.primary_action_href,
      body.secondary_action_label,
      body.secondary_action_href,
      body.hero_bg,
      body.hero_svg_fill,
      JSON.stringify(body.hero_badges),
      body.hero_video_src,
      body.hero_image_src,
      body.hero_coming_soon ? 1 : 0,
      body.title_pre,
      body.title_accent,
      now,
      now
    )
    .first<ProjectRow>()

  const project = requireProject(result)

  if (body.category_ids.length > 0) {
    await replaceProjectCategories(c.env.einao_db, project.id, body.category_ids)
  }

  const catMap = await getProjectCategories(c.env.einao_db, [project.id])
  return c.json(rowToResponse(project, catMap[project.id] ?? []), 201)
})

const updateProject = createRoute({
  method: 'put',
  path: '/{slug}',
  tags: ['Admin - Projects'],
  summary: 'Update a project',
  request: {
    params: SlugParam,
    body: {
      content: { 'application/json': { schema: UpdateProjectSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Project updated',
      content: { 'application/json': { schema: ProjectSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    404: {
      description: 'Project not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(updateProject, async (c) => {
  const { slug } = c.req.valid('param')
  const body = c.req.valid('json')

  const existing = await c.env.einao_db
    .prepare('SELECT * FROM projects WHERE slug = ?')
    .bind(slug)
    .first<ProjectRow>()

  if (!existing) {
    return c.json({ error: 'Project not found' }, 404)
  }

  const validationError = body.category_ids
    ? await validateProjectCategoryIds(c.env.einao_db, body.category_ids)
    : null
  if (validationError) {
    return c.json({ error: validationError }, 400)
  }

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const updated = {
    name: body.name ?? existing.name,
    slug: body.slug ?? existing.slug,
    description: body.description ?? existing.description,
    tags: body.tags ? JSON.stringify(body.tags) : existing.tags,
    main_image_url: body.main_image_url ?? existing.main_image_url,
    overlay_images: body.overlay_images
      ? JSON.stringify(body.overlay_images)
      : existing.overlay_images,
    link_url: body.link_url ?? existing.link_url,
    sort_order: body.sort_order ?? existing.sort_order,
    is_featured: body.is_featured !== undefined ? (body.is_featured ? 1 : 0) : existing.is_featured,
    genre: body.genre ?? existing.genre,
    platform: body.platform ?? existing.platform,
    status: body.status ?? existing.status,
    status_label: body.status_label ?? existing.status_label,
    features: body.features ? JSON.stringify(body.features) : existing.features,
    stats: body.stats ? JSON.stringify(body.stats) : existing.stats,
    primary_action_label: body.primary_action_label ?? existing.primary_action_label,
    primary_action_href: body.primary_action_href ?? existing.primary_action_href,
    secondary_action_label: body.secondary_action_label ?? existing.secondary_action_label,
    secondary_action_href: body.secondary_action_href ?? existing.secondary_action_href,
    hero_bg: body.hero_bg ?? existing.hero_bg,
    hero_svg_fill: body.hero_svg_fill ?? existing.hero_svg_fill,
    hero_badges: body.hero_badges ? JSON.stringify(body.hero_badges) : existing.hero_badges,
    hero_video_src: body.hero_video_src ?? existing.hero_video_src,
    hero_image_src: body.hero_image_src ?? existing.hero_image_src,
    hero_coming_soon: body.hero_coming_soon !== undefined ? (body.hero_coming_soon ? 1 : 0) : existing.hero_coming_soon,
    title_pre: body.title_pre ?? existing.title_pre,
    title_accent: body.title_accent ?? existing.title_accent,
  }

  const result = await c.env.einao_db
    .prepare(
      `UPDATE projects SET name = ?, slug = ?, description = ?, tags = ?, main_image_url = ?, overlay_images = ?, link_url = ?, sort_order = ?, is_featured = ?, genre = ?, platform = ?, status = ?, status_label = ?, features = ?, stats = ?, primary_action_label = ?, primary_action_href = ?, secondary_action_label = ?, secondary_action_href = ?, hero_bg = ?, hero_svg_fill = ?, hero_badges = ?, hero_video_src = ?, hero_image_src = ?, hero_coming_soon = ?, title_pre = ?, title_accent = ?, updated_at = ?
       WHERE id = ? RETURNING *`
    )
    .bind(
      updated.name,
      updated.slug,
      updated.description,
      updated.tags,
      updated.main_image_url,
      updated.overlay_images,
      updated.link_url,
      updated.sort_order,
      updated.is_featured,
      updated.genre,
      updated.platform,
      updated.status,
      updated.status_label,
      updated.features,
      updated.stats,
      updated.primary_action_label,
      updated.primary_action_href,
      updated.secondary_action_label,
      updated.secondary_action_href,
      updated.hero_bg,
      updated.hero_svg_fill,
      updated.hero_badges,
      updated.hero_video_src,
      updated.hero_image_src,
      updated.hero_coming_soon,
      updated.title_pre,
      updated.title_accent,
      now,
      existing.id
    )
    .first<ProjectRow>()

  if (body.category_ids !== undefined) {
    await replaceProjectCategories(c.env.einao_db, existing.id, body.category_ids)
  }

  const project = requireProject(result)
  const catMap = await getProjectCategories(c.env.einao_db, [project.id])
  return c.json(rowToResponse(project, catMap[project.id] ?? []), 200)
})

const deleteProject = createRoute({
  method: 'delete',
  path: '/{slug}',
  tags: ['Admin - Projects'],
  summary: 'Delete a project',
  request: { params: SlugParam },
  responses: {
    200: {
      description: 'Project deleted',
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean() }),
        },
      },
    },
    404: {
      description: 'Project not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(deleteProject, async (c) => {
  const { slug } = c.req.valid('param')

  const result = await c.env.einao_db
    .prepare('DELETE FROM projects WHERE slug = ? RETURNING id')
    .bind(slug)
    .first<{ id: number }>()

  if (!result) {
    return c.json({ error: 'Project not found' }, 404)
  }

  return c.json({ success: true }, 200)
})

export { adminRouter }
export default publicRouter
