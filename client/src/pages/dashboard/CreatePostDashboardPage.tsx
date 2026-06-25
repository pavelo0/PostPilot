import { useRef, useState, type ChangeEvent, type ElementType } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  Bold,
  CalendarDays,
  ChevronDown,
  Copy,
  Eye,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  RefreshCw,
  Send,
  Sparkles,
  Underline,
  X,
} from 'lucide-react'

const channels = ['@myawesomechannel', '@techdigest_ru', '@startupnews']

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
  { icon: Bold, title: 'Жирный', wrap: ['**', '**'] },
  { icon: Italic, title: 'Курсив', wrap: ['_', '_'] },
  { icon: Underline, title: 'Подчеркнутый', wrap: ['<u>', '</u>'] },
  { icon: List, title: 'Маркированный список', line: '• ' },
  { icon: ListOrdered, title: 'Нумерованный список', line: '1. ' },
  { icon: Link2, title: 'Ссылка', wrap: ['[', '](url)'] },
  { icon: Quote, title: 'Цитата', line: '> ' },
]

/**
 * Dashboard page for creating a post draft.
 */
export function CreatePostDashboardPage() {
  const navigate = useNavigate()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [channel, setChannel] = useState(channels[0])
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>(
    'schedule',
  )
  const [showAI, setShowAI] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [loading, setLoading] = useState(false)

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
   * Stores a local preview URL for uploaded image.
   */
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    const fileUrl = URL.createObjectURL(file)
    setImage(fileUrl)
  }

  /**
   * Mock submit handler for create post action.
   */
  const handleCreate = async () => {
    if (!body.trim()) {
      return
    }
    setLoading(true)
    await new Promise((resolve) => {
      setTimeout(resolve, 800)
    })
    setLoading(false)
    navigate('/dashboard/posts')
  }

  const charCount = body.length
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0

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
                <span className="tabular-nums text-[11px] text-muted-foreground">
                  {charCount} симв. · {wordCount} слов
                </span>
                {body.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setBody('')}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <X size={11} /> Очистить
                  </button>
                ) : null}
              </div>
            </div>

            <div className="flex w-10 shrink-0 flex-col items-center gap-0.5 border-l border-border bg-secondary/30 py-3">
              {formatActions.map(({ icon: Icon, title, ...action }) => (
                <button
                  key={title}
                  type="button"
                  title={title}
                  onClick={() => applyFormat({ icon: Icon, title, ...action })}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Icon size={14} />
                </button>
              ))}

              <div className="my-1.5 h-px w-5 bg-border" />

              <button
                type="button"
                title="AI-помощник"
                onClick={() => setShowAI((value) => !value)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                  showAI
                    ? 'text-background'
                    : 'text-muted-foreground hover:text-background',
                )}
                style={{
                  background: showAI ? 'oklch(0.420 0.095 200)' : undefined,
                }}
              >
                <Sparkles size={14} />
              </button>
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
                    <button
                      key={suggestion.label}
                      type="button"
                      onClick={() => setAiPrompt(suggestion.prompt)}
                      className="rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
                      {suggestion.label}
                    </button>
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
                  <button
                    type="button"
                    onClick={handleAIGenerate}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
                    style={{ background: 'oklch(0.420 0.095 200)' }}
                  >
                    {aiLoading ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <Sparkles size={13} />
                    )}
                    {aiLoading ? 'Генерируем...' : 'Сгенерировать'}
                  </button>
                </div>
              </div>

              {aiResult ? (
                <div className="border-t border-border">
                  <div className="flex items-center justify-between bg-secondary/20 px-4 py-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Результат
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setAiResult('')}
                        title="Сбросить"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <RefreshCw size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(aiResult)}
                        title="Скопировать"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={insertAIResult}
                        className="ml-1 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-85"
                        style={{ background: 'oklch(0.130 0.010 255)' }}
                      >
                        <Send size={11} />
                        Вставить в пост
                      </button>
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
            <div className="border-b border-border px-4 py-3">
              <span className="text-sm font-semibold">Изображение</span>
            </div>
            <div className="space-y-2 p-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {image ? (
                <div className="relative overflow-hidden rounded-lg border border-border">
                  <img src={image} alt="Обложка" className="h-32 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  <ImagePlus size={20} className="opacity-50" />
                  <span className="text-xs">Нажмите для загрузки</span>
                </button>
              )}
              <p className="px-0.5 text-[11px] text-muted-foreground">
                JPG, PNG, WebP · макс. 2 МБ · рекомендовано 1280×640
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
                    className="h-9 w-full cursor-pointer appearance-none rounded-md border border-border bg-background pl-3 pr-8 text-sm focus:ring-1 focus:ring-ring focus:outline-none"
                  >
                    {channels.map((channelName) => (
                      <option key={channelName} value={channelName}>
                        {channelName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
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
                        'flex-1 py-2 text-xs font-medium transition-colors',
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
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading || !body.trim()}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:opacity-50"
              style={{ background: 'oklch(0.130 0.010 255)' }}
            >
              {loading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {loading
                ? 'Создаём...'
                : publishMode === 'now'
                  ? 'Опубликовать'
                  : 'Запланировать'}
            </button>

            <button
              type="button"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Eye size={14} />
              Предпросмотр
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-9 w-full rounded-md text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Отмена
            </button>
          </div>

          <p className="text-center text-[11px] text-muted-foreground">
            Telegram: рекомендуемый размер поста до 4096 символов
          </p>
        </div>
      </div>
    </div>
  )
}
