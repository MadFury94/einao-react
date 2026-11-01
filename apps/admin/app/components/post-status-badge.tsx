import { cn } from '@einao/ui'
import type { PostStatus } from '../lib/posts'

const toneByStatus: Record<PostStatus, string> = {
  draft: 'border-slate-300 bg-slate-100 text-slate-700',
  scheduled: 'border-amber-300 bg-amber-100 text-amber-800',
  published: 'border-emerald-300 bg-emerald-100 text-emerald-800',
  archived: 'border-rose-300 bg-rose-100 text-rose-800',
}

export function PostStatusBadge({ status, className }: { status: PostStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize',
        toneByStatus[status],
        className
      )}
    >
      {status}
    </span>
  )
}
