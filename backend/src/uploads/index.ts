import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { validationHook } from '../lib/validation-hook'

type Bindings = {
  einao_db: D1Database
  einao_media: R2Bucket
  MEDIA_PUBLIC_BASE_URL: string
}

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
  'video/mp4',
  'video/webm',
])
const MAX_BYTES = 25 * 1024 * 1024

async function getAllowedFolders(db: D1Database): Promise<Set<string>> {
  const { results } = await db.prepare('SELECT name FROM media_folders').all<{ name: string }>()
  return new Set(results.map((r) => r.name))
}

const UploadItemSchema = z
  .object({
    id: z.number(),
    key: z.string(),
    url: z.string(),
    filename: z.string(),
    content_type: z.string(),
    size: z.number(),
    folder: z.string(),
    created_at: z.string(),
  })
  .openapi('UploadItem')

const UploadResponseSchema = z
  .object({
    url: z.string(),
    key: z.string(),
    size: z.number(),
    contentType: z.string(),
  })
  .openapi('UploadResponse')

const UploadListSchema = z
  .object({
    items: z.array(UploadItemSchema),
    total: z.number(),
  })
  .openapi('UploadList')

const ErrorSchema = z.object({ error: z.string() }).openapi('UploadError')
const MessageSchema = z.object({ message: z.string() }).openapi('UploadMessage')

const publicRouter = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: validationHook,
})

const adminRouter = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: validationHook,
})

const uploadRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Admin - Uploads'],
  summary: 'Upload a media file to R2',
  description:
    'Accepts multipart/form-data with `file` (required) and `folder` (optional). ' +
    'Stores the file at `<folder>/<yyyy>/<mm>/<hash>-<name>.<ext>` and returns the public URL.',
  request: {
    body: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: z
            .object({
              file: z.any().openapi({ type: 'string', format: 'binary' }),
              folder: z.string().optional(),
            })
            .openapi('UploadRequest'),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Uploaded',
      content: { 'application/json': { schema: UploadResponseSchema } },
    },
    400: {
      description: 'Bad request',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(uploadRoute, async (c) => {
  let form: FormData
  try {
    form = await c.req.formData()
  } catch {
    return c.json({ error: 'invalid multipart body' }, 400)
  }

  const file = form.get('file')
  const folderRaw = String(form.get('folder') ?? 'misc').toLowerCase()
  const allowedFolders = await getAllowedFolders(c.env.einao_db)
  const folder = allowedFolders.has(folderRaw) ? folderRaw : 'misc'

  if (!(file instanceof File)) {
    return c.json({ error: 'file is required' }, 400)
  }
  if (file.size === 0) {
    return c.json({ error: 'file is empty' }, 400)
  }
  if (file.size > MAX_BYTES) {
    return c.json({ error: `file too large (max ${MAX_BYTES / 1024 / 1024}MB)` }, 400)
  }
  const contentType = file.type || 'application/octet-stream'
  if (!ALLOWED_MIME.has(contentType)) {
    return c.json({ error: `mime type not allowed: ${contentType}` }, 400)
  }

  const buf = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buf)
  const hex = Array.from(new Uint8Array(digest))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  const extMatch = file.name.match(/\.[a-z0-9]+$/i)
  const ext = extMatch ? extMatch[0].toLowerCase() : ''
  const baseName =
    file.name
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/[^a-z0-9._-]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64) || 'file'

  const now = new Date()
  const yyyy = now.getUTCFullYear()
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
  const key = `${folder}/${yyyy}/${mm}/${hex}-${baseName}${ext}`

  try {
    await c.env.einao_media.put(key, buf, {
      httpMetadata: {
        contentType,
        cacheControl: 'public, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    console.error('R2 put failed', err)
    return c.json({ error: 'upload failed' }, 500)
  }

  // R2 writes are expected to be immediately readable. Verify the write before
  // returning a URL; otherwise the editor can save a URL that will immediately
  // return 404 when the image is rendered.
  try {
    const stored = await c.env.einao_media.head(key)
    if (!stored) {
      console.error('R2 upload verification failed', { key })
      return c.json({ error: 'upload could not be verified' }, 500)
    }
  } catch (err) {
    console.error('R2 upload verification failed', err)
    return c.json({ error: 'upload could not be verified' }, 500)
  }

  // Keep the configured public URL for production, while allowing preview and
  // alternate deployments to work without generating links to another worker.
  const requestUrl = new URL(c.req.url)
  const isLocalRequest = requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1'
  const configuredBase = c.env.MEDIA_PUBLIC_BASE_URL?.trim()
  const base = (
    isLocalRequest
      ? `${requestUrl.origin}/api/v1/uploads/file`
      : configuredBase || `${requestUrl.origin}/api/v1/uploads/file`
  ).replace(/\/$/, '')
  const url = `${base}/${key}`

  try {
    await c.env.einao_db
      .prepare(
        `INSERT INTO uploads (key, url, filename, content_type, size, folder)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(key, url, file.name, contentType, file.size, folder)
      .run()
  } catch (err) {
    console.error('D1 insert failed (file is in R2)', err)
  }

  return c.json({ url, key, size: file.size, contentType }, 201)
})

publicRouter.get('/file/*', async (c) => {
  const path = c.req.path
  const key = decodeURIComponent(path.replace(/^.*\/file\//, ''))
  if (!key) return c.text('not found', 404)

  const obj = await c.env.einao_media.get(key)
  if (!obj) return c.text('not found', 404)

  const headers = new Headers()
  if (obj.httpMetadata?.contentType) {
    headers.set('Content-Type', obj.httpMetadata.contentType)
  }
  headers.set(
    'Cache-Control',
    obj.httpMetadata?.cacheControl ?? 'public, max-age=31536000, immutable'
  )
  headers.set('etag', obj.httpEtag)
  return new Response(obj.body, { headers })
})

const listRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Uploads'],
  summary: 'List uploaded files',
  request: {
    query: z.object({
      limit: z.coerce.number().int().min(1).max(100).default(40).optional(),
      offset: z.coerce.number().int().min(0).default(0).optional(),
      folder: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: 'Paginated list of uploads',
      content: { 'application/json': { schema: UploadListSchema } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

publicRouter.openapi(listRoute, async (c) => {
  const { limit = 40, offset = 0, folder } = c.req.valid('query')

  try {
    const where = folder ? 'WHERE folder = ?' : ''
    const params = folder ? [folder] : []

    const countStmt = c.env.einao_db.prepare(`SELECT COUNT(*) as total FROM uploads ${where}`)
    const countResult = await (folder ? countStmt.bind(...params) : countStmt).first<{
      total: number
    }>()

    const listStmt = c.env.einao_db.prepare(
      `SELECT * FROM uploads ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    )
    const listResult = await (folder
      ? listStmt.bind(...params, limit, offset)
      : listStmt.bind(limit, offset)
    ).all()

    return c.json({
      items: listResult.results ?? [],
      total: countResult?.total ?? 0,
    })
  } catch (err) {
    console.error('List uploads failed', err)
    return c.json({ error: 'failed to list uploads' }, 500)
  }
})

const bulkMoveRoute = createRoute({
  method: 'patch',
  path: '/bulk-move',
  tags: ['Admin - Uploads'],
  summary: 'Move multiple uploads to a different folder',
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z
            .object({
              ids: z.array(z.number().int()).min(1).max(100),
              folder: z.string(),
            })
            .openapi('BulkMoveRequest'),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Moved',
      content: { 'application/json': { schema: MessageSchema } },
    },
    400: {
      description: 'Bad request',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(bulkMoveRoute, async (c) => {
  const { ids, folder } = c.req.valid('json')
  const allowedFolders = await getAllowedFolders(c.env.einao_db)

  if (!allowedFolders.has(folder)) {
    return c.json({ error: `invalid folder: ${folder}` }, 400)
  }

  try {
    const placeholders = ids.map(() => '?').join(',')
    await c.env.einao_db
      .prepare(`UPDATE uploads SET folder = ? WHERE id IN (${placeholders})`)
      .bind(folder, ...ids)
      .run()

    return c.json({ message: `${ids.length} file(s) moved to ${folder}` })
  } catch (err) {
    console.error('Bulk move failed', err)
    return c.json({ error: 'bulk move failed' }, 500)
  }
})

const deleteRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Admin - Uploads'],
  summary: 'Delete an uploaded file',
  request: {
    params: z.object({ id: z.coerce.number().int() }),
  },
  responses: {
    200: {
      description: 'Deleted',
      content: { 'application/json': { schema: MessageSchema } },
    },
    404: {
      description: 'Not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(deleteRoute, async (c) => {
  const { id } = c.req.valid('param')

  try {
    const row = await c.env.einao_db
      .prepare('SELECT key FROM uploads WHERE id = ?')
      .bind(id)
      .first<{ key: string }>()

    if (!row) {
      return c.json({ error: 'upload not found' }, 404)
    }

    await c.env.einao_media.delete(row.key)
    await c.env.einao_db.prepare('DELETE FROM uploads WHERE id = ?').bind(id).run()

    return c.json({ message: 'deleted' })
  } catch (err) {
    console.error('Delete upload failed', err)
    return c.json({ error: 'delete failed' }, 500)
  }
})

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Folder management ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

const FolderSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    created_at: z.string(),
  })
  .openapi('MediaFolder')

const listFoldersRoute = createRoute({
  method: 'get',
  path: '/folders',
  tags: ['Uploads'],
  summary: 'List media folders',
  responses: {
    200: {
      description: 'All folders',
      content: { 'application/json': { schema: z.object({ folders: z.array(FolderSchema) }) } },
    },
  },
})

publicRouter.openapi(listFoldersRoute, async (c) => {
  const { results } = await c.env.einao_db
    .prepare('SELECT id, name, created_at FROM media_folders ORDER BY name')
    .all()
  return c.json({ folders: results ?? [] })
})

const createFolderRoute = createRoute({
  method: 'post',
  path: '/folders',
  tags: ['Admin - Uploads'],
  summary: 'Create a media folder',
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({ name: z.string().min(1).max(50) }).openapi('CreateFolderRequest'),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Created',
      content: { 'application/json': { schema: FolderSchema } },
    },
    400: {
      description: 'Bad request',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    409: {
      description: 'Conflict',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(createFolderRoute, async (c) => {
  const { name } = c.req.valid('json')
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  if (!slug) return c.json({ error: 'invalid folder name' }, 400)

  try {
    await c.env.einao_db.prepare('INSERT INTO media_folders (name) VALUES (?)').bind(slug).run()

    const row = await c.env.einao_db
      .prepare('SELECT id, name, created_at FROM media_folders WHERE name = ?')
      .bind(slug)
      .first()

    return c.json(row as { id: number; name: string; created_at: string }, 201)
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE')) {
      return c.json({ error: 'folder already exists' }, 409)
    }
    return c.json({ error: 'failed to create folder' }, 400)
  }
})

const renameFolderRoute = createRoute({
  method: 'patch',
  path: '/folders/{id}',
  tags: ['Admin - Uploads'],
  summary: 'Rename a media folder',
  request: {
    params: z.object({ id: z.coerce.number().int() }),
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({ name: z.string().min(1).max(50) }).openapi('RenameFolderRequest'),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Renamed',
      content: { 'application/json': { schema: MessageSchema } },
    },
    400: {
      description: 'Bad request',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    409: {
      description: 'Conflict',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(renameFolderRoute, async (c) => {
  const { id } = c.req.valid('param')
  const { name } = c.req.valid('json')
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  if (!slug) return c.json({ error: 'invalid folder name' }, 400)

  try {
    const old = await c.env.einao_db
      .prepare('SELECT name FROM media_folders WHERE id = ?')
      .bind(id)
      .first<{ name: string }>()

    if (!old) return c.json({ error: 'folder not found' }, 400)

    await c.env.einao_db.batch([
      c.env.einao_db.prepare('UPDATE media_folders SET name = ? WHERE id = ?').bind(slug, id),
      c.env.einao_db
        .prepare('UPDATE uploads SET folder = ? WHERE folder = ?')
        .bind(slug, old.name),
    ])

    return c.json({ message: `folder renamed to ${slug}` })
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE')) {
      return c.json({ error: 'folder name already taken' }, 409)
    }
    return c.json({ error: 'rename failed' }, 400)
  }
})

const deleteFolderRoute = createRoute({
  method: 'delete',
  path: '/folders/{id}',
  tags: ['Admin - Uploads'],
  summary: 'Delete a media folder (moves files to misc)',
  request: {
    params: z.object({ id: z.coerce.number().int() }),
  },
  responses: {
    200: {
      description: 'Deleted',
      content: { 'application/json': { schema: MessageSchema } },
    },
    400: {
      description: 'Bad request',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(deleteFolderRoute, async (c) => {
  const { id } = c.req.valid('param')

  const folder = await c.env.einao_db
    .prepare('SELECT name FROM media_folders WHERE id = ?')
    .bind(id)
    .first<{ name: string }>()

  if (!folder) return c.json({ error: 'folder not found' }, 400)
  if (folder.name === 'misc') return c.json({ error: 'cannot delete the misc folder' }, 400)

  await c.env.einao_db.batch([
    c.env.einao_db
      .prepare('UPDATE uploads SET folder = ? WHERE folder = ?')
      .bind('misc', folder.name),
    c.env.einao_db.prepare('DELETE FROM media_folders WHERE id = ?').bind(id),
  ])

  return c.json({ message: `folder "${folder.name}" deleted, files moved to misc` })
})

export { adminRouter }
export default publicRouter
