import { useEffect, useRef, useState, type ChangeEvent, type ElementType } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  AlertCircle,
  ArrowLeft,
  Bold,
  CheckCircle2,
  Code,
  Copy,
  ExternalLink,
  ImagePlus,
  Italic,
  Link2,
  List,
  Quote,
  RefreshCw,
  Save,
  Send,
  Sparkles,
  Strikethrough,
  Underline,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import { Textarea } from '@/components/ui/textarea'
import { postBodySchema } from '@/utils/posts/post.schema'
import { cn } from '@/lib/utils'
import {
  useDeletePostMediaMutation,
  useGetPostByIdQuery,
  usePublishPostMutation,
  useUpdatePostMutation,
  useUploadPostMediaMutation,
  type Post,
  type PostStatus,
} from '@/store/api/posts-api'
import { getBotSetup, type BotChannelStatus } from '@/utils/bot/bot.api'

// ─── Constants ────────────────────────────────────────────────────────────────

type FormatAction = {
  icon: ElementType
  title: string
  wrap?: [string, string]
  line?: string
}

/**
 * Telegram HTML formatting tags supported by the Bot API.
 */
const FORMAT_ACTIONS: FormatAction[] = [
  { icon: Bold, title: 'Жирный  <b>', wrap: ['<b>', '</b>'] },
  { icon: Italic, title: 'Курсив  <i>', wrap: ['<i>', '</i>'] },
  { icon: Underline, title: 'Подчёркнутый  <u>', wrap: ['<u>', '</u>'] },
  { icon: Strikethrough, title: 'Зачёркнутый  <s>', wrap: ['<s>', '</s>'] },
  { icon: Code, title: 'Код  <code>', wrap: ['<code>', '</code>'] },
  { icon: Link2, title: 'Ссылка  <a href="url">', wrap: ['<a href="url">', '</a>'] },
  { icon: Quote, title: 'Цитата  <blockquote>', wrap: ['<blockquote>', '</blockquote>'] },
  { icon: List, title: 'Список  •', line: '• ' },
]

const AI_SUGGESTIONS = [
  { label: 'Написать вступление', prompt: 'Напиши цепляющее вступление для поста о...' },
  { label: 'Дополнить текст', prompt: 'Разверни эту мысль подробнее: ...' },
  { label: 'Сократить', prompt: 'Сократи текст, сохранив смысл: ...' },
  { label: 'Другой стиль', prompt: 'Перепиши в более живом, неформальном стиле: ...' },
]

const GENERATED_SAMPLE = `Многие думают, что для успешного Telegram-канала нужно публиковать каждый день. Но это миф.

Регулярность важнее частоты. Аудитория ценит предсказуемость: если вы выходите 3 раза в неделю — выходите ровно 3 раза. Каждый раз.

Качество одного сильного поста в неделю всегда лучше семи посредственных. Читатели это чувствуют.`

