import { Button, Card, CardContent, Input, Label } from '@einao/ui'
import { redirect } from 'react-router'
import { createAdminGenericPost, POST_TYPE_LABELS } from '../../lib/generic-posts'
import type { Route } from './+types/new'

export function meta() {
  return [{ title: 'New content ... Admin' }]
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const title = String(formData.get('title') ?? '').trim()
  const postType = String(formData.get('post_type') ?? 'industry') as
    | 'industry'
    | 'case_study'
    | 'testimonial'

  if (!title) {
    return { ok: false as const, error: 'A title is required.' }
  }

  try {
    const post = await createAdminGenericPost({ title, post_type: postType })
    return redirect(`/content/${post.id}?created=1`)
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Could not create the entry.',
    }
  }
}

export default function NewContent({ actionData }: Route.ComponentProps) {
  const url = typeof window !== 'undefined' ? new URL(window.location.href) : null
  const postType = (url?.searchParams.get('post_type') ?? 'industry') as
    | 'industry'
    | 'case_study'
    | 'testimonial'
  const heading = `New ${POST_TYPE_LABELS[postType]?.toLowerCase() ?? 'content entry'}`

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <a
          href="/content"
          className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          ... Content
        </a>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{heading}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start with a title and jump straight into the editor.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form method="post" className="space-y-4">
            <input type="hidden" name="post_type" value={postType} />
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Enter a title..." autoFocus />
            </div>

            {actionData && !actionData.ok && (
              <p className="text-sm text-destructive">{actionData.error}</p>
            )}

            <Button variant="glow" type="submit">Create draft</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
