import Link from 'next/link'
import { Check } from 'lucide-react'

const plans = [
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

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Тарифы</p>
          <h2 className="text-4xl font-bold leading-tight tracking-tight text-balance">
            Прозрачные цены без сюрпризов
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-8 flex flex-col ${
                plan.featured
                  ? 'border-[oklch(0.420_0.095_200)] ring-1 ring-[oklch(0.420_0.095_200)]/20'
                  : 'border-border'
              }`}
            >
              {plan.featured && (
                <span className="inline-block mb-4 text-[11px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-md" style={{ background: 'oklch(0.420 0.095 200 / 0.10)', color: 'oklch(0.420 0.095 200)' }}>
                  Популярный
                </span>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-bold tabular-nums">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>}
              </div>

              <Link
                href="/register"
                className={`block text-center text-sm font-medium py-2.5 px-4 rounded-md mb-8 transition-colors ${
                  plan.featured
                    ? 'bg-foreground text-background hover:bg-foreground/85'
                    : 'border border-border hover:bg-secondary text-foreground'
                }`}
              >
                {plan.price === 'По запросу' ? 'Связаться с нами' : 'Начать'}
              </Link>

              <ul className="space-y-3 mt-auto">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: 'oklch(0.420 0.095 200)' }} />
                    <span className="text-muted-foreground">{f}</span>
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
