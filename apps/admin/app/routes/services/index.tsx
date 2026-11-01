import {
  deleteApiV1AdminServicesById,
  getApiV1AdminServices,
  putApiV1AdminServicesReorder,
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
import { ChevronDown, ChevronUp, Pencil, Plus, Search, Settings, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useFetcher } from 'react-router'
import { toast } from 'sonner'
import { DataTable } from '../../components/data-table'
import { PostStatusBadge } from '../../components/post-status-badge'
import '../../lib/api'
import type { Route } from './+types/index'

type Service = Awaited<ReturnType<typeof loader>>['services'][number]

export function meta() {
  return [{ title: 'Services ... Admin' }]
}

export async function loader() {
  const { data, error } = await getApiV1AdminServices()
  if (error || !data) throw new Response('Failed to load services', { status: 502 })
  return { services: data }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = String(formData.get('intent') ?? '')
  if (intent === 'delete') {
    const id = String(formData.get('id') ?? '')
    const { error } = await deleteApiV1AdminServicesById({ path: { id } })
    if (error) return { ok: false as const, error }
    return { ok: true as const, id }
  }
  if (intent === 'reorder') {
    const ids = JSON.parse(String(formData.get('ids') ?? '[]')) as number[]
    const { error } = await putApiV1AdminServicesReorder({ body: { ids } })
    if (error) return { ok: false as const, error }
    return { ok: true as const, reordered: true }
  }
  return { ok: false as const, error: 'Unknown intent' }
}

export default function ServicesIndex({ loaderData }: Route.ComponentProps) {
  const { services } = loaderData
  const fetcher = useFetcher<typeof action>()
  const [pendingDelete, setPendingDelete] = useState<{ id: number; name: string } | null>(null)
  const [search, setSearch] = useState('')
  const lastResultRef = useRef<unknown>(null)

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return services
    return services.filter((service) => {
      if (service.name.toLowerCase().includes(q)) return true
      if (service.tags.some((tag) => tag.toLowerCase().includes(q))) return true
      return false
    })
  }, [services, search])

  useEffect(() => {
    const result = fetcher.data
    if (!result || result === lastResultRef.current) return
    lastResultRef.current = result
    if (result.ok && 'id' in result) {
      toast.success('Service deleted')
    } else if (!result.ok) {
      toast.error('Something went wrong', {
        description: typeof result.error === 'string' ? result.error : undefined,
      })
    }
  }, [fetcher.data])

  const isSubmitting = fetcher.state !== 'idle'
  const isFiltered = search.trim().length > 0

  function move(index: number, direction: 'up' | 'down') {
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= services.length) return
    const ids = services.map((s) => s.id)
    ;[ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]]
    fetcher.submit({ intent: 'reorder', ids: JSON.stringify(ids) }, { method: 'post' })
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: row callbacks close over latest `move` and `setPendingDelete` via render
  const columns = useMemo<ColumnDef<Service>[]>(
    () => [
      {
        id: 'id',
        accessorKey: 'id',
        header: '#',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.id}</span>
        ),
        meta: { headerClassName: 'w-[60px]' },
      },
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <PostStatusBadge status={row.original.status} />,
        meta: { headerClassName: 'w-[120px]' },
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
        id: 'order',
        header: 'Order',
        enableSorting: false,
        meta: { headerClassName: 'w-[80px] text-center', cellClassName: 'text-center' },
        cell: ({ row }) => {
          const i = row.index
          return (
            <div className="flex items-center justify-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={i === 0 || isSubmitting || isFiltered}
                onClick={() => move(i, 'up')}
              >
                <ChevronUp className="size-4" />
                <span className="sr-only">Move up</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={i === services.length - 1 || isSubmitting || isFiltered}
                onClick={() => move(i, 'down')}
              >
                <ChevronDown className="size-4" />
                <span className="sr-only">Move down</span>
              </Button>
            </div>
          )
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        meta: { headerClassName: 'w-[140px] text-right', cellClassName: 'text-right' },
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link to={`/services/${row.original.id}`}>
                <Pencil className="size-4" />
                <span className="sr-only">Edit</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPendingDelete({ id: row.original.id, name: row.original.name })}
            >
              <Trash2 className="size-4 text-destructive" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        ),
      },
    ],
    [services.length, isSubmitting, isFiltered]
  )

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight page-heading">
            Services
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage the services list shown on the public site.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/page-hero-settings/services">
              <Settings className="size-4" />
              Page Settings
            </Link>
          </Button>
          <Button asChild variant="glow">
            <Link to="/services/new">
              <Plus className="size-4" />
              New service
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
              placeholder="Search services..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={filteredServices}
            getRowId={(row) => String(row.id)}
            emptyState="No services yet. Create your first one to get started."
          />
        </CardContent>
      </Card>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete service?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{' '}
              <span className="font-semibold text-foreground">{pendingDelete?.name}</span> from the
              public site. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting}
              onClick={() => {
                if (!pendingDelete) return
                fetcher.submit(
                  { intent: 'delete', id: String(pendingDelete.id) },
                  { method: 'post' }
                )
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
