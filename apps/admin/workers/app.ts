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
  const response = await fetch(target, {
    method: request.method,
    headers: request.headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
  })

  // Returning the API response from this same-origin Worker makes the session
  // cookie belong to the admin hostname, while the admin SSR loader forwards it
  // to the API for authenticated requests.
  return new Response(response.body, { status: response.status, headers: response.headers })
}

export default {
  async fetch(request, env, ctx) {
    const pathname = new URL(request.url).pathname
    if (request.method === 'POST' && pathname === '/auth/login') return proxyAuth(request, env, 'login')
    if (request.method === 'POST' && pathname === '/auth/logout') return proxyAuth(request, env, 'logout')
    configureApiForRequest(env as unknown as Record<string, unknown>, request)
    return requestHandler(request, {
      cloudflare: { env, ctx },
    })
  },
} satisfies ExportedHandler<Env>
