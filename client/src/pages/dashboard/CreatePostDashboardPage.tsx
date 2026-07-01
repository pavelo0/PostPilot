import { useEffect, useRef, useState, type ChangeEvent, type ElementType } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import { Textarea } from '@/components/ui/textarea'
import { useCreatePostMutation, usePublishPostMutation, useUploadPostMediaMutation } from '@/store/api/posts-api'
import { getBotSetup, type BotChannelStatus } from '@/utils/bot/bot.api'
import { postBodySchema } from '@/utils/posts/post.schema'
import { cn } from '@/lib/utils'
import {
  Bold,
  CalendarDays,
  ChevronDown,
  Code,
  Copy,
  Eye,
  ImagePlus,
  Italic,
  Link2,
  List,
  Quote,
  RefreshCw,
  Send,
  Settings,
  Sparkles,
  Strikethrough,
  Underline,
  X,
} from 'lucide-react'

const aiSuggestions = [
  {
    label: 'Написать вступление',
    prompt: 'Напиши цепляющее вступление для поста о...',
  },
  { label: 'Дополнить текст', prompt: 'Разверни эту мысль подробнее: ...' },
  { label: 'Сократить', prompt: 'Сократи текст, сохранив смысл: ...' },
  {
    label: 'Другой стиль',
    prompt: 'Перепиши в более живом, неформальном стиле: ...',
  },
]

const generatedSample = `Многие думают, что для успешного Telegram-канала нужно публиковать каждый день. Но это миф.

Регулярность важнее частоты. Аудитория ценит предсказуемость: если вы выходите 3 раза в неделю — выходите ровно 3 раза. Каждый раз.

Качество одного сильного поста в неделю всегда лучше семи посредственных. Читатели это чувствуют.`

type FormatAction = {
  icon: ElementType
  title: string
  wrap?: [string, string]
  line?: string
}

const formatActions: FormatAction[] = [
  { icon: Bold, title: 'Жирный <b>', wrap: ['<b>', '</b>'] },
  { icon: Italic, title: 'Курсив <i>', wrap: ['<i>', '</i>'] },
  { icon: Underline, title: 'Подчёркнутый <u>', wrap: ['<u>', '</u>'] },
  { icon: Strikethrough, title: 'Зачёркнутый <s>', wrap: ['<s>', '</s>'] },
  { icon: Code, title: 'Код <code>', wrap: ['<code>', '</code>'] },
  { icon: List, title: 'Маркированный список', line: '• ' },
  { icon: Link2, title: 'Ссылка <a>', wrap: ['<a href="url">', '</a>'] },
  { icon: Quote, title: 'Цитата <blockquote>', wrap: ['<blockquote>', '</blockquote>'] },
]

/**
 * Extracts readable error message from RTK Query mutation errors.
 */
function getMutationErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    typeof (error as { data?: { message?: unknown } }).data?.message ===
      'string'
  ) {
    return (error as { data: { message: string } }).data.message
  }

  return fallback
}

/**
 * Dashboard page for creating a post draft.
 */
