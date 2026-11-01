import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@einao/ui'
import { ChevronLeft, ChevronRight, ImagePlus, Library, Upload } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { API_BASE_URL } from '../lib/api'

type UploadItem = {
  id: number
  filename: string
  url: string
  folder: string
  content_type: string
  size: number
  created_at: string
}

type MediaFolder = { id: number; name: string; created_at: string }

type MediaPickerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (url: string) => void
  /** Default folder to show. Defaults to 'all'. */
  defaultFolder?: string
}

const PAGE_SIZE = 18

export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  defaultFolder = 'all',
}: MediaPickerProps) {
  const [tab, setTab] = useState<'upload' | 'library'>('library')
  const [items, setItems] = useState<UploadItem[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [activeFolder, setActiveFolder] = useState(defaultFolder)
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  async function loadFolders() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/uploads/folders`, { credentials: 'include' })
      if (res.ok) {
        const data = (await res.json()) as { folders: MediaFolder[] }
        setFolders(data.folders)
      }
    } catch {
      /* ignore */
    }
  }

  async function loadLibrary(nextPage = page, folder = activeFolder) {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String((nextPage - 1) * PAGE_SIZE),
      })
      if (folder !== 'all') params.set('folder', folder)
      const res = await fetch(`${API_BASE_URL}/api/v1/uploads?${params}`, { credentials: 'include' })
      if (!res.ok) {
        toast.error('Could not load media library')
        return
      }
      const data = (await res.json()) as { items: UploadItem[]; total: number }
      setItems(data.items)
      setTotal(data.total)
      setPage(nextPage)
    } catch {
      toast.error('Could not load media library')
    } finally {
      setLoading(false)
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally omits loadLibrary (unstable ref)
  useEffect(() => {
    if (!open) return
    void loadFolders()
    if (tab === 'library') void loadLibrary(1, activeFolder)
  }, [open, tab])

  function handleFolderChange(folder: string) {
    setActiveFolder(folder)
    void loadLibrary(1, folder)
  }

  const uploadFolder = activeFolder === 'all' ? 'misc' : activeFolder

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', uploadFolder)

      const res = await fetch(`${API_BASE_URL}/api/v1/admin/uploads`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      const data = (await res.json()) as { url?: string; error?: string }

      if (!res.ok || !data.url) {
        toast.error(data.error ?? 'Upload failed')
        return
      }

      toast.success('Media uploaded')
      onSelect(data.url)
      onOpenChange(false)
      if (tab === 'library') {
        await loadLibrary(1, activeFolder)
      }
    } catch (error) {
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const emptyState = useMemo(() => {
    if (loading) return 'Loading media...'
    if (items.length > 0) return null
    return 'No media in this folder yet. Upload an image to get started.'
  }, [items.length, loading])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Media picker</DialogTitle>
          <DialogDescription>
            Upload or choose an existing asset from your library.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 border-b pb-4">
          <Button
            type="button"
            variant={tab === 'upload' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setTab('upload')}
          >
            <Upload className="size-4" />
            Upload
          </Button>
          <Button
            type="button"
            variant={tab === 'library' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => {
              setTab('library')
              void loadLibrary(1, activeFolder)
            }}
          >
            <Library className="size-4" />
            Library
          </Button>
          <div className="ml-auto">
            <Select value={activeFolder} onValueChange={handleFolderChange}>
              <SelectTrigger className="h-8 w-[140px] text-sm">
                <SelectValue placeholder="Folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All folders</SelectItem>
                {folders.map((f) => (
                  <SelectItem key={f.id} value={f.name} className="capitalize">
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {tab === 'upload' ? (
          <div className="space-y-4">
            <button
              type="button"
              className={`flex min-h-56 w-full flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center transition-colors ${
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-muted/20 hover:bg-muted/40'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault()
                setDragOver(false)
                const file = event.dataTransfer.files?.[0]
                if (file) void handleFile(file)
              }}
              disabled={uploading}
            >
              <ImagePlus className="mb-4 size-10 text-muted-foreground" />
              <p className="text-base font-medium">
                {uploading ? 'Uploading...' : 'Drop an image here or click to browse'}
              </p>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Uploads go to the <span className="font-medium">{uploadFolder}</span> folder and are
                immediately available in the editor.
              </p>
            </button>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={uploadFolder}
                className="max-w-32 bg-muted/40 font-mono text-sm capitalize"
                aria-label="Upload folder"
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                Choose file
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/mp4,video/webm"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void handleFile(file)
              }}
            />
          </div>
        ) : (
          <div className="space-y-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {total} item{total === 1 ? '' : 's'} in{' '}
                {activeFolder === 'all' ? 'all folders' : `the ${activeFolder} folder`}.
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || loading}
                    onClick={() => void loadLibrary(page - 1)}
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || loading}
                    onClick={() => void loadLibrary(page + 1)}
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}
            </div>

            {emptyState ? (
              <div className="flex min-h-56 items-center justify-center rounded-lg border bg-muted/10 px-6 text-center text-sm text-muted-foreground">
                {emptyState}
              </div>
            ) : (
              <div className="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item.url)
                      onOpenChange(false)
                    }}
                    className="overflow-hidden rounded-lg border bg-card text-left transition hover:border-primary hover:shadow-sm"
                  >
                    <div className="aspect-square bg-muted">
                      <MediaThumb item={item} />
                    </div>
                    <div className="space-y-1 p-3">
                      <p className="truncate text-sm font-medium" title={item.filename}>
                        {item.filename}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline">{item.folder}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function MediaThumb({ item }: { item: UploadItem }) {
  if (/^video\//.test(item.content_type)) {
    return <video src={item.url} muted playsInline className="h-full w-full object-cover" />
  }

  return <img src={item.url} alt={item.filename} className="h-full w-full object-cover" />
}
