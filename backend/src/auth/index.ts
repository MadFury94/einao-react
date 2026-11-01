import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { deleteCookie, setCookie } from 'hono/cookie'
import { validationHook } from '../lib/validation-hook'

type Bindings = {
  einao_db: D1Database
  JWT_SECRET: string
  ALLOWED_ORIGINS: string
}

const SESSION_EXPIRY_DAYS = 30
export const COOKIE_NAME = 'einao_session'

function generateSessionId(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  const saltHex = Array.from(salt, (b) => b.toString(16).padStart(2, '0')).join('')
  const hashHex = Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('')
  return `${saltHex}:${hashHex}`
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((b) => Number.parseInt(b, 16)))
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  const computedHex = Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('')
  return computedHex === hashHex
}

async function createJwt(
  payload: { sub: string; email: string; sessionId: string; exp: number },
  secret: string
): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encoder = new TextEncoder()

  const headerB64 = btoa(JSON.stringify(header))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  const payloadB64 = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const signingInput = `${headerB64}.${payloadB64}`
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signingInput))
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return `${signingInput}.${sigB64}`
}

export async function verifyJwt(
  token: string,
  secret: string
): Promise<{ sub: string; email: string; sessionId: string; exp: number } | null> {
  try {
    const [headerB64, payloadB64, sigB64] = token.split('.')
    if (!headerB64 || !payloadB64 || !sigB64) return null

    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const signingInput = `${headerB64}.${payloadB64}`
    const signatureBytes = Uint8Array.from(
      atob(sigB64.replace(/-/g, '+').replace(/_/g, '/')),
      (c) => c.charCodeAt(0)
    )

    const valid = await crypto.subtle.verify('HMAC', key, signatureBytes, encoder.encode(signingInput))
    if (!valid) return null

    const payload = JSON.parse(
      atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
    )

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null

    return payload
  } catch {
    return null
  }
}

const auth = new OpenAPIHono<{ Bindings: Bindings }>({ defaultHook: validationHook })

// --- Login ---
const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  tags: ['Auth'],
  summary: 'Login with email and password',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            email: z.string().email('Valid email required'),
            password: z.string().min(1, 'Password is required'),
          }),
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Login successful',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            user: z.object({
              id: z.number(),
              name: z.string(),
              email: z.string(),
              role: z.string(),
            }),
          }),
        },
      },
    },
    401: {
      description: 'Invalid credentials',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    403: {
      description: 'Account suspended',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
})

auth.openapi(loginRoute, async (c) => {
  const { email, password } = c.req.valid('json')
  const db = c.env.einao_db

  const user = await db
    .prepare('SELECT id, name, email, role, status, password_hash FROM users WHERE email = ?')
    .bind(email.toLowerCase())
    .first<{ id: number; name: string; email: string; role: string; status: string; password_hash: string | null }>()

  if (!user || !user.password_hash) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  if (user.status !== 'active') {
    return c.json(
      { error: 'Your account has been deactivated. Contact an admin to restore access.' },
      403
    )
  }

  // Create session
  const sessionId = generateSessionId()
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()

  await db
    .prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(sessionId, user.id, expiresAt)
    .run()

  await db
    .prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?")
    .bind(user.id)
    .run()

  const token = await createJwt(
    {
      sub: String(user.id),
      email: user.email,
      sessionId,
      exp: Math.floor(Date.now() / 1000) + SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    },
    c.env.JWT_SECRET
  )

  const cookieDomain = resolveCookieDomain(cookieHost(c))

  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    secure: c.req.url.startsWith('https'),
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  })

  return c.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 200)
})

// --- Set Password (for initial setup or reset) ---
const setPasswordRoute = createRoute({
  method: 'post',
  path: '/set-password',
  tags: ['Auth'],
  summary: 'Set password for a user (requires valid session)',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            password: z.string().min(8, 'Password must be at least 8 characters'),
          }),
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Password set',
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean() }),
        },
      },
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
})

auth.openapi(setPasswordRoute, async (c) => {
  const { password } = c.req.valid('json')
  const db = c.env.einao_db

  // Verify current session from cookie
  const { getCookie } = await import('hono/cookie')
  const token = getCookie(c, COOKIE_NAME)
  if (!token) return c.json({ error: 'Not authenticated' }, 401)

  const payload = await verifyJwt(token, c.env.JWT_SECRET)
  if (!payload) return c.json({ error: 'Not authenticated' }, 401)

  const hashed = await hashPassword(password)
  await db
    .prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .bind(hashed, Number(payload.sub))
    .run()

  return c.json({ success: true }, 200)
})

// --- Logout ---
const logoutRoute = createRoute({
  method: 'post',
  path: '/logout',
  tags: ['Auth'],
  summary: 'Logout and clear session',
  responses: {
    200: {
      description: 'Logged out',
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean() }),
        },
      },
    },
  },
})

auth.openapi(logoutRoute, async (c) => {
  const cookieDomain = resolveCookieDomain(cookieHost(c))
  deleteCookie(c, COOKIE_NAME, { path: '/', ...(cookieDomain ? { domain: cookieDomain } : {}) })
  return c.json({ success: true }, 200)
})

function cookieHost(c: { req: { header: (n: string) => string | undefined; url: string } }): string {
  const origin = c.req.header('Origin') || c.req.header('Referer')
  if (origin) {
    try {
      return new URL(origin).hostname
    } catch {
      // fall through
    }
  }
  return new URL(c.req.url).hostname
}

function resolveCookieDomain(host: string): string | undefined {
  if (host.endsWith('.einaosolutions.com')) return '.einaosolutions.com'
  if (host.endsWith('.einao.solutions')) return '.einao.solutions'
  return undefined
}

export { hashPassword }
export default auth
