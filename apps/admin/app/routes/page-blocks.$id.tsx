import { Button, Card, CardContent, Input, Label, Textarea } from '@einao/ui'
import {
  ArrowLeft,
  ChevronDown,
  Eye,
  EyeOff,
  ImagePlus,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, redirect, useFetcher } from 'react-router'
import { toast } from 'sonner'
import { FeaturedImageCard } from '../components/featured-image-card'
import { MediaPicker } from '../components/media-picker'
import { serverBaseUrl, serverFetch, serverHeaders } from '../lib/api'
import type { Route } from './+types/page-blocks.$id'

type PageBlock = {
  id: number
  page_slug: string
  block_type: string
  position: number
  config: Record<string, unknown>
  visible: boolean
  created_at: string
  updated_at: string
}

const BLOCK_TYPE_LABELS: Record<string, string> = {
  hero: 'Hero Section',
  page_hero: 'Page Hero',
  about: 'About Section',
  statistics: 'Statistics',
  industries: 'Industries',
  services: 'Services',
  projects: 'Games Grid',
  parallax_divider: 'Parallax Divider',
  tech_stack: 'Tech Stack',
  blog_preview: 'Blog Preview',
  cta: 'Call to Action',
  cs_logo: 'Coming Soon  -  Logo',
  cs_headline: 'Coming Soon  -  Headline',
  cs_meta: 'Coming Soon  -  Meta Info',
  cs_cta: 'Coming Soon  -  Buttons',
  cs_footer: 'Coming Soon  -  Footer',
}

const PAGES = [
  'home',
  'about',
  'capabilities',
  'capabilities/it-consulting',
  'capabilities/business-process-automation',
  'capabilities/enterprise-solutions',
  'solutions',
  'solutions/payx',
  'solutions/fileonn',
  'solutions/custom-enterprise-systems',
  'industries',
  'industries/business',
  'industries/government',
  'industries/regulatory-services',
  'work',
  'work/ipo-nigeria-portal',
  'insights',
  'contact',
  'privacy-notice',
  'terms-of-use',
]

//  - ...... Config field schema per block type  - ............................................................................................................
// Describes the editable fields for each block. Block types not listed
// here have no structured fields (they fall back to a raw JSON editor).

type ListColumn = {
  key: string
  label: string
  placeholder?: string
  /** Cell editor. Defaults to a plain text input. */
  type?: 'text' | 'image'
}

type FieldDef =
  | { key: string; label: string; type: 'text'; placeholder?: string; help?: string }
  | { key: string; label: string; type: 'textarea'; placeholder?: string; help?: string }
  | { key: string; label: string; type: 'image'; help?: string }
  | {
      key: string
      label: string
      type: 'select'
      options: { value: string; label: string }[]
      help?: string
    }
  | {
      key: string
      label: string
      type: 'list'
      item: ListColumn[]
      addLabel?: string
      help?: string
    }

