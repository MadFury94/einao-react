import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { validationHook } from '../lib/validation-hook'

type Bindings = {
  einao_db: D1Database
}

type ServiceStatus = 'draft' | 'scheduled' | 'published' | 'archived'

type ServiceRow = {
  id: number
  name: string
  description: string
  image_url: string
  tags: string
  sort_order: number
  status: ServiceStatus
  seo_title: string
  seo_description: string
  published_at: string | null
  scheduled_for: string | null
  created_at: string
  updated_at: string
}

type ServiceResponse = {
  id: number
  name: string
  description: string
  image_url: string
  tags: string[]
  sort_order: number
  status: ServiceStatus
  seo_title: string
  seo_description: string
  published_at: string | null
  scheduled_for: string | null
  created_at: string
  updated_at: string
}

function requireService(row: ServiceRow | null) {
  if (!row) {
    throw new Error('Service mutation failed')
  }

  return row
}

function rowToResponse(row: ServiceRow): ServiceResponse {
  return {
    ...row,
    tags: JSON.parse(row.tags),
  }
}

function toDbDateTime(date: Date) {
  return date.toISOString().replace('T', ' ').slice(0, 19)
}

function nowDb() {
  return toDbDateTime(new Date())
}

const ServiceStatusSchema = z
  .enum(['draft', 'scheduled', 'published', 'archived'])
  .openapi('ServiceStatus')

const ServiceSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    image_url: z.string(),
    tags: z.array(z.string()),
    sort_order: z.number(),
    status: ServiceStatusSchema,
    seo_title: z.string(),
    seo_description: z.string(),
    published_at: z.string().nullable(),
    scheduled_for: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .openapi('Service')

const CreateServiceSchema = z
  .object({
    name: z.string().min(1, 'name is required'),
    description: z.string().min(1, 'description is required'),
    image_url: z.string().min(1, 'image_url is required'),
    tags: z.array(z.string()).default([]),
    sort_order: z.number().int().default(0),
    seo_title: z.string().default(''),
    seo_description: z.string().default(''),
  })
  .openapi('CreateServiceRequest')

const UpdateServiceSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    image_url: z.string().min(1).optional(),
    tags: z.array(z.string()).optional(),
    sort_order: z.number().int().optional(),
    seo_title: z.string().optional(),
    seo_description: z.string().optional(),
  })
  .openapi('UpdateServiceRequest')

const ScheduleServiceSchema = z
  .object({
    scheduled_for: z.string().min(1, 'scheduled_for is required'),
  })
  .openapi('ScheduleServiceRequest')

const ErrorSchema = z
  .object({
    error: z.union([z.string(), z.record(z.string(), z.array(z.string()))]),
  })
  .openapi('ServiceError')

const IdParam = z.object({
  id: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .openapi({
      param: { name: 'id', in: 'path' },
      example: '1',
    }),
})

const ReorderSchema = z
  .object({
    ids: z.array(z.number().int()).min(1),
  })
  .openapi('ReorderServicesRequest')

const publicRouter = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: validationHook,
})

const adminRouter = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: validationHook,
})

// ---------------------------------------------------------------------------
// Public routes (only published, live services)
// ---------------------------------------------------------------------------

const PUBLIC_WHERE = `status = 'published' AND published_at IS NOT NULL AND published_at <= datetime('now')`

const listServices = createRoute({
  method: 'get',
  path: '/',
  tags: ['Services'],
  summary: 'List published services',
  responses: {
    200: {
      description: 'Array of services',
      content: { 'application/json': { schema: z.array(ServiceSchema) } },
    },
  },
})

publicRouter.openapi(listServices, async (c) => {
  const { results } = await c.env.einao_db
    .prepare(`SELECT * FROM services WHERE ${PUBLIC_WHERE} ORDER BY sort_order ASC, id ASC`)
    .all<ServiceRow>()

  return c.json(results.map(rowToResponse), 200)
})

