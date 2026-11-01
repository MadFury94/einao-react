import { serverBaseUrl, serverFetch, serverHeaders } from './api'

type JSONContent = {
  type?: string
  content?: JSONContent[]
  attrs?: Record<string, unknown>
  text?: string
  [key: string]: unknown
}

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived'

export type AuthorInfo = {
  id: number
  name: string
  email: string
}

export type CategoryInfo = {
  id: number
  name: string
  slug: string
}

export type TagInfo = {
  id: number
  name: string
  created_at?: string
}

export type PostSummary = {
  id: number
  title: string
  slug: string
  excerpt: string
  featured_image_url: string
  status: PostStatus
  published_at: string | null
  reading_minutes: number
  post_type: string
  subtitle: string
  author: AuthorInfo | null
  categories: CategoryInfo[]
  tags: TagInfo[]
  created_at: string
  updated_at: string
}

export type Post = PostSummary & {
  content_html: string
  content_json: string
  seo_title: string
  seo_description: string
  seo_canonical_url: string
  seo_og_image_url: string
  scheduled_for: string | null
}

export type PostListResponse = {
  items: PostSummary[]
  total: number
  page: number
  pageSize: number
}

export type PostRevision = {
  id: number
  post_id: number
  title: string
  content_json: string
  created_at: string
  created_by: number | null
}

export type PostMutationPayload = {
  title?: string
  slug?: string
  excerpt?: string
  content_json?: string
  content_html?: string
  featured_image_url?: string
  status?: 'draft'
  author_id?: number | null
  seo_title?: string
  seo_description?: string
  seo_canonical_url?: string
  seo_og_image_url?: string
  post_type?: string
  subtitle?: string
  category_ids?: number[]
  tag_ids?: number[]
}

export const EMPTY_POST_CONTENT: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
}

function contentJsonFromHtml(html: string | null | undefined): JSONContent {
  const normalized = String(html ?? '')
    .replace(/\\r\\n|\\n|\\r/g, '\n')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .trim()

  if (!normalized) return EMPTY_POST_CONTENT

  const paragraphs = decodeHtmlEntities(normalized)
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (paragraphs.length === 0) return EMPTY_POST_CONTENT

  return {
    type: 'doc',
    content: paragraphs.map((paragraph) => ({
      type: 'paragraph',
      content: [{ type: 'text', text: paragraph }],
    })),
  }
}

function buildUrl(path: string, query?: Record<string, string | number | undefined>) {
  const url = new URL(path, serverBaseUrl)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === '') continue
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

type JsonRequestInit = Omit<RequestInit, 'body'> & {
  body?: RequestInit['body'] | Record<string, unknown>
}

function normalizeInit(init?: JsonRequestInit) {
  const headers = new Headers({ ...serverHeaders, ...init?.headers })
  let body = init?.body

  if (body && isPlainObject(body)) {
    headers.set('content-type', 'application/json')
    body = JSON.stringify(body)
  }

  return { ...init, headers, body, credentials: 'include' as const }
}

function errorMessage(error: unknown) {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    return Object.entries(error as Record<string, unknown>)
      .map(([field, messages]) => {
        if (Array.isArray(messages)) return `${field}: ${messages.join(', ')}`
        return `${field}: ${String(messages)}`
      })
      .join('; ')
  }
  return 'Request failed'
}

async function apiRequest<T>(
  path: string,
  init?: JsonRequestInit,
  query?: Record<string, string | number | undefined>
) {
  const response = await serverFetch(buildUrl(path, query), normalizeInit(init))
  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data
        ? errorMessage(data.error)
        : response.statusText
    throw new Error(message || 'Request failed')
  }

  return data as T
}

export function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function parseContentJson(
  value: string | null | undefined,
  fallbackHtml?: string | null | undefined
): JSONContent {
  if (!value) return contentJsonFromHtml(fallbackHtml)

  try {
    const parsed = JSON.parse(value) as JSONContent
    if (
      parsed &&
      typeof parsed === 'object' &&
      'type' in parsed &&
      Array.isArray(parsed.content) &&
      parsed.content.length > 0
    ) {
      return parsed
    }
  } catch {
    return contentJsonFromHtml(fallbackHtml)
  }

  return contentJsonFromHtml(fallbackHtml)
}

export function parseApiDate(value: string | null | undefined) {
  if (!value) return null
  const normalized =
    /z$/i.test(value) || /[+-]\d{2}:\d{2}$/.test(value) ? value : `${value.replace(' ', 'T')}Z`
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDateTime(
  value: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
) {
  const date = parseApiDate(value)
  if (!date) return '...'
  return date.toLocaleString('en-US', options)
}

export function toLocalDateTimeInputValue(value: string | null | undefined) {
  const date = parseApiDate(value)
  if (!date) return ''

  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function fromLocalDateTimeInputValue(value: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export async function getAdminPosts(query: Record<string, string | number | undefined>) {
  return apiRequest<PostListResponse>('/api/v1/admin/posts', undefined, query)
}

export async function getAdminPost(id: string) {
  return apiRequest<Post>(`/api/v1/admin/posts/${id}`)
}

export async function createAdminPost(
  body: Required<Pick<PostMutationPayload, 'title'>> & PostMutationPayload
) {
  return apiRequest<Post>('/api/v1/admin/posts', { method: 'POST', body })
}

export async function updateAdminPost(id: number | string, body: PostMutationPayload) {
  return apiRequest<Post>(`/api/v1/admin/posts/${id}`, { method: 'PATCH', body })
}

export async function publishAdminPost(id: number | string, published_at?: string) {
  return apiRequest<Post>(`/api/v1/admin/posts/${id}/publish`, {
    method: 'POST',
    body: published_at ? { published_at } : {},
  })
}

export async function scheduleAdminPost(id: number | string, scheduled_for: string) {
  return apiRequest<Post>(`/api/v1/admin/posts/${id}/schedule`, {
    method: 'POST',
    body: { scheduled_for },
  })
}

export async function unpublishAdminPost(id: number | string) {
  return apiRequest<Post>(`/api/v1/admin/posts/${id}/unpublish`, { method: 'POST' })
}

export async function archiveAdminPost(id: number | string) {
  return apiRequest<Post>(`/api/v1/admin/posts/${id}`, { method: 'DELETE' })
}

export async function getPostRevisions(id: string) {
  return apiRequest<PostRevision[]>(`/api/v1/admin/posts/${id}/revisions`)
}

export async function restorePostRevision(id: string, revisionId: number | string) {
  return apiRequest<Post>(`/api/v1/admin/posts/${id}/revisions/${revisionId}/restore`, {
    method: 'POST',
  })
}

export async function getBlogCategories() {
  return apiRequest<CategoryInfo[]>('/api/v1/blog/categories')
}

export async function getTags() {
  return apiRequest<TagInfo[]>('/api/v1/tags')
}

export type AuthorOption = {
  id: number
  name: string
  role: string
}

export async function getAuthors(): Promise<AuthorOption[]> {
  const users = await apiRequest<{ id: number; name: string; role: string }[]>('/api/v1/users')
  return users.filter((u) => u.role === 'admin' || u.role === 'author')
}