const BLOCK_FIELDS: Record<string, FieldDef[]> = {
  hero: [
    {
      key: 'headline',
      label: 'Headline',
      type: 'text',
      placeholder: 'We build digital products',
      help: 'Overrides the default hero headline. Leave blank to use the site default.',
    },
    {
      key: 'studioImageSrc',
      label: 'Studio slide image',
      type: 'image',
      help: 'Background image for the studio branding slide in the hero carousel.',
    },
  ],
  page_hero: [
    {
      key: 'eyebrow',
      label: 'Eyebrow',
      type: 'text',
      placeholder: 'What We Do',
      help: 'Small red label above the title (e.g. "What We Do").',
    },
    {
      key: 'titlePre',
      label: 'Title (white part)',
      type: 'text',
      placeholder: 'Our',
      help: 'The first word(s) of the heading shown in white.',
    },
    {
      key: 'titleAccent',
      label: 'Title (red part)',
      type: 'text',
      placeholder: 'Services',
      help: 'The accented word(s) of the heading shown in red.',
    },
    {
      key: 'subtitle',
      label: 'Subtitle',
      type: 'textarea',
      placeholder:
        'From prototype to production  -  we bring games and creative visions to life with Unreal Engine 5 expertise.',
      help: 'Description paragraph shown below the heading.',
    },
    {
      key: 'backgroundImage',
      label: 'Background image',
      type: 'image',
      help: 'Custom background image for the hero. Replaces the default animated GIF.',
    },
  ],
  about: [
    {
      key: 'imageSrc',
      label: 'About section image',
      type: 'image',
      help: 'Image shown beside the About text on the homepage. Falls back to the default studio photo if empty.',
    },
  ],
  parallax_divider: [
    {
      key: 'imageSrc',
      label: 'Image',
      type: 'image',
      help: 'Background image shown in the parallax divider.',
    },
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Optional overlay text' },
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      options: [
        { value: 'image', label: 'Image' },
        { value: 'background', label: 'Background' },
      ],
    },
    {
      key: 'dividerClass',
      label: 'Divider CSS class',
      type: 'text',
      placeholder: 'e.g. mxd-divider-1',
      help: 'Advanced: extra CSS class applied to the divider element.',
    },
  ],
  blog_preview: [
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      options: [
        { value: 'home', label: 'Home' },
        { value: 'services', label: 'Services' },
      ],
    },
  ],
  statistics: [
    {
      key: 'manifest',
      label: 'Manifest',
      type: 'textarea',
      placeholder: 'From pixel-perfect designs to flawless code - ',
      help: 'Short paragraph shown beside the statistics. Leave blank to use the default.',
    },
    {
      key: 'stats',
      label: 'Statistics',
      type: 'list',
      addLabel: 'Add statistic',
      item: [
        { key: 'value', label: 'Value', placeholder: '50+' },
        { key: 'label', label: 'Label', placeholder: 'Happy clients who trust our work' },
      ],
      help: 'Each row is one stat shown on the home page. Leave empty to use the defaults.',
    },
  ],
  industries: [
    {
      key: 'industries',
      label: 'Industry cards',
      type: 'list',
      addLabel: 'Add industry',
      item: [
        { key: 'title', label: 'Title', placeholder: 'Fintech' },
        {
          key: 'content',
          label: 'Description',
          placeholder: 'We build secure financial products - ',
        },
        { key: 'imageUrl', label: 'Image', type: 'image' },
        { key: 'tags', label: 'Tags', placeholder: 'Payments, Compliance, Customer portals' },
      ],
      help: 'Each row is one industry card. Tags are comma-separated. Leave empty to use the defaults.',
    },
  ],
  tech_stack: [
    {
      key: 'title',
      label: 'Section title',
      type: 'text',
      placeholder: 'Our tech stack',
      help: 'Heading shown above the tech list. Leave blank to use the default.',
    },
    { key: 'number', label: 'Section number', type: 'text', placeholder: 'T/04' },
    {
      key: 'caption',
      label: 'Caption',
      type: 'textarea',
      placeholder: 'A powerhouse in full-stack development solutions',
      help: 'Short paragraph shown beside the tech list.',
    },
    {
      key: 'items',
      label: 'Technologies',
      type: 'list',
      addLabel: 'Add technology',
      item: [
        { key: 'name', label: 'Name', placeholder: 'Angular' },
        { key: 'logo', label: 'Logo', type: 'image' },
      ],
      help: 'Each row is one technology: a name and an optional logo. Leave empty to use the defaults.',
    },
  ],
  cta: [
    {
      key: 'heading',
      label: 'Heading',
      type: 'text',
      placeholder: "Let's talk about your project",
      help: 'Main call-to-action heading. Leave blank to use the default.',
    },
    { key: 'buttonLabel', label: 'Button label', type: 'text', placeholder: 'Write a line' },
    {
      key: 'words',
      label: 'Marquee words',
      type: 'list',
      addLabel: 'Add word',
      item: [{ key: 'word', label: 'Word', placeholder: 'Web design' }],
      help: 'Floating words shown in the CTA. Leave empty to use the defaults.',
    },
  ],
  services: [
    {
      key: 'title',
      label: 'Section title',
      type: 'text',
      placeholder: 'Our services',
      help: 'Presentational override. Service cards come from the Services collection, not this block.',
    },
    { key: 'number', label: 'Section number', type: 'text', placeholder: 'C/02' },
    {
      key: 'caption',
      label: 'Caption',
      type: 'textarea',
      placeholder:
        'Concrete capabilities for teams that need to plan, ship, and improve digital products - ',
    },
  ],
  projects: [
    {
      key: 'title',
      label: 'Section title',
      type: 'text',
      placeholder: 'Featured case studies',
      help: 'Presentational override. Game cards come from the Games collection, not this block.',
    },
    { key: 'number', label: 'Section number', type: 'text', placeholder: 'W/03' },
    {
      key: 'caption',
      label: 'Caption',
      type: 'textarea',
      placeholder: 'Selected work that shows how strategy, design, and engineering come together - ',
    },
  ],
  cs_logo: [
    { key: 'src', label: 'Logo image', type: 'image' },
    { key: 'alt', label: 'Alt text', type: 'text', placeholder: 'Einao Solutions' },
    { key: 'width', label: 'Width (px)', type: 'text', placeholder: '313' },
    { key: 'height', label: 'Height (px)', type: 'text', placeholder: '313' },
  ],
  cs_headline: [
    {
      key: 'heading',
      label: 'Main heading',
      type: 'text',
      placeholder: 'COMING SOON',
      help: 'Large all-caps headline at the top of the page.',
    },
    {
      key: 'lines',
      label: 'Subheading lines',
      type: 'list',
      addLabel: 'Add line',
      item: [
        { key: 'text', label: 'Text', placeholder: 'Building compact, cozy games - ' },
        { key: 'size', label: 'Size (md | lg)', placeholder: 'lg' },
      ],
      help: 'Each row is one paragraph under the headline. size: "lg" or "md".',
    },
  ],
  cs_meta: [
    {
      key: 'items',
      label: 'Meta items',
      type: 'list',
      addLabel: 'Add item',
      item: [{ key: 'text', label: 'Text', placeholder: 'Indie Einao' }],
      help: 'Small dot-separated info line (e.g.  - Indie Einao  - <- Teesside, UK - ).',
    },
  ],
  cs_cta: [
    {
      key: 'buttons',
      label: 'CTA buttons',
      type: 'list',
      addLabel: 'Add button',
      item: [
        { key: 'label', label: 'Label', placeholder: 'Wishlist on Steam' },
        { key: 'href', label: 'URL', placeholder: 'https:// -  or mailto: - ' },
        { key: 'variant', label: 'Variant (primary | secondary)', placeholder: 'primary' },
        { key: 'target', label: 'Target (_blank | _self)', placeholder: '_blank' },
      ],
    },
  ],
  cs_footer: [
    {
      key: 'text',
      label: 'Footer text',
      type: 'text',
      placeholder: 'Website launching soon',
    },
  ],
}

