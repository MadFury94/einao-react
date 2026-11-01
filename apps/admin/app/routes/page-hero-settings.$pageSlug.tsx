import { Button, Card, CardContent, Input, Label, Textarea } from '@einao/ui'
import { ArrowLeft, Save } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useFetcher } from 'react-router'
import { toast } from 'sonner'
import { FeaturedImageCard } from '../components/featured-image-card'
import { serverBaseUrl, serverFetch, serverHeaders } from '../lib/api'
import type { Route } from './+types/page-hero-settings.$pageSlug'

type PageBlock = {
  id: number
  page_slug: string
  block_type: string
  position: number
  config: Record<string, unknown>
  visible: boolean
}

const PAGE_META: Record<string, { label: string; backTo: string; backLabel: string }> = {
  services: { label: 'Services', backTo: '/services', backLabel: 'Services' },
  games: { label: 'Games', backTo: '/projects', backLabel: 'Games' },
  events: { label: 'Events', backTo: '/events', backLabel: 'Events' },
  blog: { label: 'Blog', backTo: '/posts', backLabel: 'Posts' },
  team: { label: 'Team', backTo: '/team', backLabel: 'Team' },
  contact: { label: 'Contact', backTo: '/', backLabel: 'Home' },
}

export function meta({ data }: Route.MetaArgs) {
  const label = data?.pageMeta?.label ?? 'Page'
  return [{ title: `${label} Page Settings ... Admin` }]
}

export async function loader({ params }: Route.LoaderArgs) {
  const pageSlug = params.pageSlug
  const pageMeta = PAGE_META[pageSlug] ?? {
    label: pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1),
    backTo: '/',
    backLabel: 'Home',
  }

  const res = await serverFetch(`${serverBaseUrl}/api/v1/admin/page-blocks/${pageSlug}`, {
    headers: serverHeaders,
    credentials: 'include',
  })

  let heroBlock: PageBlock | null = null
  if (res.ok) {
    const blocks: PageBlock[] = await res.json()
    heroBlock = blocks.find((b) => b.block_type === 'page_hero') ?? null
  }

  return { heroBlock, pageSlug, pageMeta }
}

export async function action({ request, params }: Route.ActionArgs) {
  const pageSlug = params.pageSlug
  const form = await request.formData()
  const blockId = form.get('block_id')
  const config = {
    eyebrow: String(form.get('eyebrow') ?? ''),
    titlePre: String(form.get('titlePre') ?? ''),
    titleAccent: String(form.get('titleAccent') ?? ''),
    subtitle: String(form.get('subtitle') ?? ''),
    backgroundImage: String(form.get('backgroundImage') ?? ''),
  }

  let res: Response
  if (blockId) {
    res = await serverFetch(`${serverBaseUrl}/api/v1/admin/page-blocks/${blockId}`, {
      method: 'PATCH',
      headers: { ...serverHeaders, 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ config }),
    })
  } else {
    res = await serverFetch(`${serverBaseUrl}/api/v1/admin/page-blocks`, {
      method: 'POST',
      headers: { ...serverHeaders, 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ page_slug: pageSlug, block_type: 'page_hero', config }),
    })
  }

  if (!res.ok) return { ok: false as const, error: 'Failed to save settings' }
  const block: PageBlock = await res.json()
  return { ok: true as const, heroBlock: block }
}

export default function PageHeroSettings({ loaderData }: Route.ComponentProps) {
  const { pageMeta } = loaderData
  const fetcher = useFetcher<typeof action>()
  const lastResultRef = useRef<unknown>(null)

  const heroBlock = fetcher.data?.ok ? fetcher.data.heroBlock : loaderData.heroBlock
  const config = heroBlock?.config ?? {}

  const [eyebrow, setEyebrow] = useState(String(config.eyebrow ?? ''))
  const [titlePre, setTitlePre] = useState(String(config.titlePre ?? ''))
  const [titleAccent, setTitleAccent] = useState(String(config.titleAccent ?? ''))
  const [subtitle, setSubtitle] = useState(String(config.subtitle ?? ''))
  const [backgroundImage, setBackgroundImage] = useState(String(config.backgroundImage ?? ''))

  useEffect(() => {
    if (!fetcher.data || fetcher.data === lastResultRef.current) return
    lastResultRef.current = fetcher.data
    if (fetcher.data.ok) {
      toast.success('Settings saved')
    } else {
      toast.error(fetcher.data.error)
    }
  }, [fetcher.data])

  const isBusy = fetcher.state !== 'idle'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData()
    if (heroBlock) formData.set('block_id', String(heroBlock.id))
    formData.set('eyebrow', eyebrow)
    formData.set('titlePre', titlePre)
    formData.set('titleAccent', titleAccent)
    formData.set('subtitle', subtitle)
    formData.set('backgroundImage', backgroundImage)
    fetcher.submit(formData, { method: 'post' })
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={pageMeta.backTo}
          className="flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {pageMeta.backLabel}
        </Link>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight page-heading">
          {pageMeta.label} Page Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure the hero section displayed at the top of the public {pageMeta.label} page.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main fields */}
          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-5 pt-6">
                <div className="grid gap-2">
                  <Label htmlFor="eyebrow">Eyebrow</Label>
                  <Input
                    id="eyebrow"
                    value={eyebrow}
                    onChange={(e) => setEyebrow(e.target.value)}
                    placeholder="e.g. What We Do"
                  />
                  <p className="text-xs text-muted-foreground">
                    Small red label shown above the title.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="titlePre">Title (white part)</Label>
                    <Input
                      id="titlePre"
                      value={titlePre}
                      onChange={(e) => setTitlePre(e.target.value)}
                      placeholder="e.g. Our"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="titleAccent">Title (red accent)</Label>
                    <Input
                      id="titleAccent"
                      value={titleAccent}
                      onChange={(e) => setTitleAccent(e.target.value)}
                      placeholder="e.g. Services"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Textarea
                    id="subtitle"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    rows={3}
                    placeholder="A short description shown below the heading."
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" variant="glow" disabled={isBusy}>
                <Save className="size-4" />
                {isBusy ? 'Saving...' : 'Save settings'}
              </Button>
            </div>
          </div>

          {/* Sidebar ... image */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-0">
                <FeaturedImageCard
                  title="Background Image"
                  label="Hero background"
                  value={backgroundImage}
                  onChange={setBackgroundImage}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <p className="text-xs text-muted-foreground">
                  Leave fields empty to use the default values. The background image replaces the
                  animated GIF shown behind the hero text.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
