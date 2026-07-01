import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { CalendarPost } from './calendar.types'
import { MONTH_LABELS, WEEKDAY_LABELS } from './calendar.types'
import { CalendarDayCell } from './CalendarDayCell'
import {
  buildMonthCells,
  getMonthGridMeta,
  isSameDay,
  toDateKey,
} from './calendar.utils'

type CalendarMonthGridProps = {
  year: number
  month: number
  selectedDate: Date
  postsByDate: Map<string, CalendarPost[]>
  onPreviousMonth: () => void
  onNextMonth: () => void
  onSelectDate: (date: Date) => void
}

export function CalendarMonthGrid({
  year,
  month,
  selectedDate,
  postsByDate,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
}: CalendarMonthGridProps) {
  const today = new Date()
  const { offset, total } = getMonthGridMeta(year, month)
  const cells = buildMonthCells(offset, total)

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <Button
          type="button"
          onClick={onPreviousMonth}
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <ChevronLeft size={16} />
        </Button>
        <h2 className="text-sm font-semibold">
          {MONTH_LABELS[month]} {year}
        </h2>
        <Button
          type="button"
          onClick={onNextMonth}
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <ChevronRight size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAY_LABELS.map((day) => (
          <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className={`min-h-[88px] border-r border-b border-border bg-secondary/10 ${
                  index % 7 === 6 ? 'border-r-0' : ''
                }`}
              />
            )
          }

          const date = new Date(year, month, day)
          const dateKey = toDateKey(date)
          const posts = postsByDate.get(dateKey) ?? []

          return (
            <CalendarDayCell
              key={dateKey}
              day={day}
              posts={posts}
              isToday={isSameDay(date, today)}
              isSelected={isSameDay(date, selectedDate)}
              onSelect={() => onSelectDate(date)}
              isLastColumn={index % 7 === 6}
            />
          )
        })}
      </div>
    </Card>
  )
}
