import type { Route } from "./+types/robots";
export function loader({ request, context }: Route.LoaderArgs) {
	const indexable = String(context.cloudflare.env.SITE_INDEXABLE) === "true";
	return new Response(
		indexable
			? `User-agent: *\nAllow: /\nSitemap: ${new URL(request.url).origin}/sitemap.xml\n`
			: "User-agent: *\nDisallow: /\n",
		{ headers: { "Content-Type": "text/plain; charset=utf-8" } },
	);
}
