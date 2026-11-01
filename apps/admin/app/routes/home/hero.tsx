import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from '@einao/ui'
import { Plus, Save, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useFetcher } from 'react-router'
import { toast } from 'sonner'
import { FeaturedImageCard } from '../../components/featured-image-card'
import { serverBaseUrl, serverFetch, serverHeaders } from '../../lib/api'
import type { Route } from './+types/hero'

type PageBlock = {
  id: number
  page_slug: string
  block_type: string
  position: number
  config: Record<string, unknown>
  visible: boolean
}

type HeroSlide = {
  title: string
  description: string
  badges: string
  imageSrc: string
  videoSrc: string
  bg: string
  comingSoon: boolean
}

const DEFAULT_SLIDE: HeroSlide = {
  title: '',
  description: '',
  badges: '',
  imageSrc: '',
  videoSrc: '',
  bg: 'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(255,0,42,0.25))',
  comingSoon: false,
}

export function meta() {
  return [{ title: 'Home ... Hero Slides ... Admin' }]
}

export async function loader() {
  const res = await serverFetch(`${serverBaseUrl}/api/v1/admin/page-blocks/home`, {
    headers: serverHeaders,
    credentials: 'include',
  }).catch(() => null)

  let heroBlock: PageBlock | null = null
  if (res?.ok) {
    const blocks: PageBlock[] = await res.json()
    heroBlock = blocks.find((b) => b.block_type === 'hero_slides') ?? null
  }

  return { heroBlock }
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const blockId = form.get('block_id')
  const slidesJson = String(form.get('slides') ?? '[]')

  let slides: Array<Record<string, unknown>>
  try {
    slides = JSON.parse(slidesJson)
  } catch {
    return { ok: false as const, error: 'Invalid slides data' }
  }

  const config = { slides }

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
      body: JSON.stringify({ page_slug: 'home', block_type: 'hero_slides', config }),
    })
  }

  if (!res.ok) return { ok: false as const, error: 'Failed to save hero slides' }
  const block: PageBlock = await res.json()
  return { ok: true as const, heroBlock: block }
}

function parseSlides(config: Record<string, unknown>): HeroSlide[] {
  const raw = config.slides
  if (!Array.isArray(raw) || raw.length === 0) return [{ ...DEFAULT_SLIDE }]
  return raw.map((s: Record<string, unknown>) => ({
    title: String(s.title ?? ''),
    description: String(s.description ?? ''),
    badges: String(s.badges ?? ''),
    imageSrc: String(s.imageSrc ?? ''),
    videoSrc: String(s.videoSrc ?? ''),
    bg: String(s.bg ?? DEFAULT_SLIDE.bg),
    comingSoon: Boolean(s.comingSoon),
  }))
}

export default function HomeHeroAdmin({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>()
  const lastRef = useRef<unknown>(null)

  const heroBlock =
    fetcher.data && 'heroBlock' in fetcher.data ? fetcher.data.heroBlock : loaderData.heroBlock

  const [slides, setSlides] = useState<HeroSlide[]>(() => parseSlides(heroBlock?.config ?? {}))

  useEffect(() => {
    if (!fetcher.data || fetcher.data === lastRef.current) return
    lastRef.current = fetcher.data
    if (fetcher.data.ok) toast.success('Hero slides saved')
    else toast.error(fetcher.data.error)
  }, [fetcher.data])

  function updateSlide(index: number, patch: Partial<HeroSlide>) {
    setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  function addSlide() {
    setSlides((prev) => [...prev, { ...DEFAULT_SLIDE }])
  }

  function removeSlide(index: number) {
    setSlides((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData()
    if (heroBlock) formData.set('block_id', String(heroBlock.id))
    formData.set(
      'slides',
      JSON.stringify(
        slides.map((s) => ({
          title: s.title,
          description: s.description,
          badges: s.badges,
          imageSrc: s.imageSrc,
          videoSrc: s.videoSrc,
          bg: s.bg,
          comingSoon: s.comingSoon,
        }))
      )
    )
    fetcher.submit(formData, { method: 'post' })
  }

  const busy = fetcher.state !== 'idle'

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight page-heading">
          Hero Slides
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage the slideshow on the home page. Each slide can have an image or video background,
          title, description, and badges.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {slides.map((slide, index) => (
            <Card key={index}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">
                    Slide {index + 1}
                    {slide.title ? ` ... ${slide.title}` : ''}
                  </CardTitle>
                  <CardDescription>
                    {slide.comingSoon ? 'Coming Soon slide' : 'Active slide'}
                  </CardDescription>
                </div>
                {slides.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSlide(index)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Title</Label>
                      <Input
                        value={slide.title}
                        onChange={(e) => updateSlide(index, { title: e.target.value })}
                        placeholder="From Teesside to the World"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Textarea
                        value={slide.description}
                        onChange={(e) => updateSlide(index, { description: e.target.value })}
                        rows={2}
                        placeholder="Award-nominated indie studio..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Badges (comma-separated)</Label>
                      <Input
                        value={slide.badges}
                        onChange={(e) => updateSlide(index, { badges: e.target.value })}
                        placeholder="Founded 2025, Teesside UK, Global Impact"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label>Video URL</Label>
                        <Input
                          value={slide.videoSrc}
                          onChange={(e) => updateSlide(index, { videoSrc: e.target.value })}
                          placeholder="/videos/hero.mp4"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Background Gradient</Label>
                        <Input
                          value={slide.bg}
                          onChange={(e) => updateSlide(index, { bg: e.target.value })}
                          placeholder="linear-gradient(...)"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slide.comingSoon}
                        onChange={(e) => updateSlide(index, { comingSoon: e.target.checked })}
                        className="rounded border-border"
                      />
                      <span className="text-sm">Coming Soon badge</span>
                    </label>
                  </div>
                  <div>
                    <FeaturedImageCard
                      title="Image"
                      label="Slide image"
                      value={slide.imageSrc}
                      onChange={(v) => updateSlide(index, { imageSrc: v })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between pt-6">
          <Button type="button" variant="outline" onClick={addSlide}>
            <Plus className="size-4" />
            Add Slide
          </Button>
          <Button type="submit" variant="glow" disabled={busy}>
            <Save className="size-4" />
            {busy ? 'Saving...' : 'Save Slides'}
          </Button>
        </div>
      </form>
    </div>
  )
}
