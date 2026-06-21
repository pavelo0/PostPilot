import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="pt-40 pb-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Label */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary text-xs font-medium text-muted-foreground mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.420_0.095_200)]" />
          Платформа для Telegram-команд
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-bold leading-[1.08] tracking-tight text-balance mb-7 max-w-3xl">
          Управляйте Telegram-каналом{' '}
          <span style={{ color: 'oklch(0.420 0.095 200)' }}>как медиаактивом</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-muted-foreground leading-relaxed text-balance max-w-xl mb-10">
          PostPilot автоматизирует весь цикл контента: создание, AI-редактирование, планирование, публикацию через бота и аналитику — в одном рабочем пространстве.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-4 flex-wrap">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/85 transition-colors"
          >
            Начать бесплатно
            <ArrowRight size={15} />
          </Link>
          <a
            href="#workflow"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border text-sm text-muted-foreground rounded-md hover:bg-secondary hover:text-foreground transition-colors"
          >
            Как это работает
          </a>
        </div>

        {/* Stats row */}
        <div className="mt-16 pt-8 border-t border-border flex items-center gap-10 flex-wrap">
          {[
            { value: '10 000+', label: 'публикаций создано' },
            { value: '98%', label: 'uptime бота' },
            { value: '3 мин', label: 'среднее время настройки' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
