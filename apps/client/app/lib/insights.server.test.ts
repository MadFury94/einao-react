import { pageMeta } from './metadata.ts';
﻿import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { articlePage, cleanArticleHtml, getInsight, getInsights, insightsApiBase, insightSitemapPages, type Article } from './insights.server.ts';
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
test('includes every published article page in sitemap pagination', async () => {
  globalThis.fetch = async input => {
    const page = Number(new URL(String(input)).searchParams.get('page'));
    return Response.json({ items: [{ ...post, slug: `article-${page}` }], page, pageSize: 100, total: 101 });
  };
  assert.deepEqual((await insightSitemapPages('https://api.test')).map(page => page.slug), ['insights/article-1', 'insights/article-2']);
});

test('article schema carries author, UTC dates, headline and absolute image', () => {
 const tags = pageMeta(articlePage({ ...post, author: { name: 'Jane Example' } }), 'https://site.test');
 const schema = tags.find(tag => 'script:ld+json' in tag)?.['script:ld+json'];
 assert.equal(schema?.['@type'], 'Article');
 assert.equal(schema?.headline, post.title);
 assert.deepEqual(schema?.author, { '@type': 'Person', name: 'Jane Example' });
 assert.equal(schema?.datePublished, '2020-01-01T12:00:00.000Z');
 assert.equal(schema?.dateModified, '2020-01-02T00:00:00.000Z');
 assert.equal(schema?.image, 'https://site.test/image.webp');
 assert.equal(schema?.mainEntityOfPage?.['@id'], 'https://site.test/insights/published-insight/');
 assert.ok(tags.some(tag => 'property' in tag && tag.property === 'og:type' && tag.content === 'article'));
});
test('missing editorial data does not invent dates or a personal author', () => {
 const page = articlePage({ ...post, author: null, published_at: null, updated_at: 'invalid' });
 const schema = pageMeta(page).find(tag => 'script:ld+json' in tag)?.['script:ld+json'];
 assert.equal(schema?.author?.['@type'], 'Organization');
 assert.equal(schema?.datePublished, undefined);
 assert.equal(schema?.dateModified, undefined);
 const regular = pageMeta({ ...page, slug: 'about' }).find(tag => 'script:ld+json' in tag)?.['script:ld+json'];
 assert.equal(regular?.['@type'], 'WebPage');
 assert.equal(regular?.author, undefined);
});
