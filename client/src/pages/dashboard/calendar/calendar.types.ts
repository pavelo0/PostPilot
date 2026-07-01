import type { Post, PostStatus } from '@/store/api/posts-api'

export type CalendarPost = Post

export type CalendarStatusMeta = {
  label: string
  chipClassName: string
}

export const CALENDAR_STATUS_META: Record<PostStatus, CalendarStatusMeta> = {
  scheduled: {
    label: 'Запланирован',
    chipClassName: 'bg-blue-50 text-blue-600',
  },
  published: {
    label: 'Опубликован',
    chipClassName: 'bg-[oklch(0.420_0.095_200)]/10 text-[oklch(0.380_0.095_200)]',
  },
  draft: {
    label: 'Черновик',
    chipClassName: 'bg-secondary text-muted-foreground',
  },
  failed: {
    label: 'Ошибка',
    chipClassName: 'bg-red-50 text-red-600',
  },
}

export const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export const MONTH_LABELS = [
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
