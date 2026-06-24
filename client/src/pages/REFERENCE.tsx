import { AlertCircle, ArrowUpRight, CheckCircle2, Clock, FileText, Pencil, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

const nextPost = {
  title: 'Анонс нового формата постов',
  preview:
    'Мы запускаем серию материалов о том, как структурировать контент в Telegram-канале, удерживать внимание аудитории и выстраивать регулярный график публикаций без выгорания.',
  scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000), // ~2 days from now
  dateLabel: '22 июня, 12:00',
}

function relativeTime(date: Date): string {
  const diff = date.getTime() - Date.now()
  const abs = Math.abs(diff)
  const future = diff > 0
  if (abs < 60 * 60 * 1000) {
    const h = Math.round(abs / (60 * 1000))
    return future ? `через ${h} мин` : `${h} мин назад`
  }
  if (abs < 24 * 60 * 60 * 1000) {
    const h = Math.round(abs / (60 * 60 * 1000))
    return future ? `через ${h} ч` : `${h} ч назад`
  }
  const d = Math.round(abs / (24 * 60 * 60 * 1000))
  return future ? `через ${d} д` : `${d} д назад`
}

const kpis = [
  { label: 'Подписчики',     value: '12 480',  delta: '+3.2%',  up: true,  icon: Users },

const statusConfig = {
  published: { label: 'Опубликовано', icon: CheckCircle2, color: 'oklch(0.420 0.095 200)' },
  scheduled: { label: 'Запланировано', icon: Clock,       color: 'oklch(0.600 0.12 220)' },
  draft:     { label: 'Черновик',      icon: FileText,    color: 'oklch(0.55 0 0)' },
  failed:    { label: 'Ошибка',        icon: AlertCircle, color: 'oklch(0.54 0.21 25)' },
}

export default function DashboardPage() {
  const relative = relativeTime(nextPost.scheduledAt)

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Main two-column block ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

        {/* LEFT — Next post focus card (spans 3/5 cols) */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl flex flex-col overflow-hidden min-h-[280px]">
          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.420 0.095 200)' }} />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Следующая публикация
              </span>
            </div>
            <Link
              href="/dashboard/posts"
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-md hover:bg-secondary"
            >
              <Pencil size={11} />
              Редактировать
            </Link>
          </div>

          {/* Card body */}
          <div className="flex flex-col flex-1 px-5 py-5 gap-4">
            <h2 className="text-[17px] font-semibold leading-snug text-balance">
              {nextPost.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
              {nextPost.preview}
            </p>

            {/* Date badges */}
            <div className="flex items-center gap-2 flex-wrap mt-auto pt-2 border-t border-border">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-foreground">
                <Clock size={11} />
                {nextPost.dateLabel}
              </span>
              <span
                className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  background: 'oklch(0.420 0.095 200 / 0.10)',
                  color: 'oklch(0.420 0.095 200)',
                }}
              >
                {relative}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT — Stats + Quick Actions (spans 2/5 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Statistics grid */}
          <div className="grid grid-cols-2 gap-3">
            {kpis.map(({ label, value, delta, up, icon: Icon }) => (
              <div key={label} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-muted-foreground leading-tight">{label}</span>
                  <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center shrink-0">
                    <Icon size={12} className="text-muted-foreground" />
                  </div>
                </div>
                <div className="text-xl font-bold tabular-nums mb-0.5">{value}</div>
                <div
                  className={`text-[11px] font-medium flex items-center gap-0.5 ${
                    up === false ? 'text-destructive' : up === null ? 'text-muted-foreground' : ''
                  }`}
                  style={up === true ? { color: 'oklch(0.420 0.095 200)' } : undefined}
                >
                  {up !== null && <TrendingUp size={10} className={up ? '' : 'rotate-180'} />}
                  {delta}
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-border">
              <h2 className="text-sm font-semibold">Быстрые действия</h2>
            </div>
            <div className="p-3 space-y-1.5">
              {[
                { label: 'Написать пост',          href: '/dashboard/posts',        primary: true },
                { label: 'Сгенерировать через AI', href: '/dashboard/ai-assistant', primary: false },
                { label: 'Открыть календарь',      href: '/dashboard/calendar',     primary: false },
                { label: 'Просмотреть аналитику',  href: '/dashboard/analytics',    primary: false },
              ].map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className={`flex items-center justify-between w-full px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    a.primary
                      ? 'bg-foreground text-background hover:bg-foreground/85'
                      : 'border border-border hover:bg-secondary text-foreground'
                  }`}
                >
                  {a.label}
                  <ArrowUpRight size={13} className="opacity-50" />
                </Link>
              ))}
            </div>

            {/* Channel health pill */}
            <div className="mx-3 mb-3 px-4 py-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'oklch(0.420 0.095 200)' }} />
                <span className="text-xs font-medium">Канал подключён</span>
              </div>
              <p className="text-xs text-muted-foreground">@myawesomechannel · Бот активен</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent posts table (full width below) ── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">Последние публикации</h2>
          <Link
            href="/dashboard/posts"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            Все посты <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recent.map((post) => {
            const s = statusConfig[post.status as keyof typeof statusConfig]
            const StatusIcon = s.icon
            return (
              <div
                key={post.title}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{post.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusIcon size={11} style={{ color: s.color }} />
                    <span className="text-xs" style={{ color: s.color }}>{s.label}</span>
                    <span className="text-xs text-muted-foreground">· {post.date}</span>
                  </div>
                </div>
                {post.views !== null && (
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold tabular-nums">{post.views.toLocaleString('ru')}</p>
                    <p className="text-xs text-muted-foreground">просм.</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}