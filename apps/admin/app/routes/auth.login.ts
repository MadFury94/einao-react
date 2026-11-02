import { serverBaseUrl, serverFetch } from '../lib/api'
import type { Route } from './+types/auth.login'

export async function action({ request }: Route.ActionArgs) {
  const response = await serverFetch(`${serverBaseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': request.headers.get('Content-Type') ?? 'application/json' },
    body: await request.text(),
  })
  return new Response(response.body, { status: response.status, headers: response.headers })
}

export function loader() {
  return new Response('Method not allowed', { status: 405 })
}

