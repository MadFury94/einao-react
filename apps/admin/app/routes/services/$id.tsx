import { getApiV1Tags } from '@einao/api-client'
import { Button, Input, Label, Textarea } from '@einao/ui'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { EditorSidebar } from '../../components/editor-sidebar'
import { FeaturedImageCard } from '../../components/featured-image-card'
import { PostStatusBadge } from '../../components/post-status-badge'
import { StatusVisibilityPanel } from '../../components/status-visibility-panel'
import { TagPicker } from '../../components/tag-picker'
import { TipTapEditor } from '../../components/tiptap-editor'
import '../../lib/api'
import { formatDateTime, type PostStatus } from '../../lib/posts'
import {
  getAdminService,
  publishAdminService,
  type Service,
  scheduleAdminService,
  unpublishAdminService,
  updateAdminService,
} from '../../lib/services'
import type { Route } from './+types/$id'

const CLIENT_ORIGIN = import.meta.env.VITE_CLIENT_URL ?? 'http://localhost:5930'

type Draft = {
  name: string
  description: string
  imageUrl: string
  tags: string[]
  seoTitle: string
  seoDescription: string
  scheduleFor: Date | undefined
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.service ? `${data.service.name} ... Admin` : 'Service ... Admin' }]
}

export async function loader({ params }: Route.LoaderArgs) {
  const id = params.id
  if (!/^\d+$/.test(id ?? '')) throw new Response('Invalid id', { status: 400 })
  try {
    const [service, tagsRes] = await Promise.all([getAdminService(id), getApiV1Tags()])
    const availableTags = (tagsRes.data ?? []).map((t) => t.name)
    return { service, availableTags }
  } catch {
    throw new Response('Service not found', { status: 404 })
  }
}

function createDraft(service: Service): Draft {
  return {
    name: service.name,
    description: service.description,
    imageUrl: service.image_url,
    tags: service.tags,
    seoTitle: service.seo_title,
    seoDescription: service.seo_description,
    scheduleFor: service.scheduled_for ? new Date(service.scheduled_for) : undefined,
  }
}

function serializeDraft(draft: Draft) {
  return JSON.stringify({
    ...draft,
    scheduleFor: draft.scheduleFor ? draft.scheduleFor.toISOString() : null,
  })
}

