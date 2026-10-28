import { getContentStore } from "~/lib/content.server";
import type { Route } from "./+types/sitemap";
export async function loader({ request, context }: Route.LoaderArgs) {
	const pages =
		String(context.cloudflare.env.SITE_INDEXABLE) === "true"
			? await getContentStore().listPages()
			: [];
	const origin = new URL(request.url).origin;
	const escape = (value: string) =>
		value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map((p) => `<url><loc>${escape(origin + (p.slug === "home" ? "/" : `/${p.slug}/`))}</loc></url>`).join("")}</urlset>`,
		{ headers: { "Content-Type": "application/xml; charset=utf-8" } },
	);
}
