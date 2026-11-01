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
  Copy,
  Eye,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  Upload,
} from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { Form, Link, useFetcher } from 'react-router'
import { toast } from 'sonner'
import { DataTable } from '../../components/data-table'
import { PostStatusBadge } from '../../components/post-status-badge'
import {
  archiveAdminPost,
  formatDateTime,
  getAdminPosts,
  getBlogCategories,
  publishAdminPost,
  unpublishAdminPost,
} from '../../lib/posts'
import type { Route } from './+types/index'

type AdminPost = Awaited<ReturnType<typeof getAdminPosts>>['items'][number]

const CLIENT_ORIGIN = import.meta.env.VITE_CLIENT_URL ?? 'http://localhost:5930'

const PAGE_SIZE = 10
const STATUSES = ['all', 'draft', 'published', 'scheduled', 'archived'] as const

const POST_TYPE_LABELS: Record<string, string> = {
  all: 'All types',
  blog: 'Blog',
  industry: 'Industry',
  case_study: 'Case study',
  testimonial: 'Testimonial',
}

const POST_TYPE_BADGE_COLORS: Record<string, string> = {
  blog: 'bg-blue-100 text-blue-700',
  industry: 'bg-purple-100 text-purple-700',
  case_study: 'bg-orange-100 text-orange-700',
  testimonial: 'bg-green-100 text-green-700',
}

