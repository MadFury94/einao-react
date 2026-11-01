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
import { CalendarClock, ClockArrowUp, ExternalLink, LoaderCircle, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import type { Post } from '../lib/posts'
import { formatDateTime } from '../lib/posts'
import { PostStatusBadge } from './post-status-badge'

export type PostPublishingCardProps = {
  status: Post['status']
  publishedAt: Post['published_at']
  postId: string
  previewHref: string
  scheduleFor: string
  onScheduleForChange: (value: string) => void
  busyAction: 'publish' | 'unpublish' | 'schedule' | null
  onPublish: () => void
  onUnpublish: () => void
  onSchedule: () => void
}

export function PostPublishingCard({
  status,
  publishedAt,
  postId,
  previewHref,
  scheduleFor,
  onScheduleForChange,
  busyAction,
  onPublish,
  onUnpublish,
  onSchedule,
}: PostPublishingCardProps) {
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

  const dateLabel = publishedAt
    ? `${status === 'scheduled' ? 'Scheduled for' : 'Published'} ${formatDateTime(publishedAt, { dateStyle: 'medium', timeStyle: 'short' })}`
    : null

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 space-y-3">
        {/* Row 1: title + nav actions */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Publishing</span>
          <div className="flex items-center gap-1">
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                >
                  <Link to={`/posts/${postId}/revisions`} aria-label="Revisions">
                    <ClockArrowUp className="size-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Revisions</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Row 2: publish controls */}
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2">
            <PostStatusBadge status={status} />
            {dateLabel && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-muted-foreground tabular-nums cursor-default">
                    {formatDateTime(publishedAt ?? '', { dateStyle: 'short', timeStyle: 'short' })}
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
                    id="publish-toggle"
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
          <div className="mt-3 space-y-2 border-t pt-3">
            <Input
              id="schedule-for"
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
