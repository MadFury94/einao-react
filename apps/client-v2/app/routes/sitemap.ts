import { createCatalogApi } from "~/lib/catalog.server";
import { blogConnection, getInsights } from "~/lib/insights.server";
import type { Route } from "./+types/sitemap";
const paths=["/","/about/","/industries/","/insights/","/contact/","/industries/government/","/industries/business/","/industries/regulatory-services/"];
export async function loader({request,context}:Route.LoaderArgs){const origin=new URL(request.url).origin;const indexable=String(context.cloudflare.env.SITE_INDEXABLE)==="true";const publishedPaths = [...paths];
if (indexable) {
  const pages = await createCatalogApi(request, context.cloudflare.env).listPages();
  publishedPaths.push(...pages.filter(page => /^(solutions|capabilities|work)(\/|$)/.test(page.slug)).map(page => `/${page.slug}/`));
  const { base, apiFetch } = blogConnection(request, context.cloudflare.env);
  const first = await getInsights(base, 1, 100, '', apiFetch);
  publishedPaths.push(...first.items.map(post => `/insights/${post.slug}/`));
  for (let page = 2; page <= Math.ceil(first.total / first.pageSize); page++) {
    const next = await getInsights(base, page, 100, '', apiFetch);
    publishedPaths.push(...next.items.map(post => `/insights/${post.slug}/`));
  }
}
const escape=(v:string)=>v.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");const body=indexable?`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${publishedPaths.map(path=>`<url><loc>${escape(origin+path)}</loc><changefreq>monthly</changefreq><priority>${path==="/"?"1.0":"0.7"}</priority></url>`).join("")}</urlset>`:`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;return new Response(body,{headers:{"Content-Type":"application/xml; charset=utf-8"}});}
