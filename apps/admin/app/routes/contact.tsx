import { getApiV1Config, postApiV1AdminConfig } from '@einao/api-client'
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
import { Save } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useFetcher } from 'react-router'
import { toast } from 'sonner'
import { FeaturedImageCard } from '../components/featured-image-card'
import {
  KeyedSocialLinksEditor,
  SOCIAL_KEYS,
  type SocialValues,
} from '../components/social-links-editor'
import { serverBaseUrl, serverFetch, serverHeaders } from '../lib/api'
import type { Route } from './+types/contact'

type PageBlock = {
  id: number
  page_slug: string
  block_type: string
  position: number
  config: Record<string, unknown>
  visible: boolean
}

export function meta() {
  return [{ title: 'Contact  -  Admin' }]
}

export async function loader() {
  const [configRes, blocksRes] = await Promise.all([
    getApiV1Config(),
    serverFetch(`${serverBaseUrl}/api/v1/admin/page-blocks/contact`, {
      headers: serverHeaders,
      credentials: 'include',
    }).catch(() => null),
  ])

  if (configRes.error || !configRes.data)
    throw new Response('Failed to load config', { status: 502 })

  let heroBlock: PageBlock | null = null
  if (blocksRes?.ok) {
    const blocks: PageBlock[] = await blocksRes.json()
    heroBlock = blocks.find((b) => b.block_type === 'page_hero') ?? null
  }

  return { config: configRes.data, heroBlock }
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const intent = String(form.get('intent') ?? '')

  if (intent === 'save_hero') {
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
        body: JSON.stringify({ page_slug: 'contact', block_type: 'page_hero', config }),
      })
    }

    if (!res.ok)
      return { ok: false as const, error: 'Failed to save hero settings', section: 'hero' }
    const block: PageBlock = await res.json()
    return { ok: true as const, heroBlock: block, section: 'hero' }
  }

  if (intent === 'save_contact') {
    const { data: currentConfig } = await getApiV1Config()
    const socials = Object.fromEntries(
      SOCIAL_KEYS.map((k) => [`social_${k}`, String(form.get(`social_${k}`) ?? '')]),
    )
    const body = {
      ...currentConfig,
      email: String(form.get('email') ?? ''),
      phone: String(form.get('phone') ?? ''),
      address_street: String(form.get('address_street') ?? ''),
      address_city: String(form.get('address_city') ?? ''),
      address_state: String(form.get('address_state') ?? ''),
      address_zip: String(form.get('address_zip') ?? ''),
      address_map_url: String(form.get('address_map_url') ?? ''),
      ...socials,
    }

    const { error } = await postApiV1AdminConfig({ body })
    if (error)
      return { ok: false as const, error: 'Failed to save contact details', section: 'contact' }
    return { ok: true as const, section: 'contact' }
  }

  return { ok: false as const, error: 'Unknown intent', section: '' }
}

