import {
  AlertCircle,
  ArrowUpRight,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Lock,
  Plus,
  Radio,
  Send,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

type RecentPost = {
  title: string
  status: 'published' | 'scheduled' | 'draft' | 'failed'
  views: number | null
  date: string
}

type SetupStep = {
  n: string
  icon: typeof Radio
  title: string
  desc: string
  action: {
    label: string
    href: string
  }
  done: boolean
}

const nextPost = {
  title: 'Анонс нового формата постов',
  preview:
    'Мы запускаем серию материалов о том, как структурировать контент в Telegram-канале, удерживать внимание аудитории и выстраивать регулярный график публикаций без выгорания.',
  scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000),
  dateLabel: '22 июня, 12:00',
}

const connectedKpis = [
  { label: 'Подписчики', value: '12 480', delta: '+3.2%', up: true, icon: Users },
  { label: 'Охват (7 дней)', value: '48 210', delta: '+11.4%', up: true, icon: Eye },
  { label: 'Публикаций', value: '24', delta: 'этот месяц', up: null, icon: Send },
  { label: 'Вовлечённость', value: '6.8%', delta: '+0.4%', up: true, icon: TrendingUp },
]

const lockedKpis = [
  { label: 'Подписчики', icon: Users },
  { label: 'Охват (7 дней)', icon: Eye },
  { label: 'Публикаций', icon: Send },
  { label: 'Вовлечённость', icon: TrendingUp },
]

const setupSteps: SetupStep[] = [
  {
    n: '1',
    icon: Radio,
    title: 'Подключите Telegram-канал',
    desc: 'Добавьте канал, чтобы PostPilot мог публиковать посты от вашего имени.',
    action: { label: 'Подключить канал', href: '/dashboard/channels' },
    done: false,
  },
  {
    n: '2',
    icon: Bot,
    title: 'Активируйте бота',
    desc: 'Добавьте @PostPilotBot администратором канала — это займёт меньше минуты.',
    action: { label: 'Настроить бота', href: '/dashboard/channels' },
    done: false,
  },
  {
    n: '3',
    icon: FileText,
    title: 'Создайте первый пост',
    desc: 'Напишите вручную или сгенерируйте контент с помощью AI-помощника.',
    action: { label: 'Создать пост', href: '/dashboard/posts' },
    done: false,
  },
]

const recentPosts: RecentPost[] = [
  { title: 'Как выбрать тему для Telegram-канала', status: 'published', views: 4210, date: '20 июн' },
  { title: 'Топ-5 ошибок при ведении канала', status: 'published', views: 3850, date: '18 июн' },
  { title: 'Анонс нового формата постов', status: 'scheduled', views: null, date: '22 июн' },
  { title: 'Как увеличить охват без рекламы', status: 'draft', views: null, date: '—' },
]

const skeletonPosts = [1, 2, 3]

const statusConfig = {
  published: { label: 'Опубликовано', icon: CheckCircle2, color: 'oklch(0.420 0.095 200)' },
  scheduled: { label: 'Запланировано', icon: Clock, color: 'oklch(0.600 0.12 220)' },
  draft: { label: 'Черновик', icon: FileText, color: 'oklch(0.55 0 0)' },
  failed: { label: 'Ошибка', icon: AlertCircle, color: 'oklch(0.54 0.21 25)' },
}

/**
 * Formats a relative time label for upcoming and past dates.
 */
function relativeTime(date: Date): string {
  const diff = date.getTime() - Date.now()
  const abs = Math.abs(diff)
  const future = diff > 0

  if (abs < 60 * 60 * 1000) {
    const minutes = Math.round(abs / (60 * 1000))
    return future ? `через ${minutes} мин` : `${minutes} мин назад`
  }

  if (abs < 24 * 60 * 60 * 1000) {
    const hours = Math.round(abs / (60 * 60 * 1000))
    return future ? `через ${hours} ч` : `${hours} ч назад`
  }

  const days = Math.round(abs / (24 * 60 * 60 * 1000))
  return future ? `через ${days} д` : `${days} д назад`
}

