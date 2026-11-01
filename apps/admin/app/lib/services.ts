import { serverBaseUrl, serverFetch, serverHeaders } from './api'
import { formatDateTime, parseApiDate } from './posts'

export type ServiceStatus = 'draft' | 'scheduled' | 'published' | 'archived'

export type Service = {
  id: number
  name: string
  description: string
  image_url: string
  tags: string[]
  sort_order: number
  status: ServiceStatus
  seo_title: string
  seo_description: string
  published_at: string | null
  scheduled_for: string | null
  created_at: string
  updated_at: string
}

export type ServiceMutationPayload = {
  name?: string
  description?: string
  image_url?: string
  tags?: string[]
  sort_order?: number
  seo_title?: string
  seo_description?: string
}

type JsonRequestInit = Omit<RequestInit, 'body'> & { body?: unknown }

function normalizeInit(init?: JsonRequestInit): RequestInit {
  if (!init) return { headers: serverHeaders }
  const { body, headers, ...rest } = init
  const merged: HeadersInit = {
    ...serverHeaders,
    'Content-Type': 'application/json',
    ...(headers ?? {}),
  }
  return {
    ...rest,
    headers: merged,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'include' as const,
  }
}

async function apiRequest<T>(path: string, init?: JsonRequestInit) {
  const response = await serverFetch(new URL(path, serverBaseUrl), normalizeInit(init))
  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data
        ? typeof (data as { error: unknown }).error === 'string'
          ? (data as { error: string }).error
          : 'Request failed'
        : response.statusText
    throw new Error(message || 'Request failed')
  }

  return data as T
}

export async function getAdminService(id: string | number) {
  return apiRequest<Service>(`/api/v1/admin/services/${id}`)
}

export async function updateAdminService(id: string | number, body: ServiceMutationPayload) {
  return apiRequest<Service>(`/api/v1/admin/services/${id}`, { method: 'PUT', body })
}

export async function publishAdminService(id: string | number) {
  return apiRequest<Service>(`/api/v1/admin/services/${id}/publish`, { method: 'POST' })
}

export async function unpublishAdminService(id: string | number) {
  return apiRequest<Service>(`/api/v1/admin/services/${id}/unpublish`, { method: 'POST' })
}

export async function scheduleAdminService(id: string | number, scheduled_for: string) {
  return apiRequest<Service>(`/api/v1/admin/services/${id}/schedule`, {
    method: 'POST',
    body: { scheduled_for },
  })
}

export { formatDateTime, parseApiDate }
