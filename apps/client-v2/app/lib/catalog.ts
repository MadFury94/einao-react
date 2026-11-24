import type { ContentItem, Page, PageBlock } from '@einao/content';
export const collectionTypes = { solutions: 'solutions', capabilities: 'services', work: 'proof' } as const;
export type CollectionKey = keyof typeof collectionTypes;
export type PageSummary = Omit<Page, 'blocks'>;
export type CatalogItem = ContentItem & { slug?: string; industry_key?: string; industry_id?: string; tag_ids?: number[] };
export type Collection = { key: CollectionKey; page: Page; entries: CatalogItem[]; block?: PageBlock };
export type Catalog = Record<CollectionKey, Collection | null>;
export function safeHref(value?: string) {
  return value && /^(\/(?!\/)|https?:\/\/|mailto:|tel:|#)/i.test(value) ? value : undefined;
}
export function publishedLink(href: string | undefined, pages: PageSummary[]) {
  const safe = safeHref(href);
  if (!safe) return undefined;
  const slug = safe.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '');
  if (/^(solutions|capabilities|work)(\/|$)/.test(slug) && !pages.some(page => page.slug === slug && page.status === 'published')) return undefined;
  return safe;
}
export function collectionFromPage(key: CollectionKey, page: Page, pages: PageSummary[], industries?: Page | null): Collection {
  const block = page.blocks.find(block => block.visible && block.block_type === collectionTypes[key]);
  if (!block) return { key, page, entries: [] };
  const published = pages.filter(page => page.status === 'published' && page.slug.startsWith(`${key}/`));
  const categories = industries?.blocks.find(block => block.visible && block.block_type === 'industries')?.config.items as CatalogItem[] | undefined;
  const entries: CatalogItem[] = [];
  for (const [index, item] of (block.config.items ?? []).entries()) {
    const original = item.link?.href || (key === 'work' && index === 0 ? block.config.cta?.href : undefined);
    const href = publishedLink(original, pages);
    if (original && !href) continue;
    const slug = href?.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '');
    const category = categories?.find(category => (category.industry_id || category.link?.href || category.title.trim().toLowerCase()) === (item as CatalogItem).industry_key);
    entries.push({ ...item, label: category?.title || item.label, slug: published.some(page => page.slug === slug) ? slug : undefined, link: href ? { label: item.link?.label || item.title, href } : undefined });
  }
  // Standalone published detail pages are editable entries in the admin too.
  for (const detail of published) {
    if (!entries.some(item => item.slug === detail.slug)) entries.push({ title: detail.title.split(' | ')[0], body: detail.description, image: detail.og_image_url || undefined, slug: detail.slug, link: { label: 'Read more', href: `/${detail.slug}/` } });
  }
  return { key, page, entries, block };
}
