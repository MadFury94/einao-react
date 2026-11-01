import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { validationHook } from '../lib/validation-hook'

type Bindings = {
  einao_db: D1Database
}

const ConfigResponseSchema = z
  .object({
    name: z.string(),
    status: z.string(),
    hero_headline: z.string(),
    manifest: z.string(),
    stats: z.array(z.object({ value: z.string(), label: z.string() })),
    copyright_text: z.string(),
    email: z.string(),
    phone: z.string(),
    social_github: z.string(),
    social_discord: z.string(),
    social_twitter: z.string(),
    social_instagram: z.string(),
    social_youtube: z.string(),
    social_linkedin: z.string(),
    social_steam: z.string(),
    address_street: z.string(),
    address_city: z.string(),
    address_state: z.string(),
    address_zip: z.string(),
    address_map_url: z.string(),
    coming_soon_enabled: z.boolean(),
    coming_soon_headline: z.string(),
    maintenance_body: z.string(),
    cta_title: z.string(),
    cta_description: z.string(),
    cta_button_label: z.string(),
    cta_button_href: z.string(),
  })
  .openapi('ConfigResponse')

const UpdateConfigSchema = z
  .object({
    name: z
      .string()
      .min(1, 'name is required')
      .max(100, 'name must be 100 characters or less')
      .optional(),
    hero_headline: z.string().max(200).optional(),
    manifest: z.string().max(500).optional(),
    stats: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
    copyright_text: z.string().max(300).optional(),
    email: z.string().email('email must be a valid email').optional().or(z.literal('')),
    phone: z.string().max(50).optional(),
    social_github: z.string().optional(),
    social_discord: z.string().optional(),
    social_twitter: z.string().optional(),
    social_instagram: z.string().optional(),
    social_youtube: z.string().optional(),
    social_linkedin: z.string().optional(),
    social_steam: z.string().optional(),
    address_street: z.string().max(200).optional(),
    address_city: z.string().max(100).optional(),
    address_state: z.string().max(100).optional(),
    address_zip: z.string().max(20).optional(),
    address_map_url: z.string().optional(),
    coming_soon_enabled: z.boolean().optional(),
    coming_soon_headline: z.string().max(200).optional(),
    maintenance_body: z.string().optional(),
    cta_title: z.string().max(200).optional(),
    cta_description: z.string().max(500).optional(),
    cta_button_label: z.string().max(100).optional(),
    cta_button_href: z.string().optional(),
  })
  .openapi('UpdateConfigRequest')

const FIELD_TO_KEY: Record<string, string> = {
  name: 'app_name',
  hero_headline: 'hero_headline',
  manifest: 'manifest',
  stats: 'stats',
  copyright_text: 'copyright_text',
  email: 'email',
  phone: 'phone',
  social_github: 'social_github',
  social_discord: 'social_discord',
  social_twitter: 'social_twitter',
  social_instagram: 'social_instagram',
  social_youtube: 'social_youtube',
  social_linkedin: 'social_linkedin',
  social_steam: 'social_steam',
  address_street: 'address_street',
  address_city: 'address_city',
  address_state: 'address_state',
  address_zip: 'address_zip',
  address_map_url: 'address_map_url',
  coming_soon_enabled: 'coming_soon_enabled',
  coming_soon_headline: 'coming_soon_headline',
  maintenance_body: 'maintenance_body',
  cta_title: 'cta_title',
  cta_description: 'cta_description',
  cta_button_label: 'cta_button_label',
  cta_button_href: 'cta_button_href',
}

const CONFIG_KEYS = [
  'app_name',
  'hero_headline',
  'manifest',
  'stats',
  'copyright_text',
  'email',
  'phone',
  'social_github',
  'social_discord',
  'social_twitter',
  'social_instagram',
  'social_youtube',
  'social_linkedin',
  'social_steam',
  'address_street',
  'address_city',
  'address_state',
  'address_zip',
  'address_map_url',
  'coming_soon_enabled',
  'coming_soon_headline',
  'maintenance_body',
  'cta_title',
  'cta_description',
  'cta_button_label',
  'cta_button_href',
] as const

