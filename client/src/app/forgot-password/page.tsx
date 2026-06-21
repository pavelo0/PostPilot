'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-10">
          <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: 'oklch(0.420 0.095 200)' }}>
            <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
              <path d="M1.5 6.5L4.5 9.5L11.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-semibold text-sm">PostPilot</span>
        </Link>

        {!sent ? (
          <>
            <h1 className="text-2xl font-bold tracking-tight mb-1.5">Восстановление пароля</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Укажите email, привязанный к аккаунту. Мы отправим ссылку для сброса.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-md text-sm font-medium text-background transition-opacity disabled:opacity-60"
                style={{ background: 'oklch(0.130 0.010 255)' }}
              >
                {loading ? 'Отправляем...' : 'Отправить ссылку'}
              </button>
            </form>

            <Link href="/login" className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={14} />
              Вернуться ко входу
            </Link>
          </>
        ) : (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'oklch(0.420 0.095 200 / 0.12)' }}>
              <CheckCircle2 size={22} style={{ color: 'oklch(0.420 0.095 200)' }} />
            </div>
            <h1 className="text-xl font-bold tracking-tight mb-2">Письмо отправлено</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Мы отправили ссылку для сброса пароля на <strong>{email}</strong>. Проверьте входящие (и папку «Спам»).
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={14} />
              Вернуться ко входу
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
