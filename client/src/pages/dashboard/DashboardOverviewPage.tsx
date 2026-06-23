import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Send,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type RecentPost = {
  title: string
  status: 'published' | 'scheduled' | 'draft' | 'failed'
  views: number | null
  date: string
}

const kpis = [
  { label: 'Подписчики', value: '12 480', delta: '+3.2%', up: true, icon: Users },
  { label: 'Охват (7 дней)', value: '48 210', delta: '+11.4%', up: true, icon: Eye },
  { label: 'Публикаций', value: '24', delta: 'этот месяц', up: null, icon: Send },
  { label: 'Вовлечённость', value: '6.8%', delta: '+0.4%', up: true, icon: TrendingUp },
]

const recentPosts: RecentPost[] = [
  { title: 'Как выбрать тему для Telegram-канала', status: 'published', views: 4210, date: '20 июн' },
  { title: 'Топ-5 ошибок при ведении канала', status: 'published', views: 3850, date: '18 июн' },
  { title: 'Анонс нового формата постов', status: 'scheduled', views: null, date: '22 июн' },
  { title: 'Как увеличить охват без рекламы', status: 'draft', views: null, date: '—' },
]

const statusConfig = {
  published: { label: 'Опубликовано', icon: CheckCircle2, color: 'oklch(0.420 0.095 200)' },
  scheduled: { label: 'Запланировано', icon: Clock, color: 'oklch(0.600 0.12 220)' },
  draft: { label: 'Черновик', icon: FileText, color: 'oklch(0.55 0 0)' },
  failed: { label: 'Ошибка', icon: AlertCircle, color: 'oklch(0.54 0.21 25)' },
}

export function DashboardOverviewPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(({ label, value, delta, up, icon: Icon }) => (
          <Card key={label} className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary">
                <Icon size={14} className="text-muted-foreground" />
              </div>
            </div>
            <div className="mb-1 text-2xl font-bold tabular-nums">{value}</div>
            <div
              className={`flex items-center gap-0.5 text-xs font-medium ${
                up === true ? '' : up === false ? 'text-destructive' : 'text-muted-foreground'
              }`}
              style={up === true ? { color: 'oklch(0.420 0.095 200)' } : undefined}
            >
              {up !== null ? <TrendingUp size={11} className={up ? '' : 'rotate-180'} /> : null}
              {delta}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Последние публикации</h2>
            <div className="flex items-center gap-1">
              <Link
                to="/dashboard/posts"
                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Все посты <ArrowUpRight size={12} />
              </Link>
              <Button asChild variant="ghost" size="icon-sm" aria-label="Открыть все посты">
                <Link to="/dashboard/posts">
                  <ArrowUpRight size={12} />
                </Link>
              </Button>
            </div>
          </div>
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
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Быстрые действия</h2>
          </div>
          <div className="space-y-2 p-4">
            {[
              { label: 'Написать пост', href: '/dashboard/posts', primary: true },
              { label: 'Сгенерировать через AI', href: '/dashboard/ai-assistant', primary: false },
              { label: 'Открыть календарь', href: '/dashboard/calendar', primary: false },
              { label: 'Просмотреть аналитику', href: '/dashboard/analytics', primary: false },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className={`flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
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
        </Card>
      </div>
    </div>
  )
}
