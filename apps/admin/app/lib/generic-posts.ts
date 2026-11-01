import { serverBaseUrl, serverFetch, serverHeaders } from './api'

export type GenericPostType = 'industry' | 'case_study' | 'testimonial'
export type GenericPostStatus = 'draft' | 'published' | 'archived'

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

export type GenericPost = {
  id: number
  title: string
  slug: string
  subtitle: string
  excerpt: string
  featured_image_url: string
  link_url: string
  link_post: { id: number; title: string; slug: string } | null
  post_type: GenericPostType
  status: GenericPostStatus
  published_at: string | null
  author: AuthorInfo | null
  categories: CategoryInfo[]
  tags: TagInfo[]
  created_at: string
  updated_at: string
}

export type GenericPostListResponse = {
  items: GenericPost[]
  total: number
  page: number
  pageSize: number
}

export type GenericPostMutationPayload = {
  title?: string
  slug?: string
  subtitle?: string
  excerpt?: string
  featured_image_url?: string
  link_url?: string
  link_post_id?: number | null
  post_type?: GenericPostType
  category_ids?: number[]
  tag_ids?: number[]
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

export async function getAdminGenericPosts(query: Record<string, string | number | undefined>) {
  return apiRequest<GenericPostListResponse>('/api/v1/admin/generic-posts', undefined, query)
}

export async function getAdminGenericPost(id: string) {
  return apiRequest<GenericPost>(`/api/v1/admin/generic-posts/${id}`)
}

export async function createAdminGenericPost(
  body: Required<Pick<GenericPostMutationPayload, 'title' | 'post_type'>> &
    GenericPostMutationPayload
) {
  return apiRequest<GenericPost>('/api/v1/admin/generic-posts', { method: 'POST', body })
}

export async function updateAdminGenericPost(
  id: number | string,
  body: GenericPostMutationPayload
) {
  return apiRequest<GenericPost>(`/api/v1/admin/generic-posts/${id}`, { method: 'PATCH', body })
}

export async function publishAdminGenericPost(id: number | string) {
  return apiRequest<GenericPost>(`/api/v1/admin/generic-posts/${id}/publish`, { method: 'POST' })
}

export async function unpublishAdminGenericPost(id: number | string) {
  return apiRequest<GenericPost>(`/api/v1/admin/generic-posts/${id}/unpublish`, { method: 'POST' })
}

export async function archiveAdminGenericPost(id: number | string) {
  return apiRequest<GenericPost>(`/api/v1/admin/generic-posts/${id}`, { method: 'DELETE' })
}

export const POST_TYPE_LABELS: Record<string, string> = {
  industry: 'Industry',
  case_study: 'Case Study',
  testimonial: 'Testimonial',
}

export const POST_TYPE_BADGE_COLORS: Record<string, string> = {
  industry: 'bg-purple-100 text-purple-700',
  case_study: 'bg-orange-100 text-orange-700',
  testimonial: 'bg-green-100 text-green-700',
}
