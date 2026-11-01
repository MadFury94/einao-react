import {
  deleteApiV1AdminUploadsById,
  deleteApiV1AdminUploadsFoldersById,
  getApiV1Uploads,
  getApiV1UploadsFolders,
  patchApiV1AdminUploadsBulkMove,
  patchApiV1AdminUploadsFoldersById,
  postApiV1AdminUploads,
  postApiV1AdminUploadsFolders,
  type UploadItem,
} from '@einao/api-client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@einao/ui'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  FolderInput,
  FolderPlus,
  Grid3X3,
  List,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { DataTable } from '../components/data-table'
import '../lib/api'
import type { Route } from './+types/media'

const PAGE_SIZE = 40

type MediaFolder = { id: number; name: string; created_at: string }

export function meta() {
  return [{ title: 'Media ... Admin' }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const folder = url.searchParams.get('folder') || undefined
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
  const offset = (page - 1) * PAGE_SIZE

  const [uploadsRes, foldersRes] = await Promise.all([
    getApiV1Uploads({
      query: {
        limit: PAGE_SIZE,
        offset,
        folder: folder === 'all' ? undefined : folder,
      },
    }),
    getApiV1UploadsFolders(),
  ])

  if (uploadsRes.error || !uploadsRes.data)
    throw new Response('Failed to load uploads', { status: 502 })

  const folders = (foldersRes.data as { folders: MediaFolder[] } | undefined)?.folders ?? []

  return { items: uploadsRes.data.items, total: uploadsRes.data.total, page, folders }
}

export default function MediaPage({ loaderData }: Route.ComponentProps) {
  const { items: initialItems, total: initialTotal, page, folders: initialFolders } = loaderData
  const [searchParams, setSearchParams] = useSearchParams()
  const activeFolder = searchParams.get('folder') || 'all'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [items, setItems] = useState(initialItems)
  const [total, setTotal] = useState(initialTotal)
  const [pendingDelete, setPendingDelete] = useState<UploadItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [previewItem, setPreviewItem] = useState<UploadItem | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [moving, setMoving] = useState(false)
  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const [folders, setFolders] = useState<MediaFolder[]>(initialFolders)
  const [showFolderManager, setShowFolderManager] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [renamingFolder, setRenamingFolder] = useState<MediaFolder | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const folderNames = useMemo(() => ['all', ...folders.map((f) => f.name)], [folders])

  // Sync loader data when navigation happens
  useEffect(() => {
    setItems(initialItems)
    setTotal(initialTotal)
  }, [initialItems, initialTotal])

  useEffect(() => {
    setFolders(initialFolders)
  }, [initialFolders])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function setFolder(folder: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (folder === 'all') next.delete('folder')
      else next.set('folder', folder)
      next.delete('page')
      return next
    })
  }

  function setPage(p: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (p <= 1) next.delete('page')
      else next.set('page', String(p))
      return next
    })
  }

  async function reloadItems() {
    const folderQuery = activeFolder === 'all' ? undefined : activeFolder
    const { data } = await getApiV1Uploads({
      query: { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE, folder: folderQuery },
    })
    if (data) {
      setItems(data.items)
      setTotal(data.total)
    }
  }

  async function handleUpload(files: File[]) {
    if (files.length === 0) return
    setUploading(true)
    const folder = activeFolder === 'all' ? 'misc' : activeFolder
    let successCount = 0
    let failCount = 0

    for (const file of files) {
      try {
        const result = await postApiV1AdminUploads({
          body: { file, folder } as never,
        })
        const url = (result.data as { url?: string } | undefined)?.url
        if (!url) {
          const err = (result.error as { error?: string } | undefined)?.error ?? 'Upload failed'
          toast.error(err, { description: file.name })
          failCount++
        } else {
          successCount++
        }
      } catch (err) {
        toast.error('Upload failed', {
          description: `${file.name}: ${err instanceof Error ? err.message : String(err)}`,
        })
        failCount++
      }
    }

    if (successCount > 0) {
      toast.success(
        successCount === 1 ? 'File uploaded' : `${successCount} files uploaded`,
        failCount > 0 ? { description: `${failCount} failed` } : undefined
      )
      await reloadItems()
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      const { error } = await deleteApiV1AdminUploadsById({
        path: { id: pendingDelete.id },
      })
      if (error) {
        toast.error('Delete failed')
        return
      }
      toast.success('File deleted')
      setItems((prev) => prev.filter((i) => i.id !== pendingDelete.id))
      setTotal((prev) => prev - 1)
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(false)
      setPendingDelete(null)
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url)
    toast.success('URL copied')
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    if (selected.size === items.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(items.map((i) => i.id)))
    }
  }

  function clearSelection() {
    setSelected(new Set())
    setShowMoveMenu(false)
  }

  async function handleBulkMove(folder: string) {
    if (selected.size === 0) return
    setMoving(true)
    try {
      const { error } = await patchApiV1AdminUploadsBulkMove({
        body: { ids: Array.from(selected), folder },
      })
      if (error) {
        toast.error('Move failed')
        return
      }
      toast.success(`${selected.size} file(s) moved to ${folder}`)
      clearSelection()
      await reloadItems()
    } catch {
      toast.error('Move failed')
    } finally {
      setMoving(false)
      setShowMoveMenu(false)
    }
  }

  async function reloadFolders() {
    const res = await getApiV1UploadsFolders()
    const data = res.data as { folders: MediaFolder[] } | undefined
    if (data) setFolders(data.folders)
  }

  async function handleCreateFolder() {
    const name = newFolderName.trim()
    if (!name) return
    const { error } = await postApiV1AdminUploadsFolders({ body: { name } })
    if (error) {
      const msg = (error as { error?: string }).error ?? 'Failed to create folder'
      toast.error(msg)
      return
    }
    toast.success(`Folder "${name}" created`)
    setNewFolderName('')
    await reloadFolders()
  }

  async function handleRenameFolder() {
    if (!renamingFolder || !renameValue.trim()) return
    const { error } = await patchApiV1AdminUploadsFoldersById({
      path: { id: renamingFolder.id },
      body: { name: renameValue.trim() },
    })
    if (error) {
      const msg = (error as { error?: string }).error ?? 'Rename failed'
      toast.error(msg)
      return
    }
    toast.success('Folder renamed')
    setRenamingFolder(null)
    setRenameValue('')
    await reloadFolders()
  }

  async function handleDeleteFolder(folder: MediaFolder) {
    const { error } = await deleteApiV1AdminUploadsFoldersById({
      path: { id: folder.id },
    })
    if (error) {
      const msg = (error as { error?: string }).error ?? 'Delete failed'
      toast.error(msg)
      return
    }
    toast.success(`Folder "${folder.name}" deleted, files moved to misc`)
    await reloadFolders()
    if (activeFolder === folder.name) setFolder('all')
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight page-heading">Media</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse and manage all uploaded files.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="size-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <List className="size-4" />
            </Button>
          </div>
          <Button variant="glow" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? (
              <>
                <Upload className="size-4 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Upload
              </>
            )}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/mp4,video/webm"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files
          if (files && files.length > 0) void handleUpload(Array.from(files))
        }}
      />

      {/* Folder filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {!showFolderManager &&
          folderNames.map((f) => {
            const active = activeFolder === f
            return (
              <Button
                key={f}
                variant="outline"
                size="sm"
                onClick={() => setFolder(f)}
                className={`capitalize rounded-full ${active ? 'page-heading border-current' : ''}`}
              >
                {f}
              </Button>
            )
          })}
        <Button
          variant={showFolderManager ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setShowFolderManager(!showFolderManager)}
          title="Manage folders"
        >
          {showFolderManager ? <X className="size-4" /> : <FolderPlus className="size-4" />}
          {showFolderManager && 'Close'}
        </Button>
        <span className="ml-auto self-center text-sm text-muted-foreground">
          {total} file{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Folder manager */}
      {showFolderManager && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="New folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void handleCreateFolder()}
                className="h-8 flex-1 rounded-md border bg-background px-3 text-sm"
              />
              <Button
                size="sm"
                onClick={() => void handleCreateFolder()}
                disabled={!newFolderName.trim()}
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>
            <div className="space-y-1">
              {folders.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-2 rounded px-2 py-1 hover:bg-muted"
                >
                  {renamingFolder?.id === f.id ? (
                    <>
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && void handleRenameFolder()}
                        className="h-7 flex-1 rounded border bg-background px-2 text-sm"
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" onClick={() => void handleRenameFolder()}>
                        <Check className="size-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setRenamingFolder(null)}>
                        <X className="size-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm capitalize">{f.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setRenamingFolder(f)
                          setRenameValue(f.name)
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={f.name === 'misc'}
                        onClick={() => void handleDeleteFolder(f)}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selection toolbar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/50 px-3 sm:px-4 py-2">
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            <X className="size-4" />
          </Button>
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button variant="ghost" size="sm" onClick={selectAll}>
            <Check className="size-4" />
            {selected.size === items.length ? 'Deselect all' : 'Select all'}
          </Button>
          <div className="ml-auto relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMoveMenu(!showMoveMenu)}
              disabled={moving}
            >
              <FolderInput className="size-4" />
              {moving ? 'Moving...' : 'Move to folder'}
            </Button>
            {showMoveMenu && (
              <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border bg-popover p-1 shadow-md">
                {folders.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className="w-full rounded-sm px-3 py-1.5 text-left text-sm capitalize hover:bg-accent"
                    onClick={() => void handleBulkMove(f.name)}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No files found. Upload your first file to get started.
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <GridView
          items={items}
          onDelete={setPendingDelete}
          onCopy={copyUrl}
          onPreview={setPreviewItem}
          selected={selected}
          onToggleSelect={toggleSelect}
        />
      ) : (
        <ListView
          items={items}
          onDelete={setPendingDelete}
          onCopy={copyUrl}
          onPreview={setPreviewItem}
          selected={selected}
          onToggleSelect={toggleSelect}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      {/* Preview dialog */}
      <PreviewDialog
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onCopy={copyUrl}
        onDelete={(item) => {
          setPreviewItem(null)
          setPendingDelete(item)
        }}
      />

      {/* Delete dialog */}
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{' '}
              <span className="font-semibold text-foreground">{pendingDelete?.filename}</span> from
              storage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pendingDelete && (
            <div className="flex justify-center py-2">
              <MediaThumb item={pendingDelete} size="lg" />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={deleting} onClick={handleDelete}>
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ... Grid View ...

function GridView({
  items,
  onDelete,
  onCopy,
  onPreview,
  selected,
  onToggleSelect,
}: {
  items: UploadItem[]
  onDelete: (item: UploadItem) => void
  onCopy: (url: string) => void
  onPreview: (item: UploadItem) => void
  selected: Set<number>
  onToggleSelect: (id: number) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.id}
          className={`group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md ${selected.has(item.id) ? 'ring-2 ring-primary' : ''}`}
        >
          {/* Selection checkbox */}
          <button
            type="button"
            className={`absolute left-2 top-2 z-10 flex size-5 items-center justify-center rounded border text-xs transition-opacity ${selected.has(item.id) ? 'border-primary bg-primary text-primary-foreground opacity-100' : 'border-white/80 bg-black/30 text-white opacity-0 group-hover:opacity-100'}`}
            onClick={() => onToggleSelect(item.id)}
          >
            {selected.has(item.id) && <Check className="size-3" />}
          </button>
          <div className="relative aspect-square overflow-hidden bg-muted">
            <button
              type="button"
              className="absolute inset-0 h-full w-full"
              onClick={() => onPreview(item)}
              aria-label={`Preview ${item.filename}`}
            >
              <MediaThumb item={item} size="fill" />
            </button>
            {/* Overlay actions */}
            <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="secondary"
                size="icon"
                className="size-8"
                onClick={() => onPreview(item)}
              >
                <Eye className="size-3.5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="size-8"
                onClick={() => onCopy(item.url)}
              >
                <Copy className="size-3.5" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="size-8"
                onClick={() => onDelete(item)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
          <div className="space-y-1 p-2">
            <p className="truncate text-xs font-medium" title={item.filename}>
              {item.filename}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{formatSize(item.size)}</span>
              <Badge variant="outline" className="text-[10px] px-1 py-0">
                {item.folder}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ... List View ...

function ListView({
  items,
  onDelete,
  onCopy,
  onPreview,
  selected,
  onToggleSelect,
}: {
  items: UploadItem[]
  onDelete: (item: UploadItem) => void
  onCopy: (url: string) => void
  onPreview: (item: UploadItem) => void
  selected: Set<number>
  onToggleSelect: (id: number) => void
}) {
  const columns = useMemo<ColumnDef<UploadItem>[]>(
    () => [
      {
        id: 'select',
        header: () => null,
        enableSorting: false,
        meta: { headerClassName: 'w-[40px]' },
        cell: ({ row }) => (
          <button
            type="button"
            className={`flex size-5 items-center justify-center rounded border text-xs ${selected.has(row.original.id) ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'}`}
            onClick={() => onToggleSelect(row.original.id)}
          >
            {selected.has(row.original.id) && <Check className="size-3" />}
          </button>
        ),
      },
      {
        id: 'thumb',
        header: () => null,
        enableSorting: false,
        meta: { headerClassName: 'w-[60px]' },
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => onPreview(row.original)}
            className="block"
            aria-label={`Preview ${row.original.filename}`}
          >
            <MediaThumb item={row.original} size="sm" />
          </button>
        ),
      },
      {
        id: 'filename',
        accessorKey: 'filename',
        header: 'Filename',
        cell: ({ row }) => (
          <>
            <span className="font-medium" title={row.original.filename}>
              {row.original.filename}
            </span>
            <div
              className="mt-0.5 max-w-xs truncate font-mono text-[11px] text-muted-foreground"
              title={row.original.url}
            >
              {row.original.url}
            </div>
          </>
        ),
      },
      {
        id: 'content_type',
        accessorKey: 'content_type',
        header: 'Type',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.content_type}</span>
        ),
      },
      {
        id: 'folder',
        accessorKey: 'folder',
        header: 'Folder',
        cell: ({ row }) => <Badge variant="outline">{row.original.folder}</Badge>,
      },
      {
        id: 'size',
        accessorKey: 'size',
        header: 'Size',
        cell: ({ row }) => <span className="text-xs">{formatSize(row.original.size)}</span>,
      },
      {
        id: 'created_at',
        accessorKey: 'created_at',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(row.original.created_at)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        meta: { headerClassName: 'w-[120px] text-right', cellClassName: 'text-right' },
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => onPreview(row.original)}>
              <Eye className="size-4" />
              <span className="sr-only">Preview</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onCopy(row.original.url)}>
              <Copy className="size-4" />
              <span className="sr-only">Copy URL</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(row.original)}>
              <Trash2 className="size-4 text-destructive" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        ),
      },
    ],
    [onCopy, onDelete, onPreview, selected, onToggleSelect]
  )

  return (
    <Card>
      <CardContent className="p-0">
        <DataTable columns={columns} data={items} getRowId={(row) => String(row.id)} />
      </CardContent>
    </Card>
  )
}

// ... Shared thumbnail component ...

function MediaThumb({ item, size }: { item: UploadItem; size: 'sm' | 'lg' | 'fill' }) {
  const isVideo = /^video\//.test(item.content_type)
  const cls =
    size === 'fill'
      ? 'absolute inset-0 h-full w-full object-cover'
      : size === 'lg'
        ? 'h-32 w-32 rounded object-cover'
        : 'h-10 w-10 rounded object-cover'

  if (isVideo) {
    return <video src={item.url} muted playsInline className={cls} />
  }
  return (
    <img
      src={item.url}
      alt={item.filename}
      className={cls}
      loading="lazy"
      onError={(e) => {
        ;(e.currentTarget as HTMLImageElement).style.opacity = '0.3'
      }}
    />
  )
}

// ... Preview Dialog ...

function PreviewDialog({
  item,
  onClose,
  onCopy,
  onDelete,
}: {
  item: UploadItem | null
  onClose: () => void
  onCopy: (url: string) => void
  onDelete: (item: UploadItem) => void
}) {
  if (!item) return null
  const isVideo = /^video\//.test(item.content_type)

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        {/* Media */}
        <div className="flex min-h-0 flex-1 items-center justify-center bg-black/90">
          {isVideo ? (
            <video src={item.url} controls className="max-h-full max-w-full object-contain">
              <track kind="captions" />
            </video>
          ) : (
            <img
              src={item.url}
              alt={item.filename}
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>

        {/* Metadata + actions */}
        <div className="shrink-0 space-y-3 p-4">
          <DialogHeader>
            <DialogTitle className="truncate pr-6" title={item.filename}>
              {item.filename}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
            <div className="text-muted-foreground">Type</div>
            <div className="font-mono text-xs">{item.content_type}</div>
            <div className="text-muted-foreground">Size</div>
            <div>{formatSize(item.size)}</div>
            <div className="text-muted-foreground">Folder</div>
            <div>
              <Badge variant="outline">{item.folder}</Badge>
            </div>
            <div className="text-muted-foreground">Uploaded</div>
            <div>{formatDate(item.created_at)}</div>
          </div>
          <div className="flex items-center gap-1 rounded-md border bg-muted/40 px-2 py-1.5 font-mono text-xs">
            <span className="flex-1 truncate" title={item.url}>
              {item.url}
            </span>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => onCopy(item.url)}>
              <Copy className="size-3.5" />
              Copy URL
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(item)}>
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ... Helpers ...

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Date(`${iso}Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
