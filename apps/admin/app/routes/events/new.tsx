import { postApiV1AdminEvents } from '@einao/api-client'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import {
  EventFormActions,
  EventFormFields,
  type EventFormValues,
} from '../../components/event-form'
import '../../lib/api'
import type { Route } from './+types/new'

export function meta() {
  return [{ title: 'New Event ... Admin' }]
}

const EMPTY: EventFormValues = { date: '', name: '', location: '', details: '' }

export default function NewEventPage(_: Route.ComponentProps) {
  const navigate = useNavigate()
  const [values, setValues] = useState<EventFormValues>(EMPTY)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const { data, error } = await postApiV1AdminEvents({ body: values })
      if (error || !data) throw error ?? new Error('Create failed')
      toast.success('Event created')
      navigate(`/events/${data.id}`)
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'error' in err
          ? typeof (err as { error: unknown }).error === 'string'
            ? String((err as { error: string }).error)
            : 'Validation failed'
          : 'Create failed'
      toast.error(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
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
          <h1 className="text-2xl font-semibold tracking-tight">New event</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <EventFormFields values={values} onChange={setValues} />
        <EventFormActions busy={busy} submitLabel="Create event" />
      </form>
    </div>
  )
}
