import { Button, Card, CardContent, Input, Label, Switch } from '@einao/ui'
import { useState } from 'react'
import { Form, Link, useNavigation } from 'react-router'
import { ImageField } from './image-field'
import { TagPicker } from './tag-picker'
import { TipTapEditor } from './tiptap-editor'

export type ProjectFormDefaults = {
  name?: string
  slug?: string
  description?: string
  main_image_url?: string
  link_url?: string
  tags?: string[]
  is_featured?: boolean
}

export function ProjectForm({
  defaults,
  fieldErrors = {},
  submitLabel,
  cancelTo = '/projects',
  availableTags = [],
}: {
  defaults?: ProjectFormDefaults
  fieldErrors?: Record<string, string[]>
  submitLabel: string
  cancelTo?: string
  availableTags?: string[]
}) {
  const navigation = useNavigation()
  const isSaving = navigation.state === 'submitting'
  const rootError = fieldErrors._root?.join(', ')
  const [description, setDescription] = useState(defaults?.description ?? '')
  const [isFeatured, setIsFeatured] = useState(defaults?.is_featured ?? false)

  return (
    <Form method="post">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6 min-w-0">
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={defaults?.name ?? ''}
                placeholder="e.g. Brand Redesign for Acme Corp"
                aria-invalid={fieldErrors.name ? true : undefined}
                className={`h-12 text-xl font-semibold ${
                  fieldErrors.name ? 'border-destructive focus-visible:ring-destructive/40' : ''
                }`}
              />
              {fieldErrors.name && (
                <p className="text-xs text-destructive">{fieldErrors.name.join(', ')}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  defaultValue={defaults?.slug ?? ''}
                  placeholder="brand-redesign-acme"
                  className="font-mono text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="link_url">External Link</Label>
                <Input
                  id="link_url"
                  name="link_url"
                  type="url"
                  defaultValue={defaults?.link_url ?? ''}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <input type="hidden" name="description" value={description} />
            <TipTapEditor
              content={defaults?.description || ''}
              onUpdate={(_json, html) => setDescription(html)}
            />
            {fieldErrors.description && (
              <p className="text-xs text-destructive">{fieldErrors.description.join(', ')}</p>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <div className="flex flex-col gap-2">
                <Button variant="glow" type="submit" disabled={isSaving} className="w-full">
                  {isSaving ? 'Saving...' : submitLabel}
                </Button>
                <Button type="button" variant="ghost" asChild className="w-full">
                  <Link to={cancelTo}>Cancel</Link>
                </Button>
              </div>
              {rootError && <p className="text-xs text-destructive">{rootError}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <ImageField
                label="Featured image"
                name="main_image_url"
                defaultValue={defaults?.main_image_url ?? ''}
                folder="projects"
                errors={fieldErrors.main_image_url}
                hint="Upload to R2 or paste an absolute URL / app-relative path."
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <TagPicker
                availableTags={availableTags}
                defaultValue={defaults?.tags ?? []}
                errors={fieldErrors.tags}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_featured" className="text-sm">
                  Featured game
                </Label>
                <Switch id="is_featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
              <input type="hidden" name="is_featured" value={String(isFeatured)} />
              <p className="text-xs text-muted-foreground">
                Featured games are highlighted on the homepage.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </Form>
  )
}

export function parseProjectForm(formData: FormData) {
  const tagsRaw = String(formData.get('tags') ?? '')
  const tags = tagsRaw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
  return {
    name: String(formData.get('name') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    description: String(formData.get('description') ?? ''),
    main_image_url: String(formData.get('main_image_url') ?? ''),
    link_url: String(formData.get('link_url') ?? ''),
    tags,
    is_featured: formData.get('is_featured') === 'true',
  }
}

export function extractFieldErrors(actionData: unknown): Record<string, string[]> {
  if (!actionData || typeof actionData !== 'object') return {}
  const obj = actionData as { ok?: boolean; error?: unknown }
  if (obj.ok || !obj.error || typeof obj.error !== 'object') return {}
  const err = obj.error as { error?: Record<string, string[]> }
  return err.error ?? {}
}
