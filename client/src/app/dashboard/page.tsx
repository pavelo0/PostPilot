import Link from 'next/link'
import { TrendingUp, Eye, Users, Send, ArrowUpRight, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react'

const kpis = [
  { label: 'Подписчики',     value: '12 480',  delta: '+3.2%',  up: true,  icon: Users },
  { label: 'Охват (7 дней)', value: '48 210',  delta: '+11.4%', up: true,  icon: Eye },
  { label: 'Публикаций',     value: '24',      delta: 'этот месяц', up: null, icon: Send },
  { label: 'Вовлечённость',  value: '6.8%',    delta: '+0.4%',  up: true,  icon: TrendingUp },
]

const recent = [
  { title: 'Как выбрать тему для Telegram-канала', status: 'published', views: 4210, date: '20 июн' },
  { title: 'Топ-5 ошибок при ведении канала',       status: 'published', views: 3850, date: '18 июн' },
  { title: 'Анонс нового формата постов',            status: 'scheduled', views: null, date: '22 июн' },
  { title: 'Как увеличить охват без рекламы',        status: 'draft',     views: null, date: '—' },
]

const statusConfig = {
  published: { label: 'Опубликовано', icon: CheckCircle2, color: 'oklch(0.420 0.095 200)' },
  scheduled: { label: 'Запланировано', icon: Clock, color: 'oklch(0.600 0.12 220)' },
  draft:     { label: 'Черновик',      icon: FileText, color: 'oklch(0.55 0 0)' },
  failed:    { label: 'Ошибка',        icon: AlertCircle, color: 'oklch(0.54 0.21 25)' },
}

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, delta, up, icon: Icon }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
              <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center">
                <Icon size={14} className="text-muted-foreground" />
              </div>
            </div>
            <div className="text-2xl font-bold tabular-nums mb-1">{value}</div>
            <div className={`text-xs font-medium flex items-center gap-0.5 ${up === true ? '' : up === false ? 'text-destructive' : 'text-muted-foreground'}`}
              style={up === true ? { color: 'oklch(0.420 0.095 200)' } : undefined}>
              {up !== null && <TrendingUp size={11} className={up ? '' : 'rotate-180'} />}
              {delta}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent posts */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Последние публикации</h2>
            <Link href="/dashboard/posts" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              Все посты <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recent.map((post) => {
              const s = statusConfig[post.status as keyof typeof statusConfig]
              const StatusIcon = s.icon
              return (
                <div key={post.title} className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusIcon size={11} style={{ color: s.color }} />
                      <span className="text-xs text-muted-foreground" style={{ color: s.color }}>{s.label}</span>
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

        {/* Quick actions */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Быстрые действия</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: 'Написать пост',          href: '/dashboard/posts',       primary: true },
              { label: 'Сгенерировать через AI', href: '/dashboard/ai-assistant', primary: false },
              { label: 'Открыть календарь',      href: '/dashboard/calendar',    primary: false },
              { label: 'Просмотреть аналитику',  href: '/dashboard/analytics',   primary: false },
            ].map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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

          {/* Channel health */}
          <div className="mx-4 mb-4 p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.420 0.095 200)' }} />
              <span className="text-xs font-medium">Канал подключён</span>
            </div>
            <p className="text-xs text-muted-foreground">@myawesomechannel · Бот активен</p>
          </div>
        </div>
      </div>
    </div>
  )
}
