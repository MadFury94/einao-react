import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { validationHook } from '../lib/validation-hook'

type Bindings = {
  einao_db: D1Database
}

type EventRow = {
  id: number
  date: string
  name: string
  location: string
  details: string
  sort_order: number
  created_at: string
  updated_at: string
}

const EventSchema = z
  .object({
    id: z.number(),
    date: z.string(),
    name: z.string(),
    location: z.string(),
    details: z.string(),
    sort_order: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .openapi('Event')

const CreateEventSchema = z
  .object({
    date: z.string().min(1, 'date is required'),
    name: z.string().min(1, 'name is required'),
    location: z.string().min(1, 'location is required'),
    details: z.string().default(''),
    sort_order: z.number().int().optional(),
  })
  .openapi('CreateEventRequest')

const UpdateEventSchema = z
  .object({
    date: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
    details: z.string().optional(),
    sort_order: z.number().int().optional(),
  })
  .openapi('UpdateEventRequest')

const ReorderSchema = z
  .object({
    ids: z.array(z.number().int()).min(1),
  })
  .openapi('ReorderEventsRequest')

const ErrorSchema = z
  .object({
    error: z.union([z.string(), z.record(z.string(), z.array(z.string()))]),
  })
  .openapi('EventError')

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

const publicRouter = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: validationHook,
})

const adminRouter = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: validationHook,
})

function requireEvent(row: EventRow | null) {
  if (!row) {
    throw new Error('Event mutation failed')
  }
  return row
}

function nowDb() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

// ---------------------------------------------------------------------------
// Public routes
// ---------------------------------------------------------------------------

const listEvents = createRoute({
  method: 'get',
  path: '/',
  tags: ['Events'],
  summary: 'List events (public)',
  responses: {
    200: {
      description: 'Array of events',
      content: { 'application/json': { schema: z.array(EventSchema) } },
    },
  },
})

publicRouter.openapi(listEvents, async (c) => {
  const { results } = await c.env.einao_db
    .prepare('SELECT * FROM events ORDER BY sort_order ASC, id ASC')
    .all<EventRow>()
  return c.json(results, 200)
})

// ---------------------------------------------------------------------------
// Admin routes
// ---------------------------------------------------------------------------

const adminListEvents = createRoute({
  method: 'get',
  path: '/',
  tags: ['Admin - Events'],
  summary: 'List all events (admin)',
  responses: {
    200: {
      description: 'Array of events',
      content: { 'application/json': { schema: z.array(EventSchema) } },
    },
  },
})

adminRouter.openapi(adminListEvents, async (c) => {
  const { results } = await c.env.einao_db
    .prepare('SELECT * FROM events ORDER BY sort_order ASC, id ASC')
    .all<EventRow>()
  return c.json(results, 200)
})

const adminGetEvent = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Admin - Events'],
  summary: 'Get an event by ID (admin)',
  request: { params: IdParam },
  responses: {
    200: {
      description: 'Event found',
      content: { 'application/json': { schema: EventSchema } },
    },
    404: {
      description: 'Event not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(adminGetEvent, async (c) => {
  const { id } = c.req.valid('param')
  const row = await c.env.einao_db
    .prepare('SELECT * FROM events WHERE id = ?')
    .bind(id)
    .first<EventRow>()
  if (!row) return c.json({ error: 'Event not found' }, 404)
  return c.json(row, 200)
})

const createEvent = createRoute({
  method: 'post',
  path: '/',
  tags: ['Admin - Events'],
  summary: 'Create an event',
  request: {
    body: {
      content: { 'application/json': { schema: CreateEventSchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'Event created',
      content: { 'application/json': { schema: EventSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(createEvent, async (c) => {
  const body = c.req.valid('json')
  const db = c.env.einao_db
  const now = nowDb()

  let sortOrder = body.sort_order
  if (sortOrder === undefined) {
    const max = await db
      .prepare('SELECT COALESCE(MAX(sort_order), -1) AS max FROM events')
      .first<{ max: number }>()
    sortOrder = (max?.max ?? -1) + 1
  }

  const result = await db
    .prepare(
      `INSERT INTO events (date, name, location, details, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`
    )
    .bind(body.date, body.name, body.location, body.details, sortOrder, now, now)
    .first<EventRow>()

  return c.json(requireEvent(result), 201)
})

const updateEvent = createRoute({
  method: 'put',
  path: '/{id}',
  tags: ['Admin - Events'],
  summary: 'Update an event',
  request: {
    params: IdParam,
    body: {
      content: { 'application/json': { schema: UpdateEventSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Event updated',
      content: { 'application/json': { schema: EventSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    404: {
      description: 'Event not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(updateEvent, async (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')
  const db = c.env.einao_db

  const existing = await db
    .prepare('SELECT * FROM events WHERE id = ?')
    .bind(id)
    .first<EventRow>()
  if (!existing) return c.json({ error: 'Event not found' }, 404)

  const merged = {
    date: body.date ?? existing.date,
    name: body.name ?? existing.name,
    location: body.location ?? existing.location,
    details: body.details ?? existing.details,
    sort_order: body.sort_order ?? existing.sort_order,
  }

  const result = await db
    .prepare(
      `UPDATE events
       SET date = ?, name = ?, location = ?, details = ?, sort_order = ?, updated_at = ?
       WHERE id = ? RETURNING *`
    )
    .bind(
      merged.date,
      merged.name,
      merged.location,
      merged.details,
      merged.sort_order,
      nowDb(),
      id
    )
    .first<EventRow>()

  return c.json(requireEvent(result), 200)
})

const reorderEvents = createRoute({
  method: 'put',
  path: '/reorder',
  tags: ['Admin - Events'],
  summary: 'Reorder events',
  request: {
    body: {
      content: { 'application/json': { schema: ReorderSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Events reordered',
      content: { 'application/json': { schema: z.array(EventSchema) } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(reorderEvents, async (c) => {
  const { ids } = c.req.valid('json')
  const db = c.env.einao_db
  const now = nowDb()

  const stmts = ids.map((id, index) =>
    db.prepare('UPDATE events SET sort_order = ?, updated_at = ? WHERE id = ?').bind(index, now, id)
  )
  await db.batch(stmts)

  const { results } = await db
    .prepare('SELECT * FROM events ORDER BY sort_order ASC, id ASC')
    .all<EventRow>()

  return c.json(results, 200)
})

const deleteEvent = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Admin - Events'],
  summary: 'Delete an event',
  request: { params: IdParam },
  responses: {
    200: {
      description: 'Event deleted',
      content: {
        'application/json': { schema: z.object({ success: z.boolean() }) },
      },
    },
    404: {
      description: 'Event not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(deleteEvent, async (c) => {
  const { id } = c.req.valid('param')
  const result = await c.env.einao_db
    .prepare('DELETE FROM events WHERE id = ? RETURNING id')
    .bind(id)
    .first<{ id: number }>()
  if (!result) return c.json({ error: 'Event not found' }, 404)
  return c.json({ success: true }, 200)
})

export { adminRouter }
export default publicRouter
