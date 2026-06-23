import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type PostStatus = 'published' | 'scheduled' | 'draft' | 'failed'

type PostItem = {
  id: number
  title: string
  status: PostStatus
  date: string
  views: number | null
}

const posts: PostItem[] = [
  { id: 1, title: 'Как выбрать тему для Telegram-канала', status: 'published', date: '20 июн 2025', views: 4210 },
  { id: 2, title: 'Топ-5 ошибок при ведении канала', status: 'published', date: '18 июн 2025', views: 3850 },
  { id: 3, title: 'Анонс нового формата контента', status: 'scheduled', date: '22 июн 2025', views: null },
  { id: 4, title: 'Как увеличить охват без рекламы', status: 'draft', date: '—', views: null },
  { id: 5, title: 'Кейс: рост с нуля до 10 000 подписчиков', status: 'published', date: '14 июн 2025', views: 6120 },
  { id: 6, title: 'Инструменты для работы с контентом', status: 'failed', date: '12 июн 2025', views: null },
  { id: 7, title: 'Итоги месяца: что сработало', status: 'draft', date: '—', views: null },
]

const statuses = {
  published: {
    label: 'Опубликовано',
    icon: CheckCircle2,
    bg: 'bg-[oklch(0.420_0.095_200)]/10',
    text: 'text-[oklch(0.380_0.095_200)]',
  },
  scheduled: { label: 'Запланировано', icon: Clock, bg: 'bg-blue-50', text: 'text-blue-600' },
  draft: { label: 'Черновик', icon: FileText, bg: 'bg-secondary', text: 'text-muted-foreground' },
  failed: { label: 'Ошибка', icon: AlertCircle, bg: 'bg-red-50', text: 'text-red-600' },
}

const filters = ['Все', 'Опубликованные', 'Запланированные', 'Черновики']

export function PostsDashboardPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Все')

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === 'Все' ||
      (filter === 'Опубликованные' && post.status === 'published') ||
      (filter === 'Запланированные' && post.status === 'scheduled') ||
      (filter === 'Черновики' && post.status === 'draft')

    return matchesSearch && matchesFilter
  })

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Поиск постов..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 rounded-md pl-9 pr-3 text-sm focus-visible:ring-1"
            style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
          {filters.map((filterItem) => (
            <Button
              key={filterItem}
              type="button"
              onClick={() => setFilter(filterItem)}
              variant="ghost"
              size="sm"
              className={`h-auto px-3 py-1 text-xs font-medium ${
                filter === filterItem
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {filterItem}
            </Button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-9 px-4">
            <Link to="/dashboard/ai-assistant">
              <Sparkles size={13} />
              AI-генерация
            </Link>
          </Button>
          <Button variant="primary" size="sm" className="h-9 px-4">
            <Plus size={14} />
            Новый пост
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Заголовок
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:table-cell">
                Статус
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase md:table-cell">
                Дата
              </th>
              <th className="hidden px-4 py-3 text-right text-xs font-semibold tracking-wide text-muted-foreground uppercase lg:table-cell">
                Просмотры
              </th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground">
                  Посты не найдены
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => {
                const status = statuses[post.status]
                const StatusIcon = status.icon
                return (
                  <tr key={post.id} className="transition-colors hover:bg-secondary/20">
                    <td className="px-5 py-3.5">
                      <span className="line-clamp-1 font-medium text-foreground">{post.title}</span>
                    </td>
                    <td className="hidden px-4 py-3.5 sm:table-cell">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.bg} ${status.text}`}
                      >
                        <StatusIcon size={11} />
                        {status.label}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3.5 text-muted-foreground md:table-cell">
                      {post.date}
                    </td>
                    <td className="hidden px-4 py-3.5 text-right tabular-nums lg:table-cell">
                      {post.views !== null ? post.views.toLocaleString('ru') : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <MoreHorizontal size={15} />
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        <div className="border-t border-border bg-secondary/20 px-5 py-3 text-xs text-muted-foreground">
          {filteredPosts.length} из {posts.length} постов
        </div>
      </Card>
    </div>
  )
}
