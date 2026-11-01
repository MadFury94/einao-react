import type { LeadershipProfile } from "./leadership";
export type Link = { label: string; href: string };
export type ContentItem = {
	year?: string;
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
  client?: string; services?: string; platform?: string; projectDate?: string;
  overviewImage?: string; overviewImageAlt?: string; galleryLeft?: string; galleryRight?: string;
  galleryLeftAlt?: string; galleryRightAlt?: string;

  leadership?: LeadershipProfile;
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
	seo_title?: string;
	seo_description?: string;
	canonical_url?: string;
	og_image_url?: string;
	article?: { author?: string; publishedAt?: string | null; modifiedAt?: string };
	blocks: PageBlock[];
};
export type NavItem = Link & { children?: Link[] };
export type SiteConfig = {
	name: string;
	tagline: string;
	logo: string;
	navigation: NavItem[];
	address: string;
	locations?: string[];
	enquiryTypes: string[];
	footer: { title: string; links: Link[] }[];
};
export interface ContentStore {
	getSiteConfig(): Promise<SiteConfig>;
	getPage(slug: string): Promise<Page | null>;
	getPageBlocks(slug: string): Promise<PageBlock[]>;
	listPages(): Promise<Omit<Page, "blocks">[]>;
}

