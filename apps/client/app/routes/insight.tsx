import { Link } from 'react-router';
import { AnimatedTitle } from '~/components/primitives';
import { articlePage, getInsight, getInsights, insightsApiBase } from '~/lib/insights.server';
import { pageMeta } from '~/lib/metadata';
import type { Route } from './+types/insight';
export async function loader({ request, context, params }: Route.LoaderArgs) {
  const env = context.cloudflare.env;
  const apiFetch = (env as unknown as { CONTENT_API?: { fetch: typeof fetch } }).CONTENT_API?.fetch.bind((env as unknown as { CONTENT_API: { fetch: typeof fetch } }).CONTENT_API) ?? globalThis.fetch;
  const base = insightsApiBase(env.CONTENT_API_URL, request.url);
  const [post, listing] = await Promise.all([getInsight(base, params.slug, apiFetch), getInsights(base, 1, 100, '', apiFetch)]);
  const index = listing.items.findIndex((item) => item.slug === post.slug);
  const categoryCounts = new Map<string, number>();
  const tagNames = new Set<string>();
  for (const item of listing.items) {
    for (const category of item.categories) categoryCounts.set(category.name, (categoryCounts.get(category.name) ?? 0) + 1);
    for (const tag of item.tags) tagNames.add(tag.name);
  }
  return {
    post,
    previous: index >= 0 ? listing.items[index + 1] ?? null : null,
    next: index > 0 ? listing.items[index - 1] ?? null : null,
    recent: listing.items.filter((item) => item.slug !== post.slug).slice(0, 3),
    categories: Array.from(categoryCounts, ([name, count]) => ({ name, count })),
    tags: Array.from(tagNames),
    page: articlePage(post),
    siteUrl: new URL(request.url).origin,
  };
}
export const meta: Route.MetaFunction = ({ data }) => pageMeta(data?.page, data?.siteUrl);
export default function Insight({ loaderData: { post, previous, next, recent, categories, tags } }: Route.ComponentProps) {
  return <article className="insight-article"><header className="insight-article-header">{post.featured_image_url && <div className="insight-article-hero-media"><img src={post.featured_image_url} alt="" width="1600" height="900" /></div>}<div className="container insight-article-header-inner"><Link className="text-link" to="/insights/">Back to Insights</Link><p className="eyebrow">{post.categories.map(category => category.name).join(' / ') || 'Insights'}</p><AnimatedTitle text={post.title} />{post.subtitle && <p className="insights-page-intro">{post.subtitle}</p>}<div className="insight-article-meta"><span>By {post.author?.name || 'Einao'}</span>{post.published_at && <time dateTime={post.published_at}>{new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</time>}{post.reading_minutes > 0 && <span>{post.reading_minutes} min read</span>}</div></div></header><div className="container insight-article-layout"><main className="insight-article-content"><div className="insight-prose" dangerouslySetInnerHTML={{ __html: post.content_html }} />{post.tags.length > 0 && <ul className="insight-tags" aria-label="Article tags">{post.tags.map(tag => <li key={tag.id}>{tag.name}</li>)}</ul>}<nav className="insight-article-nav" aria-label="Post navigation">{previous ? <Link className="insight-article-nav-link insight-article-nav-prev" to={`/insights/${previous.slug}/`}><span>Previous post</span><strong>{previous.title}</strong></Link> : <span />}{next ? <Link className="insight-article-nav-link insight-article-nav-next" to={`/insights/${next.slug}/`}><span>Next post</span><strong>{next.title}</strong></Link> : <span />}</nav></main><aside className="insight-sidebar"><section className="insight-sidebar-widget"><h2>Search</h2><form action="/insights/" method="get" className="insight-search"><input type="search" name="q" placeholder="Search insights" aria-label="Search insights" /><button type="submit" aria-label="Search">↗</button></form></section><section className="insight-sidebar-widget"><h2>All categories</h2><ul className="insight-category-list">{categories.map(category => <li key={category.name}><Link to="/insights/">{category.name}</Link><span>({category.count})</span></li>)}</ul></section><section className="insight-sidebar-widget"><h2>Recent posts</h2><div className="insight-recent-posts">{recent.map(item => <Link key={item.id} to={`/insights/${item.slug}/`} className="insight-recent-post"><span>{item.categories[0]?.name || 'Insights'}</span><strong>{item.title}</strong>{item.published_at && <time dateTime={item.published_at}>{new Date(item.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</time>}</Link>)}</div></section><section className="insight-sidebar-widget"><h2>Popular tags</h2><div className="insight-sidebar-tags">{tags.map(tag => <Link key={tag} to="/insights/">{tag}</Link>)}</div></section></aside></div></article>;
}