export function meta() {
  return [{ title: 'Posts ... Admin' }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const status = url.searchParams.get('status') || 'all'
  const category = url.searchParams.get('category') || ''
  const search = url.searchParams.get('search') || ''
  const post_type = url.searchParams.get('post_type') || 'all'
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'))

  try {
    const [posts, categories] = await Promise.all([
      getAdminPosts({
        page,
        pageSize: PAGE_SIZE,
        status: status === 'all' ? undefined : status,
        category: category || undefined,
        search: search || undefined,
        post_type: post_type === 'all' ? undefined : post_type,
      }),
      getBlogCategories(),
    ])

    return {
      posts,
      categories,
      filters: { status, category, search, post_type, page },
    }
  } catch {
    throw new Response('Failed to load posts', { status: 502 })
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = String(formData.get('intent') ?? '')
  const id = String(formData.get('id') ?? '')

  if (!/^\d+$/.test(id)) {
    return { ok: false as const, error: 'Invalid post id' }
  }

  try {
    if (intent === 'publish') {
      await publishAdminPost(id)
      return { ok: true as const, message: 'Post published' }
    }
    if (intent === 'unpublish') {
      await unpublishAdminPost(id)
      return { ok: true as const, message: 'Post moved back to draft' }
    }
    if (intent === 'archive') {
      await archiveAdminPost(id)
      return { ok: true as const, message: 'Post archived' }
    }
    return { ok: false as const, error: 'Unknown action' }
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Request failed',
    }
  }
}

export default function PostsIndex({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>()
  const lastResultRef = useRef<unknown>(null)
  const { posts, categories, filters } = loaderData

  useEffect(() => {
    if (!fetcher.data || fetcher.data === lastResultRef.current) return
    lastResultRef.current = fetcher.data

    if (fetcher.data.ok) {
      toast.success(fetcher.data.message)
      return
    }

    toast.error('Could not update post', {
      description: fetcher.data.error,
    })
  }, [fetcher.data])

  const totalPages = Math.max(1, Math.ceil(posts.total / posts.pageSize))
  const pendingId = fetcher.formData?.get('id')
  const fetcherState = fetcher.state

  // biome-ignore lint/correctness/useExhaustiveDependencies: row cells re-read fetcher state via outer closure
  const columns = useMemo<ColumnDef<AdminPost>[]>(
    () => [
      {
        id: 'title',
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => {
          const post = row.original
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Link
                  to={`/posts/${post.id}`}
                  className="font-medium text-foreground underline! underline-offset-4 hover:text-primary"
                >
                  {post.title || 'Untitled post'}
                </Link>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6 text-muted-foreground hover:text-foreground"
                      aria-label="Copy link"
                      onClick={() => copyPostLink(post.slug)}
                    >
                      <Copy className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy link</TooltipContent>
                </Tooltip>
              </div>
              <div className="text-xs text-muted-foreground">/{post.slug}</div>
            </div>
          )
        },
      },
      {
        id: 'categories',
        header: 'Categories',
        accessorFn: (row) =>
          row.categories.length > 0
            ? row.categories.map((category) => category.name).join(', ')
            : '...',
        cell: ({ row }) => {
          const cats = row.original.categories
          if (cats.length === 0) {
            return <span className="text-sm text-muted-foreground">Uncategorized</span>
          }
          return (
            <div className="flex flex-wrap gap-1">
              {cats.map((category) => (
                <Badge key={category.id} variant="secondary" className="font-normal">
                  {category.name}
                </Badge>
              ))}
            </div>
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
        id: 'post_type',
        accessorKey: 'post_type',
        header: 'Type',
        cell: ({ row }) => {
          const type = row.original.post_type ?? 'blog'
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
        id: 'author',
        header: 'Author',
        accessorFn: (row) => row.author?.name ?? '...',
        cell: ({ row }) => row.original.author?.name ?? '...',
      },
      {
        id: 'published_at',
        accessorKey: 'published_at',
        header: 'Published',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDateTime(row.original.published_at, {
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
          const post = row.original
          const isPending = fetcherState !== 'idle' && pendingId === String(post.id)
          return (
            <div className="flex justify-end gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="ghost" size="icon" className="size-8" aria-label={`Edit ${post.title || 'post'}`}>
                    <Link to={`/posts/${post.id}`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit post</TooltipContent>
              </Tooltip>
              {post.status === 'published' || post.status === 'scheduled' ? (
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
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight page-heading">
            Posts
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Search, filter, and manage your blog content lifecycle.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/page-hero-settings/blog">
              <Settings className="size-4" />
              Page Settings
            </Link>
          </Button>
          <Button asChild variant="glow">
            <Link to="/posts/new?post_type=blog">
              <Plus className="size-4" />
              New post
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((status) => {
          const params = new URLSearchParams()
          if (status !== 'all') params.set('status', status)
          if (filters.category) params.set('category', filters.category)
          if (filters.search) params.set('search', filters.search)
          if (filters.post_type !== 'all') params.set('post_type', filters.post_type)

          const active = filters.status === status
          return (
            <Button
              key={status}
              asChild
              variant="outline"
              size="sm"
              className={`capitalize rounded-full ${active ? 'page-heading border-current' : ''}`}
            >
              <Link to={params.toString() ? `/posts?${params.toString()}` : '/posts'}>
                {status}
              </Link>
            </Button>
          )
        })}
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <Form method="get" className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                name="search"
                defaultValue={filters.search}
                placeholder="Search posts..."
                className="pl-9"
              />
            </div>
            <select
              name="category"
              defaultValue={filters.category}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              {filters.status !== 'all' && (
                <input type="hidden" name="status" value={filters.status} />
              )}
              {filters.post_type !== 'all' && (
                <input type="hidden" name="post_type" value={filters.post_type} />
              )}
              <Button variant="glow" type="submit">
                Apply
              </Button>
              <Button asChild type="button" variant="outline">
                <Link to="/posts">Reset</Link>
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
            emptyState="No posts match the current filters."
          />
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button asChild variant="outline" size="sm" disabled={filters.page <= 1}>
            <Link to={pageHref(filters, filters.page - 1)}>
              <ChevronLeft className="size-4" />
              Previous
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {filters.page} of {totalPages}
          </span>
          <Button asChild variant="outline" size="sm" disabled={filters.page >= totalPages}>
            <Link to={pageHref(filters, filters.page + 1)}>
              Next
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

function pageHref(
  filters: { status: string; category: string; search: string; post_type: string; page: number },
  page: number
) {
  const params = new URLSearchParams()
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.category) params.set('category', filters.category)
  if (filters.search) params.set('search', filters.search)
  if (filters.post_type !== 'all') params.set('post_type', filters.post_type)
  if (page > 1) params.set('page', String(page))
  return params.toString() ? `/posts?${params.toString()}` : '/posts'
}

async function copyPostLink(slug: string) {
  const url = `${CLIENT_ORIGIN.replace(/\/$/, '')}/insights/${slug}`
  try {
    await navigator.clipboard.writeText(url)
    toast.success('Link copied', { description: url })
  } catch {
    toast.error('Could not copy link')
  }
}

