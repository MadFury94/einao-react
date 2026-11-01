import {
  Button,
  DateTimePicker,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@einao/ui'
import { CheckCircle2, ExternalLink, FileEdit, LoaderCircle, Lock } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'
import type { PostStatus } from '../lib/posts'
import { formatDateTime } from '../lib/posts'

export type StatusVisibilityPanelProps = {
  status: PostStatus
  /** published_at for published posts, scheduled_for for scheduled posts */
  displayDate: string | null
  /** Local-only schedule selection that hasn't been applied yet */
  scheduleFor: Date | undefined
  onScheduleForChange: (date: Date | undefined) => void
  /** Local-only backdate selection for publishing with a past date */
  publishAt?: Date | undefined
  onPublishAtChange?: (date: Date | undefined) => void
  previewHref?: string
  busyAction: 'publish' | 'unpublish' | 'schedule' | null
  onPublish: () => void
  onUnpublish: () => void
  onSchedule: () => void
  /** Extra icon buttons rendered in the header (e.g. Revisions link) */
  extraActions?: ReactNode
}

type PanelChoice = 'draft' | 'scheduled' | 'published'

const STATUS_OPTIONS: ReadonlyArray<{
  value: PanelChoice
  icon: typeof FileEdit
  label: string
  description: string
}> = [
  {
    value: 'draft',
    icon: FileEdit,
    label: 'Draft',
    description: 'Not ready to publish.',
  },
  {
    value: 'scheduled',
    icon: Lock,
    label: 'Scheduled',
    description: 'Publish automatically on a chosen date.',
  },
  {
    value: 'published',
    icon: CheckCircle2,
    label: 'Published',
    description: 'Visible to everyone.',
  },
]

function statusToChoice(status: PostStatus): PanelChoice {
  if (status === 'published') return 'published'
  if (status === 'scheduled') return 'scheduled'
  return 'draft'
}

function statusLabel(status: PostStatus) {
  if (status === 'published') return 'Published'
  if (status === 'scheduled') return 'Scheduled'
  if (status === 'archived') return 'Archived'
  return 'Draft'
}

export function StatusVisibilityPanel({
  status,
  displayDate,
  scheduleFor,
  onScheduleForChange,
  publishAt,
  onPublishAtChange,
  previewHref,
  busyAction,
  onPublish,
  onUnpublish,
  onSchedule,
  extraActions,
}: StatusVisibilityPanelProps) {
  const [choice, setChoice] = useState<PanelChoice>(() => statusToChoice(status))
  const isBusy = busyAction !== null

  // Sync choice when status changes externally
  useEffect(() => {
    setChoice(statusToChoice(status))
  }, [status])

  const publishLabel = displayDate
    ? formatDateTime(displayDate, { dateStyle: 'medium', timeStyle: 'short' })
    : 'Immediately'

  function handleApply() {
    if (choice === 'draft' && status !== 'draft') {
      onUnpublish()
    } else if (choice === 'published' && status !== 'published') {
      onPublish()
    } else if (choice === 'scheduled' && scheduleFor) {
      onSchedule()
    }
  }

  const canApply = (() => {
    if (isBusy) return false
    if (choice === statusToChoice(status) && choice !== 'scheduled') return false
    if (choice === 'scheduled' && !scheduleFor) return false
    return true
  })()

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-sm font-semibold">Post</span>
        <div className="flex items-center gap-1">
          {extraActions}
          {previewHref && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                >
                  <a href={previewHref} target="_blank" rel="noreferrer" aria-label="Preview">
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Preview</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <Separator />

      {/* Summary rows */}
      <div className="divide-y">
        <div className="flex w-full items-center justify-between gap-3 px-5 py-3">
          <span className="text-sm text-muted-foreground">Status</span>
          <span className="ml-auto text-sm font-medium text-primary">{statusLabel(status)}</span>
        </div>
        <div className="flex w-full items-center justify-between gap-3 px-5 py-3">
          <span className="text-sm text-muted-foreground">Publish</span>
          <span className="ml-auto text-sm font-medium text-primary">{publishLabel}</span>
        </div>
      </div>

      <Separator />

      {/* Inline status & visibility section */}
      <div className="space-y-3 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Status &amp; visibility
        </p>
        <fieldset className="space-y-3" disabled={isBusy}>
          <legend className="sr-only">Post status</legend>
          {STATUS_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const selected = choice === opt.value
            return (
              <label key={opt.value} className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  type="radio"
                  name="post-status"
                  value={opt.value}
                  checked={selected}
                  onChange={() => setChoice(opt.value)}
                  className="mt-1 size-4 accent-primary"
                />
                <span className="flex-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Icon className="size-3.5 text-muted-foreground" />
                    {opt.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{opt.description}</span>
                </span>
              </label>
            )
          })}
        </fieldset>

        {choice === 'scheduled' && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Publish on
            </p>
            <DateTimePicker
              value={scheduleFor}
              onChange={onScheduleForChange}
              placeholder="Pick a date &amp; time"
              minDate={new Date()}
              disabled={isBusy}
            />
            {!scheduleFor && (
              <p className="text-xs text-muted-foreground">Choose a future date to schedule.</p>
            )}
          </div>
        )}

        {choice === 'published' && status !== 'published' && onPublishAtChange && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Publish date
            </p>
            <DateTimePicker
              value={publishAt}
              onChange={onPublishAtChange}
              placeholder="Now (default)"
              disabled={isBusy}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to publish with today's date, or pick a past date to backdate.
            </p>
          </div>
        )}

        {choice === 'published' && status === 'published' && onPublishAtChange && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Published date
            </p>
            <DateTimePicker
              value={publishAt}
              onChange={onPublishAtChange}
              placeholder="Pick a date &amp; time"
              disabled={isBusy}
            />
            <p className="text-xs text-muted-foreground">
              Change when this post appears as published.
            </p>
            <div className="flex justify-end pt-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onPublish}
                disabled={isBusy || !publishAt}
              >
                {isBusy && <LoaderCircle className="size-3.5 animate-spin" />}
                Update date
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button type="button" size="sm" onClick={handleApply} disabled={!canApply}>
            {isBusy && <LoaderCircle className="size-3.5 animate-spin" />}
            {choice === 'published'
              ? 'Publish'
              : choice === 'scheduled'
                ? 'Schedule'
                : 'Save as draft'}
          </Button>
        </div>
      </div>
    </div>
  )
}
