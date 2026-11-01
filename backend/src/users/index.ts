import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { hashPassword } from '../auth'
import { validationHook } from '../lib/validation-hook'

type Bindings = {
  einao_db: D1Database
}

type User = {
  id: number
  name: string
  email: string
  role: string
  dob: string
  bio: string
  avatar_url: string
  status: string
  position: string
  socials: string
  last_login: string | null
}

function requireUserId(row: { id: number } | null) {
  if (!row) {
    throw new Error('User mutation failed')
  }

  return row.id
}

const UserSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(['admin', 'author', 'team_member', 'client', 'user']),
    dob: z.string().optional(),
    bio: z.string(),
    avatar_url: z.string(),
    status: z.enum(['active', 'suspended']),
    position: z.string(),
    socials: z.string(),
    last_login: z.string().nullable(),
  })
  .openapi('User')

const CreateUserSchema = z
  .object({
    name: z.string().min(3, 'name must be at least 3 characters'),
    email: z.string().email('invalid email address'),
    role: z.enum(['admin', 'author', 'team_member', 'client', 'user']).default('user'),
    bio: z.string().default(''),
    avatar_url: z.string().default(''),
    status: z.enum(['active', 'suspended']).default('active'),
    position: z.string().default(''),
    socials: z.string().default('[]'),
  })
  .openapi('CreateUserRequest')

const ErrorSchema = z
  .object({
    error: z.union([z.string(), z.record(z.string(), z.array(z.string()))]),
  })
  .openapi('Error')

