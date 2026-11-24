import type { Page } from '@einao/content';
import { seoMeta } from './seo';
export function catalogMeta(data?: { page: Page; origin: string } | { collection: { page: Page }; origin: string }) {
  if (!data) return [{ title: 'Content unavailable | Einao Solutions' }, { name: 'robots', content: 'noindex' }];
  const page = 'page' in data ? data.page : data.collection.page;
  const hero = page.blocks.find(block => block.block_type === 'hero')?.config;
  return seoMeta({ title: page.seo_title || page.title, description: page.seo_description || page.description, path: `/${page.slug}/`, origin: data.origin, canonicalUrl: page.canonical_url || undefined, image: page.og_image_url || hero?.image || undefined });
}
