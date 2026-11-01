import {
  deleteApiV1AdminTagsById,
  getApiV1Tags,
  postApiV1AdminTags,
  postApiV1AdminTagsByIdMerge,
  putApiV1AdminTagsById,
} from '@einao/api-client'
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@einao/ui'
import type { ColumnDef } from '@tanstack/react-table'
import { Merge, Pencil, Plus, Tag as TagIcon, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFetcher } from 'react-router'
import { toast } from 'sonner'
import { DataTable } from '../components/data-table'
import '../lib/api'
import { formatDateTime } from '../lib/posts'
import type { Route } from './+types/tags'

type TagRow = {
  id: number
  name: string
  slug: string
  created_at: string
}

type ActionResult = { ok: true; message: string } | { ok: false; error: string }

export function meta() {
  return [{ title: 'Tags ... Admin' }]
}

export async function loader(_: Route.LoaderArgs) {
  const { data, error } = await getApiV1Tags()
  if (error || !data) {
    throw new Response('Failed to load tags', { status: 502 })
  }
  return { tags: data as TagRow[] }
}

function errorToMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'error' in error) {
    const inner = (error as { error: unknown }).error
    if (typeof inner === 'string') return inner
    if (inner && typeof inner === 'object') {
      return Object.entries(inner as Record<string, unknown>)
        .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : String(m)}`)
        .join('; ')
    }
  }
  return fallback
}

async function createTagAction(form: FormData): Promise<ActionResult> {
  const name = String(form.get('name') ?? '').trim()
  const slug = String(form.get('slug') ?? '').trim() || undefined
  if (!name) return { ok: false, error: 'Tag name is required' }

  const { data, error, response } = await postApiV1AdminTags({
    body: slug ? { name, slug } : { name },
  })
  if (error || !data) {
    const fallback = response.status === 409 ? 'Tag already exists' : 'Could not create tag'
    return { ok: false, error: errorToMessage(error, fallback) }
  }
  return { ok: true, message: `Tag "${data.name}" created` }
}

async function renameTagAction(form: FormData): Promise<ActionResult> {
  const rawId = String(form.get('id') ?? '')
  if (!/^\d+$/.test(rawId)) return { ok: false, error: 'Invalid tag id' }
  const name = String(form.get('name') ?? '').trim()
  const slug = String(form.get('slug') ?? '').trim()
  const body: { name?: string; slug?: string } = {}
  if (name) body.name = name
  if (slug) body.slug = slug
  if (!body.name && !body.slug) return { ok: false, error: 'Nothing to update' }

  const { data, error, response } = await putApiV1AdminTagsById({
    path: { id: rawId as unknown as number },
    body,
  })
  if (error || !data) {
    const fallback =
      response.status === 404
        ? 'Tag not found'
        : response.status === 409
          ? 'Another tag already uses that name or slug'
          : 'Could not rename tag'
    return { ok: false, error: errorToMessage(error, fallback) }
  }
  return { ok: true, message: `Renamed to "${data.name}"` }
}

async function mergeTagAction(form: FormData): Promise<ActionResult> {
  const rawId = String(form.get('id') ?? '')
  const rawInto = String(form.get('into_id') ?? '')
  if (!/^\d+$/.test(rawId) || !/^\d+$/.test(rawInto)) {
    return { ok: false, error: 'Invalid tag ids' }
  }

  const { data, error, response } = await postApiV1AdminTagsByIdMerge({
    path: { id: rawId as unknown as number },
    body: { into_id: Number(rawInto) },
  })
  if (error || !data) {
    const fallback = response.status === 404 ? 'Tag not found' : 'Could not merge tags'
    return { ok: false, error: errorToMessage(error, fallback) }
  }
  return { ok: true, message: `Merged into "${data.name}"` }
}

async function deleteTagAction(form: FormData): Promise<ActionResult> {
  const rawId = String(form.get('id') ?? '')
  if (!/^\d+$/.test(rawId)) return { ok: false, error: 'Invalid tag id' }

  const { error, response } = await deleteApiV1AdminTagsById({
    path: { id: rawId as unknown as number },
  })
  if (error) {
    return {
      ok: false,
      error: response.status === 404 ? 'Tag not found' : 'Could not delete tag',
    }
  }
  return { ok: true, message: 'Tag deleted' }
}

export async function action({ request }: Route.ActionArgs): Promise<ActionResult> {
  const formData = await request.formData()
  const intent = String(formData.get('intent') ?? '')

  try {
    if (intent === 'create') return await createTagAction(formData)
    if (intent === 'rename') return await renameTagAction(formData)
    if (intent === 'merge') return await mergeTagAction(formData)
    if (intent === 'delete') return await deleteTagAction(formData)
    return { ok: false, error: 'Unknown action' }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Request failed' }
  }
}

type DialogState =
  | { kind: 'closed' }
  | { kind: 'rename'; tag: TagRow }
  | { kind: 'merge'; tag: TagRow }

export default function TagsIndex({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>()
  const lastResultRef = useRef<unknown>(null)
  const createFormRef = useRef<HTMLFormElement>(null)
  const { tags } = loaderData
  const [dialog, setDialog] = useState<DialogState>({ kind: 'closed' })

  useEffect(() => {
    if (!fetcher.data || fetcher.data === lastResultRef.current) return
    lastResultRef.current = fetcher.data

    if (fetcher.data.ok) {
      toast.success(fetcher.data.message)
      createFormRef.current?.reset()
      setDialog({ kind: 'closed' })
      return
    }
    toast.error('Could not update tags', { description: fetcher.data.error })
  }, [fetcher.data])

  const pendingIntent = fetcher.formData?.get('intent')
  const pendingId = fetcher.formData?.get('id')
  const fetcherState = fetcher.state
  const isCreating = fetcherState !== 'idle' && pendingIntent === 'create'
  const isSubmittingDialog =
    fetcherState !== 'idle' && (pendingIntent === 'rename' || pendingIntent === 'merge')

  // biome-ignore lint/correctness/useExhaustiveDependencies: row cells re-read fetcher state via outer closure
  const columns = useMemo<ColumnDef<TagRow>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-2 font-medium">
            <TagIcon className="size-4 text-muted-foreground" />
            {row.original.name}
          </div>
        ),
      },
      {
        id: 'slug',
        accessorKey: 'slug',
        header: 'Slug',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">/{row.original.slug}</span>
        ),
      },
      {
        id: 'created_at',
        accessorKey: 'created_at',
        header: 'Created',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDateTime(row.original.created_at, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
        cell: ({ row }) => {
          const tag = row.original
          const isPending =
            fetcherState !== 'idle' && pendingIntent === 'delete' && pendingId === String(tag.id)
          return (
            <div className="flex justify-end gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDialog({ kind: 'rename', tag })}
              >
                <Pencil className="size-4" />
                Rename
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDialog({ kind: 'merge', tag })}
                disabled={tags.length < 2}
              >
                <Merge className="size-4" />
                Merge
              </Button>
              <fetcher.Form
                method="post"
                onSubmit={(e) => {
                  if (!confirm(`Delete tag "${tag.name}"?`)) {
                    e.preventDefault()
                  }
                }}
              >
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="id" value={tag.id} />
                <Button type="submit" variant="ghost" size="sm" disabled={isPending}>
                  <Trash2 className="size-4 text-destructive" />
                  Delete
                </Button>
              </fetcher.Form>
            </div>
          )
        },
      },
    ],
    [fetcherState, pendingIntent, pendingId, tags.length]
  )

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight page-heading">Tags</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Flat, free-form labels shared across posts and games. Slugs power public URLs ...
          renaming a tag preserves its references.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <fetcher.Form
            ref={createFormRef}
            method="post"
            className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <div className="grid gap-2">
              <Label htmlFor="tag-name">Name</Label>
              <Input
                id="tag-name"
                name="name"
                placeholder="e.g. Cloudflare"
                required
                minLength={1}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tag-slug">Slug</Label>
              <Input
                id="tag-slug"
                name="slug"
                placeholder="cloudflare (auto from name)"
                pattern="[a-z0-9\-]+"
              />
            </div>
            <input type="hidden" name="intent" value="create" />
            <Button type="submit" disabled={isCreating}>
              <Plus className="size-4" />
              {isCreating ? 'Creating...' : 'Add tag'}
            </Button>
          </fetcher.Form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={tags}
            getRowId={(row) => String(row.id)}
            emptyState="No tags yet. Create one above to get started."
          />
        </CardContent>
      </Card>

      <Dialog
        open={dialog.kind === 'rename'}
        onOpenChange={(open) => !open && setDialog({ kind: 'closed' })}
      >
        <DialogContent>
          {dialog.kind === 'rename' && (
            <>
              <DialogHeader>
                <DialogTitle>Rename tag</DialogTitle>
                <DialogDescription>
                  Update the name and/or slug. Existing posts and games keep their reference.
                </DialogDescription>
              </DialogHeader>
              <fetcher.Form method="post" className="grid gap-4">
                <input type="hidden" name="intent" value="rename" />
                <input type="hidden" name="id" value={dialog.tag.id} />
                <div className="grid gap-2">
                  <Label htmlFor="rename-name">Name</Label>
                  <Input
                    id="rename-name"
                    name="name"
                    defaultValue={dialog.tag.name}
                    required
                    minLength={1}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rename-slug">Slug</Label>
                  <Input
                    id="rename-slug"
                    name="slug"
                    defaultValue={dialog.tag.slug}
                    pattern="[a-z0-9\-]+"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialog({ kind: 'closed' })}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmittingDialog}>
                    {isSubmittingDialog ? 'Saving...' : 'Save'}
                  </Button>
                </DialogFooter>
              </fetcher.Form>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialog.kind === 'merge'}
        onOpenChange={(open) => !open && setDialog({ kind: 'closed' })}
      >
        <DialogContent>
          {dialog.kind === 'merge' && (
            <>
              <DialogHeader>
                <DialogTitle>Merge tag</DialogTitle>
                <DialogDescription>
                  Move all references from <strong>{dialog.tag.name}</strong> to another tag. The
                  original tag will be deleted. This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <fetcher.Form method="post" className="grid gap-4">
                <input type="hidden" name="intent" value="merge" />
                <input type="hidden" name="id" value={dialog.tag.id} />
                <div className="grid gap-2">
                  <Label htmlFor="merge-into">Merge into</Label>
                  <select
                    id="merge-into"
                    name="into_id"
                    required
                    defaultValue=""
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <option value="" disabled>
                      Choose a target tag...
                    </option>
                    {tags
                      .filter((t) => t.id !== dialog.tag.id)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} (/{t.slug})
                        </option>
                      ))}
                  </select>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialog({ kind: 'closed' })}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="destructive" disabled={isSubmittingDialog}>
                    {isSubmittingDialog ? 'Merging...' : 'Merge'}
                  </Button>
                </DialogFooter>
              </fetcher.Form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
