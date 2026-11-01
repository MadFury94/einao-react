import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@einao/ui'
import type { ColumnDef } from '@tanstack/react-table'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { Form, Link, useFetcher } from 'react-router'
import { toast } from 'sonner'
import { DataTable } from '../../components/data-table'
import { PostStatusBadge } from '../../components/post-status-badge'
import {
  archiveAdminGenericPost,
  getAdminGenericPosts,
  POST_TYPE_BADGE_COLORS,
  POST_TYPE_LABELS,
  publishAdminGenericPost,
  unpublishAdminGenericPost,
} from '../../lib/generic-posts'
import { formatDateTime, getBlogCategories } from '../../lib/posts'
import type { Route } from './+types/index'

type AdminGenericPost = Awaited<ReturnType<typeof getAdminGenericPosts>>['items'][number]

const PAGE_SIZE = 10
const STATUSES = ['all', 'draft', 'published', 'archived'] as const

export function meta() {
  return [{ title: 'Content ... Admin' }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const status = url.searchParams.get('status') || 'all'
  const post_type = url.searchParams.get('post_type') || 'all'
  const search = url.searchParams.get('search') || ''
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'))

  try {
    const [posts, categories] = await Promise.all([
      getAdminGenericPosts({
        page,
        pageSize: PAGE_SIZE,
        status: status === 'all' ? undefined : status,
        post_type: post_type === 'all' ? undefined : post_type,
        search: search || undefined,
      }),
      getBlogCategories(),
    ])

    return { posts, categories, filters: { status, post_type, search, page } }
  } catch {
    throw new Response('Failed to load content', { status: 502 })
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = String(formData.get('intent') ?? '')
  const id = String(formData.get('id') ?? '')

  if (!/^\d+$/.test(id)) {
    return { ok: false as const, error: 'Invalid id' }
  }

  try {
    if (intent === 'publish') {
      await publishAdminGenericPost(id)
      return { ok: true as const, message: 'Published' }
    }
    if (intent === 'unpublish') {
      await unpublishAdminGenericPost(id)
      return { ok: true as const, message: 'Moved back to draft' }
    }
    if (intent === 'archive') {
      await archiveAdminGenericPost(id)
      return { ok: true as const, message: 'Archived' }
    }
    return { ok: false as const, error: 'Unknown action' }
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Request failed',
    }
  }
}

export default function ContentIndex({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>()
  const lastResultRef = useRef<unknown>(null)
  const { posts, filters } = loaderData

  useEffect(() => {
    if (!fetcher.data || fetcher.data === lastResultRef.current) return
    lastResultRef.current = fetcher.data
    if (fetcher.data.ok) {
      toast.success(fetcher.data.message)
      return
    }
    toast.error('Action failed', { description: fetcher.data.error })
  }, [fetcher.data])

  const totalPages = Math.max(1, Math.ceil(posts.total / posts.pageSize))
  const pendingId = fetcher.formData?.get('id')
  const fetcherState = fetcher.state

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetcher state accessed via closure
  const columns = useMemo<ColumnDef<AdminGenericPost>[]>(
    () => [
      {
        id: 'title',
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => {
          const post = row.original
          return (
            <div className="space-y-1">
              <Link
                to={`/content/${post.id}`}
                className="font-medium text-foreground underline! underline-offset-4 hover:text-primary"
              >
                {post.title || 'Untitled'}
              </Link>
              {post.subtitle && (
                <div className="text-xs text-muted-foreground">{post.subtitle}</div>
              )}
            </div>
          )
        },
      },
      {
        id: 'post_type',
        accessorKey: 'post_type',
        header: 'Type',
        cell: ({ row }) => {
          const type = row.original.post_type
          return (
            <Badge
              variant="secondary"
              className={`font-normal text-xs ${POST_TYPE_BADGE_COLORS[type] ?? ''}`}
            >
              {POST_TYPE_LABELS[type] ?? type}
            </Badge>
          )
        },
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <PostStatusBadge status={row.original.status} />,
      },
      {
        id: 'published_at',
        accessorKey: 'published_at',
        header: 'Published',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDateTime(row.original.published_at, { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
        cell: ({ row }) => {
          const post = row.original
          const isPending = fetcherState !== 'idle' && pendingId === String(post.id)
          return (
            <div className="flex justify-end gap-1">
              {post.status === 'published' ? (
                <fetcher.Form method="post">
                  <input type="hidden" name="intent" value="unpublish" />
                  <input type="hidden" name="id" value={post.id} />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={isPending}
                        aria-label="Unpublish"
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Unpublish</TooltipContent>
                  </Tooltip>
                </fetcher.Form>
              ) : post.status !== 'archived' ? (
                <fetcher.Form method="post">
                  <input type="hidden" name="intent" value="publish" />
                  <input type="hidden" name="id" value={post.id} />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={isPending}
                        aria-label="Publish"
                      >
                        <Upload className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Publish</TooltipContent>
                  </Tooltip>
                </fetcher.Form>
              ) : null}
              {post.status !== 'archived' && (
                <fetcher.Form method="post">
                  <input type="hidden" name="intent" value="archive" />
                  <input type="hidden" name="id" value={post.id} />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={isPending}
                        aria-label="Archive"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Archive</TooltipContent>
                  </Tooltip>
                </fetcher.Form>
              )}
            </div>
          )
        },
      },
    ],
    [fetcherState, pendingId]
  )

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight page-heading">Generic Posts</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage industry cards, case studies, and testimonials.
          </p>
        </div>
        <Button asChild variant="glow">
          <Link to={`/content/new?post_type=${filters.post_type === 'all' ? 'case_study' : filters.post_type}`}>
            New {filters.post_type === 'case_study' ? 'case study' : filters.post_type === 'industry' ? 'industry' : 'content'}
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const params = new URLSearchParams()
          if (s !== 'all') params.set('status', s)
          if (filters.post_type !== 'all') params.set('post_type', filters.post_type)
          if (filters.search) params.set('search', filters.search)
          const active = filters.status === s
          return (
            <Button
              key={s}
              asChild
              variant="outline"
              size="sm"
              className={`capitalize rounded-full ${active ? 'page-heading border-current' : ''}`}
            >
              <Link to={params.toString() ? `/content?${params.toString()}` : '/content'}>{s}</Link>
            </Button>
          )
        })}
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <Form method="get" className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                name="search"
                defaultValue={filters.search}
                placeholder="Search content..."
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {filters.status !== 'all' && (
                <input type="hidden" name="status" value={filters.status} />
              )}
              {filters.post_type !== 'all' && (
                <input type="hidden" name="post_type" value={filters.post_type} />
              )}
              <Button variant="glow" type="submit">Apply</Button>
              <Button asChild type="button" variant="outline">
                <Link to="/content">Reset</Link>
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={posts.items}
            getRowId={(row) => String(row.id)}
            emptyState="No content matches the current filters."
          />
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button asChild variant="outline" size="sm" disabled={filters.page <= 1}>
            <Link to={pageHref(filters, filters.page - 1)}>
              <ChevronLeft className="size-4" /> Previous
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {filters.page} of {totalPages}
          </span>
          <Button asChild variant="outline" size="sm" disabled={filters.page >= totalPages}>
            <Link to={pageHref(filters, filters.page + 1)}>
              Next <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

function pageHref(
  filters: { status: string; post_type: string; search: string; page: number },
  page: number
) {
  const params = new URLSearchParams()
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.post_type !== 'all') params.set('post_type', filters.post_type)
  if (filters.search) params.set('search', filters.search)
  if (page > 1) params.set('page', String(page))
  return params.toString() ? `/content?${params.toString()}` : '/content'
}