export default function ContactAdmin({ loaderData }: Route.ComponentProps) {
  const heroFetcher = useFetcher<typeof action>()
  const contactFetcher = useFetcher<typeof action>()
  const lastHeroRef = useRef<unknown>(null)
  const lastContactRef = useRef<unknown>(null)

  const { config } = loaderData
  const heroBlock =
    heroFetcher.data && 'heroBlock' in heroFetcher.data
      ? heroFetcher.data.heroBlock
      : loaderData.heroBlock
  const heroConfig = heroBlock?.config ?? {}

  const [eyebrow, setEyebrow] = useState(String(heroConfig.eyebrow ?? ''))
  const [titlePre, setTitlePre] = useState(String(heroConfig.titlePre ?? ''))
  const [titleAccent, setTitleAccent] = useState(String(heroConfig.titleAccent ?? ''))
  const [subtitle, setSubtitle] = useState(String(heroConfig.subtitle ?? ''))
  const [backgroundImage, setBackgroundImage] = useState(String(heroConfig.backgroundImage ?? ''))

  const [email, setEmail] = useState(config.email ?? '')
  const [phone, setPhone] = useState(config.phone ?? '')
  const [addressStreet, setAddressStreet] = useState(config.address_street ?? '')
  const [addressCity, setAddressCity] = useState(config.address_city ?? '')
  const [addressState, setAddressState] = useState(config.address_state ?? '')
  const [addressZip, setAddressZip] = useState(config.address_zip ?? '')
  const [addressMapUrl, setAddressMapUrl] = useState(config.address_map_url ?? '')

  const [socials, setSocials] = useState<SocialValues>(() => {
    const cfg = config as unknown as Record<string, string>
    return Object.fromEntries(SOCIAL_KEYS.map((k) => [k, cfg[`social_${k}`] ?? '']))
  })

  useEffect(() => {
    if (!heroFetcher.data || heroFetcher.data === lastHeroRef.current) return
    lastHeroRef.current = heroFetcher.data
    if (heroFetcher.data.ok) toast.success('Hero settings saved')
    else toast.error(heroFetcher.data.error)
  }, [heroFetcher.data])

  useEffect(() => {
    if (!contactFetcher.data || contactFetcher.data === lastContactRef.current) return
    lastContactRef.current = contactFetcher.data
    if (contactFetcher.data.ok) toast.success('Contact details saved')
    else toast.error(contactFetcher.data.error)
  }, [contactFetcher.data])

  function handleHeroSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData()
    formData.set('intent', 'save_hero')
    if (heroBlock) formData.set('block_id', String(heroBlock.id))
    formData.set('eyebrow', eyebrow)
    formData.set('titlePre', titlePre)
    formData.set('titleAccent', titleAccent)
    formData.set('subtitle', subtitle)
    formData.set('backgroundImage', backgroundImage)
    heroFetcher.submit(formData, { method: 'post' })
  }

  function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData()
    formData.set('intent', 'save_contact')
    formData.set('email', email)
    formData.set('phone', phone)
    formData.set('address_street', addressStreet)
    formData.set('address_city', addressCity)
    formData.set('address_state', addressState)
    formData.set('address_zip', addressZip)
    formData.set('address_map_url', addressMapUrl)
    for (const k of SOCIAL_KEYS) formData.set(`social_${k}`, socials[k] ?? '')
    contactFetcher.submit(formData, { method: 'post' })
  }

  const heroBusy = heroFetcher.state !== 'idle'
  const contactBusy = contactFetcher.state !== 'idle'

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight page-heading">Contact</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage the contact page hero and your contact details.
        </p>
      </div>

      {/* Hero Settings */}
      <form onSubmit={handleHeroSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Page Hero</CardTitle>
            <CardDescription>The banner displayed at the top of the Contact page.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="eyebrow">Eyebrow</Label>
                  <Input
                    id="eyebrow"
                    value={eyebrow}
                    onChange={(e) => setEyebrow(e.target.value)}
                    placeholder="Get In Touch"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="titlePre">Title (white)</Label>
                    <Input
                      id="titlePre"
                      value={titlePre}
                      onChange={(e) => setTitlePre(e.target.value)}
                      placeholder="Let's"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="titleAccent">Title (red)</Label>
                    <Input
                      id="titleAccent"
                      value={titleAccent}
                      onChange={(e) => setTitleAccent(e.target.value)}
                      placeholder="Connect"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Textarea
                    id="subtitle"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    rows={2}
                    placeholder="Whether it's press, collaboration, or just a hello..."
                  />
                </div>
              </div>
              <div>
                <FeaturedImageCard
                  title="Background"
                  label="Hero background"
                  value={backgroundImage}
                  onChange={setBackgroundImage}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button type="submit" variant="glow" disabled={heroBusy}>
                <Save className="size-4" />
                {heroBusy ? 'Saving - ' : 'Save Hero'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Contact Details */}
      <form onSubmit={handleContactSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
            <CardDescription>
              How visitors can reach the team. Also shown in the site footer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@einaosolutions.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 ..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Address</CardTitle>
            <CardDescription>Office location shown on the Contact page and footer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="address_street">Street</Label>
              <Input
                id="address_street"
                value={addressStreet}
                onChange={(e) => setAddressStreet(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="address_city">City</Label>
                <Input
                  id="address_city"
                  value={addressCity}
                  onChange={(e) => setAddressCity(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address_state">State</Label>
                <Input
                  id="address_state"
                  value={addressState}
                  onChange={(e) => setAddressState(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address_zip">ZIP</Label>
                <Input
                  id="address_zip"
                  value={addressZip}
                  onChange={(e) => setAddressZip(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address_map_url">Map URL</Label>
              <Input
                id="address_map_url"
                type="url"
                value={addressMapUrl}
                onChange={(e) => setAddressMapUrl(e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>
              Social media URLs displayed on the contact page and footer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <KeyedSocialLinksEditor value={socials} onChange={setSocials} />
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" variant="glow" disabled={contactBusy}>
            <Save className="size-4" />
            {contactBusy ? 'Saving - ' : 'Save Contact & Social'}
          </Button>
        </div>
      </form>
    </div>
  )
}
