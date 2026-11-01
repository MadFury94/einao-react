import { Badge, Card, CardContent, CardHeader, CardTitle } from '@einao/ui'
import { FileText, Users } from 'lucide-react'
import { Link } from 'react-router'
import { serverBaseUrl, serverFetch, serverHeaders } from '../lib/api'
import type { Route } from './+types/home'

type DashboardStats = {
  projects_total: number
  team_members_total: number
  users_total: number
  published_posts_total: number
  recent_posts: {
    id: number
    title: string
    post_type: string
    status: string
    published_at: string | null
    created_at: string
  }[]
  projects: {
    id: number
    name: string
    slug: string
    genre: string
    status: string
    status_label: string
  }[]
}

export function meta() {
  return [{ title: 'Dashboard - Admin' }]
}

export async function loader(_: Route.LoaderArgs) {
  try {
    const headers = new Headers({ ...serverHeaders })
    const res = await serverFetch(`${serverBaseUrl}/api/v1/admin/dashboard`, {
      headers,
      credentials: 'include',
    })
    if (!res.ok) {
      return { stats: null }
    }
    const stats: DashboardStats = await res.json()
    return { stats }
  } catch {
    return { stats: null }
  }
}

const STATUS_BADGE: Record<string, string> = {
  live: 'bg-green-500/15 text-green-600 border-green-500/30',
  prototype: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/30',
  coming_soon: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  archived: 'bg-muted text-muted-foreground',
}

const POST_TYPE_BADGE: Record<string, string> = {
  blog: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  industry: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
  case_study: 'bg-orange-500/15 text-orange-600 border-orange-500/30',
  testimonial: 'bg-pink-500/15 text-pink-600 border-pink-500/30',
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { stats } = loaderData

  const statCards = [
    { label: 'Solution records', value: stats?.projects_total ?? '-', icon: FileText, href: '/page-blocks' },
    { label: 'Team Members', value: stats?.team_members_total ?? '-', icon: Users, href: '/users' },
    {
      label: 'Published Posts',
      value: stats?.published_posts_total ?? '-',
      icon: FileText,
      href: '/posts',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
      
        <h1 className="text-3xl font-bold tracking-tight page-heading">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage Einao page copy, insights, solutions, media, and contact content.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} to={href} className="group block">
            <Card className="transition-shadow group-hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Bottom two columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Posts */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recent Posts</CardTitle>
            <Link
              to="/posts"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {!stats || stats.recent_posts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No posts yet.</p>
            ) : (
              <ul className="divide-y">
                {(stats?.recent_posts ?? []).map((post) => (
                  <li key={post.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <Link
                      to={`/posts/${post.id}`}
                      className="min-w-0 text-sm font-medium hover:underline truncate"
                    >
                      {post.title}
                    </Link>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${POST_TYPE_BADGE[post.post_type] ?? ''}`}
                      >
                        {post.post_type.replace('_', ' ')}
                      </Badge>
                      <Badge
                        variant={post.status === 'published' ? 'default' : 'secondary'}
                        className="text-[10px] capitalize"
                      >
                        {post.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Solution records */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Solution records</CardTitle>
            <Link
              to="/projects"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {!stats || stats.projects.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No solution records yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-3 py-2 text-left sm:px-6">Name</th>
                      <th className="px-3 py-2 text-left sm:px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(stats?.projects ?? []).map((project) => (
                      <tr key={project.id} className="hover:bg-muted/30">
                        <td className="px-3 py-3 sm:px-6">
                          <Link
                            to={`/projects/${project.slug}`}
                            className="font-medium hover:underline"
                          >
                            {project.name}
                          </Link>
                          {project.genre && (
                            <p className="text-xs text-muted-foreground">{project.genre}</p>
                          )}
                        </td>
                        <td className="px-3 py-3 sm:px-6">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold uppercase ${STATUS_BADGE[project.status] ?? ''}`}
                          >
                            {project.status_label || project.status.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

