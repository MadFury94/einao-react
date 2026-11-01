import { getTags } from './posts'
import { redirect } from 'react-router'
import { serverBaseUrl, serverFetch, serverHeaders } from './api'

export type Item = { industry_id?: string; industry_key?: string; tag_ids?: number[]; title?: string; body?: string; label?: string; image?: string; link?: { label?: string; href?: string }; [key: string]: unknown }
export type Config = { client?: string; services?: string; platform?: string; projectDate?: string; overviewImage?: string; overviewImageAlt?: string; galleryLeft?: string; galleryRight?: string; galleryLeftAlt?: string; galleryRightAlt?: string; title?: string; eyebrow?: string; body?: string[]; image?: string; imageAlt?: string; video?: string; accent?: string; items?: Item[]; cta?: { label?: string; href?: string }; secondaryCta?: { label?: string; href?: string }; [key: string]: unknown }
export type Block = { id: number; block_type: string; config: Config; visible: boolean }
export type Page = { slug: string; title: string; status: string; blocks: Block[] }
export const collections = {
  solutions: { title: 'Solutions', singular: 'solution', page: 'solutions', type: 'solutions' },
  capabilities: { title: 'Capabilities', singular: 'capability', page: 'capabilities', type: 'services' },
  work: { title: 'Work', singular: 'work entry', page: 'work', type: 'proof' },
  industries: { title: 'Industries (Categories)', singular: 'industry', page: 'industries', type: 'industries' },
} as const
export type Collection = keyof typeof collections
async function read<T>(path: string): Promise<T> {
  const response = await serverFetch(`${serverBaseUrl}/api/v1/admin/content/${path}`, { headers: serverHeaders, credentials: 'include' })
  if (!response.ok) throw new Response('Could not load website content. Please retry.', { status: response.status })
  return response.json() as Promise<T>
}
export function industryKey(item: Item) { return item.industry_id || item.link?.href || String(item.title || '').trim().toLowerCase() }
export async function loadCollection(key: Collection, request: Request) {
  const settings = collections[key]
  const [page, pages] = await Promise.all([read<Page>(`pages/${settings.page}`), read<Page[]>('pages')])
  const block = page.blocks.find(b => b.block_type === settings.type && Array.isArray(b.config.items))
  if (!block) throw new Response('The website collection has not been configured.', { status: 404 })
  const items = block.config.items ?? []
  const details = pages.filter(p => p.slug.startsWith(`${settings.page}/`))
  const params = new URL(request.url).searchParams
  const selected = params.get('item')
  if (selected !== null && selected !== 'new' && (!/^\d+$/.test(selected) || !items[Number(selected)])) throw new Response('Item not found', { status: 404 })
  const item = selected !== null && selected !== 'new' ? items[Number(selected)] : null
  const href = item?.link?.href || (key === 'work' && selected === '0' ? block.config.cta?.href : '')
  const slug = params.get('page') || String(href || '').replace(/^\/+|\/+$/g, '')
  if (params.has('page') && !details.some(p => p.slug === slug)) throw new Response('Page not found', { status: 404 })
  const detail = details.some(p => p.slug === slug) ? await read<Page>(`pages/${encodeURIComponent(slug)}`) : null
  const [industryPage, tags] = key === 'work'
    ? await Promise.all([read<Page>('pages/industries'), getTags()])
    : [null, []]
  const industries = industryPage?.blocks.find(b => b.block_type === 'industries')?.config.items ?? []
  return { settings, key, block, items, details, detail, selected, industries, tags }
}
export function validLink(href: string) { return !href || /^(\/(?!\/)|https?:\/\/|mailto:|tel:|#)/i.test(href) }
export async function saveCollection(key: Collection, request: Request) {
  try {
    const form = await request.formData()
    const data = await loadCollection(key, request)
    const block = [data.block, ...(data.detail?.blocks ?? [])].find(b => b.id === Number(form.get('blockId')))
    if (!block) return { ok: false as const, error: 'This section does not belong to the selected item.' }
    if (String(form.get('snapshot')) !== JSON.stringify(block.config)) return { ok: false as const, error: 'This content changed since you opened it. Reload before saving.' }
    let config = block.config
    if (form.get('intent') === 'item') {
      const title = String(form.get('title') || '').trim()
      if (!title) return { ok: false as const, error: 'A title is required.' }
      const index = data.selected === 'new' ? -1 : Number(data.selected)
      if (data.selected === null || block.id !== data.block.id) return { ok: false as const, error: 'Select an item first.' }
      const items = [...data.items]
      const item: Item = { ...(items[index] ?? {}), title, label: String(form.get('label') || ''), body: String(form.get('body') || ''), image: String(form.get('image') || ''), year: String(form.get('year') || '').trim() }
      if (key === 'industries') item.industry_id = index >= 0 ? industryKey(items[index]) : crypto.randomUUID()
      if (key === 'work') {
        const category = String(form.get('industry_key') || '')
        if (!data.industries.some(industry => industryKey(industry) === category)) return { ok: false as const, error: 'Choose an industry category from the list.' }
        const names = [...new Set(String(form.get('tags') || '').split(',').map(tag => tag.trim()).filter(Boolean))]
        const matches = names.map(name => data.tags.find(tag => tag.name === name))
        if (matches.some(tag => !tag)) return { ok: false as const, error: 'A selected tag is no longer available. Reload the editor and select it again.' }
        item.industry_key = category
        item.tag_ids = matches.map(tag => tag!.id)
      }
      if (key === 'work' && index === -1) {
        const response = await serverFetch(`${serverBaseUrl}/api/v1/admin/content/work`, {
          method: 'POST', headers: { ...serverHeaders, 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ blockId: block.id, snapshot: String(form.get('snapshot')), ...item, slug: String(form.get('slug') || '').trim() }),
        })
        const result = await response.json() as { index?: number; error?: string }
        if (!response.ok || result.index === undefined) return { ok: false as const, error: result.error || 'Could not create the case study. Please retry.' }
        return redirect(`/work?item=${result.index}`)
      }
      const href = String(form.get('href') || '').trim()
      const label = String(form.get('linkLabel') || '').trim()
      if (!validLink(href)) return { ok: false as const, error: 'Use a website path or an http, https, mailto or tel link.' }
      if (href) item.link = { ...(item.link ?? {}), label: label || title, href }
      else delete item.link
      if (index === -1) items.push(item)
      else items[index] = item
      config = { ...config, items }
    } else if (form.get('intent') === 'section') {
      config = JSON.parse(String(form.get('config')))
      if (!config || Array.isArray(config) || typeof config !== 'object') return { ok: false as const, error: 'Invalid section content.' }
      const links = [config.cta, config.secondaryCta, ...(config.items ?? []).map(item => item.link)]
      if (links.some(link => link?.href && !validLink(link.href))) return { ok: false as const, error: 'One of the section links is invalid.' }
    } else return { ok: false as const, error: 'Unknown action.' }
    const response = await serverFetch(`${serverBaseUrl}/api/v1/admin/content/blocks/${block.id}`, { method: 'PATCH', headers: { ...serverHeaders, 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ config, ...(key === 'work' && form.get('intent') === 'section' && block.block_type === 'editorial' ? { visible: Boolean(config.body?.some(text => text.trim()) || config.image || config.items?.some(item => item.title?.trim() || item.body?.trim() || item.image)) } : {}) }) })
    if (!response.ok) return { ok: false as const, error: 'Could not save. Your changes are still in the form; please retry.' }
    if (data.selected === 'new') return redirect(`/${key}?item=${data.items.length}`)
    return { ok: true as const }
  } catch {
    return { ok: false as const, error: 'Could not save content. Please check your connection and retry.' }
  }
}

