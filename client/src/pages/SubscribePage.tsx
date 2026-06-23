import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, ChevronRight, CreditCard, Lock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

type BillingType = 'monthly' | 'yearly'
type StepType = 'plan' | 'payment'

type Plan = {
  id: string
  name: string
  monthlyPrice: number
  yearlyPrice: number
  desc: string
  features: string[]
  badge?: string
}

const TEAL = 'oklch(0.420 0.095 200)'

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Стартер',
    monthlyPrice: 990,
    yearlyPrice: 790,
    desc: 'Для личных каналов и небольших проектов',
    features: [
      'До 3 Telegram-каналов',
      '30 постов в месяц',
      'AI-помощник (базовый)',
      'Планировщик публикаций',
      'Базовая аналитика',
    ],
  },
  {
    id: 'pro',
    name: 'Профессионал',
    monthlyPrice: 2490,
    yearlyPrice: 1990,
    desc: 'Для растущих медиа и команд контент-мейкеров',
    features: [
      'До 15 Telegram-каналов',
      'Неограниченные посты',
      'AI-помощник (расширенный)',
      'Автопостинг по расписанию',
      'Детальная аналитика',
      'Приоритетная поддержка',
    ],
    badge: 'Популярный',
  },
  {
    id: 'enterprise',
    name: 'Энтерпрайз',
    monthlyPrice: 6990,
    yearlyPrice: 5590,
    desc: 'Для агентств и крупных медиа-структур',
    features: [
      'Неограниченные каналы',
      'Неограниченные посты',
      'AI-помощник (Pro + обучение)',
      'Командный доступ',
      'Белая метка (white-label)',
      'Выделенный менеджер',
      'SLA 99,9%',
    ],
  },
]

