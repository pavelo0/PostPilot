import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, AlertCircle, ExternalLink, Send, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader } from '@/components/ui/loader'
import {
  useGetPostByIdQuery,
  useUpdatePostMutation,
  usePublishPostMutation,
  type Post,
  type PostStatus,
} from '@/store/api/posts-api'

const STATUS_CONFIG: Record<PostStatus, { label: string; className: string }> = {
  draft: {
    label: 'Черновик',
    className: 'bg-secondary text-muted-foreground',
  },
  published: {
    label: 'Опубликован',
    className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  failed: {
    label: 'Ошибка публикации',
    className: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  },
}

type PostEditorProps = {
  post: Post
}

/**
 * Editor form for an existing post — supports save (PATCH) and publish.
 */
function PostEditor({ post }: PostEditorProps) {
  const navigate = useNavigate()
  const [title, setTitle] = useState(post.title ?? '')
  const [body, setBody] = useState(post.body)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  const [updatePost, { isLoading: isSaving }] = useUpdatePostMutation()
  const [publishPost, { isLoading: isPublishing }] = usePublishPostMutation()

  const isDirty = title !== (post.title ?? '') || body !== post.body
  const canPublish = post.status === 'draft' || post.status === 'failed'
  const bodyLength = body.trim().length
  const bodyValid = bodyLength >= 1 && bodyLength <= 4000

  const handleSave = async () => {
    if (!isDirty || !bodyValid) return
    setSaveSuccess(false)
    try {
      await updatePost({ id: post.id, title: title || undefined, body }).unwrap()
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      // error handled by RTK
    }
  }

  const handlePublish = async () => {
    setPublishError(null)
    try {
      await publishPost({ id: post.id }).unwrap()
      navigate('/dashboard/posts')
    } catch (err: unknown) {
      const message =
        err instanceof Object && 'data' in err
          ? ((err as { data?: { message?: string } }).data?.message ?? 'Не удалось опубликовать')
          : 'Не удалось опубликовать'
      setPublishError(message)
    }
  }

  const statusConfig = STATUS_CONFIG[post.status]

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon-sm" className="h-8 w-8 shrink-0">
          <Link to="/dashboard/posts">
            <ArrowLeft size={15} />
          </Link>
        </Button>
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <h1 className="truncate text-base font-semibold text-foreground">
            Редактирование поста
          </h1>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusConfig.className}`}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Telegram link for published posts */}
      {post.status === 'published' && post.telegramPostUrl ? (
        <a
          href={post.telegramPostUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
        >
          <CheckCircle2 size={14} />
          <span className="flex-1">Пост опубликован в Telegram</span>
          <ExternalLink size={12} />
        </a>
      ) : null}

      {/* Error message for failed posts */}
      {post.status === 'failed' && post.errorMessage ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{post.errorMessage}</span>
        </div>
      ) : null}

      {/* Form */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-title">
            Заголовок <span className="text-muted-foreground/50">(необязательно)</span>
          </label>
          <Input
            id="edit-title"
            placeholder="Заголовок поста..."
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-body">
              Текст поста
            </label>
            <span
              className={`text-[10px] tabular-nums ${
                bodyLength > 3800 ? 'text-red-500' : 'text-muted-foreground'
              }`}
            >
              {bodyLength} / 4000
            </span>
          </div>
          <Textarea
            id="edit-body"
            placeholder="Текст поста..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[260px] resize-y text-sm leading-relaxed"
          />
        </div>
      </div>

      {/* Publish error */}
      {publishError ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{publishError}</span>
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {saveSuccess ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600">
              <CheckCircle2 size={13} />
              Сохранено
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 px-4"
            disabled={!isDirty || !bodyValid || isSaving}
            onClick={() => void handleSave()}
          >
            {isSaving ? (
              <Loader size="xs" />
            ) : (
              <Save size={14} />
            )}
            Сохранить
          </Button>

          {canPublish ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="h-9 px-4"
              disabled={isPublishing || !bodyValid}
              onClick={() => void handlePublish()}
            >
              {isPublishing ? (
                <Loader size="xs" />
              ) : (
                <Send size={14} />
              )}
              Опубликовать
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/**
 * Page wrapper — loads post by :id param and renders editor.
 */
export function EditPostDashboardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: post, isLoading, isError } = useGetPostByIdQuery(id ?? '', {
    skip: !id,
  })

  useEffect(() => {
    if (!id) {
      navigate('/dashboard/posts', { replace: true })
    }
  }, [id, navigate])

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center">
        <Loader size="lg" text="Загружаем пост..." centered />
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <AlertCircle size={32} className="opacity-40" />
        <p className="text-sm">Пост не найден</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard/posts">Вернуться к постам</Link>
        </Button>
      </div>
    )
  }

  return <PostEditor post={post} />
}
