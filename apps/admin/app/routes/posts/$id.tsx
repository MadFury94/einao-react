import {
  Badge,
  Button,
  Input,
  Label,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@einao/ui'
import { ClockArrowUp } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { AuthorPicker } from '../../components/author-picker'
import { AiAssistant } from '../../components/ai-assistant'
import { CategoryPicker } from '../../components/category-picker'
import { EditorSidebar } from '../../components/editor-sidebar'
import { FeaturedImageCard } from '../../components/featured-image-card'
import { PostStatusBadge } from '../../components/post-status-badge'
import { StatusVisibilityPanel } from '../../components/status-visibility-panel'
import { TagPicker } from '../../components/tag-picker'
import { TipTapEditor } from '../../components/tiptap-editor'
import { reconcileSavedDraft } from '../../lib/draft-reconcile'
import {
  EMPTY_POST_CONTENT,
  formatDateTime,
  getAdminPost,
  getAuthors,
  getBlogCategories,
  getTags,
  type Post,
  type PostMutationPayload,
  parseContentJson,
  publishAdminPost,
  scheduleAdminPost,
  slugify,
  type TagInfo,
  unpublishAdminPost,
  updateAdminPost,
} from '../../lib/posts'
import type { Route } from './+types/$id'

type JSONContent = {
  type: string
  content: JSONContent[]
  attrs: Record<string, unknown>
  text: string
  [key: string]: unknown
}

type EditorDraft = {
  title: string
  slug: string
  excerpt: string
  content: JSONContent
  contentHtml: string
  featuredImageUrl: string
  categoryIds: number[]
  tagNames: string[]
  authorId: number | null
  seoTitle: string
  seoDescription: string
  seoCanonicalUrl: string
  seoOgImageUrl: string
  scheduleFor: Date | undefined
  publishAt: Date | undefined
  postType: string
  subtitle: string
}

const CLIENT_ORIGIN = import.meta.env.VITE_CLIENT_URL ?? 'http://localhost:5930'

const POST_TYPE_LABELS: Record<string, string> = {
  blog: 'BLOG',
  industry: 'INDUSTRY CARD',
  case_study: 'CASE STUDY',
  testimonial: 'TESTIMONIAL',
}

const POST_TYPE_BADGE_COLORS: Record<string, string> = {
  blog: 'bg-blue-100 text-blue-700',
  industry: 'bg-purple-100 text-purple-700',
  case_study: 'bg-orange-100 text-orange-700',
  testimonial: 'bg-green-100 text-green-700',
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data.post ? `${data.post.title} - Admin` : 'Post editor - Admin' }]
}

export async function loader({ params }: Route.LoaderArgs) {
  if (!/^\d+$/.test(params.id ?? '')) {
    throw new Response('Invalid post id', { status: 400 })
  }

  try {
    const [post, categories, tags, authors] = await Promise.all([
      getAdminPost(params.id),
      getBlogCategories(),
      getTags(),
      getAuthors(),
    ])

    return { post, categories, tags, authors }
  } catch {
    throw new Response('Failed to load post editor', { status: 502 })
  }
}

