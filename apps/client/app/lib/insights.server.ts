import sanitizeHtml from 'sanitize-html';
import type { Page } from '@einao/content';
export type Insight = {
  id: number; title: string; slug: string; excerpt: string; subtitle: string;
  featured_image_url: string; status: string; post_type: string;
  published_at: string | null; updated_at: string; reading_minutes: number;
  author: { name: string } | null;
  categories: { id: number; name: string; slug: string }[];
  tags: { id: number; name: string }[];
};
export type Article = Insight & { content_html: string; seo_title: string; seo_description: string; seo_canonical_url: string; seo_og_image_url: string };
export type InsightList = { items: Insight[]; total: number; page: number; pageSize: number };
export function insightsApiBase(configured: string | undefined, requestUrl: string) {
  const host = new URL(requestUrl).hostname;
  return (host === 'localhost' || host === '127.0.0.1' ? 'http://localhost:8787' : configured || '').replace(/\/$/, '');
}
async function read<T>(base: string, path: string): Promise<T> {
  if (!base) throw new Response('Insights are temporarily unavailable.', { status: 503 });
  let response: Response;
  try { response = await fetch(`${base}/api/v1/posts${path}`, { headers: { Accept: 'application/json' }, cache: 'no-store' }); }
  catch { throw new Response('Insights are temporarily unavailable. Please try again.', { status: 503 }); }
  if (response.status === 404) throw new Response('Insight not found.', { status: 404 });
  if (!response.ok) throw new Response('Insights are temporarily unavailable. Please try again.', { status: 503 });
  return response.json() as Promise<T>;
}
export function isPublishedInsight(post: Insight) {
  const date = post.published_at ? Date.parse(post.published_at.includes('T') ? post.published_at : `${post.published_at.replace(' ', 'T')}Z`) : NaN;
  return post.post_type === 'blog' && post.status === 'published' && Number.isFinite(date) && date <= Date.now();
}
export function cleanArticleHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'blockquote', 'ul', 'ol', 'li', 'pre', 'code', 'hr', 'a', 'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div'],
    allowedAttributes: { a: ['href', 'title'], img: ['src', 'alt', 'title', 'width', 'height'], ol: ['start'], '*': ['style'] },
    allowedStyles: { '*': { 'text-align': [/^(left|right|center|justify)$/] } },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
  });
}
export async function getInsights(base: string, page = 1, pageSize = 12, search = ''): Promise<InsightList> {
  const query = new URLSearchParams({ post_type: 'blog', page: String(page), pageSize: String(pageSize) });
  if (search.trim()) query.set('search', search.trim());
  const result = await read<InsightList>(base, `?${query}`);
  return { ...result, items: result.items.filter(isPublishedInsight).map(post => ({ ...post, author: post.author ? { name: post.author.name } : null })) };
}
export async function getInsight(base: string, slug: string): Promise<Article> {
  const post = await read<Article>(base, `/${encodeURIComponent(slug)}`);
  if (!isPublishedInsight(post)) throw new Response('Insight not found.', { status: 404 });
  return { ...post, author: post.author ? { name: post.author.name } : null, content_html: cleanArticleHtml(post.content_html) };
}
export function articlePage(post: Article): Page {
  return { slug: `insights/${post.slug}`, title: post.title, description: post.excerpt, status: 'published', blocks: [], article: { author: post.author?.name, publishedAt: post.published_at, modifiedAt: post.updated_at }, seo_title: post.seo_title, seo_description: post.seo_description, canonical_url: post.seo_canonical_url, og_image_url: post.seo_og_image_url || post.featured_image_url };
}
export async function insightSitemapPages(base: string) {
  const first = await getInsights(base, 1, 100);
  const posts = [...first.items];
  for (let page = 2; page <= Math.ceil(first.total / first.pageSize); page++) posts.push(...(await getInsights(base, page, 100)).items);
  return posts.map(post => ({ slug: `insights/${post.slug}`, updated_at: post.updated_at }));
}
