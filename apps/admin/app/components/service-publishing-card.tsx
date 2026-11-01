import {
  Button,
  Card,
  CardContent,
  Input,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@einao/ui'
import { CalendarClock, ExternalLink, LoaderCircle, X } from 'lucide-react'
import { useState } from 'react'
import { formatDateTime } from '../lib/posts'
import type { ServiceStatus } from '../lib/services'
import { PostStatusBadge } from './post-status-badge'

export type ServicePublishingCardProps = {
  status: ServiceStatus
  publishedAt: string | null
  scheduledFor: string | null
  previewHref?: string
  scheduleFor: string
  onScheduleForChange: (value: string) => void
  busyAction: 'publish' | 'unpublish' | 'schedule' | null
  onPublish: () => void
  onUnpublish: () => void
  onSchedule: () => void
}

export function ServicePublishingCard({
  status,
  publishedAt,
  scheduledFor,
  previewHref,
  scheduleFor,
  onScheduleForChange,
  busyAction,
  onPublish,
  onUnpublish,
  onSchedule,
}: ServicePublishingCardProps) {
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

  const displayDate = status === 'scheduled' ? scheduledFor : publishedAt
  const dateLabel = displayDate
    ? `${status === 'scheduled' ? 'Scheduled for' : 'Published'} ${formatDateTime(displayDate, { dateStyle: 'medium', timeStyle: 'short' })}`
    : null

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Publishing</span>
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
                    id="service-publish-toggle"
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

        {showSchedule && (
          <SchedulePanel
            scheduleFor={scheduleFor}
            onScheduleForChange={onScheduleForChange}
            onSchedule={onSchedule}
            onCancel={() => setShowSchedule(false)}
            busyAction={busyAction}
            isBusy={isBusy}
          />
        )}
      </CardContent>
    </Card>
  )
}

function SchedulePanel({
  scheduleFor,
  onScheduleForChange,
  onSchedule,
  onCancel,
  busyAction,
  isBusy,
}: {
  scheduleFor: string
  onScheduleForChange: (value: string) => void
  onSchedule: () => void
  onCancel: () => void
  busyAction: ServicePublishingCardProps['busyAction']
  isBusy: boolean
}) {
  return (
    <div className="mt-3 space-y-2 border-t pt-3">
      <Input
        id="service-schedule-for"
        type="datetime-local"
        value={scheduleFor}
        onChange={(event) => onScheduleForChange(event.target.value)}
        className="h-9 text-sm"
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
          onClick={onCancel}
          aria-label="Cancel"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
