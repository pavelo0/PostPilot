import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  AlertCircle,
  ExternalLink,
  FileText,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import {
  useDeletePostMutation,
  useGetPostsQuery,
  type Post,
  type PostStatus,
} from '@/store/api/posts-api'

const PAGE_LIMIT = 12

type FilterOption = {
  label: string
  status: PostStatus | undefined
}

const filterOptions: FilterOption[] = [
  { label: 'Все', status: undefined },
  { label: 'Черновики', status: 'draft' },
  { label: 'Опубликованные', status: 'published' },
  { label: 'Ошибка', status: 'failed' },
]

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
  if (normalizedTitle) return normalizedTitle
  return post.body.trim().slice(0, 80)
}

type StatusBadgeProps = { status: PostStatus; telegramPostUrl: string | null; errorMessage: string | null }

/**
 * Colored status pill with optional Telegram link or error tooltip.
 */
function StatusBadge({ status, telegramPostUrl, errorMessage }: StatusBadgeProps) {
  if (status === 'published') {
    return (
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Опубликован
        </span>
        {telegramPostUrl ? (
          <a
            href={telegramPostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
            title="Открыть в Telegram"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={11} />
          </a>
        ) : null}
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="flex items-center gap-1.5" title={errorMessage ?? 'Ошибка публикации'}>
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle size={10} />
          Ошибка
        </span>
      </div>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
      Черновик
    </span>
  )
}

type PostCardProps = {
  post: Post
  onDelete: (id: string) => void
  isDeleting: boolean
}

function PostCard({ post, onDelete, isDeleting }: PostCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-150 hover:border-border/80 hover:shadow-sm">
      <div className="flex flex-1 flex-col gap-3 px-5 pt-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 flex-1 text-[14px] leading-snug font-semibold text-foreground">
            {getPostTitle(post)}
          </h3>
        </div>

        <p className="line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">
          {post.body}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              {formatPostDate(post.createdAt)}
            </span>
            <StatusBadge
              status={post.status}
              telegramPostUrl={post.telegramPostUrl}
              errorMessage={post.errorMessage}
            />
          </div>

          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button asChild variant="ghost" size="icon-sm" title="Редактировать">
              <Link to={`/dashboard/posts/${post.id}`}>
                <Pencil size={13} />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              title="Удалить"
              disabled={isDeleting}
              onClick={() => onDelete(post.id)}
              className="hover:bg-red-50 hover:text-destructive dark:hover:bg-red-950/30"
            >
              {isDeleting ? <Loader size="xs" /> : <Trash2 size={13} />}
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

export function PostsDashboardPage() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterOption>(filterOptions[0])
  const [page, setPage] = useState(1)
  const [accumulatedPosts, setAccumulatedPosts] = useState<Post[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, isFetching, isError, refetch } = useGetPostsQuery(
    { page, limit: PAGE_LIMIT, status: activeFilter.status },
    { refetchOnMountOrArgChange: true },
  )

  const [deletePost] = useDeletePostMutation()

  // Reset accumulated posts when filter changes
  useEffect(() => {
    setAccumulatedPosts([])
    setPage(1)
  }, [activeFilter])

  // Append new page of posts to accumulated list
  useEffect(() => {
    if (!data) return

    if (page === 1) {
      setAccumulatedPosts(data.posts)
    } else {
      setAccumulatedPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id))
        const newPosts = data.posts.filter((p) => !existingIds.has(p.id))
        return [...prev, ...newPosts]
      })
    }
  }, [data, page])

  // IntersectionObserver for infinite scroll sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && data?.hasMore && !isFetching) {
          setPage((prev) => prev + 1)
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [data?.hasMore, isFetching])

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm('Удалить пост? Это действие необратимо.')) return
      setDeletingId(id)
      try {
        await deletePost(id).unwrap()
        setAccumulatedPosts((prev) => prev.filter((p) => p.id !== id))
        toast.success('Пост удалён')
      } catch {
        toast.error('Не удалось удалить пост')
      } finally {
        setDeletingId(null)
      }
    },
    [deletePost],
  )

  const filteredPosts = accumulatedPosts.filter((post) => {
    const normalizedSearch = search.trim().toLowerCase()
    if (!normalizedSearch) return true
    const title = getPostTitle(post).toLowerCase()
    const body = post.body.toLowerCase()
    return title.includes(normalizedSearch) || body.includes(normalizedSearch)
  })

  const showInitialLoader = isLoading && page === 1
  const showGrid = !showInitialLoader && !isError

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
          {filterOptions.map((option) => (
            <Button
              key={option.label}
              type="button"
              onClick={() => setActiveFilter(option)}
              variant="ghost"
              size="sm"
              className={`h-auto px-3 py-1 text-xs font-medium ${
                activeFilter.label === option.label
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {option.label}
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

      {showInitialLoader ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="lg" text="Загружаем посты..." centered />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card py-20 text-muted-foreground">
          <p className="text-sm">Не удалось загрузить посты</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
          >
            Повторить
          </Button>
        </div>
      ) : showGrid && filteredPosts.length === 0 && !isFetching ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card py-20 text-muted-foreground">
          <FileText size={32} className="opacity-30" />
          <p className="text-sm">Посты не найдены</p>
        </div>
      ) : showGrid ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={(id) => void handleDelete(id)}
                isDeleting={deletingId === post.id}
              />
            ))}
          </div>

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-1" />

          {/* Next page loader */}
          {isFetching && page > 1 ? (
            <div className="flex justify-center py-6">
              <Loader size="sm" text="Загружаем ещё..." />
            </div>
          ) : null}
        </>
      ) : null}

      {!showInitialLoader && !isError && data ? (
        <p className="text-xs text-muted-foreground">
          Показано {filteredPosts.length} из {data.total} постов
        </p>
      ) : null}
    </div>
  )
}
