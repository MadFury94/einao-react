import { pages, site } from "./seed.ts";
import type { ContentStore, Page, SiteConfig } from "./types.ts";

/** File-backed read store. Replace this adapter with request-scoped API access later.
 * Cloning prevents one SSR request or editor preview from mutating another's content.
 */
export function createContentStore(
	sourcePages: Page[] = pages,
	sourceSite: SiteConfig = site,
): ContentStore {
	const snapshot = structuredClone(sourcePages);
	const siteSnapshot = structuredClone(sourceSite);
	const normalize = (slug: string) => slug.replace(/^\/+|\/+$/g, "") || "home";
	const find = (slug: string) =>
		snapshot.find(
			(p) => p.slug === normalize(slug) && p.status === "published",
		);
	return {
		async getSiteConfig() {
			return structuredClone(siteSnapshot);
		},
		async getPage(slug) {
			const page = find(slug);
			return page
				? { ...structuredClone(page), blocks: await this.getPageBlocks(slug) }
				: null;
		},
		async getPageBlocks(slug) {
			return structuredClone(
				(find(slug)?.blocks ?? [])
					.filter((b) => b.visible)
					.sort((a, b) => a.position - b.position),
			);
		},
		async listPages() {
			return snapshot
				.filter((p) => p.status === "published")
				.map(({ blocks, ...page }) => structuredClone(page));
		},
	};
}
