import { useEffect, useState } from 'react'
import { Bot, CheckCircle2, Radio, RefreshCw, ShieldAlert, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ChannelsDashboardPage } from '@/pages/dashboard/ChannelsDashboardPage'
import { useAppSelector } from '@/store/hooks'
import { ApiError } from '@/utils/auth/auth.api'
import {
  connectBot,
  disconnectBot,
  getBotSetup,
  recheckBot,
  type BotSetup,
  type ChannelBotAdminStatus,
} from '@/utils/bot/bot.api'

type TabKey = 'profile' | 'bot' | 'channels'

const tabs: Array<{
  id: TabKey
  label: string
  icon: React.ComponentType<{ size?: number }>
}> = [
  { id: 'profile', label: 'Профиль', icon: User },
  { id: 'bot', label: 'Bot', icon: Bot },
  { id: 'channels', label: 'Каналы', icon: Radio },
]

const channelAdminStatusConfig: Record<
  ChannelBotAdminStatus,
  { label: string; className: string; icon: React.ComponentType<{ size?: number }> }
> = {
  admin: {
    label: 'Бот администратор',
    className: 'text-[oklch(0.420_0.095_200)]',
    icon: CheckCircle2,
  },
  not_admin: {
    label: 'Нет прав администратора',
    className: 'text-destructive',
    icon: ShieldAlert,
  },
  unknown: {
    label: 'Статус не проверен',
    className: 'text-muted-foreground',
    icon: ShieldAlert,
  },
  check_failed: {
    label: 'Не удалось проверить',
    className: 'text-destructive',
    icon: ShieldAlert,
  },
}

/**
 * Maps bot health to user-friendly description in settings UI.
 */
function getBotHealthLabel(health: BotSetup['bot']['health']): string {
  if (health === 'connected') {
    return 'Токен активен'
  }
  if (health === 'token_invalid') {
    return 'Токен недействителен'
  }
  return 'Токен не подключён'
}

