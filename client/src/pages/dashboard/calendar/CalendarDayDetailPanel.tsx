import { CalendarDays, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { CalendarPost } from './calendar.types'
import { CalendarPostCard } from './CalendarPostCard'
import { formatDayHeader, toDateKey } from './calendar.utils'

type CalendarDayDetailPanelProps = {
  selectedDate: Date
  posts: CalendarPost[]
  isLoading: boolean
}

function DetailSkeleton() {
  return (
    <div className="space-y-3 px-5 py-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-2 rounded-lg border border-border p-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  )
}

export function CalendarDayDetailPanel({
  selectedDate,
  posts,
  isLoading,
}: CalendarDayDetailPanelProps) {
  const navigate = useNavigate()
  const dateKey = toDateKey(selectedDate)

  const handleSchedule = (): void => {
    navigate(`/dashboard/posts/new?date=${dateKey}&mode=schedule`)
  }

  return (
    <Card className="h-fit overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold">{formatDayHeader(selectedDate)}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {posts.length > 0
            ? `${posts.length} ${posts.length === 1 ? 'публикация' : 'публикации'}`
            : 'Нет публикаций'}
        </p>
      </div>

      {isLoading ? (
        <DetailSkeleton />
      ) : posts.length === 0 ? (
        <div className="px-4 py-4">
          <EmptyState
            icon={CalendarDays}
            title="На этот день публикаций нет"
            description="Выберите другую дату или запланируйте новый пост"
            className="py-10"
            action={
              <Button type="button" variant="primary" size="sm" onClick={handleSchedule}>
                <Plus size={14} />
                Запланировать пост
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-2 px-4 py-4">
          {posts.map((post) => (
            <CalendarPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </Card>
  )
}
