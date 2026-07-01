import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useGetCalendarPostsQuery } from '@/store/api/posts-api'
import { useScheduledPostsRefetch } from '@/hooks/useScheduledPostsRefetch'
import { CalendarDayDetailPanel } from './CalendarDayDetailPanel'
import { CalendarMonthGrid } from './CalendarMonthGrid'
import {
  getMonthRange,
  groupPostsByDate,
  parseDateKey,
  resolveDefaultSelectedDate,
  toDateKey,
} from './calendar.utils'

const today = new Date()

export function CalendarDashboardPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const preferredDateRef = useRef<string | null>(searchParams.get('date'))
  const userPickedRef = useRef(false)
  const viewKeyRef = useRef(`${today.getFullYear()}-${today.getMonth()}`)
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date>(today)

  const { from, to } = useMemo(() => getMonthRange(year, month), [year, month])

  const { data: posts = [], isLoading, isFetching, refetch } = useGetCalendarPostsQuery({
    from,
    to,
  })

  useScheduledPostsRefetch(posts, refetch)

  const postsByDate = useMemo(() => groupPostsByDate(posts), [posts])

  const selectedDateKey = toDateKey(selectedDate)
  const selectedDayPosts = postsByDate.get(selectedDateKey) ?? []

  useEffect(() => {
    const viewKey = `${year}-${month}`
    if (viewKeyRef.current !== viewKey) {
      viewKeyRef.current = viewKey
      userPickedRef.current = false
    }
  }, [year, month])

  useEffect(() => {
    if (preferredDateRef.current) {
      const preferred = parseDateKey(preferredDateRef.current)
      setYear(preferred.getFullYear())
      setMonth(preferred.getMonth())
      setSelectedDate(preferred)
      userPickedRef.current = true
      preferredDateRef.current = null

      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('date')
      setSearchParams(nextParams, { replace: true })
      return
    }

    if (!userPickedRef.current) {
      setSelectedDate(resolveDefaultSelectedDate(year, month, postsByDate, null))
    }
  }, [year, month, postsByDate, searchParams, setSearchParams])

  const handleSelectDate = (date: Date): void => {
    userPickedRef.current = true
    setSelectedDate(date)
  }

  const handlePreviousMonth = (): void => {
    if (month === 0) {
      setMonth(11)
      setYear((value) => value - 1)
      return
    }
    setMonth((value) => value - 1)
  }

  const handleNextMonth = (): void => {
    if (month === 11) {
      setMonth(0)
      setYear((value) => value + 1)
      return
    }
    setMonth((value) => value + 1)
  }

  const handleSchedule = (): void => {
    navigate(`/dashboard/posts/new?date=${selectedDateKey}&mode=schedule`)
  }

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="h-9 px-4 transition-opacity hover:opacity-85"
          style={{ background: 'oklch(0.130 0.010 255)' }}
          onClick={handleSchedule}
        >
          <Plus size={14} />
          Запланировать пост
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <CalendarMonthGrid
          year={year}
          month={month}
          selectedDate={selectedDate}
          postsByDate={postsByDate}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onSelectDate={handleSelectDate}
        />

        <CalendarDayDetailPanel
          selectedDate={selectedDate}
          posts={selectedDayPosts}
          isLoading={isLoading || isFetching}
        />
      </div>
    </div>
  )
}
