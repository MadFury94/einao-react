import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { type AuthUser, authMiddleware } from '../lib/auth-middleware'
import { validationHook } from '../lib/validation-hook'

type Bindings = {
  einao_db: D1Database
}

type Variables = {
  user: AuthUser
}

const adminRouter = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>({
  defaultHook: validationHook,
})

adminRouter.use('/*', authMiddleware)

const DashboardStatsSchema = z
  .object({
    projects_total: z.number(),
    team_members_total: z.number(),
    users_total: z.number(),
    published_posts_total: z.number(),
    events_total: z.number(),
    recent_posts: z.array(
      z.object({
        id: z.number(),
        title: z.string(),
        post_type: z.string(),
        status: z.string(),
        published_at: z.string().nullable(),
        created_at: z.string(),
      })
    ),
    projects: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        slug: z.string(),
        genre: z.string(),
        status: z.string(),
        status_label: z.string(),
      })
    ),
  })
  .openapi('DashboardStats')

const getDashboard = createRoute({
  method: 'get',
  path: '/',
  tags: ['Admin - Dashboard'],
  summary: 'Get dashboard stats',
  responses: {
    200: {
      description: 'Dashboard statistics',
      content: { 'application/json': { schema: DashboardStatsSchema } },
    },
  },
})

adminRouter.openapi(getDashboard, async (c) => {
  const db = c.env.einao_db

  const [
    projectsCount,
    teamMembersCount,
    usersCount,
    publishedPostsCount,
    eventsCount,
    recentPostsResult,
    projectsResult,
  ] = await Promise.all([
    db.prepare('SELECT COUNT(*) AS n FROM projects').first<{ n: number }>(),
    db
      .prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'team_member' AND status = 'active'")
      .first<{ n: number }>(),
    db.prepare('SELECT COUNT(*) AS n FROM users').first<{ n: number }>(),
    db
      .prepare("SELECT COUNT(*) AS n FROM posts WHERE status = 'published'")
      .first<{ n: number }>(),
    db.prepare('SELECT COUNT(*) AS n FROM events').first<{ n: number }>(),
    db
      .prepare(
        'SELECT id, title, post_type, status, published_at, created_at FROM posts ORDER BY created_at DESC LIMIT 6'
      )
      .all<{
        id: number
        title: string
        post_type: string
        status: string
        published_at: string | null
        created_at: string
      }>(),
    db
      .prepare(
        'SELECT id, name, slug, genre, status, status_label FROM projects ORDER BY sort_order ASC, id ASC'
      )
      .all<{
        id: number
        name: string
        slug: string
        genre: string
        status: string
        status_label: string
      }>(),
  ])

  return c.json(
    {
      projects_total: projectsCount?.n ?? 0,
      team_members_total: teamMembersCount?.n ?? 0,
      users_total: usersCount?.n ?? 0,
      published_posts_total: publishedPostsCount?.n ?? 0,
      events_total: eventsCount?.n ?? 0,
      recent_posts: recentPostsResult.results,
      projects: projectsResult.results,
    },
    200
  )
})

export { adminRouter }
