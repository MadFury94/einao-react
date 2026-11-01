import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getWorkCollection, workNavigation, workNeighbours } from './work.ts';
import type { ContentStore, Page, SiteConfig } from '@einao/content';
const detail = (slug: string, title: string, status: 'draft' | 'published' = 'published') => ({ slug, title, status, description: '', blocks: [] });
const pages = [detail('work/first','First'),detail('work/new','New'),detail('work/hidden','Hidden','draft')];
const work: Page = { ...detail('work','Work'), blocks: [{ id: 1, page_slug: 'work', block_type: 'proof', position: 0, visible: true, config: { title: 'Work', cta: { label: 'Read', href: '/work/first/' }, items: [{ title: 'First', body: '' },{title: 'New',body:'',link:{label:'Read',href:'/work/new/'}},{title:'Hidden',body:'',link:{label:'Read',href:'/work/hidden/'}}] } }] };
const store = { getPage: async (slug: string) => slug === 'work' ? work : null, listPages: async () => pages } as unknown as ContentStore;
test('published Work entries populate the menu and draft entries stay out', async () => {
 const { entries } = await getWorkCollection(store);
 assert.deepEqual(entries.map(item => item.slug), ['work/first','work/new']);
 const site = { navigation: [{label:'Work',href:'/work/',children:[{label:'Old',href:'/old/'}]},{label:'About',href:'/about/'}] } as SiteConfig;
 const result = workNavigation(site, entries);
 assert.deepEqual(result.navigation[0].children?.map(item => item.href), ['/work/first/','/work/new/']);
 assert.equal(result.navigation[1], site.navigation[1]);
 assert.equal(site.navigation[0].children?.[0].label, 'Old');
});
test('previous/next links follow the same published order without self-links', async () => {
 const { entries } = await getWorkCollection(store);
 assert.equal(workNeighbours(entries,'work/first').previous,null);
 assert.equal(workNeighbours(entries,'work/first').next?.slug,'work/new');
 assert.equal(workNeighbours(entries,'work/new').previous?.slug,'work/first');
 assert.equal(workNeighbours(entries,'work/new').next,null);
 assert.deepEqual(workNeighbours(entries,'missing'),{previous:null,next:null});
});
