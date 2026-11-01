import { getApiV1Tags, postApiV1AdminProjects } from '@einao/api-client'
import { useEffect, useRef } from 'react'
import { redirect, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { extractFieldErrors, ProjectForm, parseProjectForm } from '../../components/project-form'
import '../../lib/api'
import type { Route } from './+types/new'

export function meta() {
  return [{ title: 'New game ... Admin' }]
}

export async function loader() {
  const { data } = await getApiV1Tags()
  return { availableTags: (data ?? []).map((t) => t.name) }
}

export async function action({ request }: Route.ActionArgs) {
  const body = parseProjectForm(await request.formData())
  const { data, error } = await postApiV1AdminProjects({ body })
  if (error) return { ok: false as const, error }
  return redirect(`/projects/${(data as { slug: string }).slug}?created=1`)
}

export default function NewProject({ loaderData, actionData }: Route.ComponentProps) {
  const navigate = useNavigate()
  const lastRef = useRef<unknown>(null)
  const fieldErrors = extractFieldErrors(actionData)

  useEffect(() => {
    if (!actionData || actionData === lastRef.current) return
    lastRef.current = actionData
    if (!actionData.ok) {
      const fieldCount = Object.keys(fieldErrors).filter((k) => k !== '_root').length
      toast.error('Could not create game', {
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
            onClick={() => navigate('/projects')}
            className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            ... Games
          </button>
          <span className="inline-flex items-center rounded-full border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            New game
          </span>
          <span className="text-sm text-muted-foreground">Add a new game to the catalogue.</span>
        </div>
      </div>
      <ProjectForm
        submitLabel="Create game"
        fieldErrors={fieldErrors}
        availableTags={loaderData.availableTags}
      />
    </div>
  )
}
