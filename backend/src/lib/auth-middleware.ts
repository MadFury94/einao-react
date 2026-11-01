import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { COOKIE_NAME, verifyJwt } from '../auth'

type RequiredBindings = {
  JWT_SECRET: string
  einao_db: D1Database
}

export type AuthUser = {
  id: number
  email: string
  sessionId: string
}

export type AuthVariables = {
  user: AuthUser
}

type AuthEnv = {
  Bindings: RequiredBindings
  Variables: AuthVariables
}

const unauthorized = () => Response.json({ error: 'Unauthorized' }, { status: 401 })

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  if (c.req.method === 'OPTIONS') {
    await next()
    return
  }

  try {
    const token = getCookie(c, COOKIE_NAME)
    if (!token) {
      return unauthorized()
    }

    const payload = await verifyJwt(token, c.env.JWT_SECRET)
    if (!payload) {
      return unauthorized()
    }

    // Verify session still exists in DB
    const session = await c.env.einao_db
      .prepare("SELECT id FROM sessions WHERE id = ? AND expires_at > datetime('now')")
      .bind(payload.sessionId)
      .first<{ id: string }>()

    if (!session) {
      return unauthorized()
    }

    c.set('user', {
      id: Number(payload.sub),
      email: payload.email,
      sessionId: payload.sessionId,
    })
    await next()
  } catch {
    return unauthorized()
  }
})
