import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Textarea,
} from '@einao/ui'
import { Heading, Loader2, Search, Sparkles, WandSparkles } from 'lucide-react'
import { useState } from 'react'

type AiAction = 'generate' | 'rewrite' | 'suggest-title' | 'seo'

export type AiAssistantProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Current post content (HTML) for context */
  postContent?: string
  /** Current post title */
  postTitle?: string
  /** Callback when generated content should be inserted */
  onInsertContent?: (html: string) => void
  /** Callback when a title is chosen */
  onSelectTitle?: (title: string) => void
  /** Callback when SEO meta is generated */
  onApplySeo?: (seoTitle: string, seoDescription: string) => void
}

const API_BASE =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD ? 'https://einao-api.einaodevv.workers.dev' : 'http://localhost:8787')

async function aiRequest<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1/admin/ai/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`AI request failed: ${res.statusText}`)
  return res.json()
}

export function AiAssistant({
  open,
  onOpenChange,
  postContent,
  postTitle,
  onInsertContent,
  onSelectTitle,
  onApplySeo,
}: AiAssistantProps) {
  const [action, setAction] = useState<AiAction | null>(null)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [titles, setTitles] = useState<string[] | null>(null)
  const [seoResult, setSeoResult] = useState<{ seoTitle: string; seoDescription: string } | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setAction(null)
    setPrompt('')
    setResult(null)
    setTitles(null)
    setSeoResult(null)
    setError(null)
  }

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const data = await aiRequest<{ result: string }>('generate', {
        prompt,
        context: postContent?.slice(0, 3000),
      })
      setResult(data.result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleRewrite() {
    if (!postContent) {
      setError('No content to rewrite. Write some content first.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await aiRequest<{ result: string }>('rewrite', {
        content: postContent.slice(0, 8000),
        instruction: prompt || 'Improve the writing quality and make it more engaging',
      })
      setResult(data.result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleSuggestTitle() {
    if (!postContent) {
      setError('Write some content first so AI can suggest titles.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await aiRequest<{ titles: string[] }>('suggest-title', {
        content: postContent.slice(0, 4000),
        count: 5,
      })
      setTitles(data.titles)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleSeo() {
    if (!postTitle && !postContent) {
      setError('Add a title or content first.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await aiRequest<{ seoTitle: string; seoDescription: string }>('seo', {
        title: postTitle || 'Untitled',
        content: (postContent || '').slice(0, 4000),
      })
      setSeoResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit() {
    if (action === 'generate') handleGenerate()
    else if (action === 'rewrite') handleRewrite()
    else if (action === 'suggest-title') handleSuggestTitle()
    else if (action === 'seo') handleSeo()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-4 overflow-y-auto border-l px-6 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-purple-500" />
            AI Assistant
          </SheetTitle>
          <SheetDescription>Generate, rewrite, or optimize your post content.</SheetDescription>
        </SheetHeader>

        {!action && (
          <div className="grid gap-2">
            <ActionButton
              icon={<WandSparkles className="size-4" />}
              label="Generate content"
              description="Write new content from a prompt"
              onClick={() => setAction('generate')}
            />
            <ActionButton
              icon={<Sparkles className="size-4" />}
              label="Rewrite content"
              description="Improve or restyle existing content"
              onClick={() => setAction('rewrite')}
            />
            <ActionButton
              icon={<Heading className="size-4" />}
              label="Suggest titles"
              description="Get title ideas based on your content"
              onClick={() => setAction('suggest-title')}
            />
            <ActionButton
              icon={<Search className="size-4" />}
              label="Generate SEO"
              description="Create optimized meta title & description"
              onClick={() => setAction('seo')}
            />
          </div>
        )}

        {action && !result && !titles && !seoResult && (
          <div className="space-y-3">
            <Button variant="ghost" size="sm" onClick={reset}>
              ... Back
            </Button>

            {(action === 'generate' || action === 'rewrite') && (
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  action === 'generate'
                    ? 'Describe what you want to write about...'
                    : 'How should the content be rewritten? (e.g. "make it shorter", "more formal")'
                }
                rows={4}
              />
            )}

            {action === 'suggest-title' && (
              <p className="text-sm text-muted-foreground">
                AI will suggest titles based on your current post content.
              </p>
            )}

            {action === 'seo' && (
              <p className="text-sm text-muted-foreground">
                AI will generate an SEO-optimized title and meta description from your post.
              </p>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              onClick={handleSubmit}
              disabled={loading || ((action === 'generate' || action === 'rewrite') && !prompt)}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {loading ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        )}

        {/* Generated content result */}
        {result && (
          <div className="space-y-3">
            <Button variant="ghost" size="sm" onClick={reset}>
              ... Back
            </Button>
            <div className="prose prose-sm max-h-80 overflow-y-auto rounded-lg border p-3">
              {/* biome-ignore lint/security/noDangerouslySetInnerHtml: previewing AI output */}
              <div dangerouslySetInnerHTML={{ __html: result }} />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  onInsertContent?.(result)
                  reset()
                  onOpenChange(false)
                }}
              >
                Insert into editor
              </Button>
              <Button variant="outline" onClick={reset}>
                Discard
              </Button>
            </div>
          </div>
        )}

        {/* Title suggestions */}
        {titles && (
          <div className="space-y-3">
            <Button variant="ghost" size="sm" onClick={reset}>
              ... Back
            </Button>
            <p className="text-sm font-medium">Pick a title:</p>
            <div className="space-y-2">
              {titles.map((title, i) => (
                <button
                  key={`title-${i}`}
                  type="button"
                  onClick={() => {
                    onSelectTitle?.(title)
                    reset()
                    onOpenChange(false)
                  }}
                  className="w-full rounded-lg border p-3 text-left text-sm hover:bg-accent transition-colors"
                >
                  {title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SEO result */}
        {seoResult && (
          <div className="space-y-3">
            <Button variant="ghost" size="sm" onClick={reset}>
              ... Back
            </Button>
            <div className="space-y-2 rounded-lg border p-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">SEO Title</p>
                <p className="text-sm">{seoResult.seoTitle}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Meta Description</p>
                <p className="text-sm">{seoResult.seoDescription}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  onApplySeo?.(seoResult.seoTitle, seoResult.seoDescription)
                  reset()
                  onOpenChange(false)
                }}
              >
                Apply SEO
              </Button>
              <Button variant="outline" onClick={reset}>
                Discard
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function ActionButton({
  icon,
  label,
  description,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
    >
      <span className="mt-0.5 text-purple-500">{icon}</span>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}