type ActionResult = { ok: true; block: PageBlock } | { ok: false; error: string }

// Einao's content blocks use a deliberately small vocabulary of text, links,
// images and repeatable items. Layout and section order remain code-owned.
Object.assign(BLOCK_FIELDS, {
  hero: [
    { key: 'title', label: 'Heading', type: 'text' },
    { key: 'body', label: 'Paragraphs', type: 'list', addLabel: 'Add paragraph', item: [{ key: 'text', label: 'Paragraph' }] },
    { key: 'ctaLabel', label: 'Button text', type: 'text' },
  ],
  cta: [
    { key: 'title', label: 'Heading', type: 'text' },
    { key: 'body', label: 'Paragraphs', type: 'list', addLabel: 'Add paragraph', item: [{ key: 'text', label: 'Paragraph' }] },
    { key: 'ctaLabel', label: 'Button text', type: 'text' },
  ],
  editorial: [
    { key: 'title', label: 'Heading', type: 'text' },
    { key: 'body', label: 'Paragraphs', type: 'list', addLabel: 'Add paragraph', item: [{ key: 'text', label: 'Text' }] },
    { key: 'items', label: 'Supporting items', type: 'list', addLabel: 'Add item', item: [{ key: 'title', label: 'Title' }, { key: 'body', label: 'Description' }] },
  ],
  approach: [
    { key: 'title', label: 'Heading', type: 'text' },
    { key: 'body', label: 'Paragraphs', type: 'list', addLabel: 'Add paragraph', item: [{ key: 'text', label: 'Paragraph' }] },
    { key: 'items', label: 'Principles or steps', type: 'list', addLabel: 'Add item', item: [{ key: 'title', label: 'Title' }, { key: 'body', label: 'Description' }] },
  ],
  feature: [
    { key: 'title', label: 'Heading', type: 'text' },
    { key: 'body', label: 'Paragraphs', type: 'list', addLabel: 'Add paragraph', item: [{ key: 'text', label: 'Text' }] },
    { key: 'items', label: 'Highlights', type: 'list', addLabel: 'Add highlight', item: [{ key: 'title', label: 'Title' }, { key: 'body', label: 'Description' }] },
    { key: 'ctaLabel', label: 'Button text', type: 'text' },
  ],
  proof: [
    { key: 'title', label: 'Heading', type: 'text' },
    { key: 'body', label: 'Paragraphs', type: 'list', addLabel: 'Add paragraph', item: [{ key: 'text', label: 'Text' }] },
    { key: 'ctaLabel', label: 'Button text', type: 'text' },
  ],
  solutions: [
    { key: 'title', label: 'Heading', type: 'text' },
    { key: 'body', label: 'Paragraphs', type: 'list', addLabel: 'Add paragraph', item: [{ key: 'text', label: 'Paragraph' }] },
    { key: 'items', label: 'Solution cards', type: 'list', addLabel: 'Add solution', item: [{ key: 'label', label: 'Label' }, { key: 'title', label: 'Title' }, { key: 'body', label: 'Description' }] },
  ],
  industries: [
    { key: 'title', label: 'Heading', type: 'text' },
    { key: 'body', label: 'Paragraphs', type: 'list', addLabel: 'Add paragraph', item: [{ key: 'text', label: 'Paragraph' }] },
    { key: 'items', label: 'Industry cards', type: 'list', addLabel: 'Add industry', item: [{ key: 'title', label: 'Title' }, { key: 'body', label: 'Description' }] },
  ],
  cards: [
    { key: 'title', label: 'Heading', type: 'text' },
    { key: 'body', label: 'Paragraphs', type: 'list', addLabel: 'Add paragraph', item: [{ key: 'text', label: 'Paragraph' }] },
    { key: 'items', label: 'Cards', type: 'list', addLabel: 'Add card', item: [{ key: 'title', label: 'Title' }, { key: 'body', label: 'Description' }] },
  ],
  insights: [
    { key: 'title', label: 'Heading', type: 'text' },
    { key: 'body', label: 'Intro paragraphs', type: 'list', addLabel: 'Add paragraph', item: [{ key: 'text', label: 'Text' }] },
    { key: 'items', label: 'Insight cards', type: 'list', addLabel: 'Add insight', item: [{ key: 'label', label: 'Label' }, { key: 'title', label: 'Title' }, { key: 'body', label: 'Description' }] },
    { key: 'ctaLabel', label: 'Button text', type: 'text' },
  ],
  process: [
    { key: 'title', label: 'Heading', type: 'text' },
    { key: 'body', label: 'Paragraphs', type: 'list', addLabel: 'Add paragraph', item: [{ key: 'text', label: 'Text' }] },
    { key: 'items', label: 'Steps', type: 'list', addLabel: 'Add step', item: [{ key: 'title', label: 'Title' }, { key: 'body', label: 'Description' }] },
    { key: 'ctaLabel', label: 'Button text', type: 'text' },
  ],
  services: [
    { key: 'title', label: 'Heading', type: 'text' },
    { key: 'body', label: 'Paragraphs', type: 'list', addLabel: 'Add paragraph', item: [{ key: 'text', label: 'Paragraph' }] },
    { key: 'items', label: 'Capability cards', type: 'list', addLabel: 'Add capability', item: [{ key: 'title', label: 'Title' }, { key: 'body', label: 'Description' }] },
  ],
})

