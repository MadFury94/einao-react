import { leadershipProfile, type LeadershipProfile } from '../../../../packages/content/src/leadership'
import { serverBaseUrl, serverFetch, serverHeaders } from './api'
type Block = { id: number; block_type: string; config: Record<string, unknown> & { leadership?: LeadershipProfile } }
export async function loadLeadership() {
  const response = await serverFetch(`${serverBaseUrl}/api/v1/admin/content/pages/about`, { headers: serverHeaders, credentials: 'include' })
  if (!response.ok) throw new Response('Could not load the CEO profile.', { status: response.status })
  const page = await response.json() as { blocks: Block[] }
  const block = page.blocks.find(item => item.block_type === 'hero')
  if (!block) throw new Response('About page content is missing.', { status: 404 })
  return { block, profile: leadershipProfile(block.config.leadership) }
}
export async function saveLeadership(request: Request) {
  try {
    const form = await request.formData()
    const { block, profile } = await loadLeadership()
    if (String(form.get('snapshot')) !== JSON.stringify(profile)) return { ok: false as const, error: 'The profile changed since you opened it. Reload before saving.' }
    const next = { ...profile }
    for (const key of ['name', 'role', 'credentials', 'bio', 'image', 'imageAlt'] as const) next[key] = String(form.get(key) ?? '').trim()
    if (!next.name || !next.role) return { ok: false as const, error: 'Name and position are required.' }
    if (next.image && !/^(\/(?!\/)|https?:\/\/)/i.test(next.image)) return { ok: false as const, error: 'Use a website image path or an HTTP(S) image URL.' }
    const response = await serverFetch(`${serverBaseUrl}/api/v1/admin/content/blocks/${block.id}`, {
      method: 'PATCH', headers: { ...serverHeaders, 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ config: { ...block.config, leadership: next } }),
    })
    if (!response.ok) return { ok: false as const, error: 'Could not save the CEO profile. Please retry.' }
    return { ok: true as const }
  } catch {
    return { ok: false as const, error: 'Could not save the CEO profile. Your changes are still in the form.' }
  }
}