export default function EditPost({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [availableTags, setAvailableTags] = useState<TagInfo[]>(loaderData.tags)
  const [draft, setDraft] = useState(() => createDraft(loaderData.post))
  const [status, setStatus] = useState(loaderData.post.status)
  const [publishedAt, setPublishedAt] = useState(loaderData.post.published_at)
  const [scheduledForServer, setScheduledForServer] = useState(loaderData.post.scheduled_for)
  const [updatedAt, setUpdatedAt] = useState(loaderData.post.updated_at)
  const [saveState, setSaveState] = useState<'saved' | 'dirty' | 'saving' | 'error'>('saved')
  const [busyAction, setBusyAction] = useState<'publish' | 'unpublish' | 'schedule' | null>(null)
  const [aiOpen, setAiOpen] = useState(false)
  const [slugTouched, setSlugTouched] = useState(Boolean(loaderData.post.slug))
  const editorRef = useRef<any>(null)

  const draftRef = useRef(draft)
  const savingRef = useRef(false)
  const savePromiseRef = useRef<Promise<void> | null>(null)
  const saveDraftRef = useRef<() => Promise<void>>(async () => {})
  const availableTagsRef = useRef(availableTags)
  const lastSavedSnapshotRef = useRef(serializeDraft(createDraft(loaderData.post)))

  // Stable key to detect when the server sends genuinely new data
  const _loaderKey = `${loaderData.post.id}:${loaderData.post.updated_at}`

  useEffect(() => {
    const nextDraft = createDraft(loaderData.post)
    setDraft(nextDraft)
    setStatus(loaderData.post.status)
    setPublishedAt(loaderData.post.published_at)
    setScheduledForServer(loaderData.post.scheduled_for)
    setUpdatedAt(loaderData.post.updated_at)
    setAvailableTags(loaderData.tags)
    setSlugTouched(Boolean(loaderData.post.slug))
    setSaveState('saved')
    lastSavedSnapshotRef.current = serializeDraft(nextDraft)
  }, [loaderData.post, loaderData.tags])

  useEffect(() => {
    draftRef.current = draft
  }, [draft])

  useEffect(() => {
    availableTagsRef.current = availableTags
  }, [availableTags])

  useEffect(() => {
    const created = searchParams.get('created') === '1'
    const restored = searchParams.get('restored') === '1'
    if (!created && !restored) return

    if (created) toast.success('Draft created')
    if (restored) toast.success('Revision restored')

    const next = new URLSearchParams(searchParams)
    next.delete('created')
    next.delete('restored')
    setSearchParams(next, { replace: true })
  }, [setSearchParams, searchParams.get, searchParams])

  async function resolveTagIds(names: string[]) {
    const lookup = new Map(availableTagsRef.current.map((tag) => [tag.name.toLowerCase(), tag.id]))
    const missing = names.filter((name) => !lookup.has(name.toLowerCase()))

    if (missing.length > 0) {
      const freshTags = await getTags()
      setAvailableTags(freshTags)
      for (const tag of freshTags) {
        lookup.set(tag.name.toLowerCase(), tag.id)
      }
    }

    return names
      .map((name) => lookup.get(name.toLowerCase()))
      .filter((id): id is number => typeof id === 'number')
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps - saveDraft reads from refs, not closure state
  const saveDraft = useCallback(async function saveDraft() {
    if (savePromiseRef.current) return savePromiseRef.current

    const currentDraft = draftRef.current
    const snapshot = serializeDraft(currentDraft)
    if (snapshot === lastSavedSnapshotRef.current) return

    const savePromise = (async () => {
      savingRef.current = true
      setSaveState('saving')

      try {
        const tagIds = await resolveTagIds(currentDraft.tagNames)
        const updated = await updateAdminPost(
          loaderData.post.id,
          buildPayload(currentDraft, tagIds)
        )

        const { savedSnapshot, nextDraft } = reconcileSavedDraft(currentDraft, draftRef.current, {
          slug: updated.slug,
          scheduled_for: updated.scheduled_for,
        })

        draftRef.current = nextDraft
        setDraft(nextDraft)
        setStatus(updated.status)
        setPublishedAt(updated.published_at)
        setScheduledForServer(updated.scheduled_for)
        setUpdatedAt(updated.updated_at)
        setAvailableTags((prev) => mergeTags(prev, updated.tags))
        lastSavedSnapshotRef.current = serializeDraft(savedSnapshot)
        setSaveState('saved')
        toast.success('Post saved')
      } catch (error) {
        setSaveState('error')
        toast.error('Could not save post', {
          description: error instanceof Error ? error.message : 'Request failed',
        })
        throw error
      } finally {
        savingRef.current = false
        savePromiseRef.current = null
        if (serializeDraft(draftRef.current) !== lastSavedSnapshotRef.current) {
          window.setTimeout(() => {
            void saveDraftRef.current()
          }, 0)
        }
      }
    })()

    savePromiseRef.current = savePromise
    return savePromise
  }, [loaderData.post.id])

  saveDraftRef.current = saveDraft

  useEffect(() => {
    const snapshot = serializeDraft(draft)
    if (snapshot === lastSavedSnapshotRef.current) return
    setSaveState('dirty')
  }, [draft, saveDraft])

  const previewHref = `${CLIENT_ORIGIN.replace(/\/$/, '')}/insights/${draft.slug || loaderData.post.slug}`

  const currentAuthor = loaderData.authors.find((author) => author.id === draft.authorId) ?? null

  async function flushDraft() {
    while (serializeDraft(draftRef.current) !== lastSavedSnapshotRef.current) {
      await saveDraft()
    }
  }

  async function handlePublish() {
    setBusyAction('publish')
    try {
      await flushDraft()
      const publishedAtIso = draft.publishAt ? draft.publishAt.toISOString() : undefined
      const updated = await publishAdminPost(loaderData.post.id, publishedAtIso)
      setStatus(updated.status)
      setPublishedAt(updated.published_at)
      setScheduledForServer(updated.scheduled_for)
      setUpdatedAt(updated.updated_at)
      const wasPublished = status === 'published'
      setDraft((current) => ({
        ...current,
        publishAt: publishedDateValue(updated.status, updated.published_at),
      }))
      toast.success(wasPublished ? 'Published date updated' : 'Post published')
    } catch (error) {
      toast.error('Could not publish post', {
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
      const updated = await unpublishAdminPost(loaderData.post.id)
      setStatus(updated.status)
      setPublishedAt(updated.published_at)
      setScheduledForServer(updated.scheduled_for)
      setUpdatedAt(updated.updated_at)
      toast.success('Post moved back to draft')
    } catch (error) {
      toast.error('Could not unpublish post', {
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
      const updated = await scheduleAdminPost(loaderData.post.id, draft.scheduleFor.toISOString())
      setStatus(updated.status)
      setScheduledForServer(updated.scheduled_for)
      setUpdatedAt(updated.updated_at)
      setDraft((current) => ({
        ...current,
        scheduleFor: updated.scheduled_for ? new Date(updated.scheduled_for) : undefined,
      }))
      toast.success('Post scheduled')
    } catch (error) {
      toast.error('Could not schedule post', {
        description: error instanceof Error ? error.message : 'Request failed',
      })
    } finally {
      setBusyAction(null)
    }
  }

  function _removeSearchParam(key: string) {
    const next = new URLSearchParams(searchParams)
    next.delete(key)
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="sticky top-12 sm:top-14 z-20 flex flex-col gap-3 sm:gap-4 rounded-xl border bg-card/95 p-3 sm:p-4 shadow-sm backdrop-blur supports-backdrop-filter:bg-card/80 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1">
          <PostStatusBadge status={status} />
          <Badge
            variant="secondary"
            className={`text-[10px] font-semibold tracking-wide ${POST_TYPE_BADGE_COLORS[draft.postType] ?? ''}`}
          >
            {POST_TYPE_LABELS[draft.postType] ?? draft.postType.toUpperCase()}
          </Badge>
          <span className="text-xs sm:text-sm text-muted-foreground">
            {renderSaveStatus(saveState, updatedAt)}
          </span>
          {draft.slug && (
            <span className="hidden sm:inline font-mono text-xs text-muted-foreground">/{draft.slug}</span>
          )}
          {currentAuthor && (
            <span className="hidden sm:inline text-xs text-muted-foreground">by {currentAuthor.name}</span>
          )}
          {status === 'scheduled' && scheduledForServer && (
            <span className="hidden sm:inline text-sm text-muted-foreground">
              Scheduled for{' '}
              {formatDateTime(scheduledForServer, { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          )}
          {status === 'published' && publishedAt && (
            <span className="hidden sm:inline text-sm text-muted-foreground">
              Published {formatDateTime(publishedAt, { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {draft.postType === 'blog' && (
            <Button variant="outline" size="sm" onClick={() => setAiOpen(true)}>
              AI assistant
            </Button>
          )}
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

      <AiAssistant
        open={aiOpen}
        onOpenChange={setAiOpen}
        postTitle={draft.title}
        postContent={draft.contentHtml}
        onInsertContent={(html) => {
          const editor = editorRef.current
          if (editor?.commands?.setContent) {
            editor.commands.setContent(html)
            setDraft((current) => ({ ...current, contentHtml: html }))
            setSaveState('dirty')
          }
        }}
        onSelectTitle={(title) => {
          setDraft((current) => ({ ...current, title, slug: slugTouched ? current.slug : slugify(title) }))
          setSaveState('dirty')
        }}
        onApplySeo={(seoTitle, seoDescription) => {
          setDraft((current) => ({ ...current, seoTitle, seoDescription }))
          setSaveState('dirty')
        }}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6 min-w-0">
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={draft.title}
                onChange={(event) => {
                  const title = event.target.value
                  setDraft((current) => ({
                    ...current,
                    title,
                    slug: slugTouched ? current.slug : slugify(title),
                  }))
                }}
                placeholder="How we built the Einao admin blog"
                className="h-12 text-xl font-semibold"
              />
            </div>
            {draft.postType !== 'blog' && (
              <div className="grid gap-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={draft.subtitle}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, subtitle: event.target.value }))
                  }
                  placeholder="A short tagline or subtitle"
                />
              </div>
            )}
          </div>

          {draft.postType === 'blog' ? (
            <TipTapEditor
              content={draft.content || EMPTY_POST_CONTENT}
              editorRef={editorRef}
              onUpdate={(content, html) => {
                setDraft((current) => ({ ...current, content, contentHtml: html }))
              }}
            />
          ) : (
            <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
              <div className="grid gap-2">
                <Label htmlFor="excerpt-simple">Description</Label>
                <Textarea
                  id="excerpt-simple"
                  value={draft.excerpt}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, excerpt: event.target.value }))
                  }
                  placeholder="A brief description for this entry."
                  rows={5}
                />
              </div>
            </div>
          )}
        </div>

        <EditorSidebar>
          <EditorSidebar.Block>
            <StatusVisibilityPanel
              status={status}
              displayDate={status === 'scheduled' ? scheduledForServer : publishedAt}
              scheduleFor={draft.scheduleFor}
              onScheduleForChange={(date) =>
                setDraft((current) => ({ ...current, scheduleFor: date }))
              }
              publishAt={draft.publishAt}
              onPublishAtChange={(date) =>
                setDraft((current) => ({ ...current, publishAt: date }))
              }
              previewHref={previewHref}
              busyAction={busyAction}
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              onSchedule={handleSchedule}
              extraActions={
                draft.postType === 'blog' ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={`/posts/${loaderData.post.id}/revisions`}
                        aria-label="Revisions"
                        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <ClockArrowUp className="size-4" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="top">Revisions</TooltipContent>
                  </Tooltip>
                ) : undefined
              }
            />
          </EditorSidebar.Block>

          {draft.postType === 'blog' && (
            <EditorSidebar.Section title="Author">
              <AuthorPicker
                authors={loaderData.authors}
                value={draft.authorId}
                onChange={(authorId) => setDraft((d) => ({ ...d, authorId }))}
              />
            </EditorSidebar.Section>
          )}

          <EditorSidebar.Section title="Slug">
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Customize the last part of the permalink. The server appends a suffix (
                <code>-2</code>, <code>-3</code>) if the slug is already taken.
              </p>
              <div className="flex items-center rounded-md border bg-background pl-2 focus-within:ring-1 focus-within:ring-ring">
                <span className="text-sm text-muted-foreground">/</span>
                <input
                  id="slug"
                  type="text"
                  value={draft.slug}
                  onChange={(event) => {
                    setSlugTouched(true)
                    setDraft((current) => ({
                      ...current,
                      slug: slugify(event.target.value),
                    }))
                  }}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  placeholder="how-we-built-the-einao-admin-blog"
                  className="h-9 flex-1 bg-transparent px-1 text-sm outline-none"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Permalink</p>
                <a
                  href={previewHref}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-xs text-primary underline-offset-2 hover:underline"
                >
                  {previewHref}
                </a>
              </div>
            </div>
          </EditorSidebar.Section>

          <EditorSidebar.Section title="Categories">
            <CategoryPicker
              availableCategories={loaderData.categories}
              value={draft.categoryIds}
              onChange={(ids) => setDraft((current) => ({ ...current, categoryIds: ids }))}
            />
          </EditorSidebar.Section>

          <EditorSidebar.Section title="Tags">
            <TagPicker
              availableTags={availableTags.map((tag) => tag.name)}
              value={draft.tagNames}
              onChange={(tagNames) => setDraft((current) => ({ ...current, tagNames }))}
              onTagCreated={(tag) =>
                setAvailableTags((current) =>
                  current.some((item) => item.name.toLowerCase() === tag.name.toLowerCase())
                    ? current
                    : [...current, { id: tag.id ?? -1, name: tag.name, created_at: tag.created_at }]
                )
              }
              name="post-tags"
            />
          </EditorSidebar.Section>

          {draft.postType === 'blog' && (
            <EditorSidebar.Section title="Excerpt">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Write an excerpt (optional)
                </p>
                <Textarea
                  id="excerpt"
                  value={draft.excerpt}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, excerpt: event.target.value }))
                  }
                  placeholder="Short summary shown in blog listings and search results."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to auto-generate from the first paragraph.
                </p>
              </div>
            </EditorSidebar.Section>
          )}

          {draft.postType === 'blog' && (
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
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="seo-canonical">Canonical URL</Label>
                  <Input
                    id="seo-canonical"
                    value={draft.seoCanonicalUrl}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, seoCanonicalUrl: event.target.value }))
                    }
                    placeholder="https://einaosolutions.com/"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="seo-og">OG image URL</Label>
                  <Input
                    id="seo-og"
                    value={draft.seoOgImageUrl}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, seoOgImageUrl: event.target.value }))
                    }
                    placeholder="https://einaosolutions.com/assets/seo/social-card.jpg"
                  />
                </div>
              </div>
            </EditorSidebar.Section>
          )}

          <EditorSidebar.Block>
            <FeaturedImageCard
              value={draft.featuredImageUrl}
              onChange={(url) => setDraft((current) => ({ ...current, featuredImageUrl: url }))}
            />
          </EditorSidebar.Block>
        </EditorSidebar>
      </div>

    </div>
  )
}

