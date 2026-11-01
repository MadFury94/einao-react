import {
  deleteApiV1AdminProjectsBySlug,
  getApiV1Projects,
  type Project,
} from '@einao/api-client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Card,
  CardContent,
  Input,
} from '@einao/ui'
import type { ColumnDef } from '@tanstack/react-table'
import { Pencil, Plus, Search, Settings, Star, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useFetcher } from 'react-router'
import { toast } from 'sonner'
import { DataTable } from '../../components/data-table'
import '../../lib/api'
import type { Route } from './+types/index'

export function meta() {
  return [{ title: 'Games ... Admin' }]
}

export async function loader() {
  const { data, error } = await getApiV1Projects()
  if (error || !data) throw new Response('Failed to load projects', { status: 502 })
  return { projects: data as Project[] }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = String(formData.get('intent') ?? '')
  if (intent === 'delete') {
    const slug = String(formData.get('slug') ?? '')
    const { error } = await deleteApiV1AdminProjectsBySlug({ path: { slug } })
    if (error) return { ok: false as const, error }
    return { ok: true as const, slug }
  }
  return { ok: false as const, error: 'Unknown intent' }
}

export default function ProjectsIndex({ loaderData }: Route.ComponentProps) {
  const { projects } = loaderData
  const fetcher = useFetcher<typeof action>()
  const [pendingDelete, setPendingDelete] = useState<{ slug: string; name: string } | null>(null)
  const [search, setSearch] = useState('')
  const lastResultRef = useRef<unknown>(null)

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return projects
    return projects.filter((project) => {
      if (project.name.toLowerCase().includes(q)) return true
      if (project.tags.some((tag) => tag.toLowerCase().includes(q))) return true
      return false
    })
  }, [projects, search])

  useEffect(() => {
    const result = fetcher.data
    if (!result || result === lastResultRef.current) return
    lastResultRef.current = result
    if (result.ok) {
      toast.success('Game deleted')
    } else if (!result.ok) {
      toast.error('Something went wrong', {
        description: typeof result.error === 'string' ? result.error : undefined,
      })
    }
  }, [fetcher.data])

  const isSubmitting = fetcher.state !== 'idle'

  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        id: 'image',
        header: '',
        size: 60,
        cell: ({ row }) =>
          row.original.main_image_url ? (
            <img
              src={row.original.main_image_url}
              alt={row.original.name}
              className="size-10 rounded-lg object-cover"
            />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-xs">
              ...
            </div>
          ),
      },
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div>
            <span className="font-medium">{row.original.name}</span>
            {row.original.is_featured && (
              <Star className="ml-1.5 inline size-3.5 text-yellow-500 fill-yellow-500" />
            )}
          </div>
        ),
      },
      {
        id: 'slug',
        accessorKey: 'slug',
        header: 'Slug',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.slug}</span>
        ),
      },
      {
        id: 'tags',
        accessorKey: 'tags',
        header: 'Tags',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.tags.length === 0 ? (
              <span className="text-xs text-muted-foreground">...</span>
            ) : (
              row.original.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))
            )}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        meta: { headerClassName: 'w-[140px] text-right', cellClassName: 'text-right' },
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link to={`/projects/${row.original.slug}`}>
                <Pencil className="size-4" />
                <span className="sr-only">Edit</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPendingDelete({ slug: row.original.slug, name: row.original.name })}
            >
              <Trash2 className="size-4 text-destructive" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight page-heading">
            Games
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage the games shown on the public site.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/page-hero-settings/games">
              <Settings className="size-4" />
              Page Settings
            </Link>
          </Button>
          <Button asChild variant="glow">
            <Link to="/projects/new">
              <Plus className="size-4" />
              New game
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search games..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={filteredProjects}
            getRowId={(row) => row.slug}
            emptyState="No games yet. Create your first one to get started."
          />
        </CardContent>
      </Card>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete game?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{' '}
              <span className="font-semibold text-foreground">{pendingDelete?.name}</span> from the
              site. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting}
              onClick={() => {
                if (!pendingDelete) return
                fetcher.submit({ intent: 'delete', slug: pendingDelete.slug }, { method: 'post' })
                setPendingDelete(null)
              }}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
