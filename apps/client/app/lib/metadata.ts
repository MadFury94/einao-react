import type { Page } from "@einao/content";

const FALLBACK_ORIGIN = "https://einao-client.einaodevv.workers.dev";
const SOCIAL_IMAGE = "/assets/seo/einao-social-card.jpg";

function pagePath(slug: string) {
	return slug === "home" ? "/" : `/${slug.replace(/^\/+|\/+$/g, "")}/`;
}

// D1 timestamps without offsets represent UTC.
function schemaDate(value?: string | null) {
 if (!value) return undefined;
 const normalized = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(value) ? `${value.replace(" ", "T")}Z` : value;
 const date = new Date(normalized);
 return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}
export function pageMeta(page: Page | null | undefined, requestOrigin = FALLBACK_ORIGIN) {
	if (!page)
		return [
			{ title: "Page not found | Einao Solutions" },
			{ name: "robots", content: "noindex" },
		];
	const origin = requestOrigin.replace(/\/$/, "");
	const title = page.seo_title || page.title;
	const description = page.seo_description || page.description;
	const canonical = page.canonical_url || `${origin}${pagePath(page.slug)}`;
	const image = new URL(page.og_image_url || SOCIAL_IMAGE, origin).href;
	const isInsightArticle = page.slug.startsWith("insights/");
	const structuredData = {
		"@context": "https://schema.org",
		"@type": isInsightArticle ? "Article" : page.slug === "insights" ? "CollectionPage" : "WebPage",
		name: title,
        ...(isInsightArticle ? {
            headline: page.title,
            image,
            mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
            author: page.article?.author && !/^einao(?: solutions)?$/i.test(page.article.author.trim())
                ? { "@type": "Person", name: page.article.author }
                : { "@type": "Organization", name: page.article?.author || "Einao", url: origin },
            datePublished: schemaDate(page.article?.publishedAt),
            dateModified: schemaDate(page.article?.modifiedAt),
        } : {}),
		description,
		url: canonical,
		isPartOf: { "@type": "WebSite", name: "Einao Solutions", url: origin },
		publisher: {
			"@type": "Organization",
			name: "Einao Solutions",
			url: origin,
			logo: `${origin}/favicon.svg`,
		},
	};
	return [
		{ title },
		{ name: "description", content: description },
		{ name: "robots", content: "index, follow" },
		{ name: "theme-color", content: "#0b1710" },
		{ tagName: "link", rel: "canonical", href: canonical },
		{ property: "og:title", content: title },
		{ property: "og:description", content: description },
		{ property: "og:type", content: isInsightArticle ? "article" : "website" },
		{ property: "og:url", content: canonical },
		{ property: "og:image", content: image },
		{ property: "og:image:alt", content: title },
		{ property: "og:site_name", content: "Einao Solutions" },
		{ property: "og:locale", content: "en_GB" },
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },
		{ name: "twitter:image", content: image },
		{ "script:ld+json": structuredData },
	];
}

