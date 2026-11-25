import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import type { Page } from '@einao/content';
import { collectionFromPage, publishedLink } from './catalog.ts';
import { createCatalogApi } from './catalog.server.ts';
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const detail: Page = { slug: 'solutions/example', title: 'Admin title', description: 'Admin description', status: 'published', blocks: [] };
const page: Page = { slug: 'solutions', title: 'Solutions', description: '', status: 'published', blocks: [{ id: 1, page_slug: 'solutions', block_type: 'solutions', position: 0, visible: true, config: { title: 'Solutions', items: [{ title: 'Listing title', body: 'Listing summary', image: '/admin.png', link: { label: 'Explore', href: '/solutions/example/' } }, { title: 'Draft', body: '', link: { label: 'Draft', href: '/solutions/draft/' } }] } }] };
test('maps admin card text, image, link and ordering, excluding unpublished pages', () => {
  const entries = collectionFromPage('solutions', page, [detail]).entries;
  assert.equal(entries.length, 1);
  assert.equal(entries[0].title, 'Listing title');
  assert.equal(entries[0].image, '/admin.png');
  assert.equal(entries[0].link?.label, 'Explore');
});
test('includes standalone detail pages and removes unpublished entries without seed fallback', () => {
  assert.equal(collectionFromPage('solutions', page, []).entries.length, 0);
  const standalone = { ...detail, slug: 'solutions/new', title: 'New solution' };
  assert.deepEqual(collectionFromPage('solutions', page, [detail, standalone]).entries.map(item => item.title), ['Listing title', 'New solution']);
});
test('hidden collection blocks remain hidden', () => {
  assert.equal(collectionFromPage('solutions', { ...page, blocks: [{ ...page.blocks[0], visible: false }] }, [detail]).entries.length, 0);
});
test('maps legacy work CTA and industry categories', () => {
  const work: Page = { ...page, slug: 'work', blocks: [{ ...page.blocks[0], block_type: 'proof', config: { title: 'Work', cta: { label: 'View', href: '/work/example/' }, items: [{ title: 'Example', body: 'Summary', industry_key: 'government' } as any] } }] };
  const industries: Page = { ...page, blocks: [{ ...page.blocks[0], block_type: 'industries', config: { title: '', items: [{ title: 'Public sector', body: '', industry_id: 'government' } as any] } }] };
  const entries = collectionFromPage('work', work, [{ ...detail, slug: 'work/example' }], industries).entries;
  assert.equal(entries[0].link?.href, '/work/example/');
  assert.equal(entries[0].label, 'Public sector');
});
test('rejects unsafe links and unpublished detail links', () => {
  assert.equal(publishedLink('javascript:alert(1)', [detail]), undefined);
  assert.equal(publishedLink('//evil.example', [detail]), undefined);
  assert.equal(publishedLink('/solutions/draft/?x=1', [detail]), undefined);
  assert.equal(publishedLink('/solutions/example/?x=1', [detail]), '/solutions/example/?x=1');
});
test('local API bypasses service binding; detail requests encode the nested slug and filter hidden sections', async () => {
  let called = false;
  globalThis.fetch = async input => {
    const url = new URL(String(input));
    assert.equal(url.origin, 'http://localhost:8787');
    if (url.pathname.endsWith('/pages')) return Response.json([detail]);
    assert.equal(url.pathname, '/api/v1/content/pages/solutions%2Fexample');
    called = true;
    return Response.json({ ...detail, blocks: [{ ...page.blocks[0], visible: false }, { ...page.blocks[0], id: 2, block_type: 'editorial', config: { title: 'Live heading', body: ['Edited paragraph'], items: [{ title: 'Draft link', body: '', link: { label: 'Draft', href: '/solutions/draft/' } }] } }] });
  };
  const api = createCatalogApi(new Request('http://localhost:5942'), { CONTENT_API: { fetch: (() => { throw new Error('must not use local binding'); }) as typeof fetch } });
  const result = await api.getDetail('solutions', 'example');
  assert.ok(called);
  assert.equal(result.blocks.length, 1);
  assert.equal(result.blocks[0].config.body?.[0], 'Edited paragraph');
  assert.equal(result.blocks[0].config.items?.length, 0);
});
test('production uses the configured binding and preserves 404 versus outage', async () => {
  const request = new Request('https://site.example');
  for (const status of [404, 500]) {
    const api = createCatalogApi(request, { CONTENT_API_URL: 'https://api.example', CONTENT_API: { fetch: (async () => new Response('', { status })) as typeof fetch } });
    await assert.rejects(api.getPage('solutions/example'), error => error instanceof Response && error.status === (status === 404 ? 404 : 503));
  }
});
test('fresh requests see publication changes and draft responses cannot render', async () => {
  let status = 'published';
  globalThis.fetch = async () => Response.json({ ...detail, status });
  const api = createCatalogApi(new Request('http://localhost'), {});
  assert.equal((await api.getPage(detail.slug)).title, 'Admin title');
  status = 'draft';
  await assert.rejects(api.getPage(detail.slug), error => error instanceof Response && error.status === 404);
});
