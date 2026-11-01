import {
  getApiV1ProjectsBySlug,
  getApiV1Tags,
  type Project,
  putApiV1AdminProjectsBySlug,
} from '@einao/api-client'
import { Button, Input, Label, Switch, Textarea } from '@einao/ui'
import { ImagePlus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { EditorSidebar } from '../../components/editor-sidebar'
import { FeaturedImageCard } from '../../components/featured-image-card'
import { MediaPicker } from '../../components/media-picker'
import { TagPicker } from '../../components/tag-picker'
import { TipTapEditor } from '../../components/tiptap-editor'
import '../../lib/api'
import { formatDateTime } from '../../lib/posts'
import type { Route } from './+types/$slug'

type Draft = {
  name: string
  slug: string
  description: string
  imageUrl: string
  linkUrl: string
  isFeatured: boolean
  tags: string[]
  seoTitle: string
  seoDescription: string
  // Game fields
  genre: string
  platform: string
  status: string
  statusLabel: string
  features: string[]
  stats: Array<{ num: string; label: string }>
  primaryActionLabel: string
  primaryActionHref: string
  secondaryActionLabel: string
  secondaryActionHref: string
  heroBg: string
  heroSvgFill: string
  heroBadges: string[]
  heroVideoSrc: string
  heroImageSrc: string
  heroComingSoon: boolean
  titlePre: string
  titleAccent: string
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.project ? `${data.project.name} ... Games ... Admin` : 'Game ... Admin' }]
}

export async function loader({ params }: Route.LoaderArgs) {
  const slug = params.slug
  if (!slug) throw new Response('Invalid slug', { status: 400 })
  const [projectRes, tagsRes] = await Promise.all([
    getApiV1ProjectsBySlug({ path: { slug } }),
    getApiV1Tags(),
  ])
  if (projectRes.error || !projectRes.data) throw new Response('Project not found', { status: 404 })
  const availableTags = (tagsRes.data ?? []).map((t) => t.name)
  return { project: projectRes.data as Project, availableTags }
}

function createDraft(project: Project): Draft {
  return {
    name: project.name,
    slug: project.slug,
    description: (project as unknown as { description: string }).description ?? '',
    imageUrl: project.main_image_url,
    linkUrl: project.link_url,
    isFeatured: project.is_featured,
    tags: project.tags,
    seoTitle: '',
    seoDescription: '',
    genre: project.genre ?? '',
    platform: project.platform ?? '',
    status: project.status ?? 'live',
    statusLabel: project.status_label ?? '',
    features: project.features ?? [],
    stats: project.stats ?? [],
    primaryActionLabel: project.primary_action_label ?? '',
    primaryActionHref: project.primary_action_href ?? '',
    secondaryActionLabel: project.secondary_action_label ?? '',
    secondaryActionHref: project.secondary_action_href ?? '',
    heroBg: project.hero_bg ?? '',
    heroSvgFill: project.hero_svg_fill ?? '',
    heroBadges: project.hero_badges ?? [],
    heroVideoSrc: project.hero_video_src ?? '',
    heroImageSrc: project.hero_image_src ?? '',
    heroComingSoon: project.hero_coming_soon ?? false,
    titlePre: project.title_pre ?? '',
    titleAccent: project.title_accent ?? '',
  }
}

function serializeDraft(draft: Draft) {
  return JSON.stringify(draft)
}

