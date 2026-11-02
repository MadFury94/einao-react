import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { cors } from 'hono/cors'
import ai from './ai'
import auth from './auth'
import categories, { adminRouter as categoriesAdmin } from './categories'
import config, { adminRouter as configAdmin } from './config'
import contact from './contact'
import einaoContent, { adminRouter as einaoContentAdmin } from './einao-content'
import { adminRouter as dashboardAdmin } from './dashboard'
import events, { adminRouter as eventsAdmin } from './events'
import genericPosts, { adminRouter as genericPostsAdmin } from './generic-posts'
import { type AuthUser, authMiddleware } from './lib/auth-middleware'
import { validationHook } from './lib/validation-hook'
import pageBlocks, { adminRouter as pageBlocksAdmin } from './page-blocks'
import posts, { blogRouter, adminRouter as postsAdmin } from './posts'
import { stripHtmlToText } from './posts/lib'
import projects, { adminRouter as projectsAdmin } from './projects'
import services, { adminRouter as servicesAdmin } from './services'
import tags, { adminRouter as tagsAdmin } from './tags'
import uploads, { adminRouter as uploadsAdmin } from './uploads'
import users, { adminRouter as usersAdmin, teamRouter } from './users'

type Bindings = {
  einao_db: D1Database
  einao_media: R2Bucket
  AI: Ai
  ALLOWED_ORIGINS: string
  MEDIA_PUBLIC_BASE_URL: string
  JWT_SECRET: string
  RESEND_API_KEY: string
}

type Variables = {
  user: AuthUser
}

const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>({
  defaultHook: validationHook,
})

app.use('/*', (c, next) => {
  const origins = c.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  return cors({
    origin: origins,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })(c, next)
})

const rootRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['General'],
  summary: 'Health check',
  responses: {
    200: {
      description: 'Welcome message',
      content: { 'text/plain': { schema: z.string() } },
    },
  },
})

app.openapi(rootRoute, (c) => {
  return c.text('Welcome to Einao API!')
})

app.route('/api/v1/auth', auth)

app.use('/api/v1/admin/*', authMiddleware)

const meRoute = createRoute({
  method: 'get',
  path: '/api/v1/admin/me',
  tags: ['Auth'],
  summary: 'Get current authenticated user',
  responses: {
    200: {
      description: 'Authenticated user info',
      content: {
        'application/json': {
          schema: z.object({
            id: z.number(),
            name: z.string(),
            email: z.string(),
            role: z.string(),
          }),
        },
      },
    },
    401: { description: 'Unauthorized' },
  },
})

app.openapi(meRoute, async (c) => {
  const user = c.get('user')
  const row = await c.env.einao_db
    .prepare('SELECT id, name, email, role FROM users WHERE id = ?')
    .bind(user.id)
    .first<{ id: number; name: string; email: string; role: string }>()

  if (!row) {
    return c.json({ error: 'User not found' }, 401)
  }

  return c.json(row, 200)
})

app.route('/api/v1/categories', categories)
app.route('/api/v1/services', services)
app.route('/api/v1/tags', tags)
app.route('/api/v1/config', config)
app.route('/api/v1/projects', projects)
app.route('/api/v1/posts', posts)
app.route('/api/v1/blog', blogRouter)
app.route('/api/v1/generic-posts', genericPosts)
app.route('/api/v1/uploads', uploads)
app.route('/api/v1/users', users)
app.route('/api/v1/team', teamRouter)
app.route('/api/v1/events', events)
app.route('/api/v1/page-blocks', pageBlocks)
app.route('/api/v1/contact', contact)
app.route('/api/v1/content', einaoContent)

app.route('/api/v1/admin/categories', categoriesAdmin)
app.route('/api/v1/admin/dashboard', dashboardAdmin)
app.route('/api/v1/admin/services', servicesAdmin)
app.route('/api/v1/admin/tags', tagsAdmin)
app.route('/api/v1/admin/config', configAdmin)
app.route('/api/v1/admin/projects', projectsAdmin)
app.route('/api/v1/admin/posts', postsAdmin)
app.route('/api/v1/admin/generic-posts', genericPostsAdmin)
app.route('/api/v1/admin/uploads', uploadsAdmin)
app.route('/api/v1/admin/users', usersAdmin)
app.route('/api/v1/admin/events', eventsAdmin)
app.route('/api/v1/admin/page-blocks', pageBlocksAdmin)
app.route('/api/v1/admin/ai', ai)
app.route('/api/v1/admin/content', einaoContentAdmin)

app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'Einao API',
    version: '1.0.0',
    description: 'Einao backend API ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Hono on Cloudflare Workers with D1',
  },
  servers: [
    { url: 'http://localhost:8787', description: 'Local dev' },
    { url: 'https://einao-api.einaodevv.workers.dev', description: 'Production' },
  ],
})

app.get(
  '/docs',
  Scalar({
    theme: 'kepler',
    url: '/openapi.json',
  })
)

async function syncScheduledPostFts(
  db: D1Database,
  postId: number,
  title: string,
  excerpt: string,
  contentHtml: string
) {
  await db.batch([
    db
      .prepare(
        `INSERT INTO posts_fts(posts_fts, rowid, title, excerpt, content_text)
         VALUES ('delete', ?, ?, ?, '')`
      )
      .bind(postId, title, excerpt),
    db
      .prepare('INSERT INTO posts_fts(rowid, title, excerpt, content_text) VALUES (?, ?, ?, ?)')
      .bind(postId, title, excerpt, stripHtmlToText(contentHtml)),
  ])
}

export default {
  fetch: app.fetch,
  scheduled: async (_event: ScheduledEvent, env: Bindings, _ctx: ExecutionContext) => {
    const { results } = await env.einao_db
      .prepare(
        `SELECT id, title, excerpt, content_html
         FROM posts
         WHERE status = 'scheduled'
           AND scheduled_for IS NOT NULL
           AND scheduled_for <= datetime('now')`
      )
      .all<{ id: number; title: string; excerpt: string; content_html: string }>()

    for (const post of results) {
      await env.einao_db
        .prepare(
          `UPDATE posts
           SET status = 'published',
               published_at = datetime('now'),
               scheduled_for = NULL,
               updated_at = datetime('now')
           WHERE id = ?`
        )
        .bind(post.id)
        .run()

      await syncScheduledPostFts(
        env.einao_db,
        post.id,
        post.title,
        post.excerpt,
        post.content_html
      )
    }
  },
}
