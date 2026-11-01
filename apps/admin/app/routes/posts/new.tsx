import { Button, Card, CardContent, Input, Label } from '@einao/ui'
import { redirect } from 'react-router'
import { createAdminPost, EMPTY_POST_CONTENT } from '../../lib/posts'
import type { Route } from './+types/new'

const POST_TYPE_TITLES: Record<string, string> = {
  blog: 'New blog post',
  industry: 'New industry card',
  case_study: 'New case study',
  testimonial: 'New testimonial',
}

export function meta() {
  return [{ title: 'New post ... Admin' }]
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const title = String(formData.get('title') ?? '').trim()
  const postType = String(formData.get('post_type') ?? 'blog')

  if (!title) {
    return { ok: false as const, error: 'A title is required to create a post.' }
  }

  try {
    const post = await createAdminPost({
      title,
      content_json: JSON.stringify(EMPTY_POST_CONTENT),
      content_html: '',
      post_type: postType,
    })
    return redirect(`/posts/${post.id}?created=1`)
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Could not create the post.',
    }
  }
}

export default function NewPost({ actionData }: Route.ComponentProps) {
  const url = typeof window !== 'undefined' ? new URL(window.location.href) : null
  const postType = url?.searchParams.get('post_type') ?? 'blog'
  const heading = POST_TYPE_TITLES[postType] ?? 'New post'

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <a
          href="/posts"
          className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          ... Posts
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
              <Input id="title" name="title" placeholder="How we built Einao..." autoFocus />
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