export function CreatePostDashboardPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [channels, setChannels] = useState<BotChannelStatus[]>([])
  const [channel, setChannel] = useState('')
  const [isChannelsLoading, setIsChannelsLoading] = useState(true)
  const [channelsError, setChannelsError] = useState<string | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>(
    'schedule',
  )
  const [showAI, setShowAI] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation()
  const [publishPost, { isLoading: isPublishing }] = usePublishPostMutation()
  const [uploadPostMedia, { isLoading: isUploadingMedia }] = useUploadPostMediaMutation()

  useEffect(() => {
    let isMounted = true

    const loadChannels = async () => {
      setIsChannelsLoading(true)
      setChannelsError(null)

      try {
        const setup = await getBotSetup()
        if (!isMounted) {
          return
        }
        setChannels(setup.channels)
        setChannel((currentChannel) => currentChannel || setup.channels[0]?.telegramChatId || '')
      } catch {
        if (!isMounted) {
          return
        }
        setChannelsError('Не удалось загрузить каналы')
      } finally {
        if (isMounted) {
          setIsChannelsLoading(false)
        }
      }
    }

    void loadChannels()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const dateParam = searchParams.get('date')
    const timeParam = searchParams.get('time')
    const modeParam = searchParams.get('mode')

    if (dateParam) {
      setScheduleDate(dateParam)
    }
    if (timeParam) {
      setScheduleTime(timeParam)
    }
    if (modeParam === 'schedule') {
      setPublishMode('schedule')
    }
  }, [searchParams])

  /**
   * Applies markdown-like formatting to selected text.
   */
  const applyFormat = (action: FormatAction) => {
    const el = textareaRef.current
    if (!el) {
      return
    }

    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = body.slice(start, end)

    let next = body
    let cursor = start

    if (action.wrap) {
      const [open, close] = action.wrap
      const replacement = `${open}${selected || 'текст'}${close}`
      next = body.slice(0, start) + replacement + body.slice(end)
      cursor = start + open.length + (selected || 'текст').length + close.length
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

  /**
   * Generates a mocked AI completion for draft editing.
   */
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      return
    }
    setAiLoading(true)
    await new Promise((resolve) => {
      setTimeout(resolve, 1200)
    })
    setAiResult(generatedSample)
    setAiLoading(false)
  }

  /**
   * Inserts generated AI text into the draft body.
   */
  const insertAIResult = () => {
    setBody((currentBody) => (currentBody ? `${currentBody}\n\n${aiResult}` : aiResult))
    setAiResult('')
    setShowAI(false)
    setAiPrompt('')
  }

  /**
   * Adds selected files to the media list (max 10, photos + videos).
   */
  const handleMediaChange = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files ?? [])
    if (!incoming.length) return
    setMediaFiles((prev) => {
      const combined = [...prev, ...incoming]
      return combined.slice(0, 10)
    })
    event.target.value = ''
  }

  /** Removes a single media file by index. */
  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index))
  }

  /**
   * Creates draft or publishes post depending on selected mode.
   */
  const handleCreate = async () => {
    const bodyValidation = postBodySchema.safeParse({ body })
    if (!bodyValidation.success) {
      toast.error(bodyValidation.error.issues[0]?.message ?? 'Введите текст поста')
      return
    }

    const selectedChannel = channels.find(
      (channelItem) => channelItem.telegramChatId === channel,
    )

    if (publishMode === 'now' && !selectedChannel) {
      toast.error('Выберите канал для публикации')
      return
    }

    if (publishMode === 'schedule') {
      if (!selectedChannel) {
        toast.error('Выберите канал для планирования')
        return
      }
      if (!scheduleDate) {
        toast.error('Выберите дату публикации')
        return
      }
      if (!scheduleTime) {
        toast.error('Выберите время публикации')
        return
      }
    }

    try {
      if (publishMode === 'schedule') {
        const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
        const post = await createPost({
          title: name.trim() ? name.trim() : undefined,
          body: bodyValidation.data.body,
          scheduledAt,
          channelId: selectedChannel!.id,
        }).unwrap()

        if (mediaFiles.length > 0) {
          await uploadPostMedia({ id: post.id, files: mediaFiles }).unwrap()
        }

        toast.success('Пост запланирован')
        navigate(`/dashboard/calendar?date=${scheduleDate}`)
        return
      }

      const post = await createPost({
        title: name.trim() ? name.trim() : undefined,
        body: bodyValidation.data.body,
      }).unwrap()

      if (publishMode === 'now') {
        await publishPost({
          id: post.id,
          channelId: selectedChannel?.id,
          files: mediaFiles.length > 0 ? mediaFiles : undefined,
        }).unwrap()
        toast.success('Пост опубликован в Telegram')
      } else {
        if (mediaFiles.length > 0) {
          await uploadPostMedia({ id: post.id, files: mediaFiles }).unwrap()
        }
        toast.success('Черновик сохранён')
      }

      navigate('/dashboard/posts')
    } catch (error) {
      toast.error(
        getMutationErrorMessage(
          error,
          publishMode === 'now'
            ? 'Не удалось опубликовать пост. Проверьте бота и права в канале.'
            : 'Не удалось создать пост. Попробуйте еще раз.',
        ),
      )
    }
  }

  const isSubmitting = isCreating || isPublishing || isUploadingMedia

  const hasMedia = mediaFiles.length > 0
  const charLimit = hasMedia ? 1024 : 4096
  const charCount = body.length
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0
  const isOverLimit = charCount > charLimit

  return (
    <div className="max-w-5xl">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="post-name"
              className="text-xs font-medium text-muted-foreground"
            >
              Название поста{' '}
              <span className="text-muted-foreground/60">
                (только внутри приложения)
              </span>
            </label>
            <Input
              id="post-name"
              placeholder="Например: Анонс июньской рубрики"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-9 bg-card text-sm"
            />
          </div>

          <div className="flex gap-0 overflow-hidden rounded-xl border border-border bg-card shadow-none">
            <div className="flex min-w-0 flex-1 flex-col">
              <Textarea
                ref={textareaRef}
                id="post-body"
                placeholder="Начните писать пост..."
                value={body}
                onChange={(event) => setBody(event.target.value)}
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

            <div className="flex w-10 shrink-0 flex-col items-center gap-0.5 border-l border-border bg-secondary/30 py-3">
              {formatActions.map(({ icon: Icon, title, ...action }) => (
                <Button
                  key={title}
                  variant="ghost"
                  size="icon-sm"
                  title={title}
                  onClick={() => applyFormat({ icon: Icon, title, ...action })}
                >
                  <Icon size={14} />
                </Button>
              ))}

              <div className="my-1.5 h-px w-5 bg-border" />

              <Button
                variant="ghost"
                size="icon-sm"
                title="AI-помощник"
                onClick={() => setShowAI((value) => !value)}
                className={showAI ? 'text-background hover:text-background' : ''}
                style={showAI ? { background: 'oklch(0.420 0.095 200)' } : undefined}
              >
                <Sparkles size={14} />
              </Button>
            </div>
          </div>

          {showAI ? (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={13} style={{ color: 'oklch(0.420 0.095 200)' }} />
                  <span className="text-sm font-semibold">AI-помощник</span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {aiSuggestions.map((suggestion) => (
                    <Button
                      key={suggestion.label}
                      variant="outline"
                      onClick={() => setAiPrompt(suggestion.prompt)}
                      className="h-auto px-2.5 py-1 text-[11px] font-medium"
                    >
                      {suggestion.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 p-4">
                <Textarea
                  placeholder="Опишите, что нужно сгенерировать или улучшить..."
                  value={aiPrompt}
                  onChange={(event) => setAiPrompt(event.target.value)}
                  className="min-h-[80px] resize-none border-border bg-background text-sm focus-visible:ring-1"
                />
                <div className="flex justify-end">
                  <Button
                    disabled={aiLoading || !aiPrompt.trim()}
                    onClick={() => void handleAIGenerate()}
                    className="gap-2 text-sm font-medium text-background hover:opacity-85"
                    style={{ background: 'oklch(0.420 0.095 200)' }}
                  >
                    {aiLoading ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <Sparkles size={13} />
                    )}
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

        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-semibold">Медиа</span>
              {mediaFiles.length > 0 ? (
                <span className="text-[11px] text-muted-foreground">
                  {mediaFiles.length} / 10
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
                onChange={handleMediaChange}
              />

              {mediaFiles.length > 0 ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {mediaFiles.map((file, index) => {
                    const url = URL.createObjectURL(file)
                    const isVideo = file.type.startsWith('video/')
                    return (
                      <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary/30">
                        {isVideo ? (
                          <video
                            src={url}
                            className="h-full w-full object-cover"
                            muted
                          />
                        ) : (
                          <img src={url} alt="" className="h-full w-full object-cover" />
                        )}
                        {isVideo ? (
                          <div className="pointer-events-none absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[9px] text-white">
                            VID
                          </div>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )
                  })}
                  {mediaFiles.length < 10 ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
                      <ImagePlus size={18} className="opacity-50" />
                    </button>
                  ) : null}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  <ImagePlus size={20} className="opacity-50" />
                  <span className="text-xs">Фото или видео (до 10 файлов)</span>
                </button>
              )}

              <p className="px-0.5 text-[11px] text-muted-foreground">
                Фото ≤ 10 МБ · Видео ≤ 50 МБ · Альбом до 10 файлов
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <span className="text-sm font-semibold">Публикация</span>
            </div>
            <div className="space-y-4 p-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Канал</label>
                <div className="relative">
                  <select
                    value={channel}
                    onChange={(event) => setChannel(event.target.value)}
                    disabled={isChannelsLoading || channels.length === 0}
                    className="h-9 w-full cursor-pointer appearance-none rounded-md border border-border bg-background pl-3 pr-8 text-sm focus:ring-1 focus:ring-ring focus:outline-none"
                  >
                    {isChannelsLoading ? (
                      <option value="">Загрузка каналов...</option>
                    ) : channels.length === 0 ? (
                      <option value="">Нет подключенных каналов</option>
                    ) : (
                      channels.map((channelItem) => (
                        <option key={channelItem.id} value={channelItem.telegramChatId}>
                          {channelItem.telegramUsername ||
                            channelItem.title ||
                            channelItem.telegramChatId}
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
                {channelsError ? (
                  <p className="text-xs text-destructive">{channelsError}</p>
                ) : null}
                {!isChannelsLoading && channels.length === 0 ? (
                  <EmptyState
                    icon={Settings}
                    title="Нет подключённых каналов"
                    description="Подключите Telegram-канал в настройках, чтобы публиковать посты."
                    className="py-8"
                    action={
                      <Button asChild variant="outline" size="sm">
                        <Link to="/dashboard/settings">Перейти в настройки</Link>
                      </Button>
                    }
                  />
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Когда публиковать</label>
                <div className="flex overflow-hidden rounded-md border border-border">
                  {(['now', 'schedule'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPublishMode(mode)}
                      className={cn(
                        'flex-1 cursor-pointer py-2 text-xs font-medium transition-colors',
                        publishMode === mode
                          ? 'bg-foreground text-background'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                      )}
                    >
                      {mode === 'now' ? 'Сейчас' : 'По расписанию'}
                    </button>
                  ))}
                </div>
              </div>

              {publishMode === 'schedule' ? (
                <div className="space-y-2">
                  <div className="space-y-1.5">
                    <label htmlFor="sched-date" className="text-xs text-muted-foreground">
                      <CalendarDays size={11} className="mr-1 inline" />
                      Дата
                    </label>
                    <Input
                      id="sched-date"
                      type="date"
                      value={scheduleDate}
                      onChange={(event) => setScheduleDate(event.target.value)}
                      className="h-9 bg-background text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="sched-time" className="text-xs text-muted-foreground">
                      Время
                    </label>
                    <Input
                      id="sched-time"
                      type="time"
                      value={scheduleTime}
                      onChange={(event) => setScheduleTime(event.target.value)}
                      className="h-9 bg-background text-sm"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Button
              variant="primary"
              className="w-full font-semibold"
              disabled={isSubmitting || !body.trim() || isOverLimit}
              onClick={() => void handleCreate()}
            >
              {isSubmitting ? (
                <Loader size="xs" />
              ) : (
                <Send size={14} />
              )}
              {isSubmitting
                ? publishMode === 'now'
                  ? 'Публикуем...'
                  : 'Создаём...'
                : publishMode === 'now'
                  ? 'Опубликовать'
                  : 'Запланировать'}
            </Button>

            <Button variant="outline" className="w-full">
              <Eye size={14} />
              Предпросмотр
            </Button>

            <Button
              variant="ghost"
              className="h-9 w-full text-xs"
              onClick={() => navigate(-1)}
            >
              Отмена
            </Button>
          </div>

          <p className="text-center text-[11px] text-muted-foreground">
            {hasMedia
              ? 'С медиа: подпись до 1024 симв.'
              : 'Текст: до 4096 симв. С медиа — до 1024.'}
          </p>
        </div>
      </div>
    </div>
  )
}
