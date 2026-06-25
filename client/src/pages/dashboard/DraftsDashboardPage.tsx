import { useState } from 'react'
import { Clock, Edit3, FileText, Plus, Search, Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type Draft = {
  id: number
  title: string
  preview: string
  words: number
  updated: string
}

const drafts: Draft[] = [
  {
    id: 1,
    title: 'Как увеличить охват без рекламы',
    preview:
      'Многие считают, что без рекламного бюджета расти невозможно. Но это не так. В этом посте я расскажу о 5 органических методах...',
    words: 380,
    updated: '21 июн 2025',
  },
  {
    id: 2,
    title: 'Итоги месяца: что сработало',
    preview:
      'Подводим итоги июня. В этом месяце мы попробовали несколько новых форматов контента и хотим поделиться результатами...',
    words: 220,
    updated: '20 июн 2025',
  },
  {
    id: 3,
    title: 'Гайд по Telegram Stories',
    preview:
      'Telegram Stories — относительно новый формат для каналов. Как его использовать максимально эффективно?',
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

export function DraftsDashboardPage() {
  const [search, setSearch] = useState('')

  const filteredDrafts = drafts.filter((draft) =>
    draft.title.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Поиск черновиков..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 rounded-md pl-9 pr-3 text-sm focus-visible:ring-1"
            style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
          />
        </div>
        <Button variant="primary" size="sm" className="ml-auto h-9 px-4">
          <Plus size={14} />
          Новый черновик
        </Button>
      </div>

      {filteredDrafts.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText size={28} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Черновики не найдены</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDrafts.map((draft) => (
            <Card
              key={draft.id}
              className="group p-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold">{draft.title}</h3>
                  {draft.preview ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {draft.preview}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs italic text-muted-foreground">
                      Черновик пуст — начните писать
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={10} />
                      {draft.updated}
                    </div>
                    {draft.words > 0 ? (
                      <span className="text-xs text-muted-foreground">· {draft.words} слов</span>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Edit3 size={14} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Send size={14} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 text-muted-foreground hover:bg-secondary hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              {draft.words > 0 ? (
                <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min((draft.words / 500) * 100, 100)}%`,
                      background: 'oklch(0.420 0.095 200)',
                    }}
                  />
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        {filteredDrafts.length} из {drafts.length} черновиков
      </p>
    </div>
  )
}
