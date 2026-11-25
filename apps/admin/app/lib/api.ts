import { apiConnection } from './api-connection'
import { client } from '@einao/api-client'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  (typeof window !== 'undefined' ? window.location.origin : (import.meta.env.PROD ? '' : 'http://127.0.0.1:8787'))
client.setConfig({ baseUrl: API_BASE_URL, credentials: 'include' })

// Shared server-side fetch state ... set once per request by configureApiForRequest,
// then used by all lib/fetch helpers (posts.ts, services.ts, etc.) during SSR.
export let serverFetch: typeof fetch = globalThis.fetch
export let serverHeaders: Record<string, string> = {}
export let serverBaseUrl = API_BASE_URL

// Called once per request in workers/app.ts before loaders run.
// Configures the shared API client to use the service binding (Worker-to-Worker)
// and forwards the user's session cookie so admin endpoints authenticate.
export function configureApiForRequest(env: Record<string, unknown>, request: Request) {
  const { apiFetch, baseUrl } = apiConnection(env, request, API_BASE_URL)

  const cookie = request.headers.get('Cookie') ?? ''

  serverFetch = apiFetch
  serverBaseUrl = baseUrl
  serverHeaders = cookie ? { Cookie: cookie } : {}

  client.setConfig({
    baseUrl,
    fetch: apiFetch,
    credentials: 'include',
    headers: serverHeaders,
  })
}


