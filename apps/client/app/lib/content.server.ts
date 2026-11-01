import { createContentStore } from "@einao/content";
import type { ContentStore, Page, SiteConfig } from "@einao/content";

const fallbackStore = createContentStore();

function apiStore(baseUrl: string): ContentStore {
	const base = baseUrl.replace(/\/$/, "");
	const get = async <T>(path: string): Promise<T> => {
		const response = await fetch(`${base}${path}`, {
			headers: { Accept: "application/json" },
		});
		if (!response.ok) throw new Error(`Content API returned ${response.status}`);
		return (await response.json()) as T;
	};
	return {
		async getSiteConfig() {
			try {
				return await get<SiteConfig>("/api/v1/content/site");
			} catch {
				return fallbackStore.getSiteConfig();
			}
		},
		async getPage(slug) {
			try {
				return await get<Page>(`/api/v1/content/pages/${encodeURIComponent(slug)}`);
			} catch {
				return fallbackStore.getPage(slug);
			}
		},
		async getPageBlocks(slug) {
			const page = await this.getPage(slug);
			return page?.blocks ?? [];
		},
		async listPages() {
			try {
				return await get<Array<Omit<Page, "blocks">>>("/api/v1/content/pages");
			} catch {
				return fallbackStore.listPages();
			}
		},
	};
}

export function getContentStore(apiBaseUrl?: string, requestUrl?: string) {
	const hostname = requestUrl ? new URL(requestUrl).hostname : "";
	const base = hostname === "localhost" || hostname === "127.0.0.1"
		? "http://localhost:8787"
		: apiBaseUrl;
	return base ? apiStore(base) : fallbackStore;
}
