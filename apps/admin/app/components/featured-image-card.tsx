import { Button, Label } from '@einao/ui'
import { ImagePlus, X } from 'lucide-react'
import { useState } from 'react'
import { MediaPicker } from './media-picker'

export type FeaturedImageCardProps = {
  value: string
  onChange: (url: string) => void
  label?: string
  /** Hidden form input name so the value submits with native <Form>s. */
  name?: string
  /** Optional title shown above the picker. */
  title?: string
}

export function FeaturedImageCard({
  value,
  onChange,
  label = 'Featured image',
  title,
  name,
}: FeaturedImageCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-2 p-5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">{title ?? label}</Label>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setOpen(true)}
          aria-label="Pick image"
        >
          <ImagePlus className="size-4" />
        </Button>
      </div>
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt={label}
            className="aspect-video w-full rounded-lg border object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 size-7"
            onClick={() => onChange('')}
            aria-label="Remove image"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground transition hover:bg-muted/50"
        >
          <ImagePlus className="size-6" />
          <span>Set {label.toLowerCase()}</span>
        </button>
      )}
      {name && <input type="hidden" name={name} value={value} />}
      <MediaPicker open={open} onOpenChange={setOpen} onSelect={(url) => onChange(url)} />
    </div>
  )
}
