import { Badge, Button, Card, CardContent } from '@einao/ui'
import type { ColumnDef } from '@tanstack/react-table'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { DataTable } from '../../components/data-table'
import { serverBaseUrl, serverFetch, serverHeaders } from '../../lib/api'
import type { Route } from './+types/index'

type UserRow = {
  id: number
  name: string
  email: string
  role: 'admin' | 'author' | 'team_member' | 'user'
  last_login: string | null
  status: 'active' | 'suspended'
}

export function meta() {
  return [{ title: 'Users ... Admin' }]
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

export async function loader(_: Route.LoaderArgs) {
  const users = await apiRequest<UserRow[]>('/api/v1/users')
  return { users }
}

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  author: 'secondary',
  team_member: 'secondary',
  user: 'outline',
}

export default function UsersPage({ loaderData }: Route.ComponentProps) {
  const [users, setUsers] = useState<UserRow[]>(loaderData.users)
  const [roleFilter, setRoleFilter] = useState<'all' | UserRow['role']>('all')

  const filteredUsers = useMemo(
    () => (roleFilter === 'all' ? users : users.filter((u) => u.role === roleFilter)),
    [users, roleFilter]
  )

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: users.length }
    for (const u of users) counts[u.role] = (counts[u.role] ?? 0) + 1
    return counts
  }, [users])

  const roleFilters: { value: 'all' | UserRow['role']; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'admin', label: 'Admins' },
    { value: 'author', label: 'Authors' },
    { value: 'team_member', label: 'Team' },
    { value: 'user', label: 'Users' },
  ]

  const columns = useMemo<ColumnDef<UserRow>[]>(
    () => [
      { accessorKey: 'id', header: 'ID', size: 60 },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <Badge variant={roleBadgeVariant[row.original.role] ?? 'outline'} className="capitalize">
            {row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant={row.original.status === 'active' ? 'default' : 'destructive'}
            className="capitalize"
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'last_login',
        header: 'Last Login',
        cell: ({ row }) =>
          row.original.last_login ? (
            new Date(row.original.last_login).toLocaleString()
          ) : (
            <span className="text-muted-foreground text-xs">Never</span>
          ),
      },
      {
        id: 'actions',
        header: '',
        size: 80,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleStatus(row.original)}
              className={
                row.original.status === 'active'
                  ? 'text-destructive hover:text-destructive'
                  : 'text-green-600 hover:text-green-600'
              }
            >
              {row.original.status === 'active' ? 'Suspend' : 'Activate'}
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/users/${row.original.id}`}>
                <Pencil className="size-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original)}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  async function handleToggleStatus(user: UserRow) {
    const next = user.status === 'active' ? 'suspended' : 'active'
    try {
      await apiRequest(`/api/v1/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: next } : u)))
      toast.success(`${user.name} is now ${next}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  async function handleDelete(user: UserRow) {
    if (!confirm(`Delete user "${user.name}"?`)) return
    try {
      await apiRequest(`/api/v1/admin/users/${user.id}`, { method: 'DELETE' })
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      toast.success(`Deleted "${user.name}"`)
    } catch {
      toast.error('Failed to delete user')
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight page-heading">Users</h1>
        </div>
        <Button asChild variant="glow">
          <Link to="/users/new">
            <Plus className="mr-2 size-4" />
            Add User
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {roleFilters.map((f) => {
          const active = roleFilter === f.value
          return (
            <Button
              key={f.value}
              size="sm"
              variant="outline"
              className={`rounded-full ${active ? 'page-heading border-current' : ''}`}
              onClick={() => setRoleFilter(f.value)}
            >
              {f.label}
              <span className="ml-1.5 opacity-70">{roleCounts[f.value] ?? 0}</span>
            </Button>
          )
        })}
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable columns={columns} data={filteredUsers} />
        </CardContent>
      </Card>
    </div>
  )
}