const STATUS_CONFIG: Record<PostStatus, { label: string; className: string }> = {
  draft: { label: 'Черновик', className: 'bg-secondary text-muted-foreground' },
  scheduled: {
    label: 'Запланирован',
    className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  },
  published: {
    label: 'Опубликован',
    className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  failed: {
    label: 'Ошибка',
    className: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  },
}

/**
 * Formats ISO date into short Russian label.
 */
function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

// ─── Editor component ─────────────────────────────────────────────────────────

type PostEditorProps = { post: Post }

function PostEditor({ post }: PostEditorProps) {
  const navigate = useNavigate()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(post.title ?? '')
  const [body, setBody] = useState(post.body)

  // AI panel
  const [showAI, setShowAI] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // Channels
  const [channels, setChannels] = useState<BotChannelStatus[]>([])
  const [channelId, setChannelId] = useState('')
  const [isChannelsLoading, setIsChannelsLoading] = useState(true)

  const [updatePost, { isLoading: isSaving }] = useUpdatePostMutation()
  const [publishPost, { isLoading: isPublishing }] = usePublishPostMutation()
  const [uploadPostMedia, { isLoading: isUploadingMedia }] = useUploadPostMediaMutation()
  const [deletePostMedia, { isLoading: isDeletingMedia }] = useDeletePostMediaMutation()

  const isDirty = title !== (post.title ?? '') || body !== post.body
  const canPublish = post.status === 'draft' || post.status === 'failed'
  const canEditMedia = post.status !== 'published'

  const hasMedia = post.mediaItems.length > 0
  const charLimit = hasMedia ? 1024 : 4096
  const charCount = body.length
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0
  const isOverLimit = charCount > charLimit
  const bodyValid = body.trim().length >= 1 && !isOverLimit

  /** Uploads selected media files to the server immediately. */
  const handleMediaChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!incoming.length) return

    const remaining = Math.max(0, 10 - post.mediaItems.length)
    const files = incoming.slice(0, remaining)
    if (!files.length) {
      toast.error('Максимум 10 файлов')
      return
    }

    try {
      await uploadPostMedia({ id: post.id, files }).unwrap()
      toast.success('Медиа загружено')
    } catch {
      toast.error('Не удалось загрузить медиа')
    }
  }

  const removePendingMedia = async (mediaId: string) => {
    try {
      await deletePostMedia({ id: post.id, mediaId }).unwrap()
    } catch {
      toast.error('Не удалось удалить медиа')
    }
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const setup = await getBotSetup()
        if (!mounted) return
        setChannels(setup.channels)
        setChannelId(setup.channels[0]?.id ?? '')
      } finally {
        if (mounted) setIsChannelsLoading(false)
      }
    }
    void load()
    return () => { mounted = false }
  }, [])

  /**
   * Inserts HTML formatting tags around selected textarea text.
   */
  const applyFormat = (action: FormatAction) => {
    const el = textareaRef.current
    if (!el) return

    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = body.slice(start, end)

    let next = body
    let cursor = start

    if (action.wrap) {
      const [open, close] = action.wrap
      const inner = selected || 'текст'
      const replacement = `${open}${inner}${close}`
      next = body.slice(0, start) + replacement + body.slice(end)
      cursor = start + open.length + inner.length + close.length
    } else if (action.line) {
      const lineStart = body.lastIndexOf('\n', start - 1) + 1
      next = body.slice(0, lineStart) + action.line + body.slice(lineStart)
      cursor = start + action.line.length
    }

    setBody(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(cursor, cursor)
    })
  }

  /** Ctrl+B / Ctrl+I / Ctrl+U shortcuts. */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey) return
    const map: Record<string, FormatAction | undefined> = {
      b: FORMAT_ACTIONS[0],
      i: FORMAT_ACTIONS[1],
      u: FORMAT_ACTIONS[2],
    }
    const action = map[e.key]
    if (action) { e.preventDefault(); applyFormat(action) }
  }

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    await new Promise((resolve) => { setTimeout(resolve, 1200) })
    setAiResult(GENERATED_SAMPLE)
    setAiLoading(false)
  }

  const insertAIResult = () => {
    setBody((prev) => (prev ? `${prev}\n\n${aiResult}` : aiResult))
    setAiResult('')
    setShowAI(false)
    setAiPrompt('')
  }

  const handleSave = async () => {
    const bodyValidation = postBodySchema.safeParse({ body })
    if (!bodyValidation.success) {
      toast.error(bodyValidation.error.issues[0]?.message ?? 'Введите текст поста')
      return
    }
    if (!isDirty) return
    try {
      await updatePost({ id: post.id, title: title || undefined, body: bodyValidation.data.body }).unwrap()
      toast.success('Изменения сохранены')
    } catch {
      toast.error('Не удалось сохранить пост')
    }
  }

  const handlePublish = async () => {
    const bodyValidation = postBodySchema.safeParse({ body })
    if (!bodyValidation.success) {
      toast.error(bodyValidation.error.issues[0]?.message ?? 'Введите текст поста')
      return
    }
    try {
      await publishPost({
        id: post.id,
        channelId: channelId || undefined,
      }).unwrap()
      toast.success('Пост опубликован в Telegram')
      navigate('/dashboard/posts')
    } catch (err: unknown) {
      const message =
        err instanceof Object && 'data' in err
          ? ((err as { data?: { message?: string } }).data?.message ?? 'Не удалось опубликовать')
          : 'Не удалось опубликовать'
      toast.error(message)
    }
  }

  const statusConfig = STATUS_CONFIG[post.status]

  return (
    <div className="max-w-5xl">
      {/* ── Page header ── */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="icon-sm">
          <Link to="/dashboard/posts">
            <ArrowLeft size={15} />
          </Link>
        </Button>
        <h1 className="text-base font-semibold text-foreground">
          Редактирование поста
        </h1>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusConfig.className}`}
        >
          {statusConfig.label}
        </span>

        {post.status === 'published' && post.telegramPostUrl ? (
          <a
            href={post.telegramPostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 transition-colors hover:text-emerald-700"
          >
            <ExternalLink size={12} />
            Открыть в Telegram
          </a>
        ) : null}
      </div>

      {/* ── Error banner ── */}
      {post.status === 'failed' && post.errorMessage ? (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{post.errorMessage}</span>
        </div>
      ) : null}

      {/* ── Two-column grid ── */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_280px]">
        {/* LEFT — editor */}
        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="edit-title" className="text-xs font-medium text-muted-foreground">
              Название поста{' '}
              <span className="text-muted-foreground/60">(только внутри приложения)</span>
            </label>
            <Input
              id="edit-title"
              placeholder="Например: Анонс июньской рубрики"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 bg-card text-sm"
            />
          </div>

          {/* Textarea + side toolbar */}
          <div className="flex gap-0 overflow-hidden rounded-xl border border-border bg-card shadow-none">
            <div className="flex min-w-0 flex-1 flex-col">
              <Textarea
                ref={textareaRef}
                id="edit-body"
                placeholder="Начните писать пост..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={handleKeyDown}
                className={cn(
                  'min-h-[340px] resize-none rounded-none border-0 bg-transparent px-5 pt-4 pb-3 text-sm leading-relaxed',
                  'focus-visible:ring-0',
                )}
              />
              <div className="flex items-center justify-between border-t border-border bg-secondary/20 px-5 py-2.5">
                <span className={cn(
                  'tabular-nums text-[11px]',
                  isOverLimit ? 'text-destructive' : 'text-muted-foreground',
                )}>
                  {charCount} / {charLimit} симв. · {wordCount} слов
                </span>
                {body.length > 0 ? (
                  <Button
                    variant="ghost"
                    onClick={() => setBody('')}
                    className="h-auto gap-1 px-1 py-0.5 text-[11px] hover:text-destructive"
                  >
                    <X size={11} /> Очистить
                  </Button>
                ) : null}
              </div>
            </div>

            {/* Vertical format toolbar */}
            <div className="flex w-10 shrink-0 flex-col items-center gap-0.5 border-l border-border bg-secondary/30 py-3">
              {FORMAT_ACTIONS.map(({ icon: Icon, title, ...rest }) => (
                <Button
                  key={title}
                  variant="ghost"
                  size="icon-sm"
                  title={title}
                  onClick={() => applyFormat({ icon: Icon, title, ...rest })}
                >
                  <Icon size={14} />
                </Button>
              ))}

              <div className="my-1.5 h-px w-5 bg-border" />

              <Button
                variant="ghost"
                size="icon-sm"
                title="AI-помощник"
                onClick={() => setShowAI((v) => !v)}
                className={showAI ? 'text-background hover:text-background' : ''}
                style={showAI ? { background: 'oklch(0.420 0.095 200)' } : undefined}
              >
                <Sparkles size={14} />
              </Button>
            </div>
          </div>

          {/* AI panel */}
          {showAI ? (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={13} style={{ color: 'oklch(0.420 0.095 200)' }} />
                  <span className="text-sm font-semibold">AI-помощник</span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {AI_SUGGESTIONS.map((s) => (
                    <Button
                      key={s.label}
                      variant="outline"
                      onClick={() => setAiPrompt(s.prompt)}
                      className="h-auto px-2.5 py-1 text-[11px] font-medium"
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 p-4">
                <Textarea
                  placeholder="Опишите, что нужно сгенерировать или улучшить..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="min-h-[80px] resize-none border-border bg-background text-sm focus-visible:ring-1"
                />
                <div className="flex justify-end">
                  <Button
                    disabled={aiLoading || !aiPrompt.trim()}
                    onClick={() => void handleAIGenerate()}
                    className="gap-2 text-sm font-medium text-background hover:opacity-85"
                    style={{ background: 'oklch(0.420 0.095 200)' }}
                  >
                    {aiLoading
                      ? <RefreshCw size={13} className="animate-spin" />
                      : <Sparkles size={13} />}
                    {aiLoading ? 'Генерируем...' : 'Сгенерировать'}
                  </Button>
                </div>
              </div>

              {aiResult ? (
                <div className="border-t border-border">
                  <div className="flex items-center justify-between bg-secondary/20 px-4 py-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Результат
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Сбросить"
                        onClick={() => setAiResult('')}
                      >
                        <RefreshCw size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Скопировать"
                        onClick={() => void navigator.clipboard.writeText(aiResult)}
                      >
                        <Copy size={12} />
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="ml-1"
                        onClick={insertAIResult}
                      >
                        <Send size={11} />
                        Вставить в пост
                      </Button>
                    </div>
                  </div>
                  <p className="whitespace-pre-line px-4 py-3 text-sm leading-relaxed text-foreground">
                    {aiResult}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* RIGHT — info + actions */}
        <div className="space-y-4">
          {/* Status card */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <span className="text-sm font-semibold">Информация о посте</span>
            </div>
            <div className="space-y-3 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Статус</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig.className}`}
                >
                  {statusConfig.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Создан</span>
                <span className="text-xs text-foreground">{formatDate(post.createdAt)}</span>
              </div>
              {post.publishedAt ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Опубликован</span>
                  <span className="text-xs text-foreground">{formatDate(post.publishedAt)}</span>
                </div>
              ) : null}
              {post.status === 'published' && post.telegramPostUrl ? (
                <Button asChild variant="outline" className="w-full">
                  <a
                    href={post.telegramPostUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink size={12} />
                    Открыть в Telegram
                  </a>
                </Button>
              ) : null}
            </div>
          </div>

          {/* Publish card */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <span className="text-sm font-semibold">Публикация</span>
            </div>
            <div className="space-y-3 p-4">
              {/* Channel selector */}
              {canPublish ? (
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Канал</label>
                  <select
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    disabled={isChannelsLoading || channels.length === 0}
                    className="h-9 w-full cursor-pointer appearance-none rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {isChannelsLoading ? (
                      <option value="">Загрузка каналов...</option>
                    ) : channels.length === 0 ? (
                      <option value="">Нет подключённых каналов</option>
                    ) : (
                      channels.map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          {ch.telegramUsername ?? ch.title ?? ch.telegramChatId}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              ) : null}

              {/* Save */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => void handleSave()}
                disabled={!isDirty || !bodyValid || isSaving}
              >
                {isSaving ? <Loader size="xs" /> : <Save size={14} />}
                Сохранить изменения
              </Button>

              {/* Publish */}
              {canPublish ? (
                <Button
                  variant="primary"
                  className="w-full font-semibold"
                  onClick={() => void handlePublish()}
                  disabled={isPublishing || !bodyValid}
                >
                  {isPublishing ? <Loader size="xs" /> : <Send size={14} />}
                  Опубликовать
                </Button>
              ) : null}

              {/* Published confirmation */}
              {post.status === 'published' ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                  <CheckCircle2 size={13} />
                  Пост уже опубликован
                </div>
              ) : null}
            </div>
          </div>

          {/* Media card */}
          {canEditMedia ? (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="text-sm font-semibold">Медиа</span>
                {post.mediaItems.length > 0 ? (
                  <span className="text-[11px] text-muted-foreground">
                    {post.mediaItems.length} / 10
                  </span>
                ) : null}
              </div>
              <div className="space-y-2 p-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={(event) => void handleMediaChange(event)}
                />

                {post.mediaItems.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1.5">
                    {post.mediaItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="group relative flex aspect-square flex-col items-center justify-center rounded-lg border border-border bg-secondary/40 px-1 text-center text-[10px] font-medium text-muted-foreground"
                      >
                        <span>{item.mediaType === 'video' ? 'VID' : 'IMG'} {index + 1}</span>
                        {item.originalName ? (
                          <span className="mt-1 line-clamp-2 w-full text-[9px] font-normal opacity-70">
                            {item.originalName}
                          </span>
                        ) : null}
                        {item.isPending ? (
                          <button
                            type="button"
                            onClick={() => void removePendingMedia(item.id)}
                            disabled={isDeletingMedia}
                            className="absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X size={10} />
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}

                {post.mediaItems.length < 10 ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingMedia}
                    className="flex h-20 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploadingMedia ? (
                      <Loader size="sm" />
                    ) : (
                      <>
                        <ImagePlus size={18} className="opacity-50" />
                        <span className="text-[11px]">
                          {post.mediaItems.length > 0 ? 'Добавить ещё' : 'Добавить фото/видео'}
                        </span>
                      </>
                    )}
                  </button>
                ) : null}

                <p className="px-0.5 text-[11px] text-muted-foreground">
                  {hasMedia ? 'С медиа: подпись до 1024 симв.' : 'Фото ≤ 10 МБ · Видео ≤ 50 МБ · До 10 файлов'}
                </p>
              </div>
            </div>
          ) : null}

          <p className="text-center text-[11px] text-muted-foreground">
            HTML-теги: <code className="rounded bg-secondary px-1 font-mono text-[10px]">&lt;b&gt;</code>{' '}
            <code className="rounded bg-secondary px-1 font-mono text-[10px]">&lt;i&gt;</code>{' '}
            <code className="rounded bg-secondary px-1 font-mono text-[10px]">&lt;u&gt;</code>{' '}
            <code className="rounded bg-secondary px-1 font-mono text-[10px]">&lt;a href=&quot;url&quot;&gt;</code>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────

/**
 * Loads post by :id URL param, renders PostEditor when ready.
 */
export function EditPostDashboardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: post, isLoading, isError } = useGetPostByIdQuery(id ?? '', {
    skip: !id,
  })

  useEffect(() => {
    if (!id) navigate('/dashboard/posts', { replace: true })
  }, [id, navigate])

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
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
