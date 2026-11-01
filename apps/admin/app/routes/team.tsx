import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea } from '@einao/ui'
import { useEffect } from 'react'
import { Link, useFetcher, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { ImageField } from '../components/image-field'
import { loadLeadership, saveLeadership } from '../lib/leadership'
import type { Route } from './+types/team'
export function meta() { return [{ title: 'Team - Admin' }] }
export function loader() { return loadLeadership() }
export function action({ request }: Route.ActionArgs) { return saveLeadership(request) }
export default function TeamPage({ loaderData }: Route.ComponentProps) {
  const { profile } = loaderData
  const [params] = useSearchParams()
  const editing = params.get('edit') === profile.id
  const fetcher = useFetcher<typeof action>()
  useEffect(() => { if (fetcher.data) fetcher.data.ok ? toast.success('CEO profile saved') : toast.error(fetcher.data.error) }, [fetcher.data])
  return <div className="mx-auto max-w-5xl space-y-6"><div className="flex items-center justify-between gap-4"><div><h1 className="text-3xl font-semibold page-heading">{editing ? `Edit ${profile.name}` : 'Team'}</h1><p className="mt-2 text-sm text-muted-foreground">Manage the CEO profile displayed on the About page.</p></div><Button asChild variant="outline"><Link to={editing ? '/team' : '/users'}>{editing ? 'Back to Team' : 'Manage user accounts'}</Link></Button></div>
  {!editing ? <Card><CardContent className="overflow-x-auto p-0"><table className="w-full text-left text-sm"><thead><tr>{['Name', 'Position', 'Credentials', 'Website', 'Actions'].map(label => <th key={label} className="border-b p-4" scope="col">{label}</th>)}</tr></thead><tbody><tr><td className="p-4 font-medium">{profile.name}</td><td className="p-4">{profile.role}</td><td className="p-4">{profile.credentials}</td><td className="p-4">About / Leadership</td><td className="p-4"><Link className="text-primary underline" to={`/team?edit=${profile.id}`}>Edit</Link></td></tr></tbody></table></CardContent></Card> : <Card><CardHeader><CardTitle>CEO details</CardTitle></CardHeader><CardContent><fetcher.Form method="post" className="grid gap-5"><input type="hidden" name="snapshot" value={JSON.stringify(profile)} />
  {(['name', 'role', 'credentials'] as const).map(key => <div key={key} className="grid gap-2"><Label htmlFor={key}>{key === 'role' ? 'Position / title' : key === 'name' ? 'Full name' : 'Credentials'}</Label><Input id={key} name={key} required={key !== 'credentials'} defaultValue={profile[key]} /></div>)}
  <div className="grid gap-2"><Label htmlFor="bio">Biography</Label><Textarea id="bio" name="bio" rows={7} defaultValue={profile.bio} /><p className="text-xs text-muted-foreground">Add the approved CEO biography. Leave blank to hide it on the website.</p></div>
  <ImageField label="CEO portrait" name="image" defaultValue={profile.image} folder="team" />
  <div className="grid gap-2"><Label htmlFor="imageAlt">Portrait description (alt text)</Label><Input id="imageAlt" name="imageAlt" defaultValue={profile.imageAlt} /></div>
  {fetcher.data && !fetcher.data.ok && <p role="alert" className="text-destructive">{fetcher.data.error}</p>}
  <Button type="submit" disabled={fetcher.state !== 'idle'}>{fetcher.state === 'idle' ? 'Save CEO profile' : 'Saving...'}</Button>
  </fetcher.Form></CardContent></Card>}
  </div>
}
