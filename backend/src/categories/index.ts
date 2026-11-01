import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { validationHook } from '../lib/validation-hook'

type Bindings = {
  einao_db: D1Database
}

type CategoryRow = {
  id: number
  name: string
  slug: string
  type: string
  sort_order: number
  created_at: string
  updated_at: string
}

function requireCategory(row: CategoryRow | null) {
  if (!row) {
    throw new Error('Category mutation failed')
  }

  return row
}

const CategorySchema = z
  .object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    type: z.string(),
    sort_order: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .openapi('Category')

const CreateCategorySchema = z
  .object({
    name: z.string().min(1, 'name is required'),
    slug: z
      .string()
      .min(1, 'slug is required')
      .regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens'),
    type: z.string().min(1, 'type is required').default('project'),
    sort_order: z.number().int().default(0),
  })
  .openapi('CreateCategoryRequest')

const UpdateCategorySchema = z
  .object({
    name: z.string().min(1).optional(),
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens')
      .optional(),
    sort_order: z.number().int().optional(),
  })
  .openapi('UpdateCategoryRequest')

const ErrorSchema = z
  .object({
    error: z.union([z.string(), z.record(z.string(), z.array(z.string()))]),
  })
  .openapi('CategoryError')

const TypeQuery = z.object({
  type: z
    .string()
    .optional()
    .openapi({
      param: { name: 'type', in: 'query' },
      example: 'project',
    }),
})

const SlugAndTypeParams = z.object({
  type: z.string().openapi({
    param: { name: 'type', in: 'path' },
    example: 'project',
  }),
  slug: z.string().openapi({
    param: { name: 'slug', in: 'path' },
    example: 'web-design',
  }),
})

const publicRouter = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: validationHook,
})

const adminRouter = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: validationHook,
})

const listCategories = createRoute({
  method: 'get',
  path: '/',
  tags: ['Categories'],
  summary: 'List categories',
  request: { query: TypeQuery },
  responses: {
    200: {
      description: 'Array of categories',
      content: { 'application/json': { schema: z.array(CategorySchema) } },
    },
  },
})

publicRouter.openapi(listCategories, async (c) => {
  const { type } = c.req.valid('query')

  let query = 'SELECT * FROM categories'
  const bindings: string[] = []

  if (type) {
    query += ' WHERE type = ?'
    bindings.push(type)
  }

  query += ' ORDER BY sort_order ASC, id ASC'

  const { results } = await c.env.einao_db
    .prepare(query)
    .bind(...bindings)
    .all<CategoryRow>()

  return c.json(results, 200)
})

const getCategory = createRoute({
  method: 'get',
  path: '/{type}/{slug}',
  tags: ['Categories'],
  summary: 'Get a category by type and slug',
  request: { params: SlugAndTypeParams },
  responses: {
    200: {
      description: 'Category found',
      content: { 'application/json': { schema: CategorySchema } },
    },
    404: {
      description: 'Category not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

publicRouter.openapi(getCategory, async (c) => {
  const { type, slug } = c.req.valid('param')

  const row = await c.env.einao_db
    .prepare('SELECT * FROM categories WHERE type = ? AND slug = ?')
    .bind(type, slug)
    .first<CategoryRow>()

  if (!row) {
    return c.json({ error: 'Category not found' }, 404)
  }

  return c.json(row, 200)
})

const createCategory = createRoute({
  method: 'post',
  path: '/',
  tags: ['Admin - Categories'],
  summary: 'Create a category',
  request: {
    body: {
      content: { 'application/json': { schema: CreateCategorySchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'Category created',
      content: { 'application/json': { schema: CategorySchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    409: {
      description: 'Category with this slug and type already exists',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(createCategory, async (c) => {
  const body = c.req.valid('json')

  const existing = await c.env.einao_db
    .prepare('SELECT id FROM categories WHERE type = ? AND slug = ?')
    .bind(body.type, body.slug)
    .first()

  if (existing) {
    return c.json({ error: 'A category with this slug and type already exists' }, 409)
  }

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)

  const result = await c.env.einao_db
    .prepare(
      `INSERT INTO categories (name, slug, type, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?) RETURNING *`
    )
    .bind(body.name, body.slug, body.type, body.sort_order, now, now)
    .first<CategoryRow>()

  return c.json(requireCategory(result), 201)
})

const updateCategory = createRoute({
  method: 'put',
  path: '/{type}/{slug}',
  tags: ['Admin - Categories'],
  summary: 'Update a category',
  request: {
    params: SlugAndTypeParams,
    body: {
      content: { 'application/json': { schema: UpdateCategorySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Category updated',
      content: { 'application/json': { schema: CategorySchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    404: {
      description: 'Category not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(updateCategory, async (c) => {
  const { type, slug } = c.req.valid('param')
  const body = c.req.valid('json')

  const existing = await c.env.einao_db
    .prepare('SELECT * FROM categories WHERE type = ? AND slug = ?')
    .bind(type, slug)
    .first<CategoryRow>()

  if (!existing) {
    return c.json({ error: 'Category not found' }, 404)
  }

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const updated = {
    name: body.name ?? existing.name,
    slug: body.slug ?? existing.slug,
    sort_order: body.sort_order ?? existing.sort_order,
  }

  const result = await c.env.einao_db
    .prepare(
      `UPDATE categories SET name = ?, slug = ?, sort_order = ?, updated_at = ?
       WHERE id = ? RETURNING *`
    )
    .bind(updated.name, updated.slug, updated.sort_order, now, existing.id)
    .first<CategoryRow>()

  return c.json(requireCategory(result), 200)
})

const deleteCategory = createRoute({
  method: 'delete',
  path: '/{type}/{slug}',
  tags: ['Admin - Categories'],
  summary: 'Delete a category',
  request: { params: SlugAndTypeParams },
  responses: {
    200: {
      description: 'Category deleted',
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean() }),
        },
      },
    },
    404: {
      description: 'Category not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(deleteCategory, async (c) => {
  const { type, slug } = c.req.valid('param')

  const result = await c.env.einao_db
    .prepare('DELETE FROM categories WHERE type = ? AND slug = ? RETURNING id')
    .bind(type, slug)
    .first<{ id: number }>()

  if (!result) {
    return c.json({ error: 'Category not found' }, 404)
  }

  return c.json({ success: true }, 200)
})

export { adminRouter }
export default publicRouter