export function SubscribePage() {
  const navigate = useNavigate()
  const [billing, setBilling] = useState<BillingType>('yearly')
  const [selectedPlanId, setSelectedPlanId] = useState('pro')
  const [step, setStep] = useState<StepType>('plan')
  const [isPaying, setIsPaying] = useState(false)

  const chosenPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0]
  const price = billing === 'yearly' ? chosenPlan.yearlyPrice : chosenPlan.monthlyPrice
  const savings = Math.round(100 - (chosenPlan.yearlyPrice / chosenPlan.monthlyPrice) * 100)


  const handlePay = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setIsPaying(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsPaying(false)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-14 items-center gap-4 border-b border-border px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
            style={{ background: TEAL }}
          >
            <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
              <path
                d="M1.5 6.5L4.5 9.5L11.5 2.5"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold">PostPilot</span>
        </Link>

        <div className="ml-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn('flex items-center gap-1 font-medium', step === 'plan' ? 'text-foreground' : '')}>
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-semibold"
              style={step === 'plan' || step === 'payment' ? { background: TEAL, borderColor: TEAL, color: 'white' } : undefined}
            >
              1
            </span>
            Тариф
          </span>
          <ChevronRight size={13} className="text-border" />
          <span className={cn('flex items-center gap-1 font-medium', step === 'payment' ? 'text-foreground' : '')}>
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-semibold"
              style={step === 'payment' ? { background: TEAL, borderColor: TEAL, color: 'white' } : undefined}
            >
              2
            </span>
            Оплата
          </span>
        </div>

        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock size={11} />
          Безопасная оплата
        </div>
      </header>

      {step === 'plan' ? (
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="mb-10 text-center">
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-balance">Выберите тариф</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              14 дней бесплатно на любом тарифе. Карта не нужна.
            </p>
            <div className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/40 p-1">
              <button
                onClick={() => setBilling('monthly')}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                  billing === 'monthly' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Ежемесячно
              </button>
              <button
                onClick={() => setBilling('yearly')}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                  billing === 'yearly' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Ежегодно
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{ background: 'oklch(0.90 0.06 200)', color: TEAL }}
                >
                  −{savings}%
                </span>
              </button>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {plans.map((plan) => {
              const planPrice = billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
              const isSelected = selectedPlanId === plan.id

              return (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={cn(
                    'relative rounded-xl border bg-card p-6 text-left transition-all',
                    isSelected ? 'border-[oklch(0.420_0.095_200)] shadow-sm' : 'border-border hover:border-muted-foreground/40',
                  )}
                  style={isSelected ? { background: 'oklch(0.990 0.004 200)' } : undefined}
                >
                  {plan.badge ? (
                    <span
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                      style={{ background: TEAL, color: 'white' }}
                    >
                      {plan.badge}
                    </span>
                  ) : null}

                  <div
                    className={cn(
                      'absolute top-4 right-4 flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all',
                      isSelected ? 'border-[oklch(0.420_0.095_200)]' : 'border-border',
                    )}
                    style={isSelected ? { background: TEAL } : undefined}
                  >
                    {isSelected ? <div className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                  </div>

                  <p className="mb-1 text-sm font-semibold">{plan.name}</p>
                  <p className="mb-4 text-xs leading-relaxed text-muted-foreground">{plan.desc}</p>

                  <div className="mb-1 flex items-end gap-1">
                    <span className="text-2xl font-bold tracking-tight">
                      {planPrice.toLocaleString('ru')} ₽
                    </span>
                    <span className="mb-0.5 text-xs text-muted-foreground">/ мес</span>
                  </div>

                  {billing === 'yearly' ? (
                    <p className="mb-4 text-[11px] text-muted-foreground">
                      Списывается {(planPrice * 12).toLocaleString('ru')} ₽ в год
                    </p>
                  ) : (
                    <div className="mb-4" />
                  )}

                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Check size={12} className="mt-0.5 shrink-0" style={{ color: TEAL }} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              )
            })}
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => setStep('payment')}
              className="h-11 rounded-lg px-10 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'oklch(0.130 0.010 255)' }}
            >
              Продолжить — {chosenPlan.name}
            </button>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap size={11} style={{ color: TEAL }} />
              14 дней бесплатного доступа. Отмена в любой момент.
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 px-4 py-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h1 className="mb-1 text-xl font-bold tracking-tight">Данные для оплаты</h1>
            <p className="mb-7 text-sm text-muted-foreground">
              Оплата списывается безопасно через защищённое соединение.
            </p>

            <form onSubmit={handlePay} className="space-y-5">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Имя на карте</span>
                <input
                  placeholder="IVAN PETROV"
                  required
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm uppercase outline-none focus-visible:ring-1"
                  style={{ '--tw-ring-color': TEAL } as React.CSSProperties}
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Номер карты</span>
                <div className="relative">
                  <input
                    placeholder="0000 0000 0000 0000"
                    required
                    maxLength={19}
                    className="h-10 w-full rounded-md border border-border bg-background px-3 pr-10 text-sm outline-none focus-visible:ring-1"
                    style={{ '--tw-ring-color': TEAL } as React.CSSProperties}
                    onChange={(event) => {
                      const numeric = event.target.value.replace(/\D/g, '').slice(0, 16)
                      event.target.value = numeric.replace(/(.{4})/g, '$1 ').trim()
                    }}
                  />
                  <CreditCard
                    size={15}
                    className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Срок действия</span>
                  <input
                    placeholder="ММ / ГГ"
                    required
                    maxLength={7}
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-1"
                    style={{ '--tw-ring-color': TEAL } as React.CSSProperties}
                    onChange={(event) => {
                      const numeric = event.target.value.replace(/\D/g, '').slice(0, 4)
                      event.target.value = numeric.length > 2 ? `${numeric.slice(0, 2)} / ${numeric.slice(2)}` : numeric
                    }}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">CVC / CVV</span>
                  <input
                    placeholder="•••"
                    required
                    maxLength={4}
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-1"
                    style={{ '--tw-ring-color': TEAL } as React.CSSProperties}
                  />
                </label>
              </div>

              <div className="space-y-3 pt-1">
                <button
                  type="submit"
                  disabled={isPaying}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                  style={{ background: 'oklch(0.130 0.010 255)' }}
                >
                  <Lock size={13} />
                  {isPaying ? 'Обрабатываем платёж...' : `Оплатить ${price.toLocaleString('ru')} ₽`}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('plan')}
                  className="h-9 w-full rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  ← Изменить тариф
                </button>
              </div>
            </form>

            <div className="mt-6 flex items-center gap-3 border-t border-border pt-5 text-xs text-muted-foreground">
              <Lock size={12} />
              <span>Данные карты защищены шифрованием TLS 1.3. Мы не храним реквизиты.</span>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-6 rounded-xl border border-border bg-card p-6">
              <p className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Итог заказа</p>

              <div className="mb-1 flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">{chosenPlan.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {billing === 'yearly' ? 'Ежегодная подписка' : 'Ежемесячная подписка'}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {(billing === 'yearly' ? price * 12 : price).toLocaleString('ru')} ₽
                </p>
              </div>

              {billing === 'yearly' ? (
                <div className="mb-4 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Экономия за год</span>
                  <span style={{ color: TEAL }} className="font-medium">
                    −{((chosenPlan.monthlyPrice - chosenPlan.yearlyPrice) * 12).toLocaleString('ru')} ₽
                  </span>
                </div>
              ) : null}

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm font-semibold">Сегодня</span>
                <span className="text-sm font-semibold">0 ₽</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Спишем {price.toLocaleString('ru')} ₽ через 14 дней
              </p>

              <div className="mt-5 space-y-2.5">
                {chosenPlan.features.slice(0, 4).map((feature) => (
                  <div key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check size={12} className="mt-0.5 shrink-0" style={{ color: TEAL }} />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
