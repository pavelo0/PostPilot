import { useState } from 'react'
import { ArrowUpRight, Eye, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const periods = ['7 дней', '30 дней', '3 месяца', '6 месяцев']

const kpis = [
  { label: 'Подписчики', value: '12 480', delta: '+3.2%', sub: 'за период' },
  { label: 'Охват', value: '48 210', delta: '+11.4%', sub: 'уникальных' },
  { label: 'Просмотры', value: '124 500', delta: '+8.7%', sub: 'всего' },
  { label: 'Вовлечённость', value: '6.8%', delta: '+0.4%', sub: 'ср. по постам' },
]

const topPosts = [
  { title: 'Кейс: рост с нуля до 10 000 подписчиков', views: 6120, er: '9.4%', date: '14 июн' },
  { title: 'Как выбрать тему для Telegram-канала', views: 4210, er: '7.1%', date: '20 июн' },
  { title: 'Топ-5 ошибок при ведении канала', views: 3850, er: '6.8%', date: '18 июн' },
  { title: 'Инструменты для работы с контентом', views: 3210, er: '5.9%', date: '10 июн' },
]

const barData = [
  { day: 'Пн', value: 4200 },
  { day: 'Вт', value: 3800 },
  { day: 'Ср', value: 5100 },
  { day: 'Чт', value: 6200 },
  { day: 'Пт', value: 4900 },
  { day: 'Сб', value: 3200 },
  { day: 'Вс', value: 2800 },
]

const maxBar = Math.max(...barData.map((item) => item.value))

export function AnalyticsDashboardPage() {
  const [period, setPeriod] = useState('7 дней')

  return (
    <div className="w-full space-y-5">
      <div className="w-fit rounded-lg bg-secondary p-1">
        {periods.map((periodItem) => (
          <Button
            key={periodItem}
            type="button"
            onClick={() => setPeriod(periodItem)}
            variant="ghost"
            size="sm"
            className={`h-auto px-3 py-1.5 text-xs font-medium ${
              period === periodItem
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {periodItem}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-5">
            <p className="mb-3 text-xs font-medium text-muted-foreground">{kpi.label}</p>
            <p className="mb-1 text-2xl font-bold tabular-nums">{kpi.value}</p>
            <div className="flex items-center gap-1.5">
              <span
                className="flex items-center gap-0.5 text-xs font-semibold"
                style={{ color: 'oklch(0.420 0.095 200)' }}
              >
                <TrendingUp size={10} />
                {kpi.delta}
              </span>
              <span className="text-xs text-muted-foreground">{kpi.sub}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Просмотры по дням</h2>
            <p className="text-xs text-muted-foreground">Охват публикаций за выбранный период</p>
          </div>
          <div className="px-5 py-5">
            <div className="flex h-40 items-end gap-2">
              {barData.map((item) => (
                <div key={item.day} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {(item.value / 1000).toFixed(1)}k
                  </span>
                  <div
                    className="w-full rounded-md"
                    style={{
                      height: `${(item.value / maxBar) * 100}%`,
                      background: 'oklch(0.420 0.095 200)',
                      opacity: 0.8,
                      minHeight: '4px',
                    }}
                  />
                  <span className="text-[11px] text-muted-foreground">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Рост аудитории</h2>
          </div>
          <div className="space-y-4 p-5">
            {[
              { label: 'Новые подписчики', value: '+412', icon: Users },
              { label: 'Отписки', value: '-38', icon: Users, negative: true },
              { label: 'Охват (ср.)', value: '6 888', icon: Eye },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary">
                      <Icon size={13} className="text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  </div>
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      item.negative ? 'text-destructive' : ''
                    }`}
                    style={!item.negative ? { color: 'oklch(0.420 0.095 200)' } : undefined}
                  >
                    {item.value}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Лучшие посты</h2>
          <span className="text-xs text-muted-foreground">по просмотрам</span>
        </div>
        <div className="divide-y divide-border">
          {topPosts.map((post, index) => (
            <div
              key={post.title}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/20"
            >
              <span className="w-5 shrink-0 text-sm font-bold tabular-nums text-muted-foreground">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{post.title}</p>
                <p className="text-xs text-muted-foreground">{post.date}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="flex items-center gap-1 text-sm font-semibold tabular-nums">
                  <Eye size={12} className="text-muted-foreground" />
                  {post.views.toLocaleString('ru')}
                </p>
                <p className="text-xs font-medium" style={{ color: 'oklch(0.420 0.095 200)' }}>
                  ER {post.er}
                </p>
              </div>
              <ArrowUpRight size={14} className="shrink-0 text-muted-foreground" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
