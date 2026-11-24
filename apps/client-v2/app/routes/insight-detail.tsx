import { Link } from "react-router";
import type { Route } from "./+types/insight-detail";
import { blogConnection, getInsight } from "~/lib/insights.server";
import { BlogError } from "~/components/blog/BlogError";
import { seoMeta } from "~/lib/seo";
import postStyles from "~/components/blog/BlogPost.module.css";

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const { base, apiFetch } = blogConnection(request, context.cloudflare.env);
  return { post: await getInsight(base, params.slug, apiFetch), origin: new URL(request.url).origin };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [{ title: 'Insight unavailable | Einao Solutions' }, { name: 'robots', content: 'noindex' }];
  const { post, origin } = data;
  return seoMeta({ title: post.seo_title || `${post.title} | Einao Insights`, description: post.seo_description || post.excerpt, path: `/insights/${post.slug}/`, image: post.seo_og_image_url || post.featured_image_url || undefined, type: 'article', origin, canonicalUrl: post.seo_canonical_url || undefined });
}

export default function InsightDetail({ loaderData: { post } }: Route.ComponentProps) {
  const category = post.categories.map(item => item.name).join(' / ') || 'Insights';
  return (
    <main className={postStyles.page}>
      {/* Featured image — full width, tall */}
      {post.featured_image_url && (
        <div className={postStyles.cover}>
          <img src={post.featured_image_url} alt={post.title} />
        </div>
      )}

      <div className={postStyles.container}>
        {/* Breadcrumb */}
        <nav className={postStyles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/insights/">Insights</Link>
          <span aria-hidden="true">/</span>
          <span>{category}</span>
        </nav>

        {/* Title */}
        <h1 className={postStyles.title}>{post.title}</h1>

        {/* Metadata row */}
        <div className={postStyles.meta}>
          <span className={postStyles.category}>{category}</span>
          <span className={postStyles.metaDot} aria-hidden="true" />
          <span>{post.author?.name || 'Einao'}</span>
          <span className={postStyles.metaDot} aria-hidden="true" />
          <span>{post.reading_minutes} min read</span>
          {post.published_at && (
            <>
              <span className={postStyles.metaDot} aria-hidden="true" />
              <time dateTime={post.published_at.replace(' ', 'T')}>
                {new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </time>
            </>
          )}
        </div>

        {/* Excerpt / standfirst */}
        {post.excerpt && <p className={postStyles.excerpt}>{post.excerpt}</p>}

        {/* Body */}
        <div className={postStyles.body} dangerouslySetInnerHTML={{ __html: post.content_html }} />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className={postStyles.tags}>
            {post.tags.map(tag => (
              <span key={tag.name} className={postStyles.tag}>{tag.name}</span>
            ))}
          </div>
        )}

        {/* Back link */}
        <Link className={postStyles.back} to="/insights/">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          Back to insights
        </Link>
      </div>
    </main>
  );
}

export const ErrorBoundary = BlogError;
