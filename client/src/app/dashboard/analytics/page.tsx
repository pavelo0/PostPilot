'use client'

import { useState } from 'react'
import { TrendingUp, Eye, Users, ArrowUpRight } from 'lucide-react'

const periods = ['7 дней', '30 дней', '3 месяца', '6 месяцев']

const kpis = [
  { label: 'Подписчики',    value: '12 480',  delta: '+3.2%',  sub: 'за период' },
  { label: 'Охват',         value: '48 210',  delta: '+11.4%', sub: 'уникальных' },
  { label: 'Просмотры',     value: '124 500', delta: '+8.7%',  sub: 'всего' },
  { label: 'Вовлечённость', value: '6.8%',    delta: '+0.4%',  sub: 'ср. по постам' },
]

const topPosts = [
  { title: 'Кейс: рост с нуля до 10 000 подписчиков', views: 6120, er: '9.4%', date: '14 июн' },
  { title: 'Как выбрать тему для Telegram-канала',     views: 4210, er: '7.1%', date: '20 июн' },
  { title: 'Топ-5 ошибок при ведении канала',          views: 3850, er: '6.8%', date: '18 июн' },
  { title: 'Инструменты для работы с контентом',       views: 3210, er: '5.9%', date: '10 июн' },
]

const barData = [
  { day: 'Пн', v: 4200 }, { day: 'Вт', v: 3800 }, { day: 'Ср', v: 5100 },
  { day: 'Чт', v: 6200 }, { day: 'Пт', v: 4900 }, { day: 'Сб', v: 3200 }, { day: 'Вс', v: 2800 },
]
const maxBar = Math.max(...barData.map((b) => b.v))

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7 дней')

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Period selector */}
      <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 w-fit">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${period === p ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, delta, sub }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs font-medium text-muted-foreground mb-3">{label}</p>
            <p className="text-2xl font-bold tabular-nums mb-1">{value}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold flex items-center gap-0.5" style={{ color: 'oklch(0.420 0.095 200)' }}>
                <TrendingUp size={10} />
                {delta}
              </span>
              <span className="text-xs text-muted-foreground">{sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Просмотры по дням</h2>
            <p className="text-xs text-muted-foreground">Охват публикаций за выбранный период</p>
          </div>
          <div className="px-5 py-5">
            <div className="flex items-end gap-2 h-40">
              {barData.map((b) => (
                <div key={b.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs text-muted-foreground tabular-nums">{(b.v / 1000).toFixed(1)}k</span>
                  <div
                    className="w-full rounded-md transition-all"
                    style={{
                      height: `${(b.v / maxBar) * 100}%`,
                      background: 'oklch(0.420 0.095 200)',
                      opacity: 0.8,
                      minHeight: '4px',
                    }}
                  />
                  <span className="text-[11px] text-muted-foreground">{b.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Growth insight */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Рост аудитории</h2>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: 'Новые подписчики', value: '+412', icon: Users },
              { label: 'Отписки',          value: '-38',  icon: Users, neg: true },
              { label: 'Охват (ср.)',       value: '6 888', icon: Eye },
            ].map(({ label, value, icon: Icon, neg }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center">
                    <Icon size={13} className="text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
                <span className={`text-sm font-semibold tabular-nums ${neg ? 'text-destructive' : ''}`}
                  style={!neg ? { color: 'oklch(0.420 0.095 200)' } : undefined}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top posts */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold">Лучшие посты</h2>
          <span className="text-xs text-muted-foreground">по просмотрам</span>
        </div>
        <div className="divide-y divide-border">
          {topPosts.map((post, i) => (
            <div key={post.title} className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/20 transition-colors">
              <span className="text-sm font-bold tabular-nums text-muted-foreground w-5 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{post.title}</p>
                <p className="text-xs text-muted-foreground">{post.date}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold tabular-nums flex items-center gap-1">
                  <Eye size={12} className="text-muted-foreground" />
                  {post.views.toLocaleString('ru')}
                </p>
                <p className="text-xs font-medium" style={{ color: 'oklch(0.420 0.095 200)' }}>ER {post.er}</p>
              </div>
              <ArrowUpRight size={14} className="text-muted-foreground shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
