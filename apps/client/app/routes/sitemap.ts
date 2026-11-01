import { insightSitemapPages, insightsApiBase } from "~/lib/insights.server";
import { getContentStore } from "~/lib/content.server";
import type { Route } from "./+types/sitemap";
export async function loader({ request, context }: Route.LoaderArgs) {
	const pages =
		String(context.cloudflare.env.SITE_INDEXABLE) === "true"
			? await getContentStore(String(context.cloudflare.env.CONTENT_API_URL ?? ""), request.url).listPages()
			: [];
	const articles = String(context.cloudflare.env.SITE_INDEXABLE) === "true" ? await insightSitemapPages(insightsApiBase(context.cloudflare.env.CONTENT_API_URL, request.url)) : [];
    const entries = [...pages.filter(page => !page.slug.startsWith("insights/")), ...articles];
    const origin = new URL(request.url).origin;
	const escape = (value: string) =>
		value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map((p) => `<url><loc>${escape(origin + (p.slug === "home" ? "/" : `/${p.slug}/`))}</loc><changefreq>monthly</changefreq><priority>${p.slug === "home" ? "1.0" : "0.7"}</priority></url>`).join("")}</urlset>`,
		{ headers: { "Content-Type": "application/xml; charset=utf-8" } },
	);
}