export function DashboardOverviewPage() {
  const hasConnectedChannel = false
  const nextPostRelativeTime = relativeTime(nextPost.scheduledAt)

  return (
    <div className="w-full space-y-6">
      {!hasConnectedChannel ? (
        <div
          className="flex flex-col gap-3 rounded-xl border border-border px-5 py-4 sm:flex-row sm:items-center"
          style={{ background: 'oklch(0.420 0.095 200 / 0.06)' }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: 'oklch(0.420 0.095 200 / 0.15)' }}
          >
            <Radio size={16} style={{ color: 'oklch(0.420 0.095 200)' }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Канал ещё не подключён</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Подключите Telegram-канал и бота, чтобы начать публиковать посты и видеть статистику.
            </p>
          </div>
          <Link
            to="/dashboard/channels"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90"
            style={{ background: 'oklch(0.420 0.095 200)' }}
          >
            <Plus size={13} />
            Подключить
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-5">
        <div className="flex min-h-[280px] flex-col overflow-hidden rounded-xl border border-border bg-card lg:col-span-3">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <div
                className={`h-1.5 w-1.5 rounded-full ${hasConnectedChannel ? '' : 'bg-border'}`}
                style={hasConnectedChannel ? { background: 'oklch(0.420 0.095 200)' } : undefined}
              />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Следующая публикация
              </span>
            </div>
            {hasConnectedChannel ? (
              <Link
                to="/dashboard/posts"
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Редактировать
              </Link>
            ) : null}
          </div>

          {hasConnectedChannel ? (
            <div className="flex flex-1 flex-col gap-4 px-5 py-5">
              <h2 className="text-balance text-[17px] font-semibold leading-snug">{nextPost.title}</h2>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{nextPost.preview}</p>
              <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
                  <Clock size={11} />
                  {nextPost.dateLabel}
                </span>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{
                    background: 'oklch(0.420 0.095 200 / 0.10)',
                    color: 'oklch(0.420 0.095 200)',
                  }}
                >
                  {nextPostRelativeTime}
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <FileText size={20} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Нет запланированных постов</p>
                  <p className="mt-1 max-w-[260px] text-xs text-muted-foreground">
                    Создайте первый пост или сгенерируйте контент с помощью AI, чтобы он появился
                    здесь.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Link
                    to="/dashboard/posts"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
                  >
                    <Plus size={13} />
                    Написать пост
                  </Link>
                  <Link
                    to="/dashboard/ai-assistant"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    <Sparkles size={13} />
                    Через AI
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-border px-5 py-4">
                <div className="h-6 w-28 animate-pulse rounded-full bg-secondary" />
                <div className="h-6 w-16 animate-pulse rounded-full bg-secondary" />
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          {hasConnectedChannel ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                {connectedKpis.map(({ label, value, delta, up, icon: Icon }) => (
                  <div key={label} className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] font-medium leading-tight text-muted-foreground">
                        {label}
                      </span>
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary">
                        <Icon size={12} className="text-muted-foreground" />
                      </div>
                    </div>
                    <div className="mb-0.5 text-xl font-bold tabular-nums">{value}</div>
                    <div
                      className={`flex items-center gap-0.5 text-[11px] font-medium ${
                        up === false ? 'text-destructive' : up === null ? 'text-muted-foreground' : ''
                      }`}
                      style={up === true ? { color: 'oklch(0.420 0.095 200)' } : undefined}
                    >
                      {up !== null ? <TrendingUp size={10} className={up ? '' : 'rotate-180'} /> : null}
                      {delta}
                    </div>
                  </div>
                ))}
              </div>
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="border-b border-border px-4 py-3.5">
                  <h2 className="text-sm font-semibold">Быстрые действия</h2>
                </div>
                <div className="space-y-1.5 p-3">
                  {[
                    { label: 'Написать пост', href: '/dashboard/posts', primary: true },
                    { label: 'Сгенерировать через AI', href: '/dashboard/ai-assistant', primary: false },
                    { label: 'Открыть календарь', href: '/dashboard/calendar', primary: false },
                    { label: 'Просмотреть аналитику', href: '/dashboard/analytics', primary: false },
                  ].map((action) => (
                    <Link
                      key={action.label}
                      to={action.href}
                      className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                        action.primary
                          ? 'bg-foreground text-background hover:bg-foreground/85'
                          : 'border border-border text-foreground hover:bg-secondary'
                      }`}
                    >
                      {action.label}
                      <ArrowUpRight size={13} className="opacity-50" />
                    </Link>
                  ))}
                </div>
                <div className="mx-3 mb-3 rounded-lg border border-border bg-secondary/50 px-4 py-3">
                  <div className="mb-0.5 flex items-center gap-2">
                    <div
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'oklch(0.420 0.095 200)' }}
                    />
                    <span className="text-xs font-medium">Канал подключён</span>
                  </div>
                  <p className="text-xs text-muted-foreground">@myawesomechannel · Бот активен</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {lockedKpis.map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="relative overflow-hidden rounded-xl border border-border bg-card p-4"
                  >
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-[2px]">
                      <Lock size={13} className="text-muted-foreground/60" />
                    </div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] font-medium leading-tight text-muted-foreground">
                        {label}
                      </span>
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary">
                        <Icon size={12} className="text-muted-foreground" />
                      </div>
                    </div>
                    <div className="mb-1 h-6 w-16 animate-pulse rounded bg-secondary" />
                    <div className="h-3 w-10 animate-pulse rounded bg-secondary" />
                  </div>
                ))}
              </div>
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="border-b border-border px-4 py-3.5">
                  <h2 className="text-sm font-semibold">Начало работы</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Выполните 3 шага, чтобы запустить канал
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {setupSteps.map((step) => {
                    const StepIcon = step.icon
                    return (
                      <div key={step.n} className="flex gap-3 px-4 py-4">
                        <div
                          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                          style={{
                            background: step.done
                              ? 'oklch(0.420 0.095 200)'
                              : 'oklch(0.420 0.095 200 / 0.12)',
                            color: step.done ? 'white' : 'oklch(0.420 0.095 200)',
                          }}
                        >
                          {step.n}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <StepIcon size={13} className="text-muted-foreground" />
                            <p className="text-sm font-medium leading-tight">{step.title}</p>
                          </div>
                          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                            {step.desc}
                          </p>
                          <Link
                            to={step.action.href}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium transition-colors hover:underline"
                            style={{ color: 'oklch(0.420 0.095 200)' }}
                          >
                            {step.action.label}
                            <ArrowUpRight size={11} />
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Последние публикации</h2>
          {hasConnectedChannel ? (
            <Link
              to="/dashboard/posts"
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Все посты <ArrowUpRight size={12} />
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar size={11} />
              Нет публикаций
            </span>
          )}
        </div>

        {hasConnectedChannel ? (
          <div className="divide-y divide-border">
            {recentPosts.map((post) => {
              const config = statusConfig[post.status]
              const StatusIcon = config.icon
              return (
                <div
                  key={post.title}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-secondary/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{post.title}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <StatusIcon size={11} style={{ color: config.color }} />
                      <span className="text-xs" style={{ color: config.color }}>
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground">· {post.date}</span>
                    </div>
                  </div>
                  {post.views !== null ? (
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {post.views.toLocaleString('ru')}
                      </p>
                      <p className="text-xs text-muted-foreground">просм.</p>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : (
          <>
            <div className="divide-y divide-border">
              {skeletonPosts.map((index) => (
                <div key={index} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 space-y-2">
                    <div
                      className="h-3.5 animate-pulse rounded bg-secondary"
                      style={{ width: `${55 + index * 12}%` }}
                    />
                    <div className="h-3 w-24 animate-pulse rounded bg-secondary" />
                  </div>
                  <div className="shrink-0 space-y-1.5 text-right">
                    <div className="ml-auto h-3.5 w-10 animate-pulse rounded bg-secondary" />
                    <div className="ml-auto h-3 w-8 animate-pulse rounded bg-secondary" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-3 border-t border-border px-5 py-8">
              <p className="max-w-xs text-center text-sm text-muted-foreground">
                Здесь появятся ваши посты после подключения канала и создания первого контента.
              </p>
              <Link
                to="/dashboard/channels"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
              >
                <Radio size={13} />
                Подключить канал
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
