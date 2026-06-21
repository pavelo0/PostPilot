'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, ChevronRight, CreditCard, Lock, Zap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const TEAL = 'oklch(0.420 0.095 200)'

const plans = [
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
    cta: 'Начать',
    highlight: false,
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
    cta: 'Выбрать Pro',
    highlight: true,
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
    cta: 'Связаться',
    highlight: false,
  },
]

const LOGO = (
  <Link href="/" className="flex items-center gap-2.5">
    <div
      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
      style={{ background: TEAL }}
    >
      <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
        <path d="M1.5 6.5L4.5 9.5L11.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <span className="font-semibold text-sm">PostPilot</span>
  </Link>
)

export default function SubscribePage() {
  const router = useRouter()
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')
  const [selected, setSelected] = useState<string>('pro')
  const [step, setStep] = useState<'plan' | 'payment'>('plan')
  const [payLoading, setPayLoading] = useState(false)

  const chosenPlan = plans.find((p) => p.id === selected)!
  const price = billing === 'yearly' ? chosenPlan.yearlyPrice : chosenPlan.monthlyPrice
  const savings = Math.round(100 - (chosenPlan.yearlyPrice / chosenPlan.monthlyPrice) * 100)

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setPayLoading(true)
    await new Promise((r) => setTimeout(r, 1400))
    setPayLoading(false)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center px-6 gap-4">
        {LOGO}
        <div className="flex items-center gap-1.5 ml-4 text-xs text-muted-foreground">
          <span
            className={cn('flex items-center gap-1 font-medium transition-colors', step === 'plan' ? 'text-foreground' : '')}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold border"
              style={step === 'plan' || step === 'payment' ? { background: TEAL, borderColor: TEAL, color: 'white' } : {}}
            >
              1
            </span>
            Тариф
          </span>
          <ChevronRight size={13} className="text-border" />
          <span
            className={cn('flex items-center gap-1 font-medium transition-colors', step === 'payment' ? 'text-foreground' : '')}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold border"
              style={step === 'payment' ? { background: TEAL, borderColor: TEAL, color: 'white' } : {}}
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

      {step === 'plan' && (
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Title + billing toggle */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold tracking-tight mb-2 text-balance">Выберите тариф</h1>
            <p className="text-sm text-muted-foreground mb-6">14 дней бесплатно на любом тарифе. Карта не нужна.</p>
            {/* Toggle */}
            <div className="inline-flex items-center rounded-full border border-border bg-secondary/40 p-1 gap-1">
              <button
                onClick={() => setBilling('monthly')}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                  billing === 'monthly' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Ежемесячно
              </button>
              <button
                onClick={() => setBilling('yearly')}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5',
                  billing === 'yearly' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Ежегодно
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'oklch(0.90 0.06 200)', color: TEAL }}
                >
                  −{savings}%
                </span>
              </button>
            </div>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {plans.map((plan) => {
              const planPrice = billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
              const isSelected = selected === plan.id
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelected(plan.id)}
                  className={cn(
                    'relative text-left rounded-xl border p-6 transition-all focus:outline-none',
                    isSelected ? 'border-[oklch(0.420_0.095_200)] shadow-sm' : 'border-border hover:border-muted-foreground/40 bg-card'
                  )}
                  style={isSelected ? { background: 'oklch(0.990 0.004 200)' } : {}}
                >
                  {plan.badge && (
                    <Badge
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] px-2.5 py-0.5 font-semibold"
                      style={{ background: TEAL, color: 'white', border: 'none' }}
                    >
                      {plan.badge}
                    </Badge>
                  )}

                  {/* Selection indicator */}
                  <div
                    className={cn(
                      'absolute top-4 right-4 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all',
                      isSelected ? 'border-[oklch(0.420_0.095_200)]' : 'border-border'
                    )}
                    style={isSelected ? { background: TEAL } : {}}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>

                  <p className="text-sm font-semibold mb-1">{plan.name}</p>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{plan.desc}</p>

                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-2xl font-bold tracking-tight">{planPrice.toLocaleString('ru')} ₽</span>
                    <span className="text-xs text-muted-foreground mb-0.5">/ мес</span>
                  </div>
                  {billing === 'yearly' && (
                    <p className="text-[11px] text-muted-foreground mb-4">
                      Списывается {(planPrice * 12).toLocaleString('ru')} ₽ в год
                    </p>
                  )}
                  {billing === 'monthly' && <div className="mb-4" />}

                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Check size={12} className="mt-0.5 shrink-0" style={{ color: TEAL }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              )
            })}
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => setStep('payment')}
              className="h-11 px-10 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'oklch(0.130 0.010 255)' }}
            >
              Продолжить — {chosenPlan.name}
            </button>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Zap size={11} style={{ color: TEAL }} />
              14 дней бесплатного доступа. Отмена в любой момент.
            </p>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Payment form */}
          <div className="lg:col-span-3">
            <h1 className="text-xl font-bold tracking-tight mb-1">Данные для оплаты</h1>
            <p className="text-sm text-muted-foreground mb-7">Оплата списывается безопасно через защищённое соединение.</p>

            <form onSubmit={handlePay} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="cardholder" className="text-sm font-medium">Имя на карте</Label>
                <Input id="cardholder" placeholder="IVAN PETROV" required className="h-10 uppercase" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cardnumber" className="text-sm font-medium">Номер карты</Label>
                <div className="relative">
                  <Input
                    id="cardnumber"
                    placeholder="0000 0000 0000 0000"
                    required
                    maxLength={19}
                    className="h-10 pr-10"
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 16)
                      e.target.value = v.replace(/(.{4})/g, '$1 ').trim()
                    }}
                  />
                  <CreditCard size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="expiry" className="text-sm font-medium">Срок действия</Label>
                  <Input
                    id="expiry"
                    placeholder="ММ / ГГ"
                    required
                    maxLength={7}
                    className="h-10"
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                      e.target.value = v.length > 2 ? `${v.slice(0, 2)} / ${v.slice(2)}` : v
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cvc" className="text-sm font-medium">CVC / CVV</Label>
                  <Input id="cvc" placeholder="•••" required maxLength={4} className="h-10" />
                </div>
              </div>

              <div className="pt-1 space-y-3">
                <button
                  type="submit"
                  disabled={payLoading}
                  className="w-full h-11 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: 'oklch(0.130 0.010 255)' }}
                >
                  <Lock size={13} />
                  {payLoading ? 'Обрабатываем платёж...' : `Оплатить ${price.toLocaleString('ru')} ₽`}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('plan')}
                  className="w-full h-9 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Изменить тариф
                </button>
              </div>
            </form>

            <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-5">
              <Lock size={12} />
              <span>Данные карты защищены шифрованием TLS 1.3. Мы не храним реквизиты.</span>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6 sticky top-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Итог заказа</p>

              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-sm font-semibold">{chosenPlan.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{billing === 'yearly' ? 'Ежегодная подписка' : 'Ежемесячная подписка'}</p>
                </div>
                <p className="text-sm font-semibold">
                  {(billing === 'yearly' ? price * 12 : price).toLocaleString('ru')} ₽
                </p>
              </div>

              {billing === 'yearly' && (
                <div className="flex items-center justify-between text-xs mb-4">
                  <span className="text-muted-foreground">Экономия за год</span>
                  <span style={{ color: TEAL }} className="font-medium">
                    −{((chosenPlan.monthlyPrice - chosenPlan.yearlyPrice) * 12).toLocaleString('ru')} ₽
                  </span>
                </div>
              )}

              <div className="border-t border-border pt-4 mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold">Сегодня</span>
                <span className="text-sm font-semibold">0 ₽</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Спишем {price.toLocaleString('ru')} ₽ через 14 дней
              </p>

              <div className="mt-5 space-y-2.5">
                {chosenPlan.features.slice(0, 4).map((f) => (
                  <div key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check size={12} className="mt-0.5 shrink-0" style={{ color: TEAL }} />
                    {f}
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
