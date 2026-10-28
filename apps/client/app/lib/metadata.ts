import type { Page } from "@einao/content";
export function pageMeta(page: Page | null | undefined) {
	if (!page)
		return [
			{ title: "Page not found | Einao Solutions" },
			{ name: "robots", content: "noindex" },
		];
	return [
		{ title: page.title },
		{ name: "description", content: page.description },
		{ property: "og:title", content: page.title },
		{ property: "og:description", content: page.description },
		{ property: "og:type", content: "website" },
		{ name: "twitter:card", content: "summary" },
	];
}
