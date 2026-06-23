import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'

type PricingPlan = {
  name: string
  price: string
  period: string
  description: string
  featured: boolean
  features: string[]
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Старт',
    price: '990',
    period: '/мес',
    description: 'Один канал, базовый инструментарий.',
    featured: false,
    features: [
      '1 Telegram-канал',
      'До 60 постов в месяц',
      'Планирование публикаций',
      'Базовая аналитика',
      'Поддержка по email',
    ],
  },
  {
    name: 'Про',
    price: '2 490',
    period: '/мес',
    description: 'Для активных команд и медиа.',
    featured: true,
    features: [
      'До 5 каналов',
      'Неограниченные публикации',
      'AI-помощник (неограниченно)',
      'Расширенная аналитика',
      'Контент-календарь',
      'Черновики и история версий',
      'Приоритетная поддержка',
    ],
  },
  {
    name: 'Агентство',
    price: 'По запросу',
    period: '',
    description: 'Для агентств и крупных медиа.',
    featured: false,
    features: [
      'Неограниченные каналы',
      'Командный доступ',
      'Управление ролями',
      'API-доступ',
      'Выделенный менеджер',
      'SLA-гарантии',
    ],
  },
]

export function LandingPricingSection() {
  return (
    <section id="pricing" className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 max-w-lg">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Тарифы
          </p>
          <h2 className="text-balance text-4xl font-bold leading-tight tracking-tight">
            Прозрачные цены без сюрпризов
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-xl border p-8 ${
                plan.featured
                  ? 'border-[oklch(0.420_0.095_200)] ring-1 ring-[oklch(0.420_0.095_200)]/20'
                  : 'border-border'
              }`}
            >
              {plan.featured && (
                <span
                  className="mb-4 inline-block rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest"
                  style={{
                    background: 'oklch(0.420 0.095 200 / 0.10)',
                    color: 'oklch(0.420 0.095 200)',
                  }}
                >
                  Популярный
                </span>
              )}

              <div className="mb-6">
                <h3 className="mb-1 text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-bold tabular-nums">{plan.price}</span>
                {plan.period ? (
                  <span className="ml-1 text-sm text-muted-foreground">{plan.period}</span>
                ) : null}
              </div>

              <Link
                to="/register"
                className={`mb-8 block rounded-md px-4 py-2.5 text-center text-sm font-medium transition-colors ${
                  plan.featured
                    ? 'bg-foreground text-background hover:bg-foreground/85'
                    : 'border border-border text-foreground hover:bg-secondary'
                }`}
              >
                {plan.price === 'По запросу' ? 'Связаться с нами' : 'Начать'}
              </Link>

              <ul className="mt-auto space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check
                      size={14}
                      className="mt-0.5 shrink-0"
                      style={{ color: 'oklch(0.420 0.095 200)' }}
                    />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
