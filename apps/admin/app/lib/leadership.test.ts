import { beforeEach, describe, expect, it, vi } from 'vitest'
const mock = vi.hoisted(() => ({ fetch: vi.fn() }))
vi.mock('./api', () => ({ serverBaseUrl: 'http://api.test', serverHeaders: {}, serverFetch: mock.fetch }))
import { loadLeadership, saveLeadership } from './leadership'
import { leadershipProfile } from '../../../../packages/content/src/leadership'
let config: Record<string, unknown>
beforeEach(() => {
  config = { title: 'About Einao', body: ['Keep this content'], leadership: leadershipProfile() }
  mock.fetch.mockReset().mockImplementation(async (_url: string, init?: RequestInit) => {
    if (init?.method === 'PATCH') { config = JSON.parse(String(init.body)).config; return Response.json({ config }) }
    return Response.json({ blocks: [{ id: 42, block_type: 'hero', config }] })
  })
})
function request(snapshot = JSON.stringify(leadershipProfile())) {
  const form = new FormData()
  for (const [key, value] of Object.entries({ snapshot, name: 'Collins Nkwoji', role: 'CEO', credentials: 'MBA, CPA, FCA, FCIT', bio: 'Approved biography', image: '/assets/images/founder.webp', imageAlt: 'CEO portrait' })) form.set(key, value)
  return new Request('http://admin.test/team?edit=collins-nkwoji', { method: 'POST', body: form })
}
describe('CEO profile', () => {
  it('loads the seeded CEO details', async () => {
    expect((await loadLeadership()).profile).toMatchObject({ name: 'Collins Nkwoji', role: 'CEO', bio: '' })
  })
  it('saves into the About content consumed by the client without replacing other content', async () => {
    expect(await saveLeadership(request())).toEqual({ ok: true })
    expect(config.title).toBe('About Einao')
    expect(config.body).toEqual(['Keep this content'])
    expect(leadershipProfile(config.leadership as ReturnType<typeof leadershipProfile>).bio).toBe('Approved biography')
    expect((await loadLeadership()).profile.bio).toBe('Approved biography')
  })
  it('rejects stale saves', async () => {
    expect(await saveLeadership(request('{}'))).toMatchObject({ ok: false })
    expect(mock.fetch.mock.calls.some(call => call[1]?.method === 'PATCH')).toBe(false)
  })
  it('reports API save failures instead of navigating to a missing page', async () => {
    mock.fetch.mockImplementation(async (_url: string, init?: RequestInit) => init?.method === 'PATCH' ? new Response('Failure', { status: 500 }) : Response.json({ blocks: [{ id: 42, block_type: 'hero', config }] }))
    expect(await saveLeadership(request())).toMatchObject({ ok: false })
  })
})
