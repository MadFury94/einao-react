const ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
}

export function slugify(title: string): string {
  const ascii = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ÃƒÆ’Ã…Â¸/g, 'ss')
    .replace(/ÃƒÆ’Ã‚Â¦/gi, 'ae')
    .replace(/ÃƒÆ’Ã‚Â¸/gi, 'o')

  return (
    ascii
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢']/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'post'
  )
}

export async function ensureUniqueSlug(
  db: D1Database,
  base: string,
  excludeId?: number
): Promise<string> {
  const root = slugify(base)
  let candidate = root
  let suffix = 2

  while (true) {
    const existing = excludeId
      ? await db
          .prepare('SELECT id FROM posts WHERE slug = ? AND id != ?')
          .bind(candidate, excludeId)
          .first<{ id: number }>()
      : await db
          .prepare('SELECT id FROM posts WHERE slug = ?')
          .bind(candidate)
          .first<{ id: number }>()

    if (!existing) {
      return candidate
    }

    candidate = `${root}-${suffix}`
    suffix += 1
  }
}

export function stripHtmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/gi, (entity) => ENTITY_MAP[entity.toLowerCase()] ?? ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function computeReadingMinutes(text: string): number {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  return Math.max(1, Math.ceil(wordCount / 200))
}

export function deriveExcerpt(text: string, maxLength = 180): string {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized) return ''
  if (normalized.length <= maxLength) return normalized

  const cut = normalized.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  const safe = lastSpace > 60 ? cut.slice(0, lastSpace) : cut
  return `${safe.trim()}...`
}

export async function pruneRevisions(db: D1Database, postId: number, keep = 20): Promise<void> {
  const { results } = await db
    .prepare(
      `SELECT id
       FROM post_revisions
       WHERE post_id = ?
       ORDER BY created_at DESC, id DESC
       LIMIT -1 OFFSET ?`
    )
    .bind(postId, keep)
    .all<{ id: number }>()

  if (results.length === 0) {
    return
  }

  const ids = results.map((row) => row.id)
  const placeholders = ids.map(() => '?').join(', ')

  await db
    .prepare(`DELETE FROM post_revisions WHERE post_id = ? AND id IN (${placeholders})`)
    .bind(postId, ...ids)
    .run()
}
