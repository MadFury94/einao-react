export type Link = { label: string; href: string };
export type ContentItem = {
	title: string;
	body: string;
	link?: Link;
	image?: string;
	label?: string;
};
export type BlockType =
	| "hero"
	| "reality"
	| "approach"
	| "feature"
	| "services"
	| "proof"
	| "solutions"
	| "industries"
	| "cards"
	| "insights"
	| "cta"
	| "editorial"
	| "marquee"
	| "process"
	| "projects";
export type BlockConfig = {
	eyebrow?: string;
	title: string;
	body?: string[];
	items?: ContentItem[];
	cta?: Link;
	secondaryCta?: Link;
	image?: string;
	imageAlt?: string;
	video?: string;
	/** Word in the title to render in the serif-italic accent face (hero). */
	accent?: string;
};
// Same envelope as game-studio/backend/src/page-blocks, with Einao section config.
export type PageBlock = {
	id: number;
	page_slug: string;
	block_type: BlockType;
	position: number;
	config: BlockConfig;
	visible: boolean;
};
export type Page = {
	slug: string;
	title: string;
	description: string;
	status: "published" | "draft";
	blocks: PageBlock[];
};
export type NavItem = Link & { children?: Link[] };
export type SiteConfig = {
	name: string;
	tagline: string;
	logo: string;
	navigation: NavItem[];
	address: string;
	enquiryTypes: string[];
	footer: { title: string; links: Link[] }[];
};
export interface ContentStore {
	getSiteConfig(): Promise<SiteConfig>;
	getPage(slug: string): Promise<Page | null>;
	getPageBlocks(slug: string): Promise<PageBlock[]>;
	listPages(): Promise<Omit<Page, "blocks">[]>;
}
