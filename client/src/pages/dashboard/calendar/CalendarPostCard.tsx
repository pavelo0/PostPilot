import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import type { CalendarPost } from './calendar.types'
import { CALENDAR_STATUS_META } from './calendar.types'
import { formatPostDateTime, getPostPreviewTitle } from './calendar.utils'

type CalendarPostCardProps = {
  post: CalendarPost
}

export function CalendarPostCard({ post }: CalendarPostCardProps) {
  const statusMeta = CALENDAR_STATUS_META[post.status]

  return (
    <Link
      to={`/dashboard/posts/${post.id}`}
      className="block rounded-lg border border-border bg-background p-3 transition-colors hover:bg-secondary/20"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-medium text-foreground">
          {getPostPreviewTitle(post)}
        </p>
        <Badge variant="secondary" className={statusMeta.chipClassName}>
          {statusMeta.label}
        </Badge>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{formatPostDateTime(post)}</p>
      {post.channelLabel ? (
        <p className="mt-1 text-xs text-muted-foreground">{post.channelLabel}</p>
      ) : null}
    </Link>
  )
}