const getService = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Services'],
  summary: 'Get a published service by ID',
  request: { params: IdParam },
  responses: {
    200: {
      description: 'Service found',
      content: { 'application/json': { schema: ServiceSchema } },
    },
    404: {
      description: 'Service not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

publicRouter.openapi(getService, async (c) => {
  const { id } = c.req.valid('param')

  const row = await c.env.einao_db
    .prepare(`SELECT * FROM services WHERE id = ? AND ${PUBLIC_WHERE}`)
    .bind(id)
    .first<ServiceRow>()

  if (!row) {
    return c.json({ error: 'Service not found' }, 404)
  }

  return c.json(rowToResponse(row), 200)
})

// ---------------------------------------------------------------------------
// Admin: list + get (all statuses)
// ---------------------------------------------------------------------------

const adminListServices = createRoute({
  method: 'get',
  path: '/',
  tags: ['Admin - Services'],
  summary: 'List all services (admin)',
  responses: {
    200: {
      description: 'Array of services in all statuses',
      content: { 'application/json': { schema: z.array(ServiceSchema) } },
    },
  },
})

adminRouter.openapi(adminListServices, async (c) => {
  const { results } = await c.env.einao_db
    .prepare('SELECT * FROM services ORDER BY sort_order ASC, id ASC')
    .all<ServiceRow>()

  return c.json(results.map(rowToResponse), 200)
})

const adminGetService = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Admin - Services'],
  summary: 'Get a service by ID (admin)',
  request: { params: IdParam },
  responses: {
    200: {
      description: 'Service found',
      content: { 'application/json': { schema: ServiceSchema } },
    },
    404: {
      description: 'Service not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(adminGetService, async (c) => {
  const { id } = c.req.valid('param')

  const row = await c.env.einao_db
    .prepare('SELECT * FROM services WHERE id = ?')
    .bind(id)
    .first<ServiceRow>()

  if (!row) {
    return c.json({ error: 'Service not found' }, 404)
  }

  return c.json(rowToResponse(row), 200)
})

// ---------------------------------------------------------------------------
// Admin: create / update / reorder / delete
// ---------------------------------------------------------------------------

const createService = createRoute({
  method: 'post',
  path: '/',
  tags: ['Admin - Services'],
  summary: 'Create a service',
  request: {
    body: {
      content: { 'application/json': { schema: CreateServiceSchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'Service created',
      content: { 'application/json': { schema: ServiceSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(createService, async (c) => {
  const body = c.req.valid('json')
  const now = nowDb()

  // New services start as drafts ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â must be published explicitly.
  const result = await c.env.einao_db
    .prepare(
      `INSERT INTO services (name, description, image_url, tags, sort_order, status, seo_title, seo_description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?) RETURNING *`
    )
    .bind(
      body.name,
      body.description,
      body.image_url,
      JSON.stringify(body.tags),
      body.sort_order,
      body.seo_title,
      body.seo_description,
      now,
      now
    )
    .first<ServiceRow>()

  return c.json(rowToResponse(requireService(result)), 201)
})

const updateService = createRoute({
  method: 'put',
  path: '/{id}',
  tags: ['Admin - Services'],
  summary: 'Update a service',
  request: {
    params: IdParam,
    body: {
      content: { 'application/json': { schema: UpdateServiceSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Service updated',
      content: { 'application/json': { schema: ServiceSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    404: {
      description: 'Service not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(updateService, async (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')

  const existing = await c.env.einao_db
    .prepare('SELECT * FROM services WHERE id = ?')
    .bind(id)
    .first<ServiceRow>()

  if (!existing) {
    return c.json({ error: 'Service not found' }, 404)
  }

  const now = nowDb()
  const updated = {
    name: body.name ?? existing.name,
    description: body.description ?? existing.description,
    image_url: body.image_url ?? existing.image_url,
    tags: body.tags ? JSON.stringify(body.tags) : existing.tags,
    sort_order: body.sort_order ?? existing.sort_order,
    seo_title: body.seo_title ?? existing.seo_title,
    seo_description: body.seo_description ?? existing.seo_description,
  }

  const result = await c.env.einao_db
    .prepare(
      `UPDATE services SET name = ?, description = ?, image_url = ?, tags = ?, sort_order = ?, seo_title = ?, seo_description = ?, updated_at = ?
       WHERE id = ? RETURNING *`
    )
    .bind(
      updated.name,
      updated.description,
      updated.image_url,
      updated.tags,
      updated.sort_order,
      updated.seo_title,
      updated.seo_description,
      now,
      id
    )
    .first<ServiceRow>()

  return c.json(rowToResponse(requireService(result)), 200)
})

const reorderServices = createRoute({
  method: 'put',
  path: '/reorder',
  tags: ['Admin - Services'],
  summary: 'Reorder services',
  request: {
    body: {
      content: { 'application/json': { schema: ReorderSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Services reordered',
      content: { 'application/json': { schema: z.array(ServiceSchema) } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(reorderServices, async (c) => {
  const { ids } = c.req.valid('json')
  const db = c.env.einao_db
  const now = nowDb()

  const stmts = ids.map((id, index) =>
    db
      .prepare('UPDATE services SET sort_order = ?, updated_at = ? WHERE id = ?')
      .bind(index, now, id)
  )
  await db.batch(stmts)

  const { results } = await db
    .prepare('SELECT * FROM services ORDER BY sort_order ASC, id ASC')
    .all<ServiceRow>()

  return c.json(results.map(rowToResponse), 200)
})

// ---------------------------------------------------------------------------
// Admin: lifecycle (publish / schedule / unpublish)
// ---------------------------------------------------------------------------

const publishService = createRoute({
  method: 'post',
  path: '/{id}/publish',
  tags: ['Admin - Services'],
  summary: 'Publish a service',
  request: { params: IdParam },
  responses: {
    200: {
      description: 'Published service',
      content: { 'application/json': { schema: ServiceSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    404: {
      description: 'Service not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(publishService, async (c) => {
  const { id } = c.req.valid('param')
  const db = c.env.einao_db

  const existing = await db
    .prepare('SELECT * FROM services WHERE id = ?')
    .bind(id)
    .first<ServiceRow>()

  if (!existing) {
    return c.json({ error: 'Service not found' }, 404)
  }

  if (!existing.name.trim() || !existing.description.trim() || !existing.image_url.trim()) {
    return c.json(
      { error: 'Service must have a name, description, and image before publishing' },
      400
    )
  }

  const result = await db
    .prepare(
      `UPDATE services
       SET status = 'published',
           published_at = datetime('now'),
           scheduled_for = NULL,
           updated_at = datetime('now')
       WHERE id = ? RETURNING *`
    )
    .bind(id)
    .first<ServiceRow>()

  return c.json(rowToResponse(requireService(result)), 200)
})

const scheduleServiceRoute = createRoute({
  method: 'post',
  path: '/{id}/schedule',
  tags: ['Admin - Services'],
  summary: 'Schedule a service',
  request: {
    params: IdParam,
    body: {
      content: { 'application/json': { schema: ScheduleServiceSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Scheduled service',
      content: { 'application/json': { schema: ServiceSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    404: {
      description: 'Service not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(scheduleServiceRoute, async (c) => {
  const { id } = c.req.valid('param')
  const { scheduled_for } = c.req.valid('json')
  const db = c.env.einao_db

  const existing = await db
    .prepare('SELECT * FROM services WHERE id = ?')
    .bind(id)
    .first<ServiceRow>()

  if (!existing) {
    return c.json({ error: 'Service not found' }, 404)
  }

  const scheduledFor = new Date(scheduled_for)
  if (Number.isNaN(scheduledFor.getTime())) {
    return c.json({ error: 'scheduled_for must be a valid datetime' }, 400)
  }

  if (scheduledFor.getTime() <= Date.now()) {
    return c.json({ error: 'scheduled_for must be in the future' }, 400)
  }

  const result = await db
    .prepare(
      `UPDATE services
       SET status = 'scheduled',
           scheduled_for = ?,
           updated_at = datetime('now')
       WHERE id = ? RETURNING *`
    )
    .bind(toDbDateTime(scheduledFor), id)
    .first<ServiceRow>()

  return c.json(rowToResponse(requireService(result)), 200)
})

const unpublishService = createRoute({
  method: 'post',
  path: '/{id}/unpublish',
  tags: ['Admin - Services'],
  summary: 'Unpublish a service (back to draft)',
  request: { params: IdParam },
  responses: {
    200: {
      description: 'Unpublished service',
      content: { 'application/json': { schema: ServiceSchema } },
    },
    404: {
      description: 'Service not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(unpublishService, async (c) => {
  const { id } = c.req.valid('param')
  const db = c.env.einao_db

  const existing = await db
    .prepare('SELECT * FROM services WHERE id = ?')
    .bind(id)
    .first<ServiceRow>()

  if (!existing) {
    return c.json({ error: 'Service not found' }, 404)
  }

  const result = await db
    .prepare(
      `UPDATE services
       SET status = 'draft',
           scheduled_for = NULL,
           updated_at = datetime('now')
       WHERE id = ? RETURNING *`
    )
    .bind(id)
    .first<ServiceRow>()

  return c.json(rowToResponse(requireService(result)), 200)
})

// ---------------------------------------------------------------------------
// Admin: delete
// ---------------------------------------------------------------------------

const deleteService = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Admin - Services'],
  summary: 'Delete a service',
  request: { params: IdParam },
  responses: {
    200: {
      description: 'Service deleted',
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean() }),
        },
      },
    },
    404: {
      description: 'Service not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(deleteService, async (c) => {
  const { id } = c.req.valid('param')

  const result = await c.env.einao_db
    .prepare('DELETE FROM services WHERE id = ? RETURNING id')
    .bind(id)
    .first<{ id: number }>()

  if (!result) {
    return c.json({ error: 'Service not found' }, 404)
  }

  return c.json({ success: true }, 200)
})

export { adminRouter }
export default publicRouter
