/** Use the API service binding when available; fall back to the local backend for standalone dev. */
export function apiConnection(env: Record<string, unknown>, request: Request, fallback = 'http://127.0.0.1:8787') {
  const host = new URL(request.url).hostname;
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(host);
  const binding = env.API as { fetch: typeof fetch } | undefined;
  return {
    baseUrl: local ? fallback : typeof env.API_URL === 'string' ? env.API_URL : fallback,
    apiFetch: !local && binding ? binding.fetch.bind(binding) : globalThis.fetch,
  };
}





/** Keep credentials attached to this request, never in shared module state. */
export function requestApiConnection(env: Record<string, unknown>, request: Request) {
  const connection = apiConnection(env, request);
  const cookie = request.headers.get('Cookie');
  const headers: Record<string, string> = cookie ? { Cookie: cookie } : {};
  return { ...connection, headers };
}
