import { useState } from 'react'
import { ChevronDown, Copy, RefreshCw, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

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
    <div className="w-full space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-muted-foreground">Тон:</span>
            {tones.map((toneItem) => (
              <Button
                key={toneItem}
                type="button"
                onClick={() => setTone(toneItem)}
                variant="ghost"
                size="sm"
                className={`h-auto border px-3 py-1.5 text-xs font-medium ${
                  tone === toneItem
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                }`}
              >
                {toneItem}
              </Button>
            ))}
          </div>

          <Card className="overflow-hidden">
            <Textarea
              variant="embedded"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Опишите тему поста или вставьте текст для переработки..."
              className="min-h-[120px] resize-none bg-transparent px-5 py-4 text-sm"
            />
            <div className="flex items-center justify-between border-t border-border bg-secondary/20 px-4 py-3">
              <span className="text-xs text-muted-foreground">{input.length} символов</span>
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading || !input.trim()}
                variant="primary"
                size="sm"
                className="h-auto px-4 py-2 text-background transition-opacity disabled:opacity-50"
                style={{ background: 'oklch(0.420 0.095 200)' }}
              >
                {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {isLoading ? 'Генерируем...' : 'Сгенерировать'}
              </Button>
            </div>
          </Card>

          {result ? (
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Результат
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    onClick={() => setResult('')}
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    title="Сгенерировать ещё раз"
                  >
                    <RefreshCw size={13} />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(result)}
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    title="Скопировать"
                  >
                    <Copy size={13} />
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="ml-1 h-auto px-3 py-1.5 text-xs text-background transition-opacity hover:opacity-85"
                    style={{ background: 'oklch(0.130 0.010 255)' }}
                    title="Отправить в посты"
                  >
                    <Send size={12} />
                    В посты
                  </Button>
                </div>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">{result}</p>
              </div>
              <div className="flex items-center justify-between border-t border-border bg-secondary/20 px-5 py-3">
                <span className="text-xs text-muted-foreground">
                  {result.length} символов · ~{Math.ceil(result.split(' ').length / 200)} мин чтения
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto px-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Другой вариант <ChevronDown size={11} />
                </Button>
              </div>
            </Card>
          ) : null}
        </div>

        <div className="space-y-3">
          <Card className="overflow-hidden">
            <div className="border-b border-border px-4 py-3.5">
              <h3 className="text-sm font-semibold">Шаблоны промптов</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Нажмите, чтобы вставить</p>
            </div>
            <div className="space-y-1 p-2">
              {prompts.map((prompt) => (
                <Button
                  key={prompt.label}
                  type="button"
                  onClick={() => setInput(prompt.text)}
                  variant="ghost"
                  size="sm"
                  className="h-auto w-full flex-col items-start justify-start gap-0 px-3 py-2.5 text-left hover:bg-secondary"
                >
                  <span className="block text-xs font-medium text-foreground">{prompt.label}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {prompt.text}
                  </span>
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
