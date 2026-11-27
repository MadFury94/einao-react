import { describe, it, expect, vi } from 'vitest';
import { apiConnection, requestApiConnection } from './api-connection';
describe('admin API connection', () => {
  it('bypasses disconnected bindings on localhost', () => {
    const binding = { fetch: vi.fn() };
    const connection = apiConnection({ API: binding, API_URL: 'https://api.example' }, new Request('http://localhost:5931'));
    expect(connection.baseUrl).toBe('http://127.0.0.1:8787');
    expect(connection.apiFetch).toBe(globalThis.fetch);
  });
  it('uses the configured binding in production', async () => {
    const binding = { fetch: vi.fn().mockResolvedValue(new Response('ok')) };
    const connection = apiConnection({ API: binding, API_URL: 'https://api.example' }, new Request('https://admin.example'));
    expect(connection.baseUrl).toBe('https://api.example');
    await connection.apiFetch('https://api.example/api/v1/admin/me');
    expect(binding.fetch).toHaveBeenCalledOnce();
  });
});





describe('request-scoped admin credentials', () => {
  it('keeps concurrent visitors and anonymous requests isolated', async () => {
    const received: string[] = [];
    const binding = { fetch: vi.fn(async (_url, init) => {
      await Promise.resolve();
      received.push(new Headers(init?.headers).get('Cookie') || '');
      return new Response('[]');
    }) };
    const env = { API: binding, API_URL: 'https://api.example' };
    const requests = ['einao_session=first', 'einao_session=second', ''].map(cookie =>
      new Request('https://admin.example/content?page=work', { headers: cookie ? { Cookie: cookie } : {} }));
    const connections = requests.map(request => requestApiConnection(env, request));
    await Promise.all(connections.map(connection => connection.apiFetch(
      connection.baseUrl + '/api/v1/admin/page-blocks/work', { headers: connection.headers })));
    expect(received).toEqual(['einao_session=first', 'einao_session=second', '']);
  });

  it('forwards the incoming cookie on the local backend connection', () => {
    const connection = requestApiConnection({}, new Request('http://127.0.0.1:5931/content?page=work', {
      headers: { Cookie: 'einao_session=current' },
    }));
    expect(connection.baseUrl).toBe('http://127.0.0.1:8787');
    expect(connection.headers).toEqual({ Cookie: 'einao_session=current' });
    expect(connection.apiFetch).toBe(globalThis.fetch);
  });
});
