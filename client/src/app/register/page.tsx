'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Check } from 'lucide-react'

const checks = [
  'Минимум 8 символов',
  'Прописные и строчные буквы',
  'Хотя бы одна цифра',
]

export default function RegisterPage() {
  const router = useRouter()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pw, setPw] = useState('')

  const pwChecks = [pw.length >= 8, /[A-Z]/.test(pw) && /[a-z]/.test(pw), /\d/.test(pw)]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    router.push('/subscribe')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="flex-1 flex flex-col justify-between px-8 py-8 max-w-[480px]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: 'oklch(0.420 0.095 200)' }}>
            <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
              <path d="M1.5 6.5L4.5 9.5L11.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-semibold text-sm">PostPilot</span>
        </Link>

        <div className="py-12">
          <h1 className="text-2xl font-bold tracking-tight mb-1.5">Создать аккаунт</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="font-medium underline underline-offset-4 hover:text-foreground transition-colors" style={{ color: 'oklch(0.420 0.095 200)' }}>
              Войти
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-sm font-medium">Имя</Label>
                <Input id="firstName" placeholder="Иван" required className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-sm font-medium">Фамилия</Label>
                <Input id="lastName" placeholder="Петров" className="h-10" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required className="h-10" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Придумайте надёжный пароль"
                  required
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {pw.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {checks.map((c, i) => (
                    <div key={c} className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${pwChecks[i] ? 'border-[oklch(0.420_0.095_200)] bg-[oklch(0.420_0.095_200)]' : 'border-border'}`}>
                        {pwChecks[i] && <Check size={9} className="text-white" />}
                      </div>
                      <span className={pwChecks[i] ? 'text-foreground' : 'text-muted-foreground'}>{c}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="channel" className="text-sm font-medium">
                Telegram-канал <span className="text-muted-foreground font-normal">(необязательно)</span>
              </Label>
              <Input id="channel" placeholder="@myawesomechannel" className="h-10" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-md text-sm font-medium text-background transition-opacity disabled:opacity-60"
              style={{ background: 'oklch(0.130 0.010 255)' }}
            >
              {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>

        <p className="text-xs text-muted-foreground">
          Создавая аккаунт, вы соглашаетесь с{' '}
          <Link href="#" className="underline underline-offset-4 hover:text-foreground">условиями использования</Link>
          {' '}и{' '}
          <Link href="#" className="underline underline-offset-4 hover:text-foreground">политикой конфиденциальности</Link>.
        </p>
      </div>

      {/* Right panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 border-l border-border bg-secondary/30">
        <div />
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Что вы получаете</p>
          {[
            { title: 'AI-помощник', desc: 'Генерация и редактирование постов за секунды' },
            { title: 'Автопубликация', desc: 'Бот публикует по расписанию без вашего участия' },
            { title: 'Аналитика', desc: 'Детальная статистика по каждому посту и каналу' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: 'oklch(0.420 0.095 200)' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.420 0.095 200)' }} />
              </div>
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <span>14 дней бесплатно</span>
          <span className="w-px h-3 bg-border" />
          <span>Без привязки карты</span>
        </div>
      </div>
    </div>
  )
}
