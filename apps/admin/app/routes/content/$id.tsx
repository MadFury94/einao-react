import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@einao/ui'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { CategoryPicker } from '../../components/category-picker'
import { EditorSidebar } from '../../components/editor-sidebar'
import { FeaturedImageCard } from '../../components/featured-image-card'
import { PostStatusBadge } from '../../components/post-status-badge'
import { StatusVisibilityPanel } from '../../components/status-visibility-panel'
import { TagPicker } from '../../components/tag-picker'
import {
  type GenericPost,
  type GenericPostMutationPayload,
  getAdminGenericPost,
  POST_TYPE_BADGE_COLORS,
  POST_TYPE_LABELS,
  publishAdminGenericPost,
  unpublishAdminGenericPost,
  updateAdminGenericPost,
} from '../../lib/generic-posts'
import {
  formatDateTime,
  getAdminPosts,
  getBlogCategories,
  getTags,
  type TagInfo,
} from '../../lib/posts'
import type { Route } from './+types/$id'

type EditorDraft = {
  title: string
  slug: string
  subtitle: string
  excerpt: string
  featuredImageUrl: string
  linkUrl: string
  linkPostId: number | null
  categoryIds: number[]
  tagNames: string[]
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.post ? `${data.post.title} ... Admin` : 'Content editor ... Admin' }]
}

export async function loader({ params }: Route.LoaderArgs) {
  if (!/^\d+$/.test(params.id ?? '')) {
    throw new Response('Invalid id', { status: 400 })
  }

  try {
    const [post, categories, tags, blogPosts] = await Promise.all([
      getAdminGenericPost(params.id),
      getBlogCategories(),
      getTags(),
      getAdminPosts({ status: 'published', pageSize: 100 }),
    ])
    return { post, categories, tags, blogPosts: blogPosts.items }
  } catch {
    throw new Response('Failed to load content editor', { status: 502 })
  }
}

