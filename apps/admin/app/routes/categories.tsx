import {
  deleteApiV1AdminCategoriesByTypeBySlug,
  getApiV1Categories,
  postApiV1AdminCategories,
} from '@einao/api-client'
import { Button, Card, CardContent, Input, Label } from '@einao/ui'
import type { ColumnDef } from '@tanstack/react-table'
import { FolderTree, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { Link, useFetcher } from 'react-router'
import { toast } from 'sonner'
import { DataTable } from '../components/data-table'
import '../lib/api'
import { formatDateTime, slugify } from '../lib/posts'
import type { Route } from './+types/categories'

type CategoryRow = {
  id: number
  name: string
  slug: string
  type: string
  sort_order: number
  created_at: string
  updated_at: string
}

type ActionResult = { ok: true; message: string } | { ok: false; error: string }

export function meta() {
  return [{ title: 'Categories ... Admin' }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const typeFilter = url.searchParams.get('type') ?? ''
  // Always fetch the full set so we know which types exist for the tabs.
  const { data, error } = await getApiV1Categories()
  if (error || !data) {
    throw new Response('Failed to load categories', { status: 502 })
  }
  return { categories: data as CategoryRow[], typeFilter }
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

async function createCategoryAction(form: FormData): Promise<ActionResult> {
  const name = String(form.get('name') ?? '').trim()
  const slug = String(form.get('slug') ?? '').trim() || slugify(name)
  const type = String(form.get('type') ?? '').trim() || 'project'
  const sortOrderRaw = String(form.get('sort_order') ?? '0')
  const sort_order = Number.parseInt(sortOrderRaw, 10) || 0

  if (!name) return { ok: false, error: 'Name is required' }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { ok: false, error: 'Slug must be lowercase alphanumeric with hyphens' }
  }

  const { data, error, response } = await postApiV1AdminCategories({
    body: { name, slug, type, sort_order },
  })
  if (error || !data) {
    const fallback = response.status === 409 ? 'Category already exists' : 'Could not create'
    return { ok: false, error: errorToMessage(error, fallback) }
  }
  return { ok: true, message: `Category "${data.name}" created` }
}

async function deleteCategoryAction(form: FormData): Promise<ActionResult> {
  const type = String(form.get('type') ?? '')
  const slug = String(form.get('slug') ?? '')
  if (!type || !slug) return { ok: false, error: 'Invalid category' }

  const { error, response } = await deleteApiV1AdminCategoriesByTypeBySlug({
    path: { type, slug },
  })
  if (error) {
    return {
      ok: false,
      error: response.status === 404 ? 'Category not found' : 'Could not delete category',
    }
  }
  return { ok: true, message: 'Category deleted' }
}

export async function action({ request }: Route.ActionArgs): Promise<ActionResult> {
  const formData = await request.formData()
  const intent = String(formData.get('intent') ?? '')

  try {
    if (intent === 'create') return await createCategoryAction(formData)
    if (intent === 'delete') return await deleteCategoryAction(formData)
    return { ok: false, error: 'Unknown action' }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Request failed' }
  }
}

export default function CategoriesIndex({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>()
  const lastResultRef = useRef<unknown>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const { categories, typeFilter } = loaderData

  useEffect(() => {
    if (!fetcher.data || fetcher.data === lastResultRef.current) return
    lastResultRef.current = fetcher.data

    if (fetcher.data.ok) {
      toast.success(fetcher.data.message)
      formRef.current?.reset()
      return
    }
    toast.error('Could not update categories', { description: fetcher.data.error })
  }, [fetcher.data])

  const pendingIntent = fetcher.formData?.get('intent')
  const pendingSlug = fetcher.formData?.get('slug')
  const fetcherState = fetcher.state
  const isCreating = fetcherState !== 'idle' && pendingIntent === 'create'

  const knownTypes = useMemo(
    () => Array.from(new Set(categories.map((c) => c.type))).sort(),
    [categories]
  )

  const visibleCategories = useMemo(
    () => (typeFilter ? categories.filter((c) => c.type === typeFilter) : categories),
    [categories, typeFilter]
  )

  const defaultCreateType = typeFilter || knownTypes[0] || 'project'

  // biome-ignore lint/correctness/useExhaustiveDependencies: row cells re-read fetcher state via outer closure
  const columns = useMemo<ColumnDef<CategoryRow>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-2 font-medium">
            <FolderTree className="size-4 text-muted-foreground" />
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
        id: 'type',
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <span className="inline-flex rounded bg-muted px-2 py-0.5 font-mono text-xs uppercase">
            {row.original.type}
          </span>
        ),
      },
      {
        id: 'sort_order',
        accessorKey: 'sort_order',
        header: 'Order',
        cell: ({ row }) => <span className="tabular-nums">{row.original.sort_order}</span>,
      },
      {
        id: 'updated_at',
        accessorKey: 'updated_at',
        header: 'Updated',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDateTime(row.original.updated_at, {
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
          const cat = row.original
          const isPending =
            fetcherState !== 'idle' && pendingIntent === 'delete' && pendingSlug === cat.slug
          return (
            <div className="flex justify-end">
              <fetcher.Form
                method="post"
                onSubmit={(e) => {
                  if (!confirm(`Delete category "${cat.name}"?`)) {
                    e.preventDefault()
                  }
                }}
              >
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="type" value={cat.type} />
                <input type="hidden" name="slug" value={cat.slug} />
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
    [fetcherState, pendingIntent, pendingSlug]
  )

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight page-heading">Categories</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Curated, ordered taxonomy. Each `type` is its own independent set (blog vs. game vs.
          service, etc.).
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className={`rounded-full ${typeFilter === '' ? 'page-heading border-current' : ''}`}>
          <Link to="/categories">All</Link>
        </Button>
        {knownTypes.map((t) => {
          const active = typeFilter === t
          return (
            <Button
              key={t}
              asChild
              variant="outline"
              size="sm"
              className={`capitalize rounded-full ${active ? 'page-heading border-current' : ''}`}
            >
              <Link to={`/categories?type=${encodeURIComponent(t)}`}>{t}</Link>
            </Button>
          )
        })}
      </div>

      <Card>
        <CardContent className="pt-6">
          <fetcher.Form
            ref={formRef}
            method="post"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_160px_100px_auto] lg:items-end"
          >
            <div className="grid gap-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input id="cat-name" name="name" placeholder="Web Design" required minLength={1} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                name="slug"
                placeholder="web-design (auto from name)"
                pattern="[a-z0-9\-]+"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cat-type">Type</Label>
              <Input
                id="cat-type"
                name="type"
                list="known-category-types"
                placeholder="project"
                defaultValue={defaultCreateType}
                required
              />
              <datalist id="known-category-types">
                {knownTypes.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cat-sort">Order</Label>
              <Input id="cat-sort" name="sort_order" type="number" defaultValue={0} />
            </div>
            <input type="hidden" name="intent" value="create" />
            <Button type="submit" disabled={isCreating}>
              <Plus className="size-4" />
              {isCreating ? 'Creating...' : 'Add category'}
            </Button>
          </fetcher.Form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={visibleCategories}
            getRowId={(row) => `${row.type}/${row.slug}`}
            emptyState={
              typeFilter
                ? `No "${typeFilter}" categories yet.`
                : 'No categories yet. Create one above to get started.'
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
