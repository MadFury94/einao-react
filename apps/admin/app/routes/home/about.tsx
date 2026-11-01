import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@einao/ui'
import { Save } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useFetcher } from 'react-router'
import { toast } from 'sonner'
import { FeaturedImageCard } from '../../components/featured-image-card'
import { TipTapEditor } from '../../components/tiptap-editor'
import { serverBaseUrl, serverFetch, serverHeaders } from '../../lib/api'
import type { Route } from './+types/about'

type PageBlock = {
  id: number
  page_slug: string
  block_type: string
  position: number
  config: Record<string, unknown>
  visible: boolean
}

export function meta() {
  return [{ title: 'Home ... About Section ... Admin' }]
}

export async function loader() {
  const res = await serverFetch(`${serverBaseUrl}/api/v1/admin/page-blocks/home`, {
    headers: serverHeaders,
    credentials: 'include',
  }).catch(() => null)

  let aboutBlock: PageBlock | null = null
  if (res?.ok) {
    const blocks: PageBlock[] = await res.json()
    aboutBlock = blocks.find((b) => b.block_type === 'about') ?? null
  }

  return { aboutBlock }
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const blockId = form.get('block_id')
  const config = {
    heading: String(form.get('heading') ?? ''),
    headingAccent: String(form.get('headingAccent') ?? ''),
    bodyHtml: String(form.get('bodyHtml') ?? ''),
    imageSrc: String(form.get('imageSrc') ?? ''),
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
      body: JSON.stringify({ page_slug: 'home', block_type: 'about', config }),
    })
  }

  if (!res.ok) return { ok: false as const, error: 'Failed to save about section' }
  const block: PageBlock = await res.json()
  return { ok: true as const, aboutBlock: block }
}

export default function HomeAboutAdmin({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>()
  const lastRef = useRef<unknown>(null)

  const aboutBlock =
    fetcher.data && 'aboutBlock' in fetcher.data ? fetcher.data.aboutBlock : loaderData.aboutBlock
  const config = aboutBlock?.config ?? {}

  const [heading, setHeading] = useState(String(config.heading ?? ''))
  const [headingAccent, setHeadingAccent] = useState(String(config.headingAccent ?? ''))
  const [bodyHtml, setBodyHtml] = useState(String(config.bodyHtml ?? ''))
  const [imageSrc, setImageSrc] = useState(String(config.imageSrc ?? ''))

  useEffect(() => {
    if (!fetcher.data || fetcher.data === lastRef.current) return
    lastRef.current = fetcher.data
    if (fetcher.data.ok) toast.success('About section saved')
    else toast.error(fetcher.data.error)
  }, [fetcher.data])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData()
    if (aboutBlock) formData.set('block_id', String(aboutBlock.id))
    formData.set('heading', heading)
    formData.set('headingAccent', headingAccent)
    formData.set('bodyHtml', bodyHtml)
    formData.set('imageSrc', imageSrc)
    fetcher.submit(formData, { method: 'post' })
  }

  const busy = fetcher.state !== 'idle'

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight page-heading">
          About Section
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure the &quot;About&quot; section shown on the home page below the games showcase.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
            <CardDescription>Heading, body text, and image for the about block.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="heading">Heading (white)</Label>
                    <Input
                      id="heading"
                      value={heading}
                      onChange={(e) => setHeading(e.target.value)}
                      placeholder="Crafting Game Experiences"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="headingAccent">Heading (red accent)</Label>
                    <Input
                      id="headingAccent"
                      value={headingAccent}
                      onChange={(e) => setHeadingAccent(e.target.value)}
                      placeholder="Worth Playing"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Body</Label>
                  <div className="min-h-[200px] rounded-md border">
                    <TipTapEditor
                      content={bodyHtml}
                      onUpdate={(_json, html) => setBodyHtml(html)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <FeaturedImageCard
                  title="Image"
                  label="About section image"
                  value={imageSrc}
                  onChange={setImageSrc}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button type="submit" variant="glow" disabled={busy}>
                <Save className="size-4" />
                {busy ? 'Saving...' : 'Save About'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
