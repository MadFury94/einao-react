import {
	index,
	layout,
	route,
	type RouteConfig,
} from "@react-router/dev/routes";
export default [
	layout("layouts/main.tsx", [
		index("routes/home.tsx"),
		route("contact", "routes/contact.tsx"),
        route("insights", "routes/insights.tsx"),
        route("insights/:slug", "routes/insight.tsx"),
        route("blog/:slug?", "routes/blog-redirect.tsx"),
		route("*", "routes/page.tsx"),
	]),
	route("robots.txt", "routes/robots.ts"),
	route("sitemap.xml", "routes/sitemap.ts"),
] satisfies RouteConfig;

