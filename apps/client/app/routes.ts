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
		route("*", "routes/page.tsx"),
	]),
	route("robots.txt", "routes/robots.ts"),
	route("sitemap.xml", "routes/sitemap.ts"),
] satisfies RouteConfig;
