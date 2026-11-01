import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'

type Bindings = {
  AI: Ai
  einao_db: D1Database
}

// Cloudflare's current supported Llama 3.1 model. The unquantized model was
// retired, so keep this pinned to the catalog's FP8 identifier.
const MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8' as const

const ai = new OpenAPIHono<{ Bindings: Bindings }>()

// --- Schemas ---

const GenerateSchema = z.object({
  prompt: z
    .string()
    .min(1)
    .max(2000)
    .openapi({ description: 'Prompt describing what to generate' }),
  context: z.string().optional().openapi({ description: 'Existing content for context' }),
})

const RewriteSchema = z.object({
  content: z.string().min(1).max(10000).openapi({ description: 'Content to rewrite/improve' }),
  instruction: z
    .string()
    .min(1)
    .max(500)
    .openapi({ description: 'How to rewrite (e.g. "make it shorter", "more professional")' }),
})

const SuggestTitleSchema = z.object({
  content: z.string().min(1).max(5000).openapi({ description: 'Post content to base titles on' }),
  count: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(5)
    .openapi({ description: 'Number of suggestions' }),
})

const SeoSchema = z.object({
  title: z.string().min(1).openapi({ description: 'Post title' }),
  content: z.string().min(1).max(5000).openapi({ description: 'Post content (text or HTML)' }),
})

const TextResponseSchema = z.object({
  result: z.string(),
})

const TitlesResponseSchema = z.object({
  titles: z.array(z.string()),
})

const SeoResponseSchema = z.object({
  seoTitle: z.string(),
  seoDescription: z.string(),
})

// --- Routes ---

const generateRoute = createRoute({
  method: 'post',
  path: '/generate',
  tags: ['AI'],
  summary: 'Generate content from a prompt',
  request: { body: { content: { 'application/json': { schema: GenerateSchema } } } },
  responses: {
    200: {
      description: 'Generated content',
      content: { 'application/json': { schema: TextResponseSchema } },
    },
  },
})

ai.openapi(generateRoute, async (c) => {
  const { prompt, context } = c.req.valid('json')

  if (!c.env.AI) {
    return c.json({
      result:
        '<p>AI is not available in local development. Deploy to Cloudflare or use <code>wrangler dev --remote</code> to test AI features.</p>',
    })
  }

  const systemPrompt = `You are a professional content writer. Write engaging, well-structured content in HTML format suitable for a blog post. Use appropriate HTML tags like <p>, <h2>, <h3>, <ul>, <li>, <strong>, <em>. Do not wrap the content in <html>, <head>, or <body> tags. Only output the content HTML, no explanations.`

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...(context
      ? [{ role: 'user' as const, content: `Here is the existing context:\n\n${context}` }]
      : []),
    { role: 'user' as const, content: prompt },
  ]

  try {
    const response = await c.env.AI.run(MODEL, { messages })
    return c.json({ result: response.response ?? '' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI request failed'
    return c.json({ result: `<p><em>AI error: ${message}</em></p>` })
  }
})

const rewriteRoute = createRoute({
  method: 'post',
  path: '/rewrite',
  tags: ['AI'],
  summary: 'Rewrite or improve existing content',
  request: { body: { content: { 'application/json': { schema: RewriteSchema } } } },
  responses: {
    200: {
      description: 'Rewritten content',
      content: { 'application/json': { schema: TextResponseSchema } },
    },
  },
})

ai.openapi(rewriteRoute, async (c) => {
  const { content, instruction } = c.req.valid('json')

  if (!c.env.AI) {
    return c.json({
      result:
        '<p>AI is not available in local development. Deploy to Cloudflare or use <code>wrangler dev --remote</code> to test AI features.</p>',
    })
  }

  const messages = [
    {
      role: 'system' as const,
      content: `You are a professional editor. Rewrite the given content according to the user's instruction. Output only the rewritten content in HTML format (using <p>, <h2>, <h3>, <ul>, <li>, <strong>, <em> tags). No explanations or commentary.`,
    },
    {
      role: 'user' as const,
      content: `Instruction: ${instruction}\n\nContent to rewrite:\n${content}`,
    },
  ]

  try {
    const response = await c.env.AI.run(MODEL, { messages })
    return c.json({ result: response.response ?? '' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI request failed'
    return c.json({ result: `<p><em>AI error: ${message}</em></p>` })
  }
})

const suggestTitleRoute = createRoute({
  method: 'post',
  path: '/suggest-title',
  tags: ['AI'],
  summary: 'Suggest titles based on post content',
  request: { body: { content: { 'application/json': { schema: SuggestTitleSchema } } } },
  responses: {
    200: {
      description: 'Title suggestions',
      content: { 'application/json': { schema: TitlesResponseSchema } },
    },
  },
})

ai.openapi(suggestTitleRoute, async (c) => {
  const { content, count } = c.req.valid('json')

  if (!c.env.AI) {
    return c.json({ titles: ['AI unavailable in local dev ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â use wrangler dev --remote'] })
  }

  const messages = [
    {
      role: 'system' as const,
      content: `You are a headline writer. Suggest exactly ${count} compelling blog post titles based on the content provided. Return ONLY a JSON array of strings, no other text.`,
    },
    { role: 'user' as const, content },
  ]

  try {
    const response = await c.env.AI.run(MODEL, { messages })
    const raw = response.response ?? '[]'

    let titles: string[]
    try {
      const match = raw.match(/\[[\s\S]*\]/)
      titles = match ? JSON.parse(match[0]) : []
    } catch {
      titles = raw
        .split('\n')
        .map((l) =>
          l
            .replace(/^\d+[.)]\s*/, '')
            .replace(/^["']|["']$/g, '')
            .trim()
        )
        .filter(Boolean)
        .slice(0, count)
    }

    return c.json({ titles })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI request failed'
    return c.json({ titles: [`Error: ${message}`] })
  }
})

const seoRoute = createRoute({
  method: 'post',
  path: '/seo',
  tags: ['AI'],
  summary: 'Generate SEO metadata from post content',
  request: { body: { content: { 'application/json': { schema: SeoSchema } } } },
  responses: {
    200: {
      description: 'SEO metadata',
      content: { 'application/json': { schema: SeoResponseSchema } },
    },
  },
})

ai.openapi(seoRoute, async (c) => {
  const { title, content } = c.req.valid('json')

  if (!c.env.AI) {
    return c.json({
      seoTitle: title,
      seoDescription: 'AI unavailable in local dev ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â use wrangler dev --remote',
    })
  }

  const messages = [
    {
      role: 'system' as const,
      content: `You are an SEO specialist. Given a blog post title and content, generate:
1. An optimized SEO title (50-60 chars)
2. A meta description (150-160 chars)

Return ONLY valid JSON in this format: {"seoTitle": "...", "seoDescription": "..."}`,
    },
    {
      role: 'user' as const,
      content: `Title: ${title}\n\nContent:\n${content.slice(0, 3000)}`,
    },
  ]

  try {
    const response = await c.env.AI.run(MODEL, { messages })
    const raw = response.response ?? '{}'

    let result: { seoTitle: string; seoDescription: string }
    try {
      const match = raw.match(/\{[\s\S]*\}/)
      result = match ? JSON.parse(match[0]) : { seoTitle: title, seoDescription: '' }
    } catch {
      result = { seoTitle: title, seoDescription: '' }
    }

    return c.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI request failed'
    return c.json({ seoTitle: title, seoDescription: `Error: ${message}` })
  }
})

export default ai