/**
 * Extracts readable error message from API exceptions.
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

export function SettingsDashboardPage() {
  const authUser = useAppSelector((state) => state.auth.user)
  const [activeTab, setActiveTab] = useState<TabKey>('profile')
  const [botSetup, setBotSetup] = useState<BotSetup | null>(null)
  const [botTokenInput, setBotTokenInput] = useState('')
  const [botError, setBotError] = useState<string | null>(null)
  const [isLoadingBotSetup, setIsLoadingBotSetup] = useState(false)
  const [isConnectingBot, setIsConnectingBot] = useState(false)
  const [isDisconnectingBot, setIsDisconnectingBot] = useState(false)
  const [isRecheckingBot, setIsRecheckingBot] = useState(false)

  useEffect(() => {
    if (activeTab !== 'bot' || botSetup !== null) {
      return
    }

    let isCancelled = false
    const loadBotSetup = async (): Promise<void> => {
      setIsLoadingBotSetup(true)
      setBotError(null)
      try {
        const setup = await getBotSetup()
        if (!isCancelled) {
          setBotSetup(setup)
        }
      } catch (error: unknown) {
        if (!isCancelled) {
          setBotError(getErrorMessage(error))
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingBotSetup(false)
        }
      }
    }

    void loadBotSetup()
    return () => {
      isCancelled = true
    }
  }, [activeTab, botSetup])

  /**
   * Connects user bot token and refreshes setup snapshot.
   */
  const handleConnectBot = async (): Promise<void> => {
    if (botTokenInput.trim().length === 0) {
      setBotError('Введите API ключ бота')
      return
    }

    setIsConnectingBot(true)
    setBotError(null)
    try {
      const setup = await connectBot(botTokenInput)
      setBotSetup(setup)
      setBotTokenInput('')
    } catch (error: unknown) {
      setBotError(getErrorMessage(error))
    } finally {
      setIsConnectingBot(false)
    }
  }

  /**
   * Disconnects active bot token while keeping sticky progress signal.
   */
  const handleDisconnectBot = async (): Promise<void> => {
    setIsDisconnectingBot(true)
    setBotError(null)
    try {
      const setup = await disconnectBot()
      setBotSetup(setup)
    } catch (error: unknown) {
      setBotError(getErrorMessage(error))
    } finally {
      setIsDisconnectingBot(false)
    }
  }

  /**
   * Runs live recheck for token and channel admin statuses.
   */
  const handleRecheckBot = async (): Promise<void> => {
    setIsRecheckingBot(true)
    setBotError(null)
    try {
      const setup = await recheckBot()
      setBotSetup(setup)
    } catch (error: unknown) {
      setBotError(getErrorMessage(error))
    } finally {
      setIsRecheckingBot(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Настройки</h1>
        <p className="text-muted-foreground">Управляйте настройками вашего аккаунта</p>
      </div>

      <Card className="grid grid-cols-3 gap-2 p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              variant="ghost"
              size="sm"
              className={`h-auto justify-center gap-2 px-3 py-2 text-sm ${
                activeTab === tab.id
                  ? 'bg-secondary font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </Button>
          )
        })}
      </Card>

      {activeTab === 'profile' ? (
        <Card className="space-y-4 p-5">
          <h2 className="text-base font-semibold">Профиль</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm">Имя</span>
              <Input
                value={authUser?.firstName ?? ''}
                readOnly
                className="h-10 rounded-md px-3 text-sm focus-visible:ring-1"
                style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm">Фамилия</span>
              <Input
                value={authUser?.lastName ?? ''}
                readOnly
                className="h-10 rounded-md px-3 text-sm focus-visible:ring-1"
                style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
              />
            </label>
          </div>
          <label className="block space-y-2">
            <span className="text-sm">Email</span>
            <Input
              type="email"
              value={authUser?.email ?? ''}
              readOnly
              className="h-10 rounded-md px-3 text-sm focus-visible:ring-1"
              style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
            />
          </label>
        </Card>
      ) : null}

      {activeTab === 'bot' ? (
        <div className="space-y-4">
          <Card className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Bot API ключ</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ключ хранится только на backend в зашифрованном виде и используется для проверки
                  прав и публикации постов.
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  botSetup?.bot.health === 'connected'
                    ? 'bg-[oklch(0.420_0.095_200)]/10 text-[oklch(0.420_0.095_200)]'
                    : botSetup?.bot.health === 'token_invalid'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-secondary text-muted-foreground'
                }`}
              >
                {getBotHealthLabel(botSetup?.bot.health ?? 'missing')}
              </span>
            </div>

            {isLoadingBotSetup ? (
              <p className="text-sm text-muted-foreground">Загружаем настройки бота...</p>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="block space-y-2">
                    <span className="text-sm">Новый API ключ</span>
                    <Input
                      type="password"
                      placeholder="123456789:AA..."
                      value={botTokenInput}
                      onChange={(event) => setBotTokenInput(event.target.value)}
                      className="h-10 rounded-md px-3 text-sm focus-visible:ring-1"
                      style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
                    />
                  </label>
                  <div className="text-xs text-muted-foreground">
                    Текущий ключ:{' '}
                    <span className="font-medium text-foreground">
                      {botSetup?.bot.tokenMask ?? 'не подключён'}
                    </span>
                    {botSetup?.bot.username ? (
                      <span className="ml-1">· @{botSetup.bot.username}</span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      void handleConnectBot()
                    }}
                    disabled={isConnectingBot}
                  >
                    {isConnectingBot ? 'Проверяем ключ...' : 'Подключить ключ'}
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      void handleRecheckBot()
                    }}
                    disabled={isRecheckingBot}
                  >
                    <RefreshCw size={14} />
                    {isRecheckingBot ? 'Проверяем...' : 'Recheck'}
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      void handleDisconnectBot()
                    }}
                    disabled={isDisconnectingBot || !botSetup?.bot.configured}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 size={14} />
                    {isDisconnectingBot ? 'Отключаем...' : 'Отвязать ключ'}
                  </Button>
                </div>

                {botSetup?.bot.progressConnectedOnce ? (
                  <div className="rounded-lg border border-[oklch(0.420_0.095_200)]/25 bg-[oklch(0.420_0.095_200)]/8 px-3 py-2 text-xs text-foreground">
                    Шаг онбординга «Бот подключён» уже пройден. Даже если ключ отвязан, этот шаг
                    остаётся выполненным (sticky progress).
                  </div>
                ) : null}

                {botError ? (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {botError}
                  </div>
                ) : null}
              </>
            )}
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <h2 className="text-base font-semibold">Каналы, привязанные к боту</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Список берётся из реальных подключений аккаунта.
              </p>
            </div>

            {isLoadingBotSetup ? (
              <p className="text-sm text-muted-foreground">Проверяем каналы...</p>
            ) : botSetup && botSetup.channels.length > 0 ? (
              <div className="space-y-2">
                {botSetup.channels.map((channel) => {
                  const statusConfig = channelAdminStatusConfig[channel.adminStatus]
                  const StatusIcon = statusConfig.icon
                  return (
                    <div
                      key={channel.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{channel.title ?? 'Без названия'}</p>
                        <p className="text-xs text-muted-foreground">
                          {channel.telegramUsername ?? channel.telegramChatId}
                        </p>
                      </div>
                      <div
                        className={`flex shrink-0 items-center gap-1.5 text-xs font-medium ${statusConfig.className}`}
                      >
                        <StatusIcon size={12} />
                        {statusConfig.label}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Каналы пока не найдены. Подключите канал во вкладке «Каналы».
              </p>
            )}
          </Card>
        </div>
      ) : null}

      {activeTab === 'channels' ? <ChannelsDashboardPage /> : null}
    </div>
  )
}
