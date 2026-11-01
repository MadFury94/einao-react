import {
  deleteApiV1AdminEventsById,
  getApiV1AdminEventsById,
  putApiV1AdminEventsById,
} from '@einao/api-client'
import { Button } from '@einao/ui'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import {
  EventFormActions,
  EventFormFields,
  type EventFormValues,
} from '../../components/event-form'
import '../../lib/api'
import type { Route } from './+types/$id'

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.event ? `${data.event.name} ... Admin` : 'Event ... Admin' }]
}

export async function loader({ params }: Route.LoaderArgs) {
  if (!/^\d+$/.test(params.id ?? '')) throw new Response('Invalid id', { status: 400 })
  const { data, error } = await getApiV1AdminEventsById({ path: { id: params.id } })
  if (error || !data) throw new Response('Event not found', { status: 404 })
  return { event: data }
}

export default function EditEventPage({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate()
  const { event } = loaderData
  const [values, setValues] = useState<EventFormValues>({
    date: event.date,
    name: event.name,
    location: event.location,
    details: event.details,
  })
  const [busy, setBusy] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const { error } = await putApiV1AdminEventsById({
        path: { id: String(event.id) },
        body: values,
      })
      if (error) throw error
      toast.success('Event saved')
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'error' in err
          ? typeof (err as { error: unknown }).error === 'string'
            ? String((err as { error: string }).error)
            : 'Validation failed'
          : 'Save failed'
      toast.error(msg)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${event.name}"?`)) return
    setDeleting(true)
    try {
      const { error } = await deleteApiV1AdminEventsById({ path: { id: String(event.id) } })
      if (error) throw error
      toast.success('Event deleted')
      navigate('/events')
    } catch {
      toast.error('Delete failed')
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/events"
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Events
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">{event.name}</h1>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting}>
          <Trash2 className="size-4 text-destructive" />
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <EventFormFields values={values} onChange={setValues} />
        <EventFormActions busy={busy} submitLabel="Save changes" />
      </form>
    </div>
  )
}
