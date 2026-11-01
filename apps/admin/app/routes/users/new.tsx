import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@einao/ui'
import { ArrowLeft, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { serverBaseUrl, serverFetch, serverHeaders } from '../../lib/api'
import type { Route } from './+types/new'

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

export function meta() {
  return [{ title: 'New User ... Admin' }]
}

export default function NewUserPage(_: Route.ComponentProps) {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('user')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await apiRequest('/api/v1/admin/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, role }),
      })
      toast.success('User created')
      navigate('/users')
    } catch (err: any) {
      const msg = err?.error
        ? typeof err.error === 'string'
          ? err.error
          : Object.entries(err.error)
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ')
        : 'Create failed'
      toast.error(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/users">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Users</p>
          <h1 className="text-2xl font-bold">New User</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground">Create a new user account.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="user-name">Name</Label>
              <Input
                id="user-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={3}
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="team_member">Team Member</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Admins have full access. Authors can create and manage posts.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link to="/users">Cancel</Link>
              </Button>
              <Button type="submit" disabled={busy}>
                <Plus className="mr-2 size-4" />
                {busy ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
