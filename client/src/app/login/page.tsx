'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — form */}
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
          <h1 className="text-2xl font-bold tracking-tight mb-1.5">Вход в систему</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Нет аккаунта?{' '}
            <Link href="/register" className="font-medium underline underline-offset-4 hover:text-foreground transition-colors" style={{ color: 'oklch(0.420 0.095 200)' }}>
              Зарегистрироваться
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                className="h-10 bg-background border-border focus-visible:ring-1"
                style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Пароль</Label>
                <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
                  Забыли пароль?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  className="h-10 bg-background border-border pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-md text-sm font-medium text-background transition-opacity disabled:opacity-60"
              style={{ background: 'oklch(0.130 0.010 255)' }}
            >
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">или</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="h-10 rounded-md border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors">
              Google
            </button>
            <button className="h-10 rounded-md border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors">
              Telegram
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Продолжая, вы принимаете{' '}
          <Link href="#" className="underline underline-offset-4 hover:text-foreground">условия использования</Link>
          {' '}и{' '}
          <Link href="#" className="underline underline-offset-4 hover:text-foreground">политику конфиденциальности</Link>.
        </p>
      </div>

      {/* Right panel — brand */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 border-l border-border bg-secondary/30">
        <div />
        <div>
          <blockquote className="text-xl font-medium leading-snug tracking-tight text-balance mb-6">
            &ldquo;PostPilot сократил время на контент-менеджмент нашего канала с 4 часов до 20 минут в день.&rdquo;
          </blockquote>
          <div>
            <p className="text-sm font-medium">Алексей Смирнов</p>
            <p className="text-sm text-muted-foreground">Основатель, @techchannel</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <span>10 000+ публикаций</span>
          <span className="w-px h-3 bg-border" />
          <span>98% uptime</span>
          <span className="w-px h-3 bg-border" />
          <span>14 дней бесплатно</span>
        </div>
      </div>
    </div>
  )
}
