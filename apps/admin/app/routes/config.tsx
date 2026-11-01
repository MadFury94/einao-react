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
  Switch,
  Textarea,
} from '@einao/ui'
import { Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Form, Link, useNavigation } from 'react-router'
import { toast } from 'sonner'
import '../lib/api'
import type { Route } from './+types/config'

export function meta() {
  return [{ title: 'App Config ... Admin' }]
}

export async function loader() {
  const { data, error } = await getApiV1Config()
  if (error || !data) throw new Response('Failed to load config', { status: 502 })
  return { config: data }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const body = {
    name: String(formData.get('name') ?? ''),
    hero_headline: String(formData.get('hero_headline') ?? ''),
    manifest: String(formData.get('manifest') ?? ''),
    copyright_text: String(formData.get('copyright_text') ?? ''),
    coming_soon_enabled: formData.get('coming_soon_enabled') === 'on',
    cta_title: String(formData.get('cta_title') ?? ''),
    cta_description: String(formData.get('cta_description') ?? ''),
    cta_button_label: String(formData.get('cta_button_label') ?? ''),
    cta_button_href: String(formData.get('cta_button_href') ?? ''),
  }

  const { data, error } = await postApiV1AdminConfig({ body })
  if (error) {
    return { ok: false as const, error }
  }
  return { ok: true as const, config: data }
}

export default function ConfigRoute({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation()
  const isSaving = navigation.state === 'submitting'
  const config = actionData?.ok ? actionData.config : loaderData.config
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(config.coming_soon_enabled ?? false)
  const [activeTab, setActiveTab] = useState('brand')
  const fieldErrors: Record<string, string[]> =
    actionData && !actionData.ok && actionData.error && typeof actionData.error === 'object'
      ? ((actionData.error as { error?: Record<string, string[]> }).error ?? {})
      : {}
  const rootError = fieldErrors._root?.join(', ')

  // Fire toasts on each new action result (use ref to avoid duplicate fires from re-renders)
  const lastActionRef = useRef<unknown>(null)
  useEffect(() => {
    if (!actionData || actionData === lastActionRef.current) return
    lastActionRef.current = actionData
    if (actionData.ok) {
      toast.success('Site config saved', {
        description: 'Your changes are live across the public site.',
      })
    } else {
      const fieldCount = Object.keys(fieldErrors).filter((k) => k !== '_root').length
      toast.error(rootError || 'Could not save changes', {
        description: fieldCount
          ? `${fieldCount} field${fieldCount === 1 ? '' : 's'} need attention.`
          : 'Please review the form and try again.',
      })
    }
  }, [actionData, fieldErrors, rootError])

  const tabs = [
    { id: 'brand', label: 'Brand' },
    { id: 'cta', label: 'CTA' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight page-heading">Site config</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Update the public-facing metadata used across the main Einao experience.
          </p>
        </div>
        <Button variant="glow" type="submit" form="config-form" disabled={isSaving} className="shrink-0 mt-1">
          {isSaving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>

      {/* Maintenance toggle ... always visible at the top */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Switch
            id="coming_soon_enabled_top"
            checked={maintenanceEnabled}
            onCheckedChange={setMaintenanceEnabled}
            form="config-form"
          />
          <Label htmlFor="coming_soon_enabled_top" className="text-sm font-medium cursor-pointer">
            Maintenance mode
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${maintenanceEnabled ? 'bg-destructive/15 text-destructive' : 'text-muted-foreground'}`}>
            {maintenanceEnabled ? 'Coming Soon page is live' : 'Site is live'}
          </span>
          <Button asChild variant="ghost" size="icon" title="Coming Soon page settings" className="h-7 w-7">
            <Link to="/page-blocks?page=coming-soon">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border bg-muted/50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-background page-heading shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Form id="config-form" method="post" className="space-y-6">
        {/* Hidden input for maintenance toggle */}
        <input type="hidden" name="coming_soon_enabled" value={maintenanceEnabled ? 'on' : ''} />
        {/* Brand tab */}
        <div className={activeTab === 'brand' ? '' : 'hidden'}>
          <Card>
            <CardHeader>
              <CardTitle>Brand</CardTitle>
              <CardDescription>How the app introduces itself.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Field label="App name" name="name" defaultValue={config.name} errors={fieldErrors.name} />
              <Field label="Copyright text" name="copyright_text" defaultValue={config.copyright_text} errors={fieldErrors.copyright_text} />
              <Field label="Hero headline" name="hero_headline" defaultValue={config.hero_headline} errors={fieldErrors.hero_headline} multiline />
              <Field label="Manifest" name="manifest" defaultValue={config.manifest} errors={fieldErrors.manifest} multiline />
            </CardContent>
          </Card>
        </div>

        {/* CTA tab */}
        <div className={activeTab === 'cta' ? '' : 'hidden'}>
          <Card>
            <CardHeader>
              <CardTitle>Call to Action</CardTitle>
              <CardDescription>The CTA banner shown across the site.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Field label="CTA Title" name="cta_title" defaultValue={config.cta_title} errors={fieldErrors.cta_title} />
              <Field label="CTA Description" name="cta_description" defaultValue={config.cta_description} errors={fieldErrors.cta_description} multiline />
              <Field label="Button Label" name="cta_button_label" defaultValue={config.cta_button_label} errors={fieldErrors.cta_button_label} />
              <Field label="Button URL" name="cta_button_href" type="url" defaultValue={config.cta_button_href} errors={fieldErrors.cta_button_href} />
            </CardContent>
          </Card>
        </div>


      </Form>
    </div>
  )
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  errors,
  multiline = false,
}: {
  label: string
  name: string
  defaultValue: string
  type?: string
  errors?: string[]
  multiline?: boolean
}) {
  const hasError = errors && errors.length > 0
  const Control = multiline ? Textarea : Input
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Control
        id={name}
        name={name}
        type={multiline ? undefined : type}
        defaultValue={defaultValue}
        aria-invalid={hasError || undefined}
        rows={multiline ? 4 : undefined}
        className={hasError ? 'border-destructive focus-visible:ring-destructive/40' : ''}
      />
      {hasError && <p className="text-xs text-destructive">{errors.join(', ')}</p>}
    </div>
  )
}

