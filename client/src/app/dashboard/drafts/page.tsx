'use client'

import { useState } from 'react'
import { Plus, Search, FileText, Edit3, Trash2, Send, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'

const drafts = [
  {
    id: 1,
    title: 'Как увеличить охват без рекламы',
    preview: 'Многие считают, что без рекламного бюджета расти невозможно. Но это не так. В этом посте я расскажу о 5 органических методах...',
    words: 380,
    updated: '21 июн 2025',
  },
  {
    id: 2,
    title: 'Итоги месяца: что сработало',
    preview: 'Подводим итоги июня. В этом месяце мы попробовали несколько новых форматов контента и хотим поделиться результатами...',
    words: 220,
    updated: '20 июн 2025',
  },
  {
    id: 3,
    title: 'Гайд по Telegram Stories',
    preview: 'Telegram Stories — относительно новый формат для каналов. Как его использовать максимально эффективно?',
    words: 150,
    updated: '17 июн 2025',
  },
  {
    id: 4,
    title: 'Интервью: как мы набрали первые 1000 подписчиков',
    preview: '',
    words: 0,
    updated: '15 июн 2025',
  },
]

export default function DraftsPage() {
  const [search, setSearch] = useState('')

  const filtered = drafts.filter(d => d.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Поиск черновиков..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm bg-background"
          />
        </div>
        <button
          className="inline-flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-background ml-auto transition-opacity hover:opacity-85"
          style={{ background: 'oklch(0.130 0.010 255)' }}
        >
          <Plus size={14} />
          Новый черновик
        </button>
      </div>

      {/* Drafts list */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <FileText size={28} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Черновики не найдены</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((draft) => (
            <div key={draft.id} className="group bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate">{draft.title}</h3>
                  {draft.preview ? (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{draft.preview}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1 italic">Черновик пуст — начните писать</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={10} />
                      {draft.updated}
                    </div>
                    {draft.words > 0 && (
                      <span className="text-xs text-muted-foreground">· {draft.words} слов</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    title="Редактировать"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    title="Опубликовать"
                  >
                    <Send size={14} />
                  </button>
                  <button
                    className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                    title="Удалить"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {draft.words > 0 && (
                <div className="mt-3 h-0.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min((draft.words / 500) * 100, 100)}%`,
                      background: 'oklch(0.420 0.095 200)',
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">{filtered.length} из {drafts.length} черновиков</p>
    </div>
  )
}
