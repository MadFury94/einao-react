import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { articlePage, cleanArticleHtml, getInsight, getInsights, insightsApiBase, insightsApiFetch, insightSitemapPages, type Article } from './insights.server.ts';
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const post: Article = { id: 1, title: 'Published insight', slug: 'published-insight', excerpt: 'Summary', subtitle: 'Subtitle', featured_image_url: '/image.webp', status: 'published', post_type: 'blog', published_at: '2020-01-01 12:00:00', updated_at: '2020-01-02', reading_minutes: 2, author: { name: 'Einao' }, categories: [{ id: 1, name: 'Technology', slug: 'technology' }], tags: [{ id: 1, name: 'Automation' }], content_html: '<p>Hello <strong>world</strong></p>', seo_title: 'Search title', seo_description: 'Search description', seo_canonical_url: '', seo_og_image_url: '' };
test('uses the local API in development and the configured API in production', () => {
  assert.equal(insightsApiBase('https://api.test/', 'http://localhost:5930'), 'http://localhost:8787');
  assert.equal(insightsApiBase('https://api.test/', 'https://site.test'), 'https://api.test');
});
test('requests published blog listings with pagination and omits non-public records', async () => {
  globalThis.fetch = async input => {
    const url = new URL(String(input));
    assert.equal(url.pathname, '/api/v1/posts');
    assert.equal(url.searchParams.get('post_type'), 'blog');
    assert.equal(url.searchParams.get('page'), '2');
    return Response.json({ items: [post, { ...post, status: 'draft' }, { ...post, post_type: 'case_study' }, { ...post, published_at: '2999-01-01 00:00:00' }], total: 13, page: 2, pageSize: 12 });
  };
  assert.deepEqual((await getInsights('https://api.test', 2)).items, [post]);
});
test('returns an empty published listing without substituting sample content', async () => {
  globalThis.fetch = async () => Response.json({ items: [], total: 0, page: 1, pageSize: 12 });
  assert.equal((await getInsights('https://api.test')).items.length, 0);
});
test('maps article content, images, categories and SEO fields', async () => {
  globalThis.fetch = async () => Response.json(post);
  const article = await getInsight('https://api.test', post.slug);
  assert.equal(article.content_html, post.content_html);
  assert.equal(article.categories[0].name, 'Technology');
  assert.equal(articlePage(article).slug, 'insights/published-insight');
  assert.equal(articlePage(article).seo_title, 'Search title');
  assert.equal(articlePage(article).og_image_url, '/image.webp');
});
test('returns 404 for unpublished articles and preserves API 404s', async () => {
  for (const status of ['draft', 'scheduled', 'archived']) {
    globalThis.fetch = async () => Response.json({ ...post, status });
    await assert.rejects(getInsight('https://api.test', post.slug), error => error instanceof Response && error.status === 404);
  }
  globalThis.fetch = async () => new Response('', { status: 404 });
  await assert.rejects(getInsight('https://api.test', 'missing'), error => error instanceof Response && error.status === 404);
});
test('reports API failures instead of rendering stale sample posts', async () => {
  globalThis.fetch = async () => { throw new Error('Offline'); };
  await assert.rejects(getInsights('https://api.test'), error => error instanceof Response && error.status === 503);
});
test('preserves rich text while removing scripts, event handlers and unsafe URLs', () => {
  const html = cleanArticleHtml('<h2>Heading</h2><p style="text-align:center;color:red">Text <strong>bold</strong></p><script>alert(1)</script><img src="/photo.png" onerror="alert(1)"><a href="javascript:alert(1)">Link</a>');
  assert.match(html, /<h2>Heading<\/h2>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /src="\/photo.png"/);
  assert.match(html, /text-align:center/);
  assert.doesNotMatch(html, /script|onerror|alert|color:red/);
});

test('sends search and category filters to the API', async () => {
  const apiFetch: typeof fetch = async input => {
    const query = new URL(String(input)).searchParams;
    assert.equal(query.get('search'), 'automation');
    assert.equal(query.get('category'), 'technology');
    return Response.json({ items: [], total: 0, page: 1, pageSize: 12 });
  };
  await getInsights('https://api.test', 1, 12, 'automation', apiFetch, 'technology');
});
