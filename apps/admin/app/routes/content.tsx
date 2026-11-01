import { Card, CardContent } from '@einao/ui'
import { Eye, EyeOff, Pencil } from 'lucide-react'
import { useFetcher, useSearchParams, Link } from 'react-router'
import { toast } from 'sonner'
import { serverBaseUrl, serverFetch, serverHeaders } from '../lib/api'
import type { Route } from './+types/content'

type PageBlock = { id: number; page_slug: string; block_type: string; position: number; config: Record<string, unknown>; visible: boolean }
type ActionResult = { ok: true; blocks: PageBlock[] } | { ok: false; error: string }
const PAGES = [
  ['home', 'Home'], ['about', 'About'], ['capabilities', 'Capabilities'], ['solutions', 'Solutions'],
  ['industries', 'Industries'], ['work', 'Work'], ['insights', 'Insights'], ['contact', 'Contact'],
  ['privacy-notice', 'Privacy Notice'], ['terms-of-use', 'Terms of Use'],
] as const

export function meta() { return [{ title: 'Einao Content Admin' }] }
export async function loader({ request }: Route.LoaderArgs) {
  const page = new URL(request.url).searchParams.get('page') || 'home'
  const res = await serverFetch(`${serverBaseUrl}/api/v1/admin/page-blocks/${page}`, { headers: serverHeaders, credentials: 'include' })
  if (!res.ok) throw new Response('Failed to load page content', { status: 502 })
  return { page, blocks: (await res.json()) as PageBlock[] }
}
export async function action({ request }: Route.ActionArgs): Promise<ActionResult> {
  const form = await request.formData(); const id = String(form.get('id')); const page = String(form.get('page') || 'home')
  const visible = form.get('visible') === 'true'
  const res = await serverFetch(`${serverBaseUrl}/api/v1/admin/page-blocks/${id}`, { method: 'PATCH', headers: { ...serverHeaders, 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ visible }) })
  if (!res.ok) return { ok: false, error: 'Unable to update section visibility' }
  const list = await serverFetch(`${serverBaseUrl}/api/v1/admin/page-blocks/${page}`, { headers: serverHeaders, credentials: 'include' })
  return { ok: true, blocks: (await list.json()) as PageBlock[] }
}
export default function ContentRoute({ loaderData, actionData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>(); const [params, setParams] = useSearchParams()
  const page = params.get('page') || loaderData.page; const blocks = actionData?.ok ? actionData.blocks : loaderData.blocks
  if (fetcher.data?.ok) toast.success('Section updated')
  return <section className="admin-page">
    <header className="admin-page-header"><div><p className="admin-eyebrow">Einao content</p><h2 className="admin-page-title">Site content</h2><p className="admin-copy">Edit approved page text, links and media. Section order and layout are fixed in the website code.</p></div></header>
    <label className="grid max-w-sm gap-2 text-sm font-medium">Page<select value={page} onChange={(e) => setParams({ page: e.target.value })} className="h-9 rounded-md border border-input bg-background px-3 text-sm">{PAGES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <div className="space-y-2">{blocks.map((block) => <Card key={block.id} className={!block.visible ? 'opacity-50' : ''}><CardContent className="flex items-center gap-3 py-3"><div className="min-w-0 flex-1"><p className="text-sm font-medium capitalize">{block.block_type.replaceAll('_', ' ')}</p><p className="text-xs text-muted-foreground">Section {block.position + 1}  {Object.keys(block.config).length} editable fields</p></div><fetcher.Form method="post"><input type="hidden" name="id" value={block.id}/><input type="hidden" name="page" value={page}/><input type="hidden" name="visible" value={String(!block.visible)}/><button className="rounded-md p-2 hover:bg-muted" title={block.visible ? 'Hide section' : 'Show section'}>{block.visible ? <Eye className="size-4"/> : <EyeOff className="size-4"/>}</button></fetcher.Form><Link className="rounded-md p-2 hover:bg-muted" to={`/page-blocks/${block.id}`} title="Edit content"><Pencil className="size-4"/></Link></CardContent></Card>)}</div>
  </section>
}
