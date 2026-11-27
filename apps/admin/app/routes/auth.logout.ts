import { proxyApiResponse } from '../lib/proxy-response'
import { serverBaseUrl, serverFetch } from '../lib/api'
import type { Route } from './+types/auth.logout'

export async function action({ request }: Route.ActionArgs) {
  const response = await serverFetch(`${serverBaseUrl}/api/v1/auth/logout`, {
    method: 'POST',
    headers: { Cookie: request.headers.get('Cookie') ?? '' },
  })
  return proxyApiResponse(response, request)
}

export function loader() {
  return new Response('Method not allowed', { status: 405 })
}
