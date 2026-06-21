'use client'

import { useState } from 'react'
import { Plus, Radio, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Trash2 } from 'lucide-react'

const channels = [
  {
    id: 1,
    name: '@techchannel',
    title: 'Tech Insights RU',
    subscribers: 12480,
    status: 'active',
    botStatus: 'connected',
    lastPost: '20 июн 2025',
    postsMonth: 14,
  },
  {
    id: 2,
    name: '@startupnews_ru',
    title: 'Стартап Новости',
    subscribers: 3820,
    status: 'active',
    botStatus: 'connected',
    lastPost: '19 июн 2025',
    postsMonth: 8,
  },
  {
    id: 3,
    name: '@designhub',
    title: 'Design Hub',
    subscribers: 7100,
    status: 'error',
    botStatus: 'disconnected',
    lastPost: '10 июн 2025',
    postsMonth: 2,
  },
]

export default function ChannelsPage() {
  const [adding, setAdding] = useState(false)

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Add channel CTA */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{channels.length} канала подключено</p>
        <button
          onClick={() => setAdding(!adding)}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-background transition-opacity hover:opacity-85"
          style={{ background: 'oklch(0.130 0.010 255)' }}
        >
          <Plus size={14} />
          Добавить канал
        </button>
      </div>

      {/* Add channel panel */}
      {adding && (
        <div className="border border-border rounded-xl p-5 bg-card space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-1">Подключить Telegram-канал</h3>
            <p className="text-xs text-muted-foreground">Добавьте бота @PostPilotBot в администраторы вашего канала с правом публикации.</p>
          </div>
          <ol className="space-y-2 text-sm text-muted-foreground">
            {[
              'Откройте настройки вашего Telegram-канала',
              'Перейдите в раздел «Администраторы»',
              'Добавьте @PostPilotBot с правом публикации сообщений',
              'Введите имя канала ниже и нажмите «Подключить»',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-xs shrink-0 mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="@channel_name"
              className="flex-1 h-9 px-3 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1"
              style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
            />
            <button
              className="h-9 px-4 rounded-md text-sm font-medium text-background transition-opacity hover:opacity-85"
              style={{ background: 'oklch(0.420 0.095 200)' }}
            >
              Подключить
            </button>
            <button onClick={() => setAdding(false)} className="h-9 px-4 rounded-md text-sm border border-border hover:bg-secondary transition-colors">
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Channels list */}
      <div className="space-y-3">
        {channels.map((ch) => (
          <div key={ch.id} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Radio size={16} className="text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{ch.title}</h3>
                    <span className="text-xs text-muted-foreground">{ch.name}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${ch.botStatus === 'connected' ? '' : 'text-destructive'}`}
                      style={ch.botStatus === 'connected' ? { color: 'oklch(0.420 0.095 200)' } : undefined}>
                      {ch.botStatus === 'connected'
                        ? <><CheckCircle2 size={11} /> Бот активен</>
                        : <><AlertCircle size={11} /> Бот отключён</>}
                    </div>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{ch.subscribers.toLocaleString('ru')} подписчиков</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Обновить">
                  <RefreshCw size={14} />
                </button>
                <button className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Открыть">
                  <ExternalLink size={14} />
                </button>
                <button className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors" title="Удалить">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4">
              {[
                { label: 'Публикаций в месяц', value: ch.postsMonth },
                { label: 'Последний пост', value: ch.lastPost },
                { label: 'Статус', value: ch.status === 'active' ? 'Активен' : 'Ошибка' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {ch.botStatus === 'disconnected' && (
              <div className="mt-3 flex items-start gap-2.5 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <AlertCircle size={14} className="text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-destructive">Бот не может публиковать посты</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Убедитесь, что @PostPilotBot является администратором канала с правом публикации.</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
