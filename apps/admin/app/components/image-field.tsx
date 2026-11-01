import { postApiV1AdminUploads } from '@einao/api-client'
import { Button, Input, Label } from '@einao/ui'
import { useId, useRef, useState } from 'react'
import { toast } from 'sonner'

type ImageFieldProps = {
  label: string
  name: string
  defaultValue?: string
  folder: string
  errors?: string[]
  hint?: string
}

export function ImageField({
  label,
  name,
  defaultValue = '',
  folder,
  errors,
  hint,
}: ImageFieldProps) {
  const reactId = useId()
  const inputId = `${reactId}-${name}`
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(defaultValue)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const hasError = errors && errors.length > 0

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const result = await postApiV1AdminUploads({
        body: { file, folder } as never,
      })
      const url = (result.data as { url?: string } | undefined)?.url
      if (!url) {
        const err = (result.error as { error?: string } | undefined)?.error ?? 'Upload failed'
        toast.error(err)
        return
      }
      setValue(url)
      toast.success('Uploaded', { description: url })
    } catch (err) {
      toast.error('Upload failed', {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function openPicker() {
    fileInputRef.current?.click()
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={inputId}>{label}</Label>

      {/* Drop zone / picker */}
      <button
        type="button"
        onClick={openPicker}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const file = e.dataTransfer.files?.[0]
          if (file) void handleFile(file)
        }}
        className={`flex w-full items-center gap-4 rounded-md border border-dashed p-4 text-left transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/30 hover:bg-muted/60'
        } ${uploading ? 'opacity-60' : ''}`}
        disabled={uploading}
      >
        {value ? (
          <PreviewMedia url={value} />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded bg-muted text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">
            {uploading
              ? 'Uploading...'
              : value
                ? 'Click or drop to replace'
                : 'Click to choose a file or drag & drop'}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            Images (jpg, png, webp, gif, svg) or video (mp4, webm). Max 25 MB.
          </div>
          {value && (
            <div
              className="mt-1 truncate font-mono text-[11px] text-muted-foreground"
              title={value}
            >
              {value}
            </div>
          )}
        </div>
      </button>

      {value && (
        <button
          type="button"
          onClick={() => setValue('')}
          className="self-start text-xs text-destructive hover:underline"
        >
          Clear image
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/mp4,video/webm"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />

      {/* Manual URL fallback (also the actual form field that gets submitted) */}
      <div className="flex items-center gap-2">
        <Input
          id={inputId}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="...or paste a URL: https://... or /img/..."
          aria-invalid={hasError || undefined}
          className={hasError ? 'border-destructive focus-visible:ring-destructive/40' : ''}
        />
        <Button type="button" variant="outline" disabled={uploading} onClick={openPicker}>
          {uploading ? 'Uploading...' : 'Browse'}
        </Button>
      </div>

      {hint && !hasError && <p className="text-xs text-muted-foreground">{hint}</p>}
      {hasError && <p className="text-xs text-destructive">{errors.join(', ')}</p>}
    </div>
  )
}

function PreviewMedia({ url }: { url: string }) {
  const resolved = resolvePreviewUrl(url)
  const isVideo = /\.(mp4|webm)(\?|$)/i.test(resolved)
  if (isVideo) {
    return <video src={resolved} muted playsInline className="h-16 w-16 rounded object-cover" />
  }
  return (
    <img
      src={resolved}
      alt=""
      className="h-16 w-16 rounded object-cover"
      onError={(e) => {
        ;(e.currentTarget as HTMLImageElement).style.opacity = '0.3'
      }}
    />
  )
}

const CLIENT_ORIGIN =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLIENT_URL) ||
  'http://localhost:5930'

function resolvePreviewUrl(url: string) {
  // Absolute URL ...<- as-is. Relative path (legacy /img/...) ...<- resolve against client app.
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/')) return `${CLIENT_ORIGIN}${url}`
  return url
}
