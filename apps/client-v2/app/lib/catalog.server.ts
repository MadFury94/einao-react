import type { Page } from '@einao/content';
import { collectionFromPage, publishedLink, type Catalog, type CollectionKey, type PageSummary } from './catalog.ts';
type ApiEnv = { CONTENT_API_URL?: string; CONTENT_API?: { fetch: typeof fetch } };

export type AdminUser = { id: number; name: string; email: string; role: string };

export async function checkAdminSession(request: Request, env: ApiEnv): Promise<AdminUser | null> {
  const cookie = request.headers.get('Cookie')?.split(';').map(value => value.trim()).find(value => value.startsWith('einao_session='));
  if (!cookie || cookie === 'einao_session=') return null;
  try {
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(new URL(request.url).hostname);
    const base = local ? 'http://localhost:8787' : env.CONTENT_API_URL;
    if (!base) return null;
    const apiFetch = !local && env.CONTENT_API ? env.CONTENT_API.fetch.bind(env.CONTENT_API) : globalThis.fetch;
    const response = await apiFetch(base.replace(/\/$/, '') + '/api/v1/admin/me', {
      headers: { Accept: 'application/json', Cookie: cookie },
      cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;
    const user: unknown = await response.json();
    if (!user || typeof user !== 'object') return null;
    const candidate = user as Partial<AdminUser>;
    if (typeof candidate.id !== 'number' || typeof candidate.name !== 'string' || typeof candidate.email !== 'string' || typeof candidate.role !== 'string') return null;
    return { id: candidate.id, name: candidate.name, email: candidate.email, role: candidate.role };
  } catch {
    return null;
  }
}

export function createCatalogApi(request: Request, env: ApiEnv) {
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(new URL(request.url).hostname);
  const base = local ? 'http://localhost:8787' : env.CONTENT_API_URL;
  const apiFetch = !local && env.CONTENT_API ? env.CONTENT_API.fetch.bind(env.CONTENT_API) : globalThis.fetch;
  async function read<T>(path: string): Promise<T> {
    if (!base) throw new Response('Content unavailable', { status: 503 });
    let response: Response;
    try { response = await apiFetch(`${base.replace(/\/$/, '')}/api/v1/content/${path}`, { headers: { Accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(local ? 30000 : 10000) }); }
    catch { throw new Response('Content temporarily unavailable', { status: 503 }); }
    if (response.status === 404) throw new Response('Page not found', { status: 404 });
    if (!response.ok) throw new Response('Content temporarily unavailable', { status: 503 });
    return response.json() as Promise<T>;
  }
  // Memoization is scoped to this request, never shared across visitors.
  let pagesPromise: Promise<PageSummary[]> | undefined;
  const listPages = () => pagesPromise ??= read<PageSummary[]>('pages').then(pages => pages.filter(page => page.status === 'published'));
  async function getPage(slug: string) {
    const page = await read<Page>(`pages/${encodeURIComponent(slug)}`);
    if (page.status !== 'published') throw new Response('Page not found', { status: 404 });
    return { ...page, blocks: page.blocks.filter(block => block.visible).sort((a, b) => a.position - b.position) };
  }
  async function getCollection(key: CollectionKey) {
    const [page, pages, industries] = await Promise.all([getPage(key), listPages(), key === 'work' ? getPage('industries').catch(() => null) : null]);
    return collectionFromPage(key, page, pages, industries);
  }
  async function getDetail(key: CollectionKey, slug: string) {
    const [page, pages] = await Promise.all([getPage(`${key}/${slug}`), listPages()]);
    // Related cards and CTAs must not lead to unpublished collection pages.
    return { ...page, blocks: page.blocks.map(block => ({ ...block, config: {
      ...block.config,
      cta: block.config.cta && publishedLink(block.config.cta.href, pages) ? block.config.cta : undefined,
      secondaryCta: block.config.secondaryCta && publishedLink(block.config.secondaryCta.href, pages) ? block.config.secondaryCta : undefined,
      items: block.config.items?.filter(item => !item.link?.href || publishedLink(item.link.href, pages)),
    } })) };
  }
  async function getCatalog(): Promise<Catalog> {
    const keys = ['solutions', 'capabilities', 'work'] as const;
    const values = await Promise.all(keys.map(key => getCollection(key).catch(() => null)));
    return { solutions: values[0], capabilities: values[1], work: values[2] };
  }
  return { getPage, listPages, getCollection, getDetail, getCatalog };
}