export function meta({ data }: Route.MetaArgs) {
  const label = data?.block
    ? (BLOCK_TYPE_LABELS[data.block.block_type] ?? data.block.block_type)
    : 'Block'
  return [{ title: `${label}  -  Page Blocks` }]
}

export async function loader({ params }: Route.LoaderArgs) {
  const id = params.id
  // No by-id admin endpoint yet, so scan the known pages for the block.
  for (const slug of PAGES) {
    const res = await serverFetch(`${serverBaseUrl}/api/v1/admin/page-blocks/${slug}`, {
      headers: serverHeaders,
      credentials: 'include',
    })
    if (!res.ok) continue
    const blocks: PageBlock[] = await res.json()
    const block = blocks.find((b) => String(b.id) === id)
    if (block) return { block }
  }
  throw new Response('Block not found', { status: 404 })
}

export async function action({
  params,
  request,
}: Route.ActionArgs): Promise<Response | ActionResult> {
  const id = params.id
  const form = await request.formData()
  const intent = String(form.get('intent') ?? '')

  if (intent === 'delete') {
    const page = String(form.get('page') ?? 'home')
    const res = await serverFetch(`${serverBaseUrl}/api/v1/admin/page-blocks/${id}`, {
      method: 'DELETE',
      headers: serverHeaders,
      credentials: 'include',
    })
    if (!res.ok) return { ok: false, error: 'Failed to delete block' }
    return redirect(`/page-blocks?page=${encodeURIComponent(page)}`)
  }

  if (intent === 'toggle') {
    const visible = form.get('visible') === 'true'
    const res = await serverFetch(`${serverBaseUrl}/api/v1/admin/page-blocks/${id}`, {
      method: 'PATCH',
      headers: { ...serverHeaders, 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ visible }),
    })
    if (!res.ok) return { ok: false, error: 'Failed to toggle visibility' }
    const block: PageBlock = await res.json()
    return { ok: true, block }
  }

  if (intent === 'update') {
    const configRaw = String(form.get('config') ?? '{}')
    let config: Record<string, unknown>
    try {
      config = JSON.parse(configRaw)
    } catch {
      return { ok: false, error: 'Invalid config JSON' }
    }
    const res = await serverFetch(`${serverBaseUrl}/api/v1/admin/page-blocks/${id}`, {
      method: 'PATCH',
      headers: { ...serverHeaders, 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ config }),
    })
    if (!res.ok) return { ok: false, error: 'Failed to update block' }
    const block: PageBlock = await res.json()
    return { ok: true, block }
  }

  return { ok: false, error: 'Unknown intent' }
}

