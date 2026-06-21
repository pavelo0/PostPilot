'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock, CheckCircle2 } from 'lucide-react'

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

const scheduledPosts: Record<number, { title: string; status: 'scheduled' | 'published'; time: string }[]> = {
  10: [{ title: 'Инструменты для контента', status: 'published', time: '10:00' }],
  14: [{ title: 'Кейс: рост до 10k', status: 'published', time: '12:00' }],
  18: [{ title: 'Топ-5 ошибок', status: 'published', time: '09:30' }],
  20: [{ title: 'Как выбрать тему', status: 'published', time: '11:00' }],
  22: [{ title: 'Анонс нового формата', status: 'scheduled', time: '14:00' }, { title: 'Итоги недели', status: 'scheduled', time: '18:00' }],
  25: [{ title: 'Советы по вовлечённости', status: 'scheduled', time: '12:00' }],
}

function getDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay()
  const offset = first === 0 ? 6 : first - 1
  const total = new Date(year, month + 1, 0).getDate()
  return { offset, total }
}

export default function CalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const { offset, total } = getDays(year, month)
  const cells = Array.from({ length: offset + total }, (_, i) => (i < offset ? null : i - offset + 1))
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const upcoming = Object.entries(scheduledPosts)
    .flatMap(([d, posts]) => posts.map(p => ({ day: Number(d), ...p })))
    .filter(p => p.status === 'scheduled')
    .sort((a, b) => a.day - b.day)
    .slice(0, 4)

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-end">
        <button
          className="inline-flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-background transition-opacity hover:opacity-85"
          style={{ background: 'oklch(0.130 0.010 255)' }}
        >
          <Plus size={14} />
          Запланировать пост
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_260px] gap-5">
        {/* Calendar grid */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <button onClick={prev} className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <ChevronLeft size={16} />
            </button>
            <h2 className="text-sm font-semibold">{MONTHS[month]} {year}</h2>
            <button onClick={next} className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 border-b border-border">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const posts = day ? scheduledPosts[day] : undefined
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              return (
                <div
                  key={i}
                  className={`min-h-[72px] border-b border-r border-border p-1.5 ${day ? 'hover:bg-secondary/30 cursor-pointer transition-colors' : 'bg-secondary/10'} ${i % 7 === 6 ? 'border-r-0' : ''}`}
                >
                  {day && (
                    <>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${isToday ? 'text-background' : 'text-muted-foreground hover:text-foreground'}`}
                        style={isToday ? { background: 'oklch(0.420 0.095 200)' } : undefined}>
                        {day}
                      </div>
                      {posts?.slice(0, 2).map((p, j) => (
                        <div key={j} className={`text-[10px] truncate px-1.5 py-0.5 rounded mb-0.5 font-medium ${p.status === 'published' ? 'bg-[oklch(0.420_0.095_200)]/10 text-[oklch(0.380_0.095_200)]' : 'bg-blue-50 text-blue-600'}`}>
                          {p.title}
                        </div>
                      ))}
                      {posts && posts.length > 2 && (
                        <div className="text-[10px] text-muted-foreground px-1">+{posts.length - 2}</div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming */}
        <div className="bg-card border border-border rounded-xl overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold">Запланировано</h3>
          </div>
          <div className="divide-y divide-border">
            {upcoming.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted-foreground text-center">Нет запланированных постов</p>
            ) : (
              upcoming.map((p, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3.5 hover:bg-secondary/20 transition-colors">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-blue-50">
                    <Clock size={13} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-2">{p.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{MONTHS[month]} {p.day} · {p.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-5 py-3 border-t border-border">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={11} style={{ color: 'oklch(0.420 0.095 200)' }} />
                Опубликовано: {Object.values(scheduledPosts).flat().filter(p => p.status === 'published').length}
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
