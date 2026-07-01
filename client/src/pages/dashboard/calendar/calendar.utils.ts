import type { CalendarPost } from './calendar.types'
import { MONTH_LABELS } from './calendar.types'

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateKey(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year!, month! - 1, day)
}

export function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

export function getMonthRange(year: number, month: number): { from: string; to: string } {
  const lastDay = new Date(year, month + 1, 0).getDate()
  const monthPart = String(month + 1).padStart(2, '0')
  return {
    from: `${year}-${monthPart}-01`,
    to: `${year}-${monthPart}-${String(lastDay).padStart(2, '0')}`,
  }
}

export function getMonthGridMeta(year: number, month: number): { offset: number; total: number } {
  const firstDay = new Date(year, month, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const total = new Date(year, month + 1, 0).getDate()
  return { offset, total }
}

export function buildMonthCells(offset: number, total: number): (number | null)[] {
  const values = Array.from({ length: offset + total }, (_, index) =>
    index < offset ? null : index - offset + 1,
  )
  while (values.length % 7 !== 0) {
    values.push(null)
  }
  return values
}

export function getCalendarEventDate(post: CalendarPost): Date {
  if (post.status === 'scheduled' && post.scheduledAt) {
    return new Date(post.scheduledAt)
  }
  if (post.publishedAt) {
    return new Date(post.publishedAt)
  }
  return new Date(post.createdAt)
}

export function groupPostsByDate(posts: CalendarPost[]): Map<string, CalendarPost[]> {
  const grouped = new Map<string, CalendarPost[]>()

  for (const post of posts) {
    const key = toDateKey(getCalendarEventDate(post))
    const existing = grouped.get(key) ?? []
    existing.push(post)
    grouped.set(key, existing)
  }

  for (const [key, dayPosts] of grouped.entries()) {
    grouped.set(
      key,
      [...dayPosts].sort(
        (left, right) =>
          getCalendarEventDate(left).getTime() - getCalendarEventDate(right).getTime(),
      ),
    )
  }

  return grouped
}

export function formatDayHeader(date: Date): string {
  const day = date.getDate()
  const month = MONTH_LABELS[date.getMonth()]?.toLowerCase() ?? ''
  return `Посты на ${day} ${month}`
}

export function formatPostDateTime(post: CalendarPost): string {
  const eventDate = getCalendarEventDate(post)
  const hours = String(eventDate.getHours()).padStart(2, '0')
  const minutes = String(eventDate.getMinutes()).padStart(2, '0')
  const day = eventDate.getDate()
  const month = MONTH_LABELS[eventDate.getMonth()]?.toLowerCase() ?? ''
  return `${day} ${month} · ${hours}:${minutes}`
}

export function getPostPreviewTitle(post: CalendarPost): string {
  if (post.title?.trim()) {
    return post.title.trim()
  }
  const snippet = post.body.trim().slice(0, 48)
  return snippet.length < post.body.trim().length ? `${snippet}…` : snippet
}

export function resolveDefaultSelectedDate(
  year: number,
  month: number,
  postsByDate: Map<string, CalendarPost[]>,
  preferredDateKey?: string | null,
): Date {
  if (preferredDateKey) {
    const preferred = parseDateKey(preferredDateKey)
    if (preferred.getFullYear() === year && preferred.getMonth() === month) {
      return preferred
    }
  }

  const today = new Date()
  const todayInMonth =
    today.getFullYear() === year && today.getMonth() === month ? today : null

  const monthPostDates = Array.from(postsByDate.keys())
    .filter((key) => {
      const date = parseDateKey(key)
      return date.getFullYear() === year && date.getMonth() === month
    })
    .map(parseDateKey)
    .sort((left, right) => left.getTime() - right.getTime())

  if (todayInMonth) {
    const todayStart = new Date(todayInMonth)
    todayStart.setHours(0, 0, 0, 0)
    const todayKey = toDateKey(todayInMonth)

    if ((postsByDate.get(todayKey)?.length ?? 0) > 0) {
      return todayInMonth
    }

    const future = monthPostDates.find((date) => date.getTime() >= todayStart.getTime())
    if (future) {
      return future
    }

    const past = [...monthPostDates]
      .reverse()
      .find((date) => date.getTime() < todayStart.getTime())
    if (past) {
      return past
    }

    return todayInMonth
  }

  if (monthPostDates.length > 0) {
    return monthPostDates[0]!
  }

  return new Date(year, month, 1)
}
