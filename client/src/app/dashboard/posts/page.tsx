'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, MoreHorizontal, Clock, CheckCircle2, FileText, AlertCircle, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'

const posts = [
  { id: 1, title: 'Как выбрать тему для Telegram-канала',   status: 'published', date: '20 июн 2025', views: 4210 },
  { id: 2, title: 'Топ-5 ошибок при ведении канала',         status: 'published', date: '18 июн 2025', views: 3850 },
  { id: 3, title: 'Анонс нового формата контента',           status: 'scheduled', date: '22 июн 2025', views: null },
  { id: 4, title: 'Как увеличить охват без рекламы',         status: 'draft',     date: '—',           views: null },
  { id: 5, title: 'Кейс: рост с нуля до 10 000 подписчиков', status: 'published', date: '14 июн 2025', views: 6120 },
  { id: 6, title: 'Инструменты для работы с контентом',     status: 'failed',    date: '12 июн 2025', views: null },
  { id: 7, title: 'Итоги месяца: что сработало',             status: 'draft',     date: '—',           views: null },
]

const statuses = {
  published: { label: 'Опубликовано', icon: CheckCircle2, bg: 'bg-[oklch(0.420_0.095_200)]/10',  text: 'text-[oklch(0.380_0.095_200)]' },
  scheduled: { label: 'Запланировано', icon: Clock,        bg: 'bg-blue-50',                       text: 'text-blue-600' },
  draft:     { label: 'Черновик',      icon: FileText,     bg: 'bg-secondary',                     text: 'text-muted-foreground' },
  failed:    { label: 'Ошибка',        icon: AlertCircle,  bg: 'bg-red-50',                        text: 'text-red-600' },
}

const filters = ['Все', 'Опубликованные', 'Запланированные', 'Черновики']

export default function PostsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Все')

  const filtered = posts.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'Все' ||
      (filter === 'Опубликованные' && p.status === 'published') ||
      (filter === 'Запланированные' && p.status === 'scheduled') ||
      (filter === 'Черновики' && p.status === 'draft')
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Поиск постов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm bg-background"
          />
        </div>

        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${filter === f ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Link
            href="/dashboard/ai-assistant"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Sparkles size={13} />
            AI-генерация
          </Link>
          <button
            className="inline-flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-background transition-colors hover:opacity-85"
            style={{ background: 'oklch(0.130 0.010 255)' }}
          >
            <Plus size={14} />
            Новый пост
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Заголовок</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Статус</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Дата</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Просмотры</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground">
                  Посты не найдены
                </td>
              </tr>
            ) : (
              filtered.map((post) => {
                const s = statuses[post.status as keyof typeof statuses]
                const StatusIcon = s.icon
                return (
                  <tr key={post.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-foreground line-clamp-1">{post.title}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
                        <StatusIcon size={11} />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground hidden md:table-cell">{post.date}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums hidden lg:table-cell">
                      {post.views !== null ? post.views.toLocaleString('ru') : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <button className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                        <MoreHorizontal size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground bg-secondary/20">
          {filtered.length} из {posts.length} постов
        </div>
      </div>
    </div>
  )
}
