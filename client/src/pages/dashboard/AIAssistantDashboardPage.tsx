import { useState } from 'react'
import { ChevronDown, Copy, RefreshCw, Send, Sparkles } from 'lucide-react'

const tones = ['Нейтральный', 'Экспертный', 'Неформальный', 'Продающий', 'Вдохновляющий']

const prompts = [
  { label: 'Анонс нового поста/рубрики', text: 'Напиши анонс для новой серии постов о...' },
  { label: 'Образовательный пост', text: 'Объясни простыми словами, как...' },
  { label: 'Подборка советов', text: 'Составь список из 5 практических советов о...' },
  { label: 'Личная история / кейс', text: 'Расскажи историю успеха в формате кейса про...' },
  { label: 'Переписать текст', text: 'Перепиши этот текст в более живом стиле: ...' },
  { label: 'Сократить текст', text: 'Сократи этот текст до 3 предложений: ...' },
]

const generated = `Многие думают, что для успешного Telegram-канала нужно публиковать каждый день. Но это миф.

Регулярность важнее частоты. Аудитория ценит предсказуемость: если вы выходите 3 раза в неделю — выходите ровно 3 раза. Каждый раз.

Качество одного сильного поста в неделю всегда лучше семи посредственных. Читатели это чувствуют.

Выберите ритм, который вы можете поддерживать месяцами — и придерживайтесь его.`

export function AIAssistantDashboardPage() {
  const [input, setInput] = useState('')
  const [tone, setTone] = useState('Нейтральный')
  const [result, setResult] = useState(generated)
  const [isLoading, setIsLoading] = useState(false)


  const handleGenerate = async (): Promise<void> => {
    if (!input.trim()) {
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsLoading(false)
    setResult(generated)
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-muted-foreground">Тон:</span>
            {tones.map((toneItem) => (
              <button
                key={toneItem}
                onClick={() => setTone(toneItem)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  tone === toneItem
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                }`}
              >
                {toneItem}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Опишите тему поста или вставьте текст для переработки..."
              className="min-h-[120px] w-full resize-none border-0 bg-transparent px-5 py-4 text-sm outline-none"
            />
            <div className="flex items-center justify-between border-t border-border bg-secondary/20 px-4 py-3">
              <span className="text-xs text-muted-foreground">{input.length} символов</span>
              <button
                onClick={handleGenerate}
                disabled={isLoading || !input.trim()}
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-background transition-opacity disabled:opacity-50"
                style={{ background: 'oklch(0.420 0.095 200)' }}
              >
                {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {isLoading ? 'Генерируем...' : 'Сгенерировать'}
              </button>
            </div>
          </div>

          {result ? (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Результат
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setResult('')}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    title="Сгенерировать ещё раз"
                  >
                    <RefreshCw size={13} />
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(result)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    title="Скопировать"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    className="ml-1 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-85"
                    style={{ background: 'oklch(0.130 0.010 255)' }}
                    title="Отправить в посты"
                  >
                    <Send size={12} />
                    В посты
                  </button>
                </div>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">{result}</p>
              </div>
              <div className="flex items-center justify-between border-t border-border bg-secondary/20 px-5 py-3">
                <span className="text-xs text-muted-foreground">
                  {result.length} символов · ~{Math.ceil(result.split(' ').length / 200)} мин чтения
                </span>
                <button className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
                  Другой вариант <ChevronDown size={11} />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-4 py-3.5">
              <h3 className="text-sm font-semibold">Шаблоны промптов</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Нажмите, чтобы вставить</p>
            </div>
            <div className="space-y-1 p-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => setInput(prompt.text)}
                  className="w-full rounded-md px-3 py-2.5 text-left transition-colors hover:bg-secondary"
                >
                  <span className="block text-xs font-medium text-foreground">{prompt.label}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {prompt.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
