import { Form, Link } from "react-router";
import type { Route } from "./+types/insights";
import { blogConnection, getInsights, getCategories } from "~/lib/insights.server";
import { ReferenceHero } from "~/components/reference-hero/ReferenceHero";
import { BlogError } from "~/components/blog/BlogError";
import styles from "~/components/company-pages/CompanyPages.module.css";
import { seoMeta } from "~/lib/seo";
export async function loader({ request, context }: Route.LoaderArgs) {
  const query = new URL(request.url).searchParams;
  const page = query.get('page') || '1';
  if (!/^[1-9]\d*$/.test(page) || !Number.isSafeInteger(Number(page))) throw new Response('Page not found', { status: 404 });
  const search = query.get('search') || '';
  const category = query.get('category') || '';
  const { base, apiFetch } = blogConnection(request, context.cloudflare.env);
  const [posts, categories] = await Promise.all([getInsights(base, Number(page), 12, search, apiFetch, category), getCategories(base, apiFetch)]);
  if (Number(page) > Math.max(1, Math.ceil(posts.total / posts.pageSize))) throw new Response('Page not found', { status: 404 });
  return { posts, categories, search, category };
}
export function meta({ data }: Route.MetaArgs) { return data ? seoMeta({ title: "Insights | Einao Solutions", description: "Practical perspectives on technology, automation and operations.", path: "/insights/" }) : [{ title: "Insights unavailable | Einao Solutions" }, { name: "robots", content: "noindex" }]; }
export default function Insights({ loaderData: { posts, categories, search, category } }: Route.ComponentProps) {
  const pages = Math.ceil(posts.total / posts.pageSize);
  const href = (page: number, selected = category) => `/insights/?${new URLSearchParams({ page: String(page), search, category: selected })}`;
  return <main className={styles.page}>
    <ReferenceHero label="Insights" title="Better systems begin with better questions." intro="Practical perspectives on the operational decisions behind technology." image="/assets/images/Hands sketching a business workflow.png">
      <Form method="get" className={styles.search} role="search"><input type="hidden" name="category" value={category} /><label><span className={styles.srOnly}>Search insights</span><input key={search} type="search" name="search" defaultValue={search} placeholder="Search insights..." /></label><button type="submit">Search</button></Form>
    </ReferenceHero>
    <section className={styles.insights}><div className={styles.sectionInner}>
      <div className={styles.insightsHeader}><h2>Ideas for making technology more useful.</h2><nav className={styles.filters} aria-label="Insight categories">
        <Link className={!category ? styles.filterActive : styles.filter} to={href(1, '')}>All</Link>
        {categories.map(item => <Link key={item.id} className={category === item.slug ? styles.filterActive : styles.filter} to={href(1, item.slug)}>{item.name}</Link>)}
      </nav></div>
      <div className={styles.insightGrid}>{posts.items.map(post => <article className={styles.insightCard} key={post.id}>
        <Link to={`/insights/${post.slug}/`} className={styles.insightImageLink}><img src={post.featured_image_url || '/assets/seo/einao-social-card.jpg'} alt="" loading="lazy" /></Link>
        <div className={styles.insightBody}><span className={styles.cardLabel}>{post.categories.map(item => item.name).join(' / ')}</span><h3><Link to={`/insights/${post.slug}/`}>{post.title}</Link></h3><p>{post.excerpt}</p><Link className={styles.link} to={`/insights/${post.slug}/`}>Read the post ?</Link></div>
      </article>)}</div>
      {!posts.items.length && <p className={styles.empty}>{search || category ? 'No insights match your filters.' : 'No insights have been published yet. Please check back soon.'}</p>}
      {pages > 1 && <nav className={styles.filters} aria-label="Insights pages">{posts.page > 1 && <Link to={href(posts.page - 1)}>Previous</Link>}<span>Page {posts.page} of {pages}</span>{posts.page < pages && <Link to={href(posts.page + 1)}>Next</Link>}</nav>}
    </div></section>
  </main>;
}
export const ErrorBoundary = BlogError;
