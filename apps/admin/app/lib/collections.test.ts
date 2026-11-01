import { beforeEach, describe, expect, it, vi } from 'vitest'
const mock = vi.hoisted(() => ({ fetch: vi.fn() }))
vi.mock('./api', () => ({ serverBaseUrl: 'http://api.test', serverHeaders: {}, serverFetch: mock.fetch }))
vi.mock('./posts', () => ({ getTags: async () => [{ id: 7, name: 'Digital services' }] }))
import { industryKey, loadCollection, saveCollection } from './collections'
const config = { title: 'Solutions', items: [{ title: 'PayX', body: 'Original', image: '/original.png', link: { label: 'Explore', href: '/solutions/payx/' }, custom: 'preserve' }] }
let saved: any
beforeEach(() => {
  saved = undefined
  mock.fetch.mockReset().mockImplementation(async (url: string, init?: RequestInit) => {
    if (init?.method === 'PATCH') { saved = JSON.parse(String(init.body)); return Response.json(saved) }
    if (url.endsWith('/pages')) return Response.json([{ slug: 'solutions/payx', title: 'PayX', status: 'published' }])
    if (url.endsWith('/pages/solutions')) return Response.json({ slug: 'solutions', blocks: [{ id: 1, block_type: 'solutions', config, visible: true }] })
    return Response.json({ slug: 'solutions/payx', title: 'PayX', blocks: [{ id: 2, block_type: 'hero', config: { title: 'PayX detail' } }] })
  })
})
function request(item: string, snapshot = JSON.stringify(config)) {
  const form = new FormData()
  for (const [key, value] of Object.entries({ intent: 'item', blockId: '1', snapshot, title: 'Updated PayX', body: 'Updated', label: 'Payments', image: '/new.png', href: '/solutions/payx/', linkLabel: 'Explore PayX' })) form.set(key, value)
  return new Request(`http://admin.test/solutions?item=${item}`, { method: 'POST', body: form })
}
describe('website collections', () => {
  it('opens the list without selecting the first item', async () => {
    const data = await loadCollection('solutions', new Request('http://admin.test/solutions'))
    expect(data.selected).toBeNull()
    expect(data.detail).toBeNull()
    expect(data.items).toHaveLength(1)
  })
  it('loads the linked detail page for editing', async () => {
    const data = await loadCollection('solutions', new Request('http://admin.test/solutions?item=0'))
    expect(data.detail?.blocks[0].config.title).toBe('PayX detail')
  })
  it('saves images and links while preserving unedited item and section fields', async () => {
    expect(await saveCollection('solutions', request('0'))).toEqual({ ok: true })
    expect(saved.config.title).toBe('Solutions')
    expect(saved.config.items[0]).toMatchObject({ image: '/new.png', custom: 'preserve', link: { href: '/solutions/payx/', label: 'Explore PayX' } })
  })
  it('adds once and redirects to the created item', async () => {
    const result = await saveCollection('solutions', request('new'))
    expect(result).toBeInstanceOf(Response)
    expect((result as Response).headers.get('Location')).toBe('/solutions?item=1')
    expect(saved.config.items).toHaveLength(2)
  })
  it('rejects stale forms without overwriting content', async () => {
    expect(await saveCollection('solutions', request('0', '{}'))).toMatchObject({ ok: false })
    expect(saved).toBeUndefined()
  })
  it('rejects invalid selections', async () => {
    await expect(loadCollection('solutions', new Request('http://admin.test/solutions?item=-1'))).rejects.toMatchObject({ status: 404 })
  })
})

describe('work categories and tags', () => {
  const workConfig = { title: 'Work', items: [{ title: 'IPO Nigeria', industry_key: '/industries/government/', tag_ids: [7] }] }
  const industryConfig = { title: 'Industries', items: [{ title: 'Government & Public Institutions', link: { href: '/industries/government/' } }] }
  beforeEach(() => {
    mock.fetch.mockImplementation(async (url: string, init?: RequestInit) => {
      if (init?.method === 'POST') { saved = JSON.parse(String(init.body)); return Response.json({ index: 1, slug: 'work/new-work' }, { status: 201 }) }
      if (init?.method === 'PATCH') { saved = JSON.parse(String(init.body)); return Response.json(saved) }
      if (url.endsWith('/pages')) return Response.json([])
      if (url.endsWith('/pages/industries')) return Response.json({ blocks: [{ id: 3, block_type: 'industries', config: industryConfig }] })
      return Response.json({ blocks: [{ id: 1, block_type: 'proof', config: workConfig }] })
    })
  })
  function workRequest(category: string, tags = 'Digital services') {
    const form = new FormData()
    for (const [key, value] of Object.entries({ intent: 'item', blockId: '1', snapshot: JSON.stringify(workConfig), title: 'New work', industry_key: category, tags })) form.set(key, value)
    return new Request('http://admin.test/work?item=new', { method: 'POST', body: form })
  }
  it('loads category choices from the actual industries content', async () => {
    const data = await loadCollection('work', new Request('http://admin.test/work?item=new'))
    expect(data.settings.title).toBe('Work')
    expect(data.industries[0].title).toBe('Government & Public Institutions')
    expect(data.tags).toEqual([{ id: 7, name: 'Digital services' }])
  })
  it('persists the selected industry and tag IDs on a new work entry', async () => {
    const result = await saveCollection('work', workRequest('/industries/government/'))
    expect((result as Response).headers.get('Location')).toBe('/work?item=1')
    expect(saved).toMatchObject({ blockId: 1, title: 'New work', industry_key: '/industries/government/', tag_ids: [7] })
    expect(mock.fetch).toHaveBeenCalledWith('http://api.test/api/v1/admin/content/work', expect.objectContaining({ method: 'POST' }))
  })
  it('returns the API conflict message and keeps the form instead of redirecting', async () => {
    const handler = mock.fetch.getMockImplementation()!
    mock.fetch.mockImplementation(async (url: string, init?: RequestInit) => init?.method === 'POST' ? Response.json({ error: 'That page URL already exists.' }, { status: 409 }) : handler(url, init))
    expect(await saveCollection('work', workRequest('/industries/government/'))).toEqual({ ok: false, error: 'That page URL already exists.' })
  })
  it('rejects a missing or unknown industry', async () => {
    for (const value of ['', 'unknown']) expect(await saveCollection('work', workRequest(value))).toMatchObject({ ok: false })
    expect(saved).toBeUndefined()
  })
  it('rejects tags that do not exist', async () => {
    expect(await saveCollection('work', workRequest('/industries/government/', 'Unknown'))).toMatchObject({ ok: false })
    expect(saved).toBeUndefined()
  })
  it('keeps an existing industry key when its title and link are edited', async () => {
    const form = new FormData()
    for (const [key, value] of Object.entries({ intent: 'item', blockId: '3', snapshot: JSON.stringify(industryConfig), title: 'Public sector', href: '/industries/public-sector/' })) form.set(key, value)
    expect(await saveCollection('industries', new Request('http://admin.test/industries?item=0', { method: 'POST', body: form }))).toEqual({ ok: true })
    expect(industryKey(saved.config.items[0])).toBe('/industries/government/')
  })
})