function publishedDateValue(status: string, publishedAt: string | null): Date | undefined {
  return status === 'published' && publishedAt ? new Date(publishedAt) : undefined
}

function createDraft(post: Post): EditorDraft {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: parseContentJson(post.content_json, post.content_html),
    contentHtml: post.content_html,
    featuredImageUrl: post.featured_image_url,
    categoryIds: post.categories.map((category) => category.id),
    tagNames: post.tags.map((tag) => tag.name),
    authorId: post.author.id ?? null,
    seoTitle: post.seo_title,
    seoDescription: post.seo_description,
    seoCanonicalUrl: post.seo_canonical_url,
    seoOgImageUrl: post.seo_og_image_url,
    scheduleFor: post.scheduled_for ? new Date(post.scheduled_for) : undefined,
    publishAt: publishedDateValue(post.status, post.published_at),
    postType: post.post_type ?? 'blog',
    subtitle: post.subtitle ?? '',
  }
}

function serializeDraft(draft: EditorDraft) {
  return JSON.stringify(draft)
}

function buildPayload(draft: EditorDraft, tagIds: number[]): PostMutationPayload {
  return {
    title: draft.title,
    slug: draft.slug,
    excerpt: draft.excerpt,
    content_json: JSON.stringify(draft.content || EMPTY_POST_CONTENT),
    content_html: draft.contentHtml,
    featured_image_url: draft.featuredImageUrl,
    category_ids: draft.categoryIds,
    tag_ids: tagIds,
    author_id: draft.authorId,
    seo_title: draft.seoTitle,
    seo_description: draft.seoDescription,
    seo_canonical_url: draft.seoCanonicalUrl,
    seo_og_image_url: draft.seoOgImageUrl,
    post_type: draft.postType,
    subtitle: draft.subtitle,
  }
}

function mergeTags(current: TagInfo[], incoming: TagInfo[]) {
  const byName = new Map(current.map((tag) => [tag.name.toLowerCase(), tag]))
  for (const tag of incoming) {
    byName.set(tag.name.toLowerCase(), tag)
  }
  return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name))
}

function renderSaveStatus(state: 'saved' | 'dirty' | 'saving' | 'error', updatedAt: string) {
  if (state === 'saving') return 'Saving...'
  if (state === 'dirty') return 'Unsaved changes'
  if (state === 'error') return 'Save failed'
  return `Saved at ${formatDateTime(updatedAt, { timeStyle: 'short' })}`
}

