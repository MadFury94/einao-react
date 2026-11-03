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

    // Auth proxy — handle before React Router so the session cookie is set
    // on the admin hostname. Body is buffered as text to avoid stream issues.
    if (pathname === '/api/v1/auth/login' || pathname === '/api/v1/auth/logout') {
      const path = pathname.includes('login') ? 'login' : 'logout'
      const target = new URL(`/api/v1/auth/${path}`, env.API_URL)
      const proxyHeaders: Record<string, string> = {}
      const ct = request.headers.get('Content-Type')
      if (ct) proxyHeaders['Content-Type'] = ct
      const body = request.method === 'POST' ? request.body : null

      // Use Service Binding (env.API) when available — avoids Cloudflare error 1042
      // which blocks same-zone workers.dev fetch(). Falls back to fetch() for local dev.
      const apiRes = env.API
        ? await (env.API as { fetch: typeof fetch }).fetch(target.toString(), { method: request.method, headers: proxyHeaders, body })
        : await fetch(target.toString(), { method: request.method, headers: proxyHeaders, body })

      const resHeaders = new Headers(apiRes.headers)
      const cookie = resHeaders.get('Set-Cookie')
      if (cookie) resHeaders.set('Set-Cookie', cookie.replace(/;\s*Domain=[^;]+/i, ''))
      return new Response(apiRes.body, { status: apiRes.status, headers: resHeaders })
    }

    // With `run_worker_first`, static files also reach this Worker. Serve them
    // from the asset binding before React Router handles document requests.
    const isStaticAsset = pathname.startsWith('/assets/') || pathname.startsWith('/@') || /\.[a-z0-9]+$/i.test(pathname)
    if (isStaticAsset && env.ASSETS) return env.ASSETS.fetch(request)

    configureApiForRequest(env as unknown as Record<string, unknown>, request)
    const response = await requestHandler(request, {
      cloudflare: { env, ctx },
    })
    return response
  },
} satisfies ExportedHandler<Env>
