import { useMemo, useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react'

type ScheduledPost = {
  title: string
  status: 'scheduled' | 'published'
  time: string
}

const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const months = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

const scheduledPosts: Record<number, ScheduledPost[]> = {
  10: [{ title: 'Инструменты для контента', status: 'published', time: '10:00' }],
  14: [{ title: 'Кейс: рост до 10k', status: 'published', time: '12:00' }],
  18: [{ title: 'Топ-5 ошибок', status: 'published', time: '09:30' }],
  20: [{ title: 'Как выбрать тему', status: 'published', time: '11:00' }],
  22: [
    { title: 'Анонс нового формата', status: 'scheduled', time: '14:00' },
    { title: 'Итоги недели', status: 'scheduled', time: '18:00' },
  ],
  25: [{ title: 'Советы по вовлечённости', status: 'scheduled', time: '12:00' }],
}

function getMonthGridMeta(year: number, month: number): { offset: number; total: number } {
  const firstDay = new Date(year, month, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const total = new Date(year, month + 1, 0).getDate()

  return { offset, total }
}

export function CalendarDashboardPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const { offset, total } = getMonthGridMeta(year, month)

  const cells = useMemo<(number | null)[]>(() => {
    const values = Array.from({ length: offset + total }, (_, index) =>
      index < offset ? null : index - offset + 1,
    )
    while (values.length % 7 !== 0) {
      values.push(null)
    }
    return values
  }, [offset, total])

  const upcoming = useMemo(() => {
    return Object.entries(scheduledPosts)
      .flatMap(([day, posts]) => posts.map((post) => ({ day: Number(day), ...post })))
      .filter((post) => post.status === 'scheduled')
      .sort((a, b) => a.day - b.day)
      .slice(0, 4)
  }, [])


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

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-end">
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium text-background transition-opacity hover:opacity-85"
          style={{ background: 'oklch(0.130 0.010 255)' }}
        >
          <Plus size={14} />
          Запланировать пост
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <button
              onClick={handlePreviousMonth}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ChevronLeft size={16} />
            </button>
            <h2 className="text-sm font-semibold">
              {months[month]} {year}
            </h2>
            <button
              onClick={handleNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 border-b border-border">
            {days.map((day) => (
              <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((day, index) => {
              const posts = day ? scheduledPosts[day] : undefined
              const isToday =
                day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              return (
                <div
                  key={index}
                  className={`min-h-[72px] border-r border-b border-border p-1.5 ${
                    day ? 'cursor-pointer transition-colors hover:bg-secondary/30' : 'bg-secondary/10'
                  } ${index % 7 === 6 ? 'border-r-0' : ''}`}
                >
                  {day ? (
                    <>
                      <div
                        className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                          isToday ? 'text-background' : 'text-muted-foreground hover:text-foreground'
                        }`}
                        style={isToday ? { background: 'oklch(0.420 0.095 200)' } : undefined}
                      >
                        {day}
                      </div>
                      {posts?.slice(0, 2).map((post, postIndex) => (
                        <div
                          key={`${post.title}-${postIndex}`}
                          className={`mb-0.5 truncate rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            post.status === 'published'
                              ? 'bg-[oklch(0.420_0.095_200)]/10 text-[oklch(0.380_0.095_200)]'
                              : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          {post.title}
                        </div>
                      ))}
                      {posts && posts.length > 2 ? (
                        <div className="px-1 text-[10px] text-muted-foreground">
                          +{posts.length - 2}
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>

        <div className="h-fit overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold">Запланировано</h3>
          </div>
          <div className="divide-y divide-border">
            {upcoming.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-muted-foreground">
                Нет запланированных постов
              </p>
            ) : (
              upcoming.map((post, index) => (
                <div
                  key={`${post.title}-${index}`}
                  className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/20"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50">
                    <Clock size={13} className="text-blue-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-medium">{post.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {months[month]} {post.day} · {post.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-border px-5 py-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={11} style={{ color: 'oklch(0.420 0.095 200)' }} />
                Опубликовано:{' '}
                {Object.values(scheduledPosts)
                  .flat()
                  .filter((post) => post.status === 'published').length}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={11} className="text-blue-500" />
                Запланировано: {upcoming.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