//  - ...... Schema-driven config form  - ..................................................................................................................................................................

type ListRow = Record<string, string>

function seedValue(field: FieldDef, raw: unknown): unknown {
  if (field.type === 'list') {
    if (!Array.isArray(raw)) return []
    const firstKey = field.item[0]?.key ?? 'text'
    return raw.map((row) => typeof row === 'string' ? { [firstKey]: row } : row) as ListRow[]
  }
  return raw == null ? '' : String(raw)
}

// Compact image picker for a single list-row cell. Reuses the same
// MediaPicker as the top-level image field and stores the chosen URL
// as a plain string, so list serialization stays unchanged.
function ImageCell({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex items-center gap-2">
      {value ? (
        <img src={value} alt="" className="size-10 shrink-0 rounded border object-cover" />
      ) : (
        <div className="flex size-10 shrink-0 items-center justify-center rounded border border-dashed bg-muted/30 text-muted-foreground">
          <ImagePlus className="size-4" />
        </div>
      )}
      <Input value={value} placeholder="Image URL" onChange={(e) => onChange(e.target.value)} />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-9 shrink-0"
        onClick={() => setOpen(true)}
        aria-label="Pick image"
      >
        <ImagePlus className="size-4" />
      </Button>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          onClick={() => onChange('')}
          aria-label="Remove image"
        >
          <X className="size-4 text-destructive" />
        </Button>
      )}
      <MediaPicker open={open} onOpenChange={setOpen} onSelect={(url) => onChange(url)} />
    </div>
  )
}

