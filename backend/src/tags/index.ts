import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { validationHook } from '../lib/validation-hook'

type Bindings = {
  einao_db: D1Database
}

type TagRow = {
  id: number
  name: string
  slug: string
  created_at: string
}

function requireTag(row: TagRow | null) {
  if (!row) {
    throw new Error('Tag mutation failed')
  }

  return row
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const SLUG_PATTERN = /^[a-z0-9-]+$/

const TagSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    created_at: z.string(),
  })
  .openapi('Tag')

const CreateTagSchema = z
  .object({
    name: z.string().min(1, 'name is required'),
    slug: z
      .string()
      .min(1)
      .regex(SLUG_PATTERN, 'slug must be lowercase alphanumeric with hyphens')
      .optional(),
  })
  .openapi('CreateTagRequest')

const UpdateTagSchema = z
  .object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).regex(SLUG_PATTERN).optional(),
  })
  .refine((v) => v.name !== undefined || v.slug !== undefined, {
    message: 'name or slug is required',
  })
  .openapi('UpdateTagRequest')

const MergeTagSchema = z
  .object({
    into_id: z.number().int().positive(),
  })
  .openapi('MergeTagRequest')

const ErrorSchema = z
  .object({
    error: z.union([z.string(), z.record(z.string(), z.array(z.string()))]),
  })
  .openapi('TagError')

const publicRouter = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: validationHook,
})

const adminRouter = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: validationHook,
})

const listTags = createRoute({
  method: 'get',
  path: '/',
  tags: ['Tags'],
  summary: 'List all tags',
  responses: {
    200: {
      description: 'Array of tags',
      content: { 'application/json': { schema: z.array(TagSchema) } },
    },
  },
})

publicRouter.openapi(listTags, async (c) => {
  const { results } = await c.env.einao_db
    .prepare('SELECT id, name, slug, created_at FROM tags ORDER BY name ASC')
    .all<TagRow>()

  return c.json(results, 200)
})