const DEFAULTS: Record<string, string> = {
  app_name: 'unknown',
  hero_headline: 'Innovative software development company',
  manifest:
    'From pixel-perfect designs to flawless code, every aspect of our projects is crafted with care to ensure the highest standards of quality.',
  stats:
    '[{"value":"50+","label":"Happy clients who trust our work"},{"value":"86%","label":"Clients come back for a new projects"},{"value":"5+","label":"Years of professional experience"},{"value":"70+","label":"Successfully completed projects"}]',
  copyright_text: 'Copyright Einao Technologies. All rights reserved',
  email: '',
  phone: '',
  social_github: '',
  social_discord: '',
  social_twitter: '',
  social_instagram: '',
  social_youtube: '',
  social_linkedin: '',
  social_steam: '',
  address_street: '',
  address_city: '',
  address_state: '',
  address_zip: '',
  address_map_url: '',
  coming_soon_enabled: 'false',
  coming_soon_headline: 'Something exciting is on the way',
  maintenance_body: '',
  cta_title: 'Ready for the Adventure?',
  cta_description: 'Join players who\'ve discovered award-nominated indie games from Einao Solutions. Wishlist our games, follow our development, and be part of something special.',
  cta_button_label: 'Explore Our Games',
  cta_button_href: 'https://store.steampowered.com/app/4468420/Meowsic/',
}

async function readConfig(db: D1Database) {
  const placeholders = CONFIG_KEYS.map(() => '?').join(', ')
  const { results } = await db
    .prepare(`SELECT key, value FROM app_config WHERE key IN (${placeholders})`)
    .bind(...CONFIG_KEYS)
    .all<{ key: string; value: string }>()

  const values: Record<string, string> = { ...DEFAULTS }
  for (const row of results ?? []) {
    values[row.key] = row.value
  }

  return {
    name: values.app_name,
    status: 'ok',
    hero_headline: values.hero_headline,
    manifest: values.manifest,
    stats: JSON.parse(values.stats),
    copyright_text: values.copyright_text,
    email: values.email,
    phone: values.phone,
    social_github: values.social_github,
    social_discord: values.social_discord,
    social_twitter: values.social_twitter,
    social_instagram: values.social_instagram,
    social_youtube: values.social_youtube,
    social_linkedin: values.social_linkedin,
    social_steam: values.social_steam,
    address_street: values.address_street,
    address_city: values.address_city,
    address_state: values.address_state,
    address_zip: values.address_zip,
    address_map_url: values.address_map_url,
    coming_soon_enabled: values.coming_soon_enabled === 'true',
    coming_soon_headline: values.coming_soon_headline,
    maintenance_body: values.maintenance_body,
    cta_title: values.cta_title,
    cta_description: values.cta_description,
    cta_button_label: values.cta_button_label,
    cta_button_href: values.cta_button_href,
  }
}

const publicRouter = new OpenAPIHono<{ Bindings: Bindings }>({ defaultHook: validationHook })
const adminRouter = new OpenAPIHono<{ Bindings: Bindings }>({ defaultHook: validationHook })

const getConfig = createRoute({
  method: 'get',
  path: '/',
  tags: ['Config'],
  summary: 'Get app config',
  responses: {
    200: {
      description: 'Current app config',
      content: { 'application/json': { schema: ConfigResponseSchema } },
    },
  },
})

publicRouter.openapi(getConfig, async (c) => {
  return c.json(await readConfig(c.env.einao_db))
})

const updateConfig = createRoute({
  method: 'post',
  path: '/',
  tags: ['Admin - Config'],
  summary: 'Update app config',
  request: {
    body: {
      content: { 'application/json': { schema: UpdateConfigSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Config updated',
      content: { 'application/json': { schema: ConfigResponseSchema } },
    },
    400: {
      description: 'Validation error',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.record(z.string(), z.array(z.string())),
          }),
        },
      },
    },
  },
})

adminRouter.openapi(updateConfig, async (c) => {
  const body = c.req.valid('json')

  const updates = Object.entries(body)
    .filter(([, value]) => value !== undefined)
    .map(([field, value]) => ({
      key: FIELD_TO_KEY[field],
      value: field === 'stats' ? JSON.stringify(value) : String(value),
    }))

  if (updates.length > 0) {
    await c.env.einao_db.batch(
      updates.map((u) =>
        c.env.einao_db
          .prepare('INSERT OR REPLACE INTO app_config (key, value) VALUES (?, ?)')
          .bind(u.key, u.value)
      )
    )
  }

  return c.json(await readConfig(c.env.einao_db), 200)
})

export { adminRouter }
export default publicRouter
