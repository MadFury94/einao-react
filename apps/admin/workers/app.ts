import { createRequestHandler } from 'react-router'
import { configureApiForRequest } from '../app/lib/api'

declare module 'react-router' {
  export interface AppLoadContext {
    cloudflare: {
      env: Env
      ctx: ExecutionContext
    }
  }
}

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE
)

async function proxyAuth(request: Request, env: Env, path: string): Promise<Response> {
  const target = new URL(`/api/v1/auth/${path}`, env.API_URL)
  const requestHeaders = new Headers()
  const contentType = request.headers.get('Content-Type')
  const origin = request.headers.get('Origin')
  if (contentType) requestHeaders.set('Content-Type', contentType)
  if (origin) requestHeaders.set('Origin', origin)
  const isPost = request.method !== 'GET' && request.method !== 'HEAD'
  const body = isPost ? await request.arrayBuffer() : null
  const response = await fetch(target.toString(), {
    method: request.method,
    headers: requestHeaders,
    body,
  })

  // Returning the API response from this same-origin Worker makes the session
  // cookie belong to the admin hostname, while the admin SSR loader forwards it
  // to the API for authenticated requests.
  const headers = new Headers(response.headers)
  const cookie = headers.get('Set-Cookie')
  if (cookie) headers.set('Set-Cookie', cookie.replace(/;\s*Domain=[^;]+/i, ''))
  return new Response(response.body, { status: response.status, headers })
}

export default {
  async fetch(request, env, ctx) {
    const pathname = new URL(request.url).pathname

    // Auth proxy — handles login/logout via Service Binding to avoid error 1042
    if (pathname === '/api/v1/auth/login' || pathname === '/api/v1/auth/logout') {
      const path = pathname.includes('login') ? 'login' : 'logout'
      const target = new URL(`/api/v1/auth/${path}`, env.API_URL)
      const proxyHeaders: Record<string, string> = {}
      const ct = request.headers.get('Content-Type')
      if (ct) proxyHeaders['Content-Type'] = ct
      const body = request.method === 'POST' ? request.body : null
      const apiBind = env.API as { fetch: typeof fetch } | undefined
      const apiRes = apiBind
        ? await apiBind.fetch(target.toString(), { method: request.method, headers: proxyHeaders, body })
        : await fetch(target.toString(), { method: request.method, headers: proxyHeaders, body })
      const resHeaders = new Headers(apiRes.headers)
      const cookie = resHeaders.get('Set-Cookie')
      if (cookie) resHeaders.set('Set-Cookie', cookie.replace(/;\s*Domain=[^;]+/i, ''))
      return new Response(apiRes.body, { status: apiRes.status, headers: resHeaders })
    }

    // API proxy — forwards all /api/v1/* requests to einao-api via Service Binding.
    // This allows browser-side fetch calls (e.g. publish, save) to reach the API
    // without hitting the same-zone workers.dev restriction (error 1042).
    if (pathname.startsWith('/api/v1/')) {
      const target = new URL(pathname + new URL(request.url).search, env.API_URL)
      const proxyHeaders = new Headers(request.headers)
      // Forward session cookie from browser
      const cookie = request.headers.get('Cookie')
      if (cookie) proxyHeaders.set('Cookie', cookie)
      const apiBind = env.API as { fetch: typeof fetch } | undefined
      const apiRes = apiBind
        ? await apiBind.fetch(target.toString(), { method: request.method, headers: proxyHeaders, body: request.body })
        : await fetch(target.toString(), { method: request.method, headers: proxyHeaders, body: request.body })
      const resHeaders = new Headers(apiRes.headers)
      // Strip domain from any Set-Cookie so it applies to the admin hostname
      const setCookie = resHeaders.get('Set-Cookie')
      if (setCookie) resHeaders.set('Set-Cookie', setCookie.replace(/;\s*Domain=[^;]+/i, ''))
      return new Response(apiRes.body, { status: apiRes.status, headers: resHeaders })
    }

    // With `run_worker_first`, static files also reach this Worker. Serve them
    // from the asset binding before React Router handles document requests.
    // Exclude .data requests — those are React Router route data fetches, not assets.
    const isStaticAsset = (pathname.startsWith('/assets/') || pathname.startsWith('/@') || /\.[a-z0-9]+$/i.test(pathname)) && !pathname.endsWith('.data')
    if (isStaticAsset && env.ASSETS) return env.ASSETS.fetch(request)

    configureApiForRequest(env as unknown as Record<string, unknown>, request)
    const response = await requestHandler(request, {
      cloudflare: { env, ctx },
    })
    return response
  },
} satisfies ExportedHandler<Env>
