import {
  Badge,
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@einao/ui'
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { API_BASE_URL } from '../lib/api'

export function TagPicker({
  availableTags,
  defaultValue = [],
  value,
  onChange,
  onTagCreated,
  name = 'tags',
  errors,
}: {
  availableTags: string[]
  defaultValue?: string[]
  value?: string[]
  onChange?: (tags: string[]) => void
  onTagCreated?: (tag: { id?: number; name: string; created_at?: string }) => void
  name?: string
  errors?: string[]
}) {
  const [open, setOpen] = useState(false)
  const [internalSelected, setInternalSelected] = useState<string[]>(defaultValue)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [knownTags, setKnownTags] = useState<string[]>(() => {
    // merge existing selection so previously-saved tags show in the list
    return Array.from(new Set([...availableTags, ...defaultValue])).sort((a, b) =>
      a.localeCompare(b)
    )
  })
  const hasError = errors && errors.length > 0
  const selected = value ?? internalSelected

  useEffect(() => {
    setKnownTags((prev) => {
      const merged = Array.from(
        new Set([...prev, ...availableTags, ...defaultValue, ...(value ?? [])])
      ).sort((a, b) => a.localeCompare(b))
      if (merged.length === prev.length && merged.every((tag, index) => tag === prev[index])) {
        return prev
      }
      return merged
    })
  }, [availableTags, defaultValue, value])

  function updateSelected(next: string[]) {
    if (value === undefined) {
      setInternalSelected(next)
    }
    onChange?.(next)
  }

  function toggle(tag: string) {
    updateSelected(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag])
  }

  function remove(tag: string) {
    updateSelected(selected.filter((t) => t !== tag))
  }

  const trimmed = query.trim()
  const lowered = trimmed.toLowerCase()
  const exactMatch = useMemo(
    () => knownTags.some((t) => t.toLowerCase() === lowered),
    [knownTags, lowered]
  )
  const canCreate = trimmed.length > 0 && !exactMatch

  async function createTag() {
    if (!canCreate || creating) return
    setCreating(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/tags`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      const data = (await res.json()) as {
        id?: number
        name?: string
        created_at?: string
        error?: string
      }
      if (!res.ok || !data.name) {
        toast.error(data.error ?? 'Could not create tag')
        return
      }
      const created = data.name
      setKnownTags((prev) =>
        Array.from(new Set([...prev, created])).sort((a, b) => a.localeCompare(b))
      )
      updateSelected(selected.includes(created) ? selected : [...selected, created])
      onTagCreated?.({ id: data.id, name: created, created_at: data.created_at })
      setQuery('')
      toast.success(`Tag "${created}" created`)
    } catch (err) {
      toast.error('Could not create tag', {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="grid gap-2">
      {/* Hidden input so tags submit with the form */}
      <input type="hidden" name={name} value={selected.join(',')} />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`h-9 w-full justify-between font-normal ${
              hasError ? 'border-destructive focus-visible:ring-destructive/40' : ''
            }`}
          >
            <span className="text-muted-foreground">
              {selected.length === 0
                ? 'Select or create tags'
                : `${selected.length} tag${selected.length === 1 ? '' : 's'} selected`}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
          side="bottom"
          sideOffset={4}
          avoidCollisions={false}
        >
          <Command>
            <CommandInput
              placeholder="Search or type to create"
              value={query}
              onValueChange={setQuery}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canCreate) {
                  e.preventDefault()
                  void createTag()
                }
              }}
            />
            <CommandList>
              {canCreate && (
                <CommandGroup heading="Create">
                  <CommandItem
                    value={`__create:${trimmed}`}
                    onSelect={() => void createTag()}
                    disabled={creating}
                  >
                    <Plus className="mr-2 size-4" />
                    {creating ? 'Creating...' : `Create "${trimmed}"`}
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup heading="Tags">
                {knownTags.map((tag) => {
                  const isSelected = selected.includes(tag)
                  return (
                    <CommandItem key={tag} value={tag} onSelect={() => toggle(tag)}>
                      <div
                        className={`mr-2 flex size-4 items-center justify-center rounded-sm border ${
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/30'
                        }`}
                      >
                        {isSelected && <Check className="size-3" />}
                      </div>
                      {tag}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                onClick={() => remove(tag)}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {hasError && <p className="text-xs text-destructive">{errors.join(', ')}</p>}
    </div>
  )
}