function ListField({
  field,
  rows,
  onChange,
}: {
  field: Extract<FieldDef, { type: 'list' }>
  rows: ListRow[]
  onChange: (next: ListRow[]) => void
}) {
  const updateCell = (index: number, key: string, val: string) =>
    onChange(rows.map((r, i) => (i === index ? { ...r, [key]: val } : r)))

  return (
    <div className="grid gap-2">
      <Label>{field.label}</Label>
      <div className="grid gap-3">
        {rows.map((row, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional and reorderable
          <details key={index} className="group rounded-lg border bg-background">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
              <span>{String(row[field.item[0]?.key ?? 'title'] ?? `Item ${index + 1}`) || `Item ${index + 1}`}</span>
              <span className="flex shrink-0 items-center gap-2 text-xs font-normal text-muted-foreground">
                <span>Open to edit</span>
                <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
              </span>
            </summary>
            <div className="border-t p-3">
              <div className="grid gap-2 sm:grid-cols-[8rem_1fr]">
                {field.item.map((col) => (
                  <div
                    key={col.key}
                    className={`grid gap-1 ${col.type === 'image' ? 'sm:col-span-2' : ''}`}
                  >
                    <Label className="text-xs text-muted-foreground">{col.label}</Label>
                    {col.type === 'image' ? (
                      <ImageCell
                        value={row[col.key] ?? ''}
                        onChange={(url) => updateCell(index, col.key, url)}
                      />
                    ) : (
                      <Input
                        value={row[col.key] ?? ''}
                        placeholder={col.placeholder}
                        onChange={(e) => updateCell(index, col.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </details>
        ))}
      </div>
      {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
    </div>
  )
}

function ConfigFields({
  fields,
  initial,
}: {
  fields: FieldDef[]
  initial: Record<string, unknown>
}) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const seed: Record<string, unknown> = {}
    for (const f of fields) {
      if (f.key === 'ctaLabel') seed[f.key] = typeof initial.cta === 'object' && initial.cta !== null ? String((initial.cta as { label?: unknown }).label ?? '') : ''
      else seed[f.key] = seedValue(f, initial[f.key])
    }
    return seed
  })

  // Preserve config keys we don't render, and drop empty values so we
  // don't override defaults with empty strings / empty lists.
  const configJson = useMemo(() => {
    const out: Record<string, unknown> = { ...initial }
    for (const f of fields) {
      const val = values[f.key]
      if (f.type === 'list') {
        if (Array.isArray(val) && val.length > 0) out[f.key] = f.item.length === 1 && f.item[0].key === 'text' ? val.map((row) => row.text ?? '') : val
        else delete out[f.key]
      } else if (f.key === 'ctaLabel') {
        if (val === '') delete out.cta
        else out.cta = { ...(typeof initial.cta === 'object' && initial.cta !== null ? initial.cta : {}), label: val }
      } else if (val === '') {
        delete out[f.key]
      } else {
        out[f.key] = val
      }
    }
    return JSON.stringify(out)
  }, [values, fields, initial])

  const set = (key: string, val: unknown) => setValues((prev) => ({ ...prev, [key]: val }))
  const str = (key: string) => String(values[key] ?? '')

  return (
    <>
      <input type="hidden" name="config" value={configJson} />
      <div className="grid gap-3">
        {fields.map((field) => {
          const section = (content: ReactNode) => (
            <details key={field.key} className="group rounded-lg border bg-card">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                <span>{field.label}</span>
                <span className="flex shrink-0 items-center gap-2 text-xs font-normal text-muted-foreground">
                  <span>Open to edit</span>
                  <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
                </span>
              </summary>
              <div className="border-t px-5 py-5">{content}</div>
            </details>
          )
          if (field.type === 'image') {
            return section(
              <>
                <FeaturedImageCard
                  label={field.label}
                  value={str(field.key)}
                  onChange={(url) => set(field.key, url)}
                />
                {field.help && (
                  <p className="pb-1 text-xs text-muted-foreground">{field.help}</p>
                )}
              </>,
            )
          }
          if (field.type === 'list') {
            return section(
              <ListField
                key={field.key}
                field={field}
                rows={(values[field.key] as ListRow[]) ?? []}
                onChange={(next) => set(field.key, next)}
              />,
            )
          }
          if (field.type === 'select') {
            return section(
              <div className="grid gap-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <select
                  id={field.key}
                  value={str(field.key)}
                  onChange={(e) => set(field.key, e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value=""> -  Default  - </option>
                  {field.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
              </div>,
            )
          }
          if (field.type === 'textarea') {
            return section(
              <div className="grid gap-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Textarea
                  id={field.key}
                  rows={4}
                  value={str(field.key)}
                  placeholder={field.placeholder}
                  onChange={(e) => set(field.key, e.target.value)}
                />
                {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
              </div>,
            )
          }
          return section(
            <div className="grid gap-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                value={str(field.key)}
                placeholder={field.placeholder}
                onChange={(e) => set(field.key, e.target.value)}
              />
              {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
            </div>,
          )
        })}
      </div>
    </>
  )
}

export default function PageBlockEdit({ loaderData, actionData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>()
  const lastResultRef = useRef<unknown>(null)

  const block = (actionData?.ok ? actionData.block : null) ?? loaderData.block
  const label = BLOCK_TYPE_LABELS[block.block_type] ?? block.block_type
  const baseFields = BLOCK_FIELDS[block.block_type]
  const fields = block.block_type === 'editorial' && /question/i.test(String(block.config.title ?? ''))
    ? baseFields?.map((field) => field.key === 'items'
      ? {
          ...field,
          label: 'Questions and answers',
          item: [
            { key: 'title', label: 'Question' },
            { key: 'body', label: 'Answer' },
          ],
        }
      : field)
    : baseFields

  useEffect(() => {
    if (!fetcher.data || fetcher.data === lastResultRef.current) return
    lastResultRef.current = fetcher.data
    if (fetcher.data.ok) {
      toast.success('Block updated')
    } else {
      toast.error(fetcher.data.error)
    }
  }, [fetcher.data])

  const isBusy = fetcher.state !== 'idle'

  return (
    <section className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            <Link to={`/page-blocks?page=${block.page_slug}`} className="hover:underline">
               -  Page Blocks ({block.page_slug})
            </Link>
          </p>
          <h2 className="admin-page-title">{label}</h2>
          <p className="admin-copy">
            Position {block.position} -... {block.visible ? 'Visible' : 'Hidden'} -... ID {block.id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to={`/page-blocks?page=${block.page_slug}`}>
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
          <fetcher.Form method="post" className="contents">
            <input type="hidden" name="intent" value="toggle" />
            <input type="hidden" name="visible" value={String(!block.visible)} />
            <Button type="submit" variant="outline" disabled={isBusy}>
              {block.visible ? (
                <>
                  <EyeOff className="mr-2 size-4" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="mr-2 size-4" />
                  Show
                </>
              )}
            </Button>
          </fetcher.Form>
          <fetcher.Form
            method="post"
            onSubmit={(e) => {
              if (!confirm(`Delete "${label}" block?`)) e.preventDefault()
            }}
            className="contents"
          >
            <input type="hidden" name="intent" value="delete" />
            <input type="hidden" name="page" value={block.page_slug} />
            <Button type="submit" variant="outline" disabled={isBusy}>
              <Trash2 className="mr-2 size-4 text-destructive" />
              Delete
            </Button>
          </fetcher.Form>
        </div>
      </header>

      <Card>
        <CardContent className="py-6">
          <fetcher.Form method="post" className="grid gap-6">
            <input type="hidden" name="intent" value="update" />
            {fields ? (
              <ConfigFields fields={fields} initial={block.config} />
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="config">Config (JSON)</Label>
                <Textarea
                  id="config"
                  name="config"
                  rows={16}
                  defaultValue={JSON.stringify(block.config, null, 2)}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  This block type has no structured fields. Edit its raw JSON config here.
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button asChild type="button" variant="outline">
                <Link to={`/page-blocks?page=${block.page_slug}`}>Cancel</Link>
              </Button>
              <Button variant="glow" type="submit" disabled={isBusy}>
                {isBusy ? 'Saving - ' : 'Save changes'}
              </Button>
            </div>
          </fetcher.Form>
        </CardContent>
      </Card>
    </section>
  )
}