const IdParam = z.object({
  id: z.coerce
    .number()
    .int()
    .positive()
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

const listUsers = createRoute({
  method: 'get',
  path: '/',
  tags: ['Users'],
  summary: 'List all users',
  responses: {
    200: {
      description: 'Array of users',
      content: { 'application/json': { schema: z.array(UserSchema) } },
    },
  },
})

publicRouter.openapi(listUsers, async (c) => {
  const { results } = await c.env.einao_db
    .prepare(
      'SELECT id, name, email, role, dob, bio, avatar_url, status, position, socials, last_login FROM users ORDER BY id ASC'
    )
    .all<User>()

  return c.json(results, 200)
})

const getUser = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Users'],
  summary: 'Get a user by ID',
  request: { params: IdParam },
  responses: {
    200: {
      description: 'User found',
      content: { 'application/json': { schema: UserSchema } },
    },
    404: {
      description: 'User not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

publicRouter.openapi(getUser, async (c) => {
  const { id } = c.req.valid('param')

  const user = await c.env.einao_db
    .prepare('SELECT id, name, email, role, dob, bio, avatar_url, status, position, socials, last_login FROM users WHERE id = ?')
    .bind(id)
    .first<User>()

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json(user, 200)
})

const createUser = createRoute({
  method: 'post',
  path: '/',
  tags: ['Admin - Users'],
  summary: 'Create a user',
  description: 'User must be at least 30 years old.',
  request: {
    body: {
      content: { 'application/json': { schema: CreateUserSchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'User created',
      content: { 'application/json': { schema: UserSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(createUser, async (c) => {
  const { name, email, role, bio, avatar_url, status, position, socials } = c.req.valid('json')

  const result = await c.env.einao_db
    .prepare(
      'INSERT INTO users (name, email, role, dob, bio, avatar_url, status, position, socials) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id'
    )
    .bind(name, email, role, '', bio, avatar_url, status, position, socials)
    .first<{ id: number }>()

  return c.json({ id: requireUserId(result), name, email, role, dob: undefined, bio, avatar_url, status, position, socials, last_login: null }, 201)
})

const updateUser = createRoute({
  method: 'put',
  path: '/{id}',
  tags: ['Admin - Users'],
  summary: 'Update a user',
  request: {
    params: IdParam,
    body: {
      content: { 'application/json': { schema: CreateUserSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'User updated',
      content: { 'application/json': { schema: UserSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    404: {
      description: 'User not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(updateUser, async (c) => {
  const { id } = c.req.valid('param')
  const { name, email, role, bio, avatar_url, status, position, socials } = c.req.valid('json')

  const result = await c.env.einao_db
    .prepare(
      'UPDATE users SET name = ?, email = ?, role = ?, bio = ?, avatar_url = ?, status = ?, position = ?, socials = ? WHERE id = ? RETURNING id'
    )
    .bind(name, email, role, bio, avatar_url, status, position, socials, id)
    .first<{ id: number }>()

  if (!result) {
    return c.json({ error: 'User not found' }, 404)
  }

  const updated = await c.env.einao_db
    .prepare('SELECT last_login FROM users WHERE id = ?')
    .bind(id)
    .first<{ last_login: string | null }>()

  return c.json({ id, name, email, role, dob: undefined, bio, avatar_url, status, position, socials, last_login: updated?.last_login ?? null }, 200)
})

const patchUserStatus = createRoute({
  method: 'patch',
  path: '/{id}/status',
  tags: ['Admin - Users'],
  summary: 'Suspend or activate a user',
  request: {
    params: IdParam,
    body: {
      content: {
        'application/json': {
          schema: z.object({ status: z.enum(['active', 'suspended']) }),
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Status updated',
      content: {
        'application/json': {
          schema: z.object({ id: z.number(), status: z.string() }),
        },
      },
    },
    404: {
      description: 'User not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(patchUserStatus, async (c) => {
  const { id } = c.req.valid('param')
  const { status } = c.req.valid('json')

  const result = await c.env.einao_db
    .prepare('UPDATE users SET status = ? WHERE id = ? RETURNING id')
    .bind(status, id)
    .first<{ id: number }>()

  if (!result) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ id, status }, 200)
})

const deleteUser = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Admin - Users'],
  summary: 'Delete a user',
  request: { params: IdParam },
  responses: {
    200: {
      description: 'User deleted',
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean() }),
        },
      },
    },
    404: {
      description: 'User not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
})

adminRouter.openapi(deleteUser, async (c) => {
  const { id } = c.req.valid('param')

  const result = await c.env.einao_db
    .prepare('DELETE FROM users WHERE id = ? RETURNING id')
    .bind(id)
    .first<{ id: number }>()

  if (!result) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ success: true }, 200)
})

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Set user password (admin only) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

const setUserPassword = createRoute({
  method: 'put',
  path: '/{id}/password',
  tags: ['Admin'],
  summary: 'Set password for a user',
  request: {
    params: z.object({ id: z.coerce.number() }),
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
      content: { 'application/json': { schema: z.object({ success: z.boolean() }) } },
    },
    404: {
      description: 'User not found',
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
    },
  },
})

adminRouter.openapi(setUserPassword, async (c) => {
  const { id } = c.req.valid('param')
  const { password } = c.req.valid('json')

  const user = await c.env.einao_db
    .prepare('SELECT id FROM users WHERE id = ?')
    .bind(id)
    .first<{ id: number }>()

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  const hashed = await hashPassword(password)
  await c.env.einao_db
    .prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .bind(hashed, id)
    .run()

  return c.json({ success: true }, 200)
})

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Public team endpoint ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

const TeamMemberSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    position: z.string(),
    avatar_url: z.string(),
    socials: z.array(z.object({ label: z.string(), href: z.string() })),
  })
  .openapi('TeamMember')

const listTeam = createRoute({
  method: 'get',
  path: '/',
  tags: ['Team'],
  summary: 'List public team members',
  responses: {
    200: {
      description: 'Array of team members',
      content: { 'application/json': { schema: z.array(TeamMemberSchema) } },
    },
  },
})

const teamRouter = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: validationHook,
})

teamRouter.openapi(listTeam, async (c) => {
  const { results } = await c.env.einao_db
    .prepare(
      "SELECT id, name, position, avatar_url, socials FROM users WHERE role = 'team_member' AND status = 'active' ORDER BY id ASC"
    )
    .all<{ id: number; name: string; position: string; avatar_url: string; socials: string }>()

  const members = results.map((r) => ({
    ...r,
    socials: JSON.parse(r.socials || '[]') as { label: string; href: string }[],
  }))

  return c.json(members, 200)
})

export { adminRouter, teamRouter }
export default publicRouter
