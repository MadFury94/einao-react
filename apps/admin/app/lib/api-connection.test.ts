import { describe, it, expect, vi } from 'vitest';
import { apiConnection } from './api-connection';
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



