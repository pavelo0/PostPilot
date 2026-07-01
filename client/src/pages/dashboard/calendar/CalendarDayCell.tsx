import { cn } from '@/lib/utils'
import type { CalendarPost } from './calendar.types'
import { CALENDAR_STATUS_META } from './calendar.types'
import { getPostPreviewTitle } from './calendar.utils'

type CalendarDayCellProps = {
  day: number
  posts: CalendarPost[]
  isToday: boolean
  isSelected: boolean
  onSelect: () => void
  isLastColumn: boolean
}

export function CalendarDayCell({
  day,
  posts,
  isToday,
  isSelected,
  onSelect,
  isLastColumn,
}: CalendarDayCellProps) {
  const previews = posts.slice(0, 2)
  const hiddenCount = Math.max(posts.length - previews.length, 0)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'min-h-[88px] border-r border-b border-border p-1.5 text-left transition-colors',
        'cursor-pointer hover:bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected && 'bg-secondary/40 ring-1 ring-inset ring-[oklch(0.420_0.095_200)]/40',
        isLastColumn && 'border-r-0',
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-1">
        <div
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
            isToday ? 'text-background' : 'text-muted-foreground',
          )}
          style={isToday ? { background: 'oklch(0.420 0.095 200)' } : undefined}
        >
          {day}
        </div>
        {posts.length > 0 ? (
          <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.420_0.095_200)]" />
        ) : null}
      </div>

      {previews.map((post) => (
        <div
          key={post.id}
          className={cn(
            'mb-0.5 truncate rounded px-1.5 py-0.5 text-[10px] font-medium',
            CALENDAR_STATUS_META[post.status].chipClassName,
          )}
        >
          {getPostPreviewTitle(post)}
        </div>
      ))}

      {hiddenCount > 0 ? (
        <div className="px-1 text-[10px] text-muted-foreground">+{hiddenCount} ещё</div>
      ) : null}
    </button>
  )
}
