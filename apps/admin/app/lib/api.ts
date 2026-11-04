import { client } from '@einao/api-client'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD ? window?.location?.origin ?? '' : 'http://localhost:8787')

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
  const hasBinding = Boolean(env.API)
  const apiFetch = hasBinding
    ? (env.API as { fetch: typeof fetch }).fetch.bind(env.API)
    : globalThis.fetch
  const baseUrl = hasBinding ? 'https://einao-api.einaodevv.workers.dev' : API_BASE_URL

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
