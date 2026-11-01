import {
  deleteApiV1AdminEventsById,
  getApiV1AdminEvents,
  putApiV1AdminEventsReorder,
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
  Button,
  Card,
  CardContent,
} from '@einao/ui'
import type { ColumnDef } from '@tanstack/react-table'
import { CalendarDays, ChevronDown, ChevronUp, Pencil, Plus, Settings, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useFetcher } from 'react-router'
import { toast } from 'sonner'
import { DataTable } from '../../components/data-table'
import '../../lib/api'
import type { Route } from './+types/index'

type EventItem = Awaited<ReturnType<typeof loader>>['events'][number]

export function meta() {
  return [{ title: 'Events ... Admin' }]
}

export async function loader() {
  const { data, error } = await getApiV1AdminEvents()
  if (error || !data) throw new Response('Failed to load events', { status: 502 })
  return { events: data }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = String(formData.get('intent') ?? '')
  if (intent === 'delete') {
    const id = String(formData.get('id') ?? '')
    const { error } = await deleteApiV1AdminEventsById({ path: { id } })
    if (error) return { ok: false as const, error }
    return { ok: true as const, id }
  }
  if (intent === 'reorder') {
    const ids = JSON.parse(String(formData.get('ids') ?? '[]')) as number[]
    const { error } = await putApiV1AdminEventsReorder({ body: { ids } })
    if (error) return { ok: false as const, error }
    return { ok: true as const, reordered: true }
  }
  return { ok: false as const, error: 'Unknown intent' }
}

export default function EventsIndex({ loaderData }: Route.ComponentProps) {
  const { events } = loaderData
  const fetcher = useFetcher<typeof action>()
  const [pendingDelete, setPendingDelete] = useState<{ id: number; name: string } | null>(null)
  const lastResultRef = useRef<unknown>(null)

  useEffect(() => {
    const result = fetcher.data
    if (!result || result === lastResultRef.current) return
    lastResultRef.current = result
    if (result.ok && 'id' in result) {
      toast.success('Event deleted')
    } else if (!result.ok) {
      toast.error('Something went wrong', {
        description: typeof result.error === 'string' ? result.error : undefined,
      })
    }
  }, [fetcher.data])

  const isSubmitting = fetcher.state !== 'idle'

  function move(index: number, direction: 'up' | 'down') {
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= events.length) return
    const ids = events.map((e) => e.id)
    ;[ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]]
    fetcher.submit({ intent: 'reorder', ids: JSON.stringify(ids) }, { method: 'post' })
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: row callbacks close over latest `move`
  const columns = useMemo<ColumnDef<EventItem>[]>(
    () => [
      {
        id: 'date',
        accessorKey: 'date',
        header: 'When',
        cell: ({ row }) => (
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {row.original.date}
          </span>
        ),
        meta: { headerClassName: 'w-[120px]' },
      },
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Event',
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        id: 'location',
        accessorKey: 'location',
        header: 'Location',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.location}</span>
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
                disabled={i === 0 || isSubmitting}
                onClick={() => move(i, 'up')}
              >
                <ChevronUp className="size-4" />
                <span className="sr-only">Move up</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={i === events.length - 1 || isSubmitting}
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
        meta: { headerClassName: 'w-[120px] text-right', cellClassName: 'text-right' },
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link to={`/events/${row.original.id}`}>
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
    [events.length, isSubmitting]
  )

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight page-heading">
            Events
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Showcases, festivals, talks ... anything that appears on the public events timeline.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/page-hero-settings/events">
              <Settings className="size-4" />
              Page Settings
            </Link>
          </Button>
          <Button asChild variant="glow">
            <Link to="/events/new">
              <Plus className="size-4" />
              New event
            </Link>
          </Button>
        </div>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarDays className="mb-4 size-10 text-muted-foreground/50" />
            <h2 className="text-lg font-semibold">No events yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first event to populate the public timeline.
            </p>
            <Button asChild variant="glow" className="mt-4">
              <Link to="/events/new">
                <Plus className="size-4" />
                New event
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={events}
              getRowId={(row) => String(row.id)}
              emptyState="No events yet."
            />
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{' '}
              <span className="font-semibold text-foreground">{pendingDelete?.name}</span> from the
              public timeline. This action cannot be undone.
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
