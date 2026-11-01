import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@einao/ui'
import { ArrowLeft, Save } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { EditorSidebar } from '../../components/editor-sidebar'
import { FeaturedImageCard } from '../../components/featured-image-card'
import { SocialLinksEditor } from '../../components/social-links-editor'
import { TipTapEditor } from '../../components/tiptap-editor'
import { serverBaseUrl, serverFetch, serverHeaders } from '../../lib/api'
import type { Route } from './+types/$id'

type UserDetail = {
  id: number
  name: string
  email: string
  role: 'admin' | 'author' | 'team_member' | 'client' | 'user'
  last_login: string | null
  bio?: string
  avatar_url?: string
  position?: string
  socials?: string
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers({ ...serverHeaders, ...init?.headers })
  const res = await serverFetch(`${serverBaseUrl}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw body
  }
  return res.json()
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.user ? `${data.user.name} ... Users ... Admin` : 'User ... Admin' }]
}

export async function loader({ params }: Route.LoaderArgs) {
  if (!/^\d+$/.test(params.id ?? '')) {
    throw new Response('Invalid user id', { status: 400 })
  }
  const user = await apiRequest<UserDetail>(`/api/v1/users/${params.id}`)
  return { user }
}

export default function EditUserPage({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData
  const navigate = useNavigate()

  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [role, setRole] = useState(user.role)
  const [bio, setBio] = useState(user.bio ?? '')
  const [bioHtml, setBioHtml] = useState(user.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url ?? '')
  const [position, setPosition] = useState(user.position ?? '')
  const [socials, setSocials] = useState<{ label: string; href: string }[]>(() => {
    try {
      return JSON.parse(user.socials ?? '[]')
    } catch {
      return []
    }
  })
  const [busy, setBusy] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await apiRequest(`/api/v1/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, role, bio: bioHtml, avatar_url: avatarUrl, position, socials: JSON.stringify(socials) }),
      })
      toast.success('User updated')
      navigate('/users')
    } catch (err: any) {
      const msg = err?.error
        ? typeof err.error === 'string'
          ? err.error
          : Object.entries(err.error)
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ')
        : 'Update failed'
      toast.error(msg)
    } finally {
      setBusy(false)
    }
  }

  async function handleSetPassword() {
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setPasswordBusy(true)
    try {
      await apiRequest(`/api/v1/admin/users/${user.id}/password`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })
      toast.success('Password updated')
      setNewPassword('')
    } catch {
      toast.error('Failed to set password')
    } finally {
      setPasswordBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild type="button">
            <Link to="/users">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">User</p>
            <h1 className="text-2xl font-bold">{user.name}</h1>
          </div>
        </div>
        <Button variant="glow" type="submit" disabled={busy}>
          <Save className="mr-2 size-4" />
          {busy ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main content */}
        <div className="space-y-6 min-w-0">
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="user-name">Name</Label>
              <Input
                id="user-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={3}
                className="h-12 text-lg font-semibold"
                placeholder="Full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-position">Position / Title</Label>
              <Input
                id="user-position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Creative Designer"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <div className="space-y-2">
              <Label>Bio / Description</Label>
              <TipTapEditor content={bio} onUpdate={(_json, html) => setBioHtml(html)} />
              <p className="text-xs text-muted-foreground">
                Displayed on author pages and post bylines.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <EditorSidebar>
          <EditorSidebar.Block>
            <FeaturedImageCard
              value={avatarUrl}
              onChange={setAvatarUrl}
              label="Profile photo"
              title="Avatar"
            />
          </EditorSidebar.Block>

          <EditorSidebar.Section title="Role" defaultOpen>
            <div className="space-y-2">
              <Select value={role} onValueChange={(v) => setRole(v as UserDetail['role'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="team_member">Team Member</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Admins have full access. Authors can create and manage posts.
              </p>
            </div>
          </EditorSidebar.Section>


          <EditorSidebar.Section title="Password" defaultOpen>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  minLength={8}
                />
              </div>
              <Button type="button" variant="secondary" className="w-full" disabled={passwordBusy || newPassword.length < 8} onClick={handleSetPassword}>
                {passwordBusy ? 'Setting...' : 'Set Password'}
              </Button>
              <p className="text-xs text-muted-foreground">
                Set or reset this user's login password.
              </p>
            </div>
          </EditorSidebar.Section>

          <EditorSidebar.Section title="Social Links" defaultOpen>
            <SocialLinksEditor value={socials} onChange={setSocials} />
          </EditorSidebar.Section>
        </EditorSidebar>
      </div>
    </form>
  )
}
