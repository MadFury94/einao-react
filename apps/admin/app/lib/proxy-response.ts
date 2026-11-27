const ADMIN_HOST = 'einao-admin.einaodevv.workers.dev'
const SESSION_DOMAIN = 'einaodevv.workers.dev'

/** Keep the deployed session available to the client, while local/custom hosts stay host-only. */
export function proxyApiResponse(response: Response, request: Request): Response {
  const url = new URL(request.url)
  const sharedSession = url.protocol === 'https:' && url.hostname === ADMIN_HOST
  const headers = new Headers(response.headers)
  const cookies = headers.getSetCookie()
  headers.delete('Set-Cookie')
  for (const cookie of cookies) {
    const hostOnlyCookie = cookie.replace(/;\s*Domain=[^;]+/gi, '')
    if (sharedSession && cookie.startsWith('einao_session=')) {
      // Remove cookies from earlier deployments to avoid duplicate session names.
      headers.append('Set-Cookie', 'einao_session=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Lax')
      headers.append('Set-Cookie', `${hostOnlyCookie}; Domain=${SESSION_DOMAIN}`)
    } else {
      headers.append('Set-Cookie', hostOnlyCookie)
    }
  }
  return new Response(response.body, { status: response.status, headers })
}
