import { getApiV1Tags, postApiV1AdminServices } from '@einao/api-client'
import { useEffect, useRef } from 'react'
import { redirect, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { extractFieldErrors, parseServiceForm, ServiceForm } from '../../components/service-form'
import '../../lib/api'
import type { Route } from './+types/new'

export function meta() {
  return [{ title: 'New service ... Admin' }]
}

export async function loader() {
  const { data } = await getApiV1Tags()
  return { availableTags: (data ?? []).map((t) => t.name) }
}

export async function action({ request }: Route.ActionArgs) {
  const body = parseServiceForm(await request.formData())
  const { data, error } = await postApiV1AdminServices({ body })
  if (error) return { ok: false as const, error }
  return redirect(`/services/${data.id}?created=1`)
}

export default function NewService({ loaderData, actionData }: Route.ComponentProps) {
  const navigate = useNavigate()
  const lastRef = useRef<unknown>(null)
  const fieldErrors = extractFieldErrors(actionData)

  useEffect(() => {
    if (!actionData || actionData === lastRef.current) return
    lastRef.current = actionData
    if (!actionData.ok) {
      const fieldCount = Object.keys(fieldErrors).filter((k) => k !== '_root').length
      toast.error('Could not create service', {
        description: fieldCount
          ? `${fieldCount} field${fieldCount === 1 ? '' : 's'} need attention.`
          : 'Please review the form and try again.',
      })
    }
  }, [actionData, fieldErrors])

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="sticky top-14 z-20 flex flex-col gap-4 rounded-xl border bg-card/95 p-4 shadow-sm backdrop-blur supports-backdrop-filter:bg-card/80 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            ... Services
          </button>
          <span className="inline-flex items-center rounded-full border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            New service
          </span>
          <span className="text-sm text-muted-foreground">
            Add a new service to the public site.
          </span>
        </div>
      </div>
      <ServiceForm
        submitLabel="Create service"
        fieldErrors={fieldErrors}
        availableTags={loaderData.availableTags}
      />
    </div>
  )
}
