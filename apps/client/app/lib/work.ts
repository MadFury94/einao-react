import type { ContentItem, ContentStore, Page, SiteConfig } from '@einao/content';
export type WorkEntry = ContentItem & { slug?: string; year?: string; industry_key?: string };
export async function getWorkCollection(store: ContentStore) {
  const [page, pages, industries] = await Promise.all([store.getPage('work'), store.listPages(), store.getPage('industries')]);
  const published = new Map(pages.filter(p => p.status === 'published' && p.slug.startsWith('work/')).map(p => [p.slug, p]));
  const proof = page?.blocks.find(block => block.block_type === 'proof')?.config;
  const categories = industries?.blocks.find(block => block.block_type === 'industries')?.config.items ?? [];
  const entries: WorkEntry[] = [];
  for (const [index, item] of (proof?.items ?? []).entries()) {
    const href = item.link?.href || (index === 0 ? proof?.cta?.href : '') || '';
    const slug = href.replace(/^\/+|\/+$/g, '');
    if (!href || (href.startsWith('/work/') && !published.has(slug))) continue;
    const category = categories.find(category => ((category as ContentItem & { industry_id?: string }).industry_id || category.link?.href || category.title.trim().toLowerCase()) === (item as WorkEntry).industry_key);
    entries.push({ ...item, label: category?.title || item.label, slug: published.has(slug) ? slug : undefined, link: { label: item.link?.label || 'Read the case study', href } });
  }
  for (const [slug, detail] of published) {
    if (!entries.some(item => item.slug === slug)) entries.push({ title: detail.title.split(' | ')[0], body: detail.description, slug, link: { label: 'Read the case study', href: `/${slug}/` } });
  }
  return { page, entries };
}
export function workNavigation(site: SiteConfig, entries: WorkEntry[]): SiteConfig {
  return { ...site, navigation: site.navigation.map(item => item.href.replace(/\/$/, '') === '/work' ? { ...item, children: entries.filter(entry => entry.slug).map(entry => ({ label: entry.title, href: entry.link!.href })) } : item) };
}
export function workNeighbours(entries: WorkEntry[], slug: string) {
  const published = entries.filter(entry => entry.slug);
  const index = published.findIndex(entry => entry.slug === slug);
  return { previous: index > 0 ? published[index - 1] : null, next: index >= 0 && index < published.length - 1 ? published[index + 1] : null };
}
