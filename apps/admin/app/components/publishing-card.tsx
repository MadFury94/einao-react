import {
  Button,
  Card,
  CardContent,
  DateTimePicker,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@einao/ui'
import { CalendarClock, ExternalLink, LoaderCircle, X } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import type { PostStatus } from '../lib/posts'
import { formatDateTime } from '../lib/posts'
import type { ServiceStatus } from '../lib/services'
import { PostStatusBadge } from './post-status-badge'

export type PublishingStatus = PostStatus | ServiceStatus

export type PublishingCardProps = {
  status: PublishingStatus
  /** The currently live date ... published_at for published, scheduled_for for scheduled */
  displayDate: string | null
  previewHref?: string
  /** Controlled schedule date from parent */
  scheduleFor: Date | undefined
  onScheduleForChange: (date: Date | undefined) => void
  busyAction: 'publish' | 'unpublish' | 'schedule' | null
  onPublish: () => void
  onUnpublish: () => void
  onSchedule: () => void
  /** Extra icon buttons rendered next to the preview button (e.g. Revisions link) */
  extraActions?: ReactNode
}

export function PublishingCard({
  status,
  displayDate,
  previewHref,
  scheduleFor,
  onScheduleForChange,
  busyAction,
  onPublish,
  onUnpublish,
  onSchedule,
  extraActions,
}: PublishingCardProps) {
  const [showSchedule, setShowSchedule] = useState(false)
  const isLive = status === 'published' || status === 'scheduled'
  const isBusy = busyAction !== null

  const toggleTooltip =
    status === 'published'
      ? 'Published ... click to unpublish'
      : status === 'scheduled'
        ? 'Scheduled ... will go live automatically'
        : status === 'archived'
          ? 'Archived ... click to republish'
          : 'Draft ... click to publish'

  const dateLabel = displayDate
    ? `${status === 'scheduled' ? 'Scheduled for' : 'Published'} ${formatDateTime(displayDate, { dateStyle: 'medium', timeStyle: 'short' })}`
    : null

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Publishing</span>
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

        {/* Status + toggle row */}
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2">
            <PostStatusBadge status={status} />
            {displayDate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-muted-foreground tabular-nums cursor-default">
                    {formatDateTime(displayDate, { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">{dateLabel}</TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Switch
                    checked={isLive}
                    disabled={isBusy}
                    onCheckedChange={(checked) => {
                      if (checked) onPublish()
                      else onUnpublish()
                    }}
                    aria-label={toggleTooltip}
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">{toggleTooltip}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  onClick={() => setShowSchedule((v) => !v)}
                  disabled={isBusy}
                  aria-label="Schedule for later"
                >
                  <CalendarClock className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Schedule for later</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Schedule panel */}
        {showSchedule && (
          <div className="space-y-2 border-t pt-3">
            <DateTimePicker
              value={scheduleFor}
              onChange={onScheduleForChange}
              placeholder="Pick a date & time"
              disabled={isBusy}
              minDate={new Date()}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="flex-1"
                disabled={isBusy || !scheduleFor}
                onClick={onSchedule}
              >
                {busyAction === 'schedule' && <LoaderCircle className="size-3.5 animate-spin" />}
                Schedule
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 shrink-0"
                onClick={() => setShowSchedule(false)}
                aria-label="Cancel"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
