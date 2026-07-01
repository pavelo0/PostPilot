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
import { EmptyState } from '@/components/EmptyState'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useDeletePostMutation,
  useGetPostsQuery,
  type Post,
  type PostStatus,
} from '@/store/api/posts-api'
import { useScheduledPostsRefetch } from '@/hooks/useScheduledPostsRefetch'

const PAGE_LIMIT = 12

type FilterOption = {
  label: string
  status: PostStatus | undefined
}

const filterOptions: FilterOption[] = [
  { label: 'Все', status: undefined },
  { label: 'Черновики', status: 'draft' },
  { label: 'Запланированные', status: 'scheduled' },
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
        <Badge variant="secondary" className="gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Опубликован
        </Badge>
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
        <Badge variant="destructive" className="gap-1">
          <AlertCircle size={10} />
          Ошибка
        </Badge>
      </div>
    )
  }

  if (status === 'scheduled') {
    return (
      <Badge variant="secondary" className="gap-1 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        Запланирован
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="gap-1 text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
      Черновик
    </Badge>
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
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, isFetching, isError, refetch } = useGetPostsQuery(
    { page, limit: PAGE_LIMIT, status: activeFilter.status },
    { refetchOnMountOrArgChange: true },
  )

  const [deletePost] = useDeletePostMutation()

  const postsForScheduling =
    accumulatedPosts.length > 0 ? accumulatedPosts : (data?.posts ?? [])

  useScheduledPostsRefetch(postsForScheduling, refetch)

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
      setDeletingId(id)
      try {
        await deletePost(id).unwrap()
        setAccumulatedPosts((prev) => prev.filter((p) => p.id !== id))
        toast.success('Пост удалён')
      } catch {
        toast.error('Не удалось удалить пост')
      } finally {
        setDeletingId(null)
        setDeleteTargetId(null)
      }
    },
    [deletePost],
  )

  const confirmDelete = useCallback(() => {
    if (deleteTargetId) {
      void handleDelete(deleteTargetId)
    }
  }, [deleteTargetId, handleDelete])

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-xl border border-border bg-card p-5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="mt-2 h-8 w-full" />
            </div>
          ))}
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
        search.trim() || activeFilter.status ? (
          <EmptyState
            icon={FileText}
            title="Посты не найдены"
            description="Попробуйте изменить фильтр или поисковый запрос."
          />
        ) : (
          <EmptyState
            icon={FileText}
            title="Пока нет постов"
            description="Создайте первый пост и опубликуйте его в Telegram-канал."
            action={
              <Button asChild variant="primary" size="sm">
                <Link to="/dashboard/posts/new">
                  <Plus size={14} />
                  Создать пост
                </Link>
              </Button>
            }
          />
        )
      ) : showGrid ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={(id) => setDeleteTargetId(id)}
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

      <AlertDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTargetId(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пост?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие необратимо. Пост будет удалён из вашего аккаунта.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                confirmDelete()
              }}
              disabled={deletingId !== null}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deletingId ? <Loader size="xs" /> : 'Удалить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