export default function EditService({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [service, setService] = useState(loaderData.service)
  const [draft, setDraft] = useState(() => createDraft(loaderData.service))
  const [saveState, setSaveState] = useState<'saved' | 'dirty' | 'saving' | 'error'>('saved')
  const [busyAction, setBusyAction] = useState<'publish' | 'unpublish' | 'schedule' | null>(null)

  const draftRef = useRef(draft)
  const serviceRef = useRef(service)
  const savePromiseRef = useRef<Promise<void> | null>(null)
  const lastSavedSnapshotRef = useRef(serializeDraft(createDraft(loaderData.service)))
  // biome-ignore lint/suspicious/noExplicitAny: TipTap editor type lives outside our type graph
  const editorRef = useRef<any>(null)

  useEffect(() => {
    draftRef.current = draft
  }, [draft])

  useEffect(() => {
    serviceRef.current = service
  }, [service])

  // Reset when loader reports a new service id/version.
  const loaderKey = `${loaderData.service.id}:${loaderData.service.updated_at}`
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on loader version
  useEffect(() => {
    const nextDraft = createDraft(loaderData.service)
    setService(loaderData.service)
    setDraft(nextDraft)
    setSaveState('saved')
    lastSavedSnapshotRef.current = serializeDraft(nextDraft)
  }, [loaderKey])

  // One-shot "created" toast from /services/new redirect.
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    if (searchParams.get('created') !== '1') return
    toast.success('Service created', {
      description: 'Now publish it or schedule it for later.',
    })
    const next = new URLSearchParams(searchParams)
    next.delete('created')
    setSearchParams(next, { replace: true })
  }, [])

  // Autosave (debounced).
  // biome-ignore lint/correctness/useExhaustiveDependencies: saveDraft is stable via refs
  useEffect(() => {
    const snapshot = serializeDraft(draft)
    if (snapshot === lastSavedSnapshotRef.current) return
    setSaveState('dirty')
    const t = window.setTimeout(() => {
      void saveDraft()
    }, 1200)
    return () => window.clearTimeout(t)
  }, [draft])

  async function saveDraft() {
    if (savePromiseRef.current) return savePromiseRef.current
    const current = draftRef.current
    const snapshot = serializeDraft(current)
    if (snapshot === lastSavedSnapshotRef.current) return

    const promise = (async () => {
      setSaveState('saving')
      try {
        const updated = await updateAdminService(serviceRef.current.id, {
          name: current.name,
          description: current.description,
          image_url: current.imageUrl || undefined,
          tags: current.tags,
          seo_title: current.seoTitle,
          seo_description: current.seoDescription,
        })
        setService(updated)
        lastSavedSnapshotRef.current = snapshot
        setSaveState('saved')
      } catch (error) {
        setSaveState('error')
        toast.error('Could not save service', {
          description: error instanceof Error ? error.message : 'Request failed',
        })
        throw error
      } finally {
        savePromiseRef.current = null
        if (serializeDraft(draftRef.current) !== lastSavedSnapshotRef.current) {
          window.setTimeout(() => {
            void saveDraft()
          }, 0)
        }
      }
    })()

    savePromiseRef.current = promise
    return promise
  }

  async function flushDraft() {
    while (serializeDraft(draftRef.current) !== lastSavedSnapshotRef.current) {
      await saveDraft()
    }
  }

  async function handlePublish() {
    setBusyAction('publish')
    try {
      await flushDraft()
      const updated = await publishAdminService(service.id)
      setService(updated)
      toast.success('Service published')
    } catch (error) {
      toast.error('Could not publish service', {
        description: error instanceof Error ? error.message : 'Request failed',
      })
    } finally {
      setBusyAction(null)
    }
  }

  async function handleUnpublish() {
    setBusyAction('unpublish')
    try {
      await flushDraft()
      const updated = await unpublishAdminService(service.id)
      setService(updated)
      toast.success('Service moved back to draft')
    } catch (error) {
      toast.error('Could not unpublish service', {
        description: error instanceof Error ? error.message : 'Request failed',
      })
    } finally {
      setBusyAction(null)
    }
  }

  async function handleSchedule() {
    if (!draft.scheduleFor) {
      toast.error('Choose a valid schedule date first')
      return
    }
    setBusyAction('schedule')
    try {
      await flushDraft()
      const updated = await scheduleAdminService(service.id, draft.scheduleFor.toISOString())
      setService(updated)
      setDraft((current) => ({
        ...current,
        scheduleFor: updated.scheduled_for ? new Date(updated.scheduled_for) : undefined,
      }))
      toast.success('Service scheduled')
    } catch (error) {
      toast.error('Could not schedule service', {
        description: error instanceof Error ? error.message : 'Request failed',
      })
    } finally {
      setBusyAction(null)
    }
  }

  const previewHref = `${CLIENT_ORIGIN.replace(/\/$/, '')}/#services`
  const status = service.status as PostStatus
  const displayDate = status === 'scheduled' ? service.scheduled_for : service.published_at

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="sticky top-14 z-20 flex flex-col gap-4 rounded-xl border bg-card/95 p-4 shadow-sm backdrop-blur supports-backdrop-filter:bg-card/80 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Link
            to="/services"
            className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            ... Services
          </Link>
          <PostStatusBadge status={status} />
          <span className="text-sm text-muted-foreground">
            {renderSaveStatus(saveState, service.updated_at)}
          </span>
          {status === 'scheduled' && service.scheduled_for && (
            <span className="text-sm text-muted-foreground">
              Scheduled for{' '}
              {formatDateTime(service.scheduled_for, { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          )}
          {status === 'published' && service.published_at && (
            <span className="text-sm text-muted-foreground">
              Published{' '}
              {formatDateTime(service.published_at, { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="glow"
            size="sm"
            onClick={() => void flushDraft()}
            disabled={saveState === 'saved' || saveState === 'saving'}
          >
            {saveState === 'saving' ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6 min-w-0">
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="e.g. Brand identity & visual systems"
                className="h-12 text-xl font-semibold"
              />
            </div>
          </div>

          <TipTapEditor
            content={draft.description || ''}
            editorRef={editorRef}
            onUpdate={(_json, html) => setDraft((current) => ({ ...current, description: html }))}
          />
        </div>

        <EditorSidebar>
          <EditorSidebar.Block>
            <StatusVisibilityPanel
              status={status}
              displayDate={displayDate}
              scheduleFor={draft.scheduleFor}
              onScheduleForChange={(date) =>
                setDraft((current) => ({ ...current, scheduleFor: date }))
              }
              previewHref={previewHref}
              busyAction={busyAction}
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              onSchedule={handleSchedule}
            />
          </EditorSidebar.Block>

          <EditorSidebar.Section title="Tags">
            <TagPicker
              availableTags={loaderData.availableTags}
              value={draft.tags}
              onChange={(tags) => setDraft((current) => ({ ...current, tags }))}
              name="service-tags"
            />
          </EditorSidebar.Section>

          <EditorSidebar.Section title="SEO">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="seo-title">SEO title</Label>
                <Input
                  id="seo-title"
                  value={draft.seoTitle}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, seoTitle: event.target.value }))
                  }
                  placeholder="Optional search title override"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="seo-description">SEO description</Label>
                <Textarea
                  id="seo-description"
                  value={draft.seoDescription}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, seoDescription: event.target.value }))
                  }
                  rows={3}
                  placeholder="Short summary used for search results and social shares."
                />
              </div>
            </div>
          </EditorSidebar.Section>

          <EditorSidebar.Block>
            <FeaturedImageCard
              value={draft.imageUrl}
              onChange={(url) => setDraft((current) => ({ ...current, imageUrl: url }))}
            />
          </EditorSidebar.Block>
        </EditorSidebar>
      </div>

    </div>
  )
}

function renderSaveStatus(state: 'saved' | 'dirty' | 'saving' | 'error', updatedAt: string) {
  if (state === 'saving') return 'Saving...'
  if (state === 'dirty') return 'Unsaved changes'
  if (state === 'error') return 'Save failed'
  return `Saved at ${formatDateTime(updatedAt, { timeStyle: 'short' })}`
}
