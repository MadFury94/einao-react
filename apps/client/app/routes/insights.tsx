import { Link } from 'react-router';
import { InsightCard } from '~/components/page-blocks';
import { AnimatedTitle } from '~/components/primitives';
import { getContentStore } from '~/lib/content.server';
import { getInsights, insightsApiBase } from '~/lib/insights.server';
import { pageMeta } from '~/lib/metadata';
import type { Route } from './+types/insights';
export async function loader({ request, context }: Route.LoaderArgs) {
  const params = new URL(request.url).searchParams;
  const requested = params.get('page') || '1';
  const search = params.get('search') || '';
  if (!/^[1-9]\d*$/.test(requested) || !Number.isSafeInteger(Number(requested))) throw new Response('Page not found', { status: 404 });
  const env = context.cloudflare.env;
  const page = await getContentStore(env.CONTENT_API_URL, request.url).getPage('insights');
  let posts = { items: [], total: 0, page: Number(requested), pageSize: 12 } as Awaited<ReturnType<typeof getInsights>>;
  try {
    posts = await getInsights(insightsApiBase(env.CONTENT_API_URL, request.url), Number(requested), 12, search);
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
  const grid = page?.blocks.find(block => block.block_type === 'insights')?.config;
  const totalPages = Math.ceil(posts.total / posts.pageSize);
  return (
    <div className="insights-page">
      {/* ── Hero — shared Work-breadcrumb style ── */}
      <section className="page-hero-shared">
        <div className="container page-hero-shared-inner">
          <p className="eyebrow page-hero-shared-eyebrow">Insights</p>
          <div className="page-hero-shared-title">
            <AnimatedTitle text={hero?.title || 'Better systems begin with better questions.'} />
          </div>
          <div className="page-hero-shared-bottom">
            <div className="page-hero-shared-meta">
              <span>Technology, operations, and change</span>
              <span>Einao Solutions</span>
            </div>
            <span className="page-hero-shared-label" aria-hidden="true">Insights</span>
          </div>
        </div>
      </section>

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