export default function EditProject({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [project, setProject] = useState(loaderData.project)
  const [draft, setDraft] = useState(() => createDraft(loaderData.project))
  const [saveState, setSaveState] = useState<'saved' | 'dirty' | 'saving' | 'error'>('saved')
  const [heroImagePickerOpen, setHeroImagePickerOpen] = useState(false)

  const draftRef = useRef(draft)
  const projectRef = useRef(project)
  const savePromiseRef = useRef<Promise<void> | null>(null)
  const lastSavedSnapshotRef = useRef(serializeDraft(createDraft(loaderData.project)))
  // biome-ignore lint/suspicious/noExplicitAny: TipTap editor type lives outside our type graph
  const editorRef = useRef<any>(null)

  useEffect(() => {
    draftRef.current = draft
  }, [draft])

  useEffect(() => {
    projectRef.current = project
  }, [project])

  // Reset when loader reports a new project version.
  const loaderKey = `${loaderData.project.slug}:${loaderData.project.updated_at}`
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on loader version
  useEffect(() => {
    const nextDraft = createDraft(loaderData.project)
    setProject(loaderData.project)
    setDraft(nextDraft)
    setSaveState('saved')
    lastSavedSnapshotRef.current = serializeDraft(nextDraft)
  }, [loaderKey])

  // One-shot "created" toast from /projects/new redirect.
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    if (searchParams.get('created') !== '1') return
    toast.success('Game created', {
      description: 'Now you can add a description and images.',
    })
    const next = new URLSearchParams(searchParams)
    next.delete('created')
    setSearchParams(next, { replace: true })
  }, [])

  // Track dirty state (no autosave).
  // biome-ignore lint/correctness/useExhaustiveDependencies: saveDraft is stable via refs
  useEffect(() => {
    const snapshot = serializeDraft(draft)
    if (snapshot === lastSavedSnapshotRef.current) return
    setSaveState('dirty')
  }, [draft])

  async function saveDraft() {
    if (savePromiseRef.current) return savePromiseRef.current
    const current = draftRef.current
    const snapshot = serializeDraft(current)
    if (snapshot === lastSavedSnapshotRef.current) return

    const promise = (async () => {
      setSaveState('saving')
      try {
        const { data, error } = await putApiV1AdminProjectsBySlug({
          path: { slug: projectRef.current.slug },
          body: {
            name: current.name,
            slug: current.slug,
            description: current.description,
            main_image_url: current.imageUrl || undefined,
            link_url: current.linkUrl,
            is_featured: current.isFeatured,
            tags: current.tags,
            genre: current.genre,
            platform: current.platform,
            status: current.status,
            status_label: current.statusLabel,
            features: current.features,
            stats: current.stats,
            primary_action_label: current.primaryActionLabel,
            primary_action_href: current.primaryActionHref,
            secondary_action_label: current.secondaryActionLabel,
            secondary_action_href: current.secondaryActionHref,
            hero_bg: current.heroBg,
            hero_svg_fill: current.heroSvgFill,
            hero_badges: current.heroBadges,
            hero_video_src: current.heroVideoSrc,
            hero_image_src: current.heroImageSrc,
            hero_coming_soon: current.heroComingSoon,
            title_pre: current.titlePre,
            title_accent: current.titleAccent,
          },
        })
        if (error) throw new Error(typeof error === 'string' ? error : 'Save failed')
        if (data) setProject(data as Project)
        lastSavedSnapshotRef.current = snapshot
        setSaveState('saved')
        toast.success('Game saved')
      } catch (error) {
        setSaveState('error')
        toast.error('Could not save game', {
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

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="sticky top-14 z-20 flex flex-col gap-4 rounded-xl border bg-card/95 p-4 shadow-sm backdrop-blur supports-backdrop-filter:bg-card/80 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Link
            to="/projects"
            className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            ... Games
          </Link>
          <span className="text-sm text-muted-foreground">
            {renderSaveStatus(saveState, project.updated_at)}
          </span>
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
                placeholder="e.g. Brand Redesign for Acme Corp"
                className="h-12 text-xl font-semibold"
              />
            </div>
          </div>

          <TipTapEditor
            content={loaderData.project.description ?? ''}
            editorRef={editorRef}
            onUpdate={(_json, html) => setDraft((current) => ({ ...current, description: html }))}
          />

          {/* Game Details */}
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Game Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  value={draft.genre}
                  onChange={(e) => setDraft((c) => ({ ...c, genre: e.target.value }))}
                  placeholder="e.g. Rhythm Platformer"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="platform">Platform</Label>
                <Input
                  id="platform"
                  value={draft.platform}
                  onChange={(e) => setDraft((c) => ({ ...c, platform: e.target.value }))}
                  placeholder="e.g. Steam ... PC"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={draft.status}
                  onChange={(e) => setDraft((c) => ({ ...c, status: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="live">Live</option>
                  <option value="prototype">Prototype</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="statusLabel">Status Label</Label>
                <Input
                  id="statusLabel"
                  value={draft.statusLabel}
                  onChange={(e) => setDraft((c) => ({ ...c, statusLabel: e.target.value }))}
                  placeholder="e.g. On Steam - Wishlist Now"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="titlePre">Title Prefix</Label>
                <Input
                  id="titlePre"
                  value={draft.titlePre}
                  onChange={(e) => setDraft((c) => ({ ...c, titlePre: e.target.value }))}
                  placeholder="e.g. Drone"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="titleAccent">Title Accent</Label>
                <Input
                  id="titleAccent"
                  value={draft.titleAccent}
                  onChange={(e) => setDraft((c) => ({ ...c, titleAccent: e.target.value }))}
                  placeholder="e.g. Defiance"
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Features</h3>
            <div className="space-y-2">
              {draft.features.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={f}
                    onChange={(e) => {
                      const next = [...draft.features]
                      next[i] = e.target.value
                      setDraft((c) => ({ ...c, features: next }))
                    }}
                    placeholder={`Feature ${i + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDraft((c) => ({ ...c, features: c.features.filter((_, idx) => idx !== i) }))}
                  >
                    ...
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDraft((c) => ({ ...c, features: [...c.features, ''] }))}
              >
                + Add Feature
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Stats</h3>
            <div className="space-y-2">
              {draft.stats.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={s.num}
                    onChange={(e) => {
                      const next = [...draft.stats]
                      next[i] = { ...next[i], num: e.target.value }
                      setDraft((c) => ({ ...c, stats: next }))
                    }}
                    placeholder="Number"
                    className="w-24"
                  />
                  <Input
                    value={s.label}
                    onChange={(e) => {
                      const next = [...draft.stats]
                      next[i] = { ...next[i], label: e.target.value }
                      setDraft((c) => ({ ...c, stats: next }))
                    }}
                    placeholder="Label"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDraft((c) => ({ ...c, stats: c.stats.filter((_, idx) => idx !== i) }))}
                  >
                    ...
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDraft((c) => ({ ...c, stats: [...c.stats, { num: '', label: '' }] }))}
              >
                + Add Stat
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Action Buttons</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="primaryActionLabel">Primary Label</Label>
                <Input
                  id="primaryActionLabel"
                  value={draft.primaryActionLabel}
                  onChange={(e) => setDraft((c) => ({ ...c, primaryActionLabel: e.target.value }))}
                  placeholder="e.g. Add to Wishlist"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="primaryActionHref">Primary URL</Label>
                <Input
                  id="primaryActionHref"
                  value={draft.primaryActionHref}
                  onChange={(e) => setDraft((c) => ({ ...c, primaryActionHref: e.target.value }))}
                  placeholder="https://store.steampowered.com/..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="secondaryActionLabel">Secondary Label</Label>
                <Input
                  id="secondaryActionLabel"
                  value={draft.secondaryActionLabel}
                  onChange={(e) => setDraft((c) => ({ ...c, secondaryActionLabel: e.target.value }))}
                  placeholder="e.g. View on Steam"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="secondaryActionHref">Secondary URL</Label>
                <Input
                  id="secondaryActionHref"
                  value={draft.secondaryActionHref}
                  onChange={(e) => setDraft((c) => ({ ...c, secondaryActionHref: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Hero Slide */}
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Hero Slide</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="heroBg">Background CSS</Label>
                <Input
                  id="heroBg"
                  value={draft.heroBg}
                  onChange={(e) => setDraft((c) => ({ ...c, heroBg: e.target.value }))}
                  placeholder="linear-gradient(135deg, ...)"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="heroSvgFill">SVG Fill</Label>
                <Input
                  id="heroSvgFill"
                  value={draft.heroSvgFill}
                  onChange={(e) => setDraft((c) => ({ ...c, heroSvgFill: e.target.value }))}
                  placeholder="%23100a1e"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="heroVideoSrc">Video Source</Label>
                <Input
                  id="heroVideoSrc"
                  value={draft.heroVideoSrc}
                  onChange={(e) => setDraft((c) => ({ ...c, heroVideoSrc: e.target.value }))}
                  placeholder="/meowsic-hero.webm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="heroImageSrc">Image Source</Label>
                <div className="flex gap-2">
                  <Input
                    id="heroImageSrc"
                    value={draft.heroImageSrc}
                    onChange={(e) => setDraft((c) => ({ ...c, heroImageSrc: e.target.value }))}
                    placeholder="/drone.jpg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setHeroImagePickerOpen(true)}
                  >
                    <ImagePlus className="size-4" />
                    Browse
                  </Button>
                </div>
                {draft.heroImageSrc && (
                  <img
                    src={draft.heroImageSrc}
                    alt="Hero preview"
                    className="mt-1 aspect-video w-full rounded-lg border object-cover"
                  />
                )}
                <MediaPicker
                  open={heroImagePickerOpen}
                  onOpenChange={setHeroImagePickerOpen}
                  onSelect={(url) => setDraft((c) => ({ ...c, heroImageSrc: url }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="heroComingSoon" className="text-sm">Coming Soon Badge</Label>
              <Switch
                id="heroComingSoon"
                checked={draft.heroComingSoon}
                onCheckedChange={(checked) => setDraft((c) => ({ ...c, heroComingSoon: checked }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Hero Badges</Label>
              <div className="space-y-2">
                {draft.heroBadges.map((b, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={b}
                      onChange={(e) => {
                        const next = [...draft.heroBadges]
                        next[i] = e.target.value
                        setDraft((c) => ({ ...c, heroBadges: next }))
                      }}
                      placeholder={`Badge ${i + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDraft((c) => ({ ...c, heroBadges: c.heroBadges.filter((_, idx) => idx !== i) }))}
                    >
                      ...
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDraft((c) => ({ ...c, heroBadges: [...c.heroBadges, ''] }))}
                >
                  + Add Badge
                </Button>
              </div>
            </div>
          </div>
        </div>

        <EditorSidebar>
          <EditorSidebar.Section title="Details">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={draft.slug}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, slug: event.target.value }))
                  }
                  className="font-mono text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="link_url">External Link</Label>
                <Input
                  id="link_url"
                  type="url"
                  value={draft.linkUrl}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, linkUrl: event.target.value }))
                  }
                  placeholder="https://example.com/project"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_featured" className="text-sm">
                  Featured game
                </Label>
                <Switch
                  id="is_featured"
                  checked={draft.isFeatured}
                  onCheckedChange={(checked) =>
                    setDraft((current) => ({ ...current, isFeatured: checked }))
                  }
                />
              </div>
            </div>
          </EditorSidebar.Section>

          <EditorSidebar.Section title="Tags">
            <TagPicker
              availableTags={loaderData.availableTags}
              value={draft.tags}
              onChange={(tags) => setDraft((current) => ({ ...current, tags }))}
              name="project-tags"
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

