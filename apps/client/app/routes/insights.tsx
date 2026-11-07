import { Form, Link } from 'react-router';
import { InsightCard, PageHero } from '~/components/page-blocks';
import { getContentStore } from '~/lib/content.server';
import { getInsights, insightsApiBase, insightsApiFetch } from '~/lib/insights.server';
import { pageMeta } from '~/lib/metadata';
import type { Route } from './+types/insights';
export async function loader({ request, context }: Route.LoaderArgs) {
  const params = new URL(request.url).searchParams;
  const requested = params.get('page') || '1';
  const search = params.get('search') || '';
  if (!/^[1-9]\d*$/.test(requested) || !Number.isSafeInteger(Number(requested))) throw new Response('Page not found', { status: 404 });
  const env = context.cloudflare.env;
  const apiFetch = insightsApiFetch(request.url, env.CONTENT_API);
  const page = await getContentStore(env.CONTENT_API_URL, request.url).getPage('insights');
  let posts = { items: [], total: 0, page: Number(requested), pageSize: 12 } as Awaited<ReturnType<typeof getInsights>>;
  try {
    posts = await getInsights(insightsApiBase(env.CONTENT_API_URL, request.url), Number(requested), 12, search, apiFetch);
  } catch {
    // Keep the Insights page available when the optional posts feed is unavailable.
  }
  if (Number(requested) > Math.max(1, Math.ceil(posts.total / posts.pageSize))) throw new Response('Page not found', { status: 404 });
  return { page, posts, siteUrl: new URL(request.url).origin, search };
}
export const meta: Route.MetaFunction = ({ data }) => {
  if (!data) return pageMeta(null);
  const page = data.page ?? { slug: 'insights', title: 'Insights | Einao Solutions', description: 'Practical perspectives on technology, operations and change.', status: 'published' as const, blocks: [] };
  const tags = pageMeta(page, data?.siteUrl);
  if (data && data.posts.page > 1) return tags.map(tag => 'rel' in tag && tag.rel === 'canonical' ? { ...tag, href: `${data.siteUrl}/insights/?page=${data.posts.page}` } : tag);
  return tags;
};
export default function Insights({ loaderData: { page, posts, search } }: Route.ComponentProps) {
  const hero = page?.blocks.find(block => block.block_type === 'hero')?.config;
  const totalPages = Math.ceil(posts.total / posts.pageSize);
  return (
    <div className="insights-page">
      {/* ── Hero — PageHero with search bar replacing CTAs ── */}
      <PageHero
        eyebrow="01 / Insights"
        title={hero?.title || 'Latest insights and practical perspectives'}
        pageLabel="Insights"
        metaLines={['Technology, operations, and change', 'Einao Solutions']}
        bgImage="/assets/images/about hero/DEinao ata Center Team Troubleshooting Together (1).png"
        typewriterWords={['Technology.', 'Operations.', 'Automation.', 'Delivery.']}
        hideCtas
      >
        {/* Search bar — replaces the default CTA buttons */}
        <Form method="get" action="/insights/" className="insights-search-form" role="search">
          <label htmlFor="insights-search" className="sr-only">Search insights</label>
          <input
            id="insights-search"
            name="search"
            type="search"
            defaultValue={search}
            placeholder="Search insights…"
            className="insights-search-input"
            autoComplete="off"
          />
          <button type="submit" className="insights-search-btn" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </Form>
      </PageHero>

      <section className="section insights-news-section">
        <div className="container">
          {posts.items.length
            ? <div className="insight-news-grid">{posts.items.map((post, index) => <InsightCard key={post.id} index={index} author={post.author?.name || 'Einao'} item={{ title: post.title, body: post.excerpt, image: post.featured_image_url, label: post.categories.map(category => category.name).join(' / '), link: { label: `Read ${post.title}`, href: `/insights/${post.slug}/` } }} />)}</div>
            : <p className="insights-empty">No insights have been published yet. Please check back soon.</p>}
          {totalPages > 1 && (
            <nav className="insights-pagination" aria-label="Insights pages">
              {posts.page > 1 && <Link className="text-link" to={`/insights/?page=${posts.page - 1}`}>Previous</Link>}
              <span>Page {posts.page} of {totalPages}</span>
              {posts.page < totalPages && <Link className="text-link" to={`/insights/?page=${posts.page + 1}`}>Next</Link>}
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}
