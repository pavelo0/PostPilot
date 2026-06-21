'use client'

import { useState } from 'react'
import { Sparkles, Copy, RefreshCw, Send, ChevronDown } from 'lucide-react'
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

export default function AIAssistantPage() {
  const [input, setInput] = useState('')
  const [tone, setTone] = useState('Нейтральный')
  const [result, setResult] = useState(generated)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!input.trim()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setResult(generated)
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        {/* Main editor */}
        <div className="space-y-3">
          {/* Tone selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground mr-1">Тон:</span>
            {tones.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                  tone === t
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/40'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Опишите тему поста или вставьте текст для переработки..."
              className="min-h-[120px] resize-none border-0 rounded-none text-sm focus-visible:ring-0 bg-transparent px-5 py-4"
            />
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20">
              <span className="text-xs text-muted-foreground">{input.length} символов</span>
              <button
                onClick={handleGenerate}
                disabled={loading || !input.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-background transition-opacity disabled:opacity-50"
                style={{ background: 'oklch(0.420 0.095 200)' }}
              >
                {loading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                {loading ? 'Генерируем...' : 'Сгенерировать'}
              </button>
            </div>
          </div>

          {/* Output */}
          {result && (
            <div className="border border-border rounded-xl overflow-hidden bg-card">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Результат</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setResult('')}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    title="Сгенерировать ещё раз"
                  >
                    <RefreshCw size={13} />
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(result)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    title="Скопировать"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-background ml-1 transition-opacity hover:opacity-85"
                    style={{ background: 'oklch(0.130 0.010 255)' }}
                    title="Опубликовать"
                  >
                    <Send size={12} />
                    В посты
                  </button>
                </div>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">{result}</p>
              </div>
              <div className="px-5 py-3 border-t border-border bg-secondary/20 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{result.length} символов · ~{Math.ceil(result.split(' ').length / 200)} мин чтения</span>
                <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  Другой вариант <ChevronDown size={11} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Prompt suggestions */}
        <div className="space-y-3">
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <div className="px-4 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold">Шаблоны промптов</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Нажмите, чтобы вставить</p>
            </div>
            <div className="p-2 space-y-1">
              {prompts.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setInput(p.text)}
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm hover:bg-secondary transition-colors"
                >
                  <span className="font-medium text-foreground text-xs block">{p.label}</span>
                  <span className="text-xs text-muted-foreground truncate block mt-0.5">{p.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
