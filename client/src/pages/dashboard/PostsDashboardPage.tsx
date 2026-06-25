import { useMemo, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGetPostsQuery, type Post } from '@/store/api/posts-api'

const filters = ['Все', 'Опубликованные', 'Запланированные', 'Черновики']

/**
 * Formats ISO date into short Russian label for post cards.
 */
function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

/**
 * Resolves card title from post title or body preview.
 */
function getPostTitle(post: Post): string {
  const normalizedTitle = post.title?.trim()
  if (normalizedTitle) {
    return normalizedTitle
  }

  return post.body.trim().slice(0, 80)
}

export function PostsDashboardPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Все')
  const { data: posts = [], isLoading, isError, refetch } = useGetPostsQuery()

  const filteredPosts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return posts
    }

    return posts.filter((post) => {
      const title = getPostTitle(post).toLowerCase()
      const body = post.body.toLowerCase()
      return title.includes(normalizedSearch) || body.includes(normalizedSearch)
    })
  }, [posts, search])

  return (
    <div className="w-full space-y-5">
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
            style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as CSSProperties}
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
          <Button asChild variant="primary" size="sm" className="h-9 px-4">
            <Link to="/dashboard/posts/new">
              <Plus size={14} />
              Новый пост
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card py-20 text-muted-foreground">
          <FileText size={32} className="opacity-30" />
          <p className="text-sm">Загружаем посты...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card py-20 text-muted-foreground">
          <p className="text-sm">Не удалось загрузить посты</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            Повторить
          </Button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card py-20 text-muted-foreground">
          <FileText size={32} className="opacity-30" />
          <p className="text-sm">Посты не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-150 hover:border-border/80 hover:shadow-sm"
            >
              <div className="flex flex-1 flex-col gap-3 px-5 pt-4 pb-4">
                <h3 className="line-clamp-2 text-[14px] leading-snug font-semibold text-foreground">
                  {getPostTitle(post)}
                </h3>

                <p className="line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">
                  {post.body}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                  <span className="text-[11px] text-muted-foreground">
                    {formatPostDate(post.createdAt)}
                  </span>

                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      title="Редактировать"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-50 hover:text-destructive"
                      title="Удалить"
                    >
                      <Trash2 size={13} />
                    </button>
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      title="Ещё"
                    >
                      <MoreHorizontal size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!isLoading && !isError ? (
        <p className="text-xs text-muted-foreground">
          {filteredPosts.length} из {posts.length} постов
        </p>
      ) : null}
    </div>
  )
}
