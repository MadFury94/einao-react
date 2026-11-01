import { Button, Card, CardContent } from '@einao/ui'
import { Form, Link, redirect } from 'react-router'
import {
  formatDateTime,
  getAdminPost,
  getPostRevisions,
  restorePostRevision,
} from '../../lib/posts'
import type { Route } from './+types/$id.revisions'

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.post ? `${data.post.title} revisions ... Admin` : 'Post revisions ... Admin' }]
}

export async function loader({ params }: Route.LoaderArgs) {
  if (!/^\d+$/.test(params.id ?? '')) {
    throw new Response('Invalid post id', { status: 400 })
  }

  try {
    const [post, revisions] = await Promise.all([
      getAdminPost(params.id),
      getPostRevisions(params.id),
    ])
    return { post, revisions }
  } catch {
    throw new Response('Failed to load revisions', { status: 502 })
  }
}

export async function action({ params, request }: Route.ActionArgs) {
  const formData = await request.formData()
  const revisionId = String(formData.get('revisionId') ?? '')

  if (!/^\d+$/.test(params.id ?? '') || !/^\d+$/.test(revisionId)) {
    return { ok: false as const, error: 'Invalid revision selection.' }
  }

  try {
    await restorePostRevision(params.id, revisionId)
    return redirect(`/posts/${params.id}?restored=1`)
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Could not restore revision.',
    }
  }
}

export default function PostRevisions({ loaderData, actionData }: Route.ComponentProps) {
  const { post, revisions } = loaderData

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to={`/posts/${post.id}`}
            className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            ... Back to editor
          </Link>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight page-heading">Revision history</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Restore a previous snapshot of{' '}
            <span className="font-medium text-foreground">{post.title}</span>.
          </p>
        </div>
      </div>

      {actionData && !actionData.ok && (
        <p className="text-sm text-destructive">{actionData.error}</p>
      )}

      <div className="space-y-3">
        {revisions.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              No saved revisions yet.
            </CardContent>
          </Card>
        ) : (
          revisions.map((revision) => (
            <Card key={revision.id}>
              <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="font-medium">{revision.title || 'Untitled revision'}</div>
                  <div className="text-sm text-muted-foreground">
                    Saved{' '}
                    {formatDateTime(revision.created_at, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
                <Form method="post">
                  <input type="hidden" name="revisionId" value={revision.id} />
                  <Button type="submit" variant="outline">
                    Restore revision
                  </Button>
                </Form>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
