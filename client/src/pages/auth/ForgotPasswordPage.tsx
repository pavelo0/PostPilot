import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    setIsLoading(false)
    setIsSent(true)
  }

  if (isSent) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-full max-w-sm text-center">
          <div
            className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: 'oklch(0.420 0.095 200 / 0.12)' }}
          >
            <CheckCircle2 size={22} style={{ color: 'oklch(0.420 0.095 200)' }} />
          </div>
          <h1 className="mb-2 text-xl font-bold tracking-tight">Письмо отправлено</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Мы отправили ссылку для сброса пароля на <strong>{email}</strong>.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Вернуться ко входу
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-1.5 text-2xl font-bold tracking-tight">Восстановление пароля</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Укажите email, привязанный к аккаунту. Мы отправим ссылку для сброса.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Email</span>
            <Input
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-10 rounded-md px-3 text-sm focus-visible:ring-1"
              style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
            />
          </label>

          <Button
            type="submit"
            disabled={isLoading}
            variant="primary"
            size="md"
            className="h-10 w-full disabled:opacity-60"
          >
            {isLoading ? 'Отправляем...' : 'Отправить ссылку'}
          </Button>
        </form>

        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Вернуться ко входу
        </Link>
      </div>
    </div>
  )
}