const createTag = createRoute({
  method: 'post',
  path: '/',
  tags: ['Admin - Tags'],
  summary: 'Create a tag',
  request: {
    body: {
      content: { 'application/json': { schema: CreateTagSchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'Tag created',
      content: { 'application/json': { schema: TagSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    409: {
      description: 'Tag with this name or slug already exists',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(createTag, async (c) => {
  const { name, slug: slugInput } = c.req.valid('json')
  const slug = slugInput ?? slugify(name)

  if (!slug || !SLUG_PATTERN.test(slug)) {
    return c.json({ error: 'Could not derive a valid slug from name' }, 400)
  }

  const existing = await c.env.einao_db
    .prepare('SELECT id FROM tags WHERE name = ? OR slug = ?')
    .bind(name, slug)
    .first()

  if (existing) {
    return c.json({ error: 'Tag with this name or slug already exists' }, 409)
  }

  const result = await c.env.einao_db
    .prepare('INSERT INTO tags (name, slug) VALUES (?, ?) RETURNING id, name, slug, created_at')
    .bind(name, slug)
    .first<TagRow>()

  return c.json(requireTag(result), 201)
})

const updateTag = createRoute({
  method: 'put',
  path: '/{id}',
  tags: ['Admin - Tags'],
  summary: 'Rename a tag (and/or change its slug)',
  request: {
    params: z.object({
      id: z
        .string()
        .regex(/^\d+$/)
        .transform(Number)
        .openapi({ param: { name: 'id', in: 'path' }, example: '1' }),
    }),
    body: {
      content: { 'application/json': { schema: UpdateTagSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Tag updated',
      content: { 'application/json': { schema: TagSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    404: {
      description: 'Tag not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    409: {
      description: 'Conflict with another tag',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(updateTag, async (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')

  const existing = await c.env.einao_db
    .prepare('SELECT id, name, slug, created_at FROM tags WHERE id = ?')
    .bind(id)
    .first<TagRow>()

  if (!existing) {
    return c.json({ error: 'Tag not found' }, 404)
  }

  const nextName = body.name ?? existing.name
  const nextSlug = body.slug ?? (body.name ? slugify(body.name) : existing.slug)

  if (!nextSlug || !SLUG_PATTERN.test(nextSlug)) {
    return c.json({ error: 'Invalid slug' }, 400)
  }

  if (nextName !== existing.name || nextSlug !== existing.slug) {
    const conflict = await c.env.einao_db
      .prepare('SELECT id FROM tags WHERE (name = ? OR slug = ?) AND id != ?')
      .bind(nextName, nextSlug, id)
      .first()

    if (conflict) {
      return c.json({ error: 'Another tag already uses that name or slug' }, 409)
    }
  }

  const result = await c.env.einao_db
    .prepare('UPDATE tags SET name = ?, slug = ? WHERE id = ? RETURNING id, name, slug, created_at')
    .bind(nextName, nextSlug, id)
    .first<TagRow>()

  return c.json(requireTag(result), 200)
})

const mergeTag = createRoute({
  method: 'post',
  path: '/{id}/merge',
  tags: ['Admin - Tags'],
  summary: 'Merge this tag into another (moves all references, then deletes source)',
  request: {
    params: z.object({
      id: z
        .string()
        .regex(/^\d+$/)
        .transform(Number)
        .openapi({ param: { name: 'id', in: 'path' }, example: '1' }),
    }),
    body: {
      content: { 'application/json': { schema: MergeTagSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Tag merged',
      content: { 'application/json': { schema: TagSchema } },
    },
    400: {
      description: 'Cannot merge a tag into itself',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    404: {
      description: 'Source or target tag not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(mergeTag, async (c) => {
  const { id } = c.req.valid('param')
  const { into_id } = c.req.valid('json')

  if (id === into_id) {
    return c.json({ error: 'Cannot merge a tag into itself' }, 400)
  }

  const db = c.env.einao_db
  const target = await db
    .prepare('SELECT id, name, slug, created_at FROM tags WHERE id = ?')
    .bind(into_id)
    .first<TagRow>()
  const source = await db.prepare('SELECT id FROM tags WHERE id = ?').bind(id).first()

  if (!source || !target) {
    return c.json({ error: 'Source or target tag not found' }, 404)
  }

  // Re-point junction rows. INSERT OR IGNORE skips rows that would collide
  // with an already-present (entity, target) pair; then clear the source rows.
  await db.batch([
    db
      .prepare(
        'INSERT OR IGNORE INTO post_tags (post_id, tag_id) SELECT post_id, ? FROM post_tags WHERE tag_id = ?'
      )
      .bind(into_id, id),
    db.prepare('DELETE FROM post_tags WHERE tag_id = ?').bind(id),
    db
      .prepare(
        'INSERT OR IGNORE INTO project_tags (project_id, tag_id) SELECT project_id, ? FROM project_tags WHERE tag_id = ?'
      )
      .bind(into_id, id),
    db.prepare('DELETE FROM project_tags WHERE tag_id = ?').bind(id),
    db.prepare('DELETE FROM tags WHERE id = ?').bind(id),
  ])

  return c.json(target, 200)
})

const deleteTag = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Admin - Tags'],
  summary: 'Delete a tag',
  request: {
    params: z.object({
      id: z
        .string()
        .regex(/^\d+$/)
        .transform(Number)
        .openapi({ param: { name: 'id', in: 'path' }, example: '1' }),
    }),
  },
  responses: {
    200: {
      description: 'Tag deleted',
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean() }),
        },
      },
    },
    404: {
      description: 'Tag not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(deleteTag, async (c) => {
  const { id } = c.req.valid('param')

  const result = await c.env.einao_db
    .prepare('DELETE FROM tags WHERE id = ? RETURNING id')
    .bind(id)
    .first<{ id: number }>()

  if (!result) {
    return c.json({ error: 'Tag not found' }, 404)
  }

  return c.json({ success: true }, 200)
})

export { adminRouter }
export default publicRouter