export default function EditContent({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [availableTags, setAvailableTags] = useState<TagInfo[]>(loaderData.tags)
  const [draft, setDraft] = useState(() => createDraft(loaderData.post))
  const [status, setStatus] = useState(loaderData.post.status)
  const [publishedAt, setPublishedAt] = useState(loaderData.post.published_at)
  const [updatedAt, setUpdatedAt] = useState(loaderData.post.updated_at)
  const [saveState, setSaveState] = useState<'saved' | 'dirty' | 'saving' | 'error'>('saved')
  const [busyAction, setBusyAction] = useState<'publish' | 'unpublish' | null>(null)

  const draftRef = useRef(draft)
  const savingRef = useRef(false)
  const savePromiseRef = useRef<Promise<void> | null>(null)
  const availableTagsRef = useRef(availableTags)
  const lastSavedSnapshotRef = useRef(JSON.stringify(createDraft(loaderData.post)))

  useEffect(() => {
    const nextDraft = createDraft(loaderData.post)
    setDraft(nextDraft)
    setStatus(loaderData.post.status)
    setPublishedAt(loaderData.post.published_at)
    setUpdatedAt(loaderData.post.updated_at)
    setAvailableTags(loaderData.tags)
    setSaveState('saved')
    lastSavedSnapshotRef.current = JSON.stringify(nextDraft)
  }, [loaderData.post, loaderData.tags])

  useEffect(() => {
    draftRef.current = draft
  }, [draft])
  useEffect(() => {
    availableTagsRef.current = availableTags
  }, [availableTags])

  useEffect(() => {
    const created = searchParams.get('created') === '1'
    if (!created) return
    toast.success('Draft created')
    const next = new URLSearchParams(searchParams)
    next.delete('created')
    setSearchParams(next, { replace: true })
  }, [setSearchParams, searchParams])

  const saveDraftRef = useRef(saveDraft)
  useEffect(() => {
    saveDraftRef.current = saveDraft
  })

  useEffect(() => {
    const snapshot = JSON.stringify(draft)
    if (snapshot === lastSavedSnapshotRef.current) return
    setSaveState('dirty')
    const timeoutId = window.setTimeout(() => {
      void saveDraftRef.current()
    }, 1500)
    return () => window.clearTimeout(timeoutId)
  }, [draft])

  async function resolveTagIds(names: string[]) {
    const lookup = new Map(availableTagsRef.current.map((t) => [t.name.toLowerCase(), t.id]))
    const missing = names.filter((n) => !lookup.has(n.toLowerCase()))
    if (missing.length > 0) {
      const freshTags = await getTags()
      setAvailableTags(freshTags)
      for (const tag of freshTags) lookup.set(tag.name.toLowerCase(), tag.id)
    }
    return names
      .map((n) => lookup.get(n.toLowerCase()))
      .filter((id): id is number => typeof id === 'number')
  }

  async function saveDraft() {
    if (savePromiseRef.current) return savePromiseRef.current

    const currentDraft = draftRef.current
    const snapshot = JSON.stringify(currentDraft)
    if (snapshot === lastSavedSnapshotRef.current) return

    const savePromise = (async () => {
      savingRef.current = true
      setSaveState('saving')
      try {
        const tagIds = await resolveTagIds(currentDraft.tagNames)
        const updated = await updateAdminGenericPost(
          loaderData.post.id,
          buildPayload(currentDraft, tagIds)
        )
        setStatus(updated.status)
        setPublishedAt(updated.published_at)
        setUpdatedAt(updated.updated_at)
        setAvailableTags((prev) => mergeTags(prev, updated.tags))
        lastSavedSnapshotRef.current = JSON.stringify(createDraft(updated))
        draftRef.current = createDraft(updated)
        setDraft(createDraft(updated))
        setSaveState('saved')
      } catch (error) {
        setSaveState('error')
        toast.error('Could not save', {
          description: error instanceof Error ? error.message : 'Request failed',
        })
        throw error
      } finally {
        savingRef.current = false
        savePromiseRef.current = null
        if (JSON.stringify(draftRef.current) !== lastSavedSnapshotRef.current) {
          window.setTimeout(() => {
            void saveDraft()
          }, 0)
        }
      }
    })()

    savePromiseRef.current = savePromise
    return savePromise
  }

  async function flushDraft() {
    while (JSON.stringify(draftRef.current) !== lastSavedSnapshotRef.current) {
      await saveDraft()
    }
  }

  async function handlePublish() {
    setBusyAction('publish')
    try {
      await flushDraft()
      const updated = await publishAdminGenericPost(loaderData.post.id)
      setStatus(updated.status)
      setPublishedAt(updated.published_at)
      setUpdatedAt(updated.updated_at)
      toast.success('Published')
    } catch (error) {
      toast.error('Could not publish', {
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
      const updated = await unpublishAdminGenericPost(loaderData.post.id)
      setStatus(updated.status)
      setPublishedAt(updated.published_at)
      setUpdatedAt(updated.updated_at)
      toast.success('Moved back to draft')
    } catch (error) {
      toast.error('Could not unpublish', {
        description: error instanceof Error ? error.message : 'Request failed',
      })
    } finally {
      setBusyAction(null)
    }
  }

  const postType = loaderData.post.post_type

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="sticky top-14 z-20 flex flex-col gap-4 rounded-xl border bg-card/95 p-4 shadow-sm backdrop-blur supports-backdrop-filter:bg-card/80 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <PostStatusBadge status={status} />
          <Badge
            variant="secondary"
            className={`text-[10px] font-semibold tracking-wide ${POST_TYPE_BADGE_COLORS[postType] ?? ''}`}
          >
            {POST_TYPE_LABELS[postType] ?? postType.toUpperCase()}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {renderSaveStatus(saveState, updatedAt)}
          </span>
          {status === 'published' && publishedAt && (
            <span className="text-sm text-muted-foreground">
              Published {formatDateTime(publishedAt, { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
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
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="Enter a title"
                className="h-12 text-xl font-semibold"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={draft.subtitle}
                onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
                placeholder="A short tagline"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <div className="grid gap-2">
              <Label htmlFor="excerpt">Description</Label>
              <Textarea
                id="excerpt"
                value={draft.excerpt}
                onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
                placeholder="A brief description for this entry."
                rows={5}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <div className="grid gap-2">
              <Label>Link</Label>
              <p className="text-xs text-muted-foreground">
                Optionally link this card to a blog post or external URL.
              </p>
              <Select
                value={draft.linkPostId ? String(draft.linkPostId) : '__none__'}
                onValueChange={(value) => {
                  if (value === '__none__') {
                    setDraft((d) => ({ ...d, linkPostId: null }))
                  } else {
                    setDraft((d) => ({ ...d, linkPostId: Number(value), linkUrl: '' }))
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Link to a blog post..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None (use external URL)</SelectItem>
                  {loaderData.blogPosts.map((bp) => (
                    <SelectItem key={bp.id} value={String(bp.id)}>
                      {bp.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!draft.linkPostId && (
              <div className="grid gap-2">
                <Label htmlFor="link_url">External URL</Label>
                <Input
                  id="link_url"
                  type="url"
                  value={draft.linkUrl}
                  onChange={(e) => setDraft((d) => ({ ...d, linkUrl: e.target.value }))}
                  placeholder="https://example.com/article"
                />
              </div>
            )}
            {draft.linkPostId && (
              <p className="text-xs text-muted-foreground">
                Card will link to:{' '}
                <span className="font-medium">
                  /blog/{loaderData.blogPosts.find((bp) => bp.id === draft.linkPostId)?.slug ?? '...'}
                </span>
              </p>
            )}
          </div>
        </div>

        <EditorSidebar>
          <EditorSidebar.Block>
            <StatusVisibilityPanel
              status={status}
              displayDate={publishedAt}
              scheduleFor={undefined}
              onScheduleForChange={() => {}}
              busyAction={busyAction}
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              onSchedule={() => {}}
            />
          </EditorSidebar.Block>

          <EditorSidebar.Section title="Categories">
            <CategoryPicker
              availableCategories={loaderData.categories}
              value={draft.categoryIds}
              onChange={(ids) => setDraft((d) => ({ ...d, categoryIds: ids }))}
            />
          </EditorSidebar.Section>

          <EditorSidebar.Section title="Tags">
            <TagPicker
              availableTags={availableTags.map((t) => t.name)}
              value={draft.tagNames}
              onChange={(tagNames) => setDraft((d) => ({ ...d, tagNames }))}
              onTagCreated={(tag) =>
                setAvailableTags((current) =>
                  current.some((item) => item.name.toLowerCase() === tag.name.toLowerCase())
                    ? current
                    : [...current, { id: tag.id ?? -1, name: tag.name, created_at: tag.created_at }]
                )
              }
              name="content-tags"
            />
          </EditorSidebar.Section>

          <EditorSidebar.Block>
            <FeaturedImageCard
              value={draft.featuredImageUrl}
              onChange={(url) => setDraft((d) => ({ ...d, featuredImageUrl: url }))}
            />
          </EditorSidebar.Block>
        </EditorSidebar>
      </div>
    </div>
  )
}

function createDraft(post: GenericPost): EditorDraft {
  return {
    title: post.title,
    slug: post.slug,
    subtitle: post.subtitle,
    excerpt: post.excerpt,
    featuredImageUrl: post.featured_image_url,
    linkUrl: post.link_url,
    linkPostId: post.link_post?.id ?? null,
    categoryIds: post.categories.map((c) => c.id),
    tagNames: post.tags.map((t) => t.name),
  }
}

function buildPayload(draft: EditorDraft, tagIds: number[]): GenericPostMutationPayload {
  return {
    title: draft.title,
    slug: draft.slug,
    subtitle: draft.subtitle,
    excerpt: draft.excerpt,
    featured_image_url: draft.featuredImageUrl,
    link_url: draft.linkUrl,
    link_post_id: draft.linkPostId,
    category_ids: draft.categoryIds,
    tag_ids: tagIds,
  }
}

function mergeTags(current: TagInfo[], incoming: TagInfo[]) {
  const byName = new Map(current.map((t) => [t.name.toLowerCase(), t]))
  for (const tag of incoming) byName.set(tag.name.toLowerCase(), tag)
  return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name))
}

function renderSaveStatus(state: 'saved' | 'dirty' | 'saving' | 'error', updatedAt: string) {
  if (state === 'saving') return 'Saving...'
  if (state === 'dirty') return 'Unsaved changes'
  if (state === 'error') return 'Save failed'
  return `Saved at ${formatDateTime(updatedAt, { timeStyle: 'short' })}`
}
