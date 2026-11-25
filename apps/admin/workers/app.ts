import { apiConnection } from '../app/lib/api-connection'
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

export default {
  async fetch(request, env, ctx) {
    const pathname = new URL(request.url).pathname

    // Use the same connection for session checks, authentication and content.
    if (pathname.startsWith('/api/v1/')) {
      const { baseUrl, apiFetch } = apiConnection(env as unknown as Record<string, unknown>, request)
      const target = new URL(pathname + new URL(request.url).search, baseUrl)
      const headers = new Headers(request.headers)
      headers.delete('host')
      const response = await apiFetch(target.toString(), {
        method: request.method,
        headers,
        body: request.method === 'GET' || request.method === 'HEAD' ? null : request.body,
      })
      const responseHeaders = new Headers(response.headers)
      const cookie = responseHeaders.get('Set-Cookie')
      if (cookie) responseHeaders.set('Set-Cookie', cookie.replace(/;\s*Domain=[^;]+/i, ''))
      return new Response(response.body, { status: response.status, headers: responseHeaders })
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
