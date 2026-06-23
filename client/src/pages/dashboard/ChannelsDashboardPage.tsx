import { useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Plus,
  Radio,
  RefreshCw,
  Trash2,
} from 'lucide-react'

type Channel = {
  id: number
  name: string
  title: string
  subscribers: number
  status: 'active' | 'error'
  botStatus: 'connected' | 'disconnected'
  lastPost: string
  postsMonth: number
}

const channels: Channel[] = [
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

export function ChannelsDashboardPage() {
  const [isAdding, setIsAdding] = useState(false)

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{channels.length} канала подключено</p>
        <button
          onClick={() => setIsAdding((value) => !value)}
          className="inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium text-background transition-opacity hover:opacity-85"
          style={{ background: 'oklch(0.130 0.010 255)' }}
        >
          <Plus size={14} />
          Добавить канал
        </button>
      </div>

      {isAdding ? (
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div>
            <h3 className="mb-1 text-sm font-semibold">Подключить Telegram-канал</h3>
            <p className="text-xs text-muted-foreground">
              Добавьте бота @PostPilotBot в администраторы вашего канала с правом публикации.
            </p>
          </div>

          <ol className="space-y-2 text-sm text-muted-foreground">
            {[
              'Откройте настройки вашего Telegram-канала',
              'Перейдите в раздел «Администраторы»',
              'Добавьте @PostPilotBot с правом публикации сообщений',
              'Введите имя канала ниже и нажмите «Подключить»',
            ].map((step, index) => (
              <li key={step} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-xs">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="@channel_name"
              className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-1"
              style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
            />
            <button
              className="h-9 rounded-md px-4 text-sm font-medium text-background transition-opacity hover:opacity-85"
              style={{ background: 'oklch(0.420 0.095 200)' }}
            >
              Подключить
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="h-9 rounded-md border border-border px-4 text-sm transition-colors hover:bg-secondary"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {channels.map((channel) => (
          <div key={channel.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Radio size={16} className="text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{channel.title}</h3>
                    <span className="text-xs text-muted-foreground">{channel.name}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    <div
                      className={`flex items-center gap-1.5 text-xs font-medium ${
                        channel.botStatus === 'connected' ? '' : 'text-destructive'
                      }`}
                      style={
                        channel.botStatus === 'connected'
                          ? { color: 'oklch(0.420 0.095 200)' }
                          : undefined
                      }
                    >
                      {channel.botStatus === 'connected' ? (
                        <>
                          <CheckCircle2 size={11} /> Бот активен
                        </>
                      ) : (
                        <>
                          <AlertCircle size={11} /> Бот отключён
                        </>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {channel.subscribers.toLocaleString('ru')} подписчиков
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <RefreshCw size={14} />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <ExternalLink size={14} />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
              {[
                { label: 'Публикаций в месяц', value: channel.postsMonth },
                { label: 'Последний пост', value: channel.lastPost },
                { label: 'Статус', value: channel.status === 'active' ? 'Активен' : 'Ошибка' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-0.5 text-sm font-medium">{value}</p>
                </div>
              ))}
            </div>

            {channel.botStatus === 'disconnected' ? (
              <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <AlertCircle size={14} className="mt-0.5 shrink-0 text-destructive" />
                <div>
                  <p className="text-xs font-medium text-destructive">
                    Бот не может публиковать посты
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Убедитесь, что @PostPilotBot является администратором канала с правом
                    публикации.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
