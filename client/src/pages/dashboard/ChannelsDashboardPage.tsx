import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  Radio,
  RefreshCw,
} from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import { Skeleton } from '@/components/ui/skeleton'
import { ApiError } from '@/utils/auth/auth.api'
import { connectChannelSchema } from '@/utils/channel/channel.schema'
import {
  connectChannel,
  getBotSetup,
  type BotSetup,
  type ChannelBotAdminStatus,
} from '@/utils/bot/bot.api'

const channelStatusConfig: Record<
  ChannelBotAdminStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  admin: {
    label: 'Бот активен',
    className: 'text-[oklch(0.420_0.095_200)]',
    icon: CheckCircle2,
  },
  not_admin: {
    label: 'Бот без прав администратора',
    className: 'text-destructive',
    icon: AlertCircle,
  },
  unknown: {
    label: 'Статус не проверен',
    className: 'text-muted-foreground',
    icon: AlertCircle,
  },
  check_failed: {
    label: 'Не удалось проверить',
    className: 'text-destructive',
    icon: AlertCircle,
  },
}

/**
 * Resolves user-facing message from unknown API errors.
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Не удалось выполнить запрос'
}

const connectChannelFriendlyError =
  'Ошибка при попытке подключения. Убедитесь, что бот привязан к каналу и имеет права администратора.'

export function ChannelsDashboardPage() {
  const [isAdding, setIsAdding] = useState(false)
  const [setup, setSetup] = useState<BotSetup | null>(null)
  const [channelInput, setChannelInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const channels = useMemo(() => setup?.channels ?? [], [setup])

  useEffect(() => {
    let cancelled = false

    const loadSetup = async (): Promise<void> => {
      setIsLoading(true)
      setError(null)
      try {
        const nextSetup = await getBotSetup()
        if (!cancelled) {
          setSetup(nextSetup)
        }
      } catch (loadError: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(loadError))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadSetup()

    return () => {
      cancelled = true
    }
  }, [])

  /**
   * Refreshes bot setup and channel admin statuses.
   */
  const handleRefresh = async (): Promise<void> => {
    setIsRefreshing(true)
    setError(null)
    try {
      const nextSetup = await getBotSetup()
      setSetup(nextSetup)
      toast.success('Список каналов обновлён')
    } catch (refreshError: unknown) {
      const message = getErrorMessage(refreshError)
      setError(message)
      toast.error(message)
    } finally {
      setIsRefreshing(false)
    }
  }

  /**
   * Connects channel reference to current user bot.
   */
  const handleConnectChannel = async (): Promise<void> => {
    const validation = connectChannelSchema.safeParse({
      channelReference: channelInput,
    })
    if (!validation.success) {
      const message = validation.error.issues[0]?.message ?? 'Некорректные данные канала'
      setError(message)
      toast.error(message)
      return
    }

    setIsConnecting(true)
    setError(null)
    try {
      await connectChannel(validation.data.channelReference)
      const nextSetup = await getBotSetup()
      setSetup(nextSetup)
      setChannelInput('')
      setIsAdding(false)
      toast.success('Канал подключён')
    } catch (connectError: unknown) {
      if (connectError instanceof ApiError && connectError.status === 403) {
        setError(connectError.message)
        toast.error(connectError.message)
      } else {
        setError(connectChannelFriendlyError)
        toast.error(connectChannelFriendlyError)
      }
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{channels.length} канала подключено</p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => {
              void handleRefresh()
            }}
            variant="outline"
            size="sm"
            className="h-9 px-4"
            disabled={isRefreshing}
          >
            {isRefreshing ? <Loader size="xs" /> : <RefreshCw size={14} />}
            {isRefreshing ? 'Обновляем...' : 'Обновить'}
          </Button>
          <Button
            onClick={() => setIsAdding((value) => !value)}
            variant="primary"
            size="sm"
            className="h-9 px-4"
          >
            <Plus size={14} />
            Добавить канал
          </Button>
        </div>
      </div>

      {isAdding ? (
        <Card className="space-y-4 p-5">
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
              'Добавьте вашего бота с правом публикации сообщений',
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
            <Input
              type="text"
              placeholder="@channel_name"
              value={channelInput}
              onChange={(event) => setChannelInput(event.target.value)}
              className="h-9 flex-1 rounded-md px-3 text-sm focus-visible:ring-1"
              style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
            />
            <Button
              variant="primary"
              size="sm"
              className="h-9 px-4"
              onClick={() => {
                void handleConnectChannel()
              }}
              disabled={isConnecting}
            >
              {isConnecting ? <Loader size="xs" /> : null}
              {isConnecting ? 'Подключаем...' : 'Подключить'}
            </Button>
            <Button
              onClick={() => setIsAdding(false)}
              variant="outline"
              size="sm"
              className="h-9 px-4"
            >
              Отмена
            </Button>
          </div>
        </Card>
      ) : null}

      {error ? (
        <Card className="border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </Card>
      ) : null}

      <div className="space-y-3">
        {isLoading ? (
          <Card className="space-y-3 p-5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-10 w-full" />
          </Card>
        ) : channels.length > 0 ? (
          channels.map((channel) => {
            const status = channelStatusConfig[channel.adminStatus]
            const StatusIcon = status.icon
            return (
              <Card key={channel.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                      <Radio size={16} className="text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{channel.title ?? 'Без названия'}</h3>
                        <span className="text-xs text-muted-foreground">
                          {channel.telegramUsername ?? channel.telegramChatId}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3">
                        <div className={`flex items-center gap-1.5 text-xs font-medium ${status.className}`}>
                          <StatusIcon size={11} /> {status.label}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="h-8 w-8 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      onClick={() => {
                        void handleRefresh()
                      }}
                    >
                      <RefreshCw size={14} />
                    </Button>
                  </div>
                </div>

                {channel.adminStatus !== 'admin' ? (
                  <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <AlertCircle size={14} className="mt-0.5 shrink-0 text-destructive" />
                    <div>
                      <p className="text-xs font-medium text-destructive">
                        Бот не может публиковать посты
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Проверьте, что бот назначен администратором с правом публикации.
                      </p>
                    </div>
                  </div>
                ) : null}
              </Card>
            )
          })
        ) : (
          <EmptyState
            icon={Radio}
            title="Каналы не подключены"
            description="Добавьте Telegram-канал, чтобы публиковать посты через PostPilot."
            action={
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsAdding(true)}
              >
                <Plus size={14} />
                Добавить канал
              </Button>
            }
          />
        )}
      </div>
    </div>
  )
}
