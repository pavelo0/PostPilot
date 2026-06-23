import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    setIsLoading(false)
  }

  return (
    <div className="py-12">
      <h1 className="mb-1.5 text-2xl font-bold tracking-tight">Вход в систему</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Нет аккаунта?{' '}
        <Link
          to="/register"
          className="font-medium underline underline-offset-4 transition-colors hover:text-foreground"
          style={{ color: 'oklch(0.420 0.095 200)' }}
        >
          Зарегистрироваться
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            required
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition focus-visible:ring-1"
            style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
          />
        </label>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Пароль</span>
            <Link
              to="/forgot-password"
              className="text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Забыли пароль?
            </Link>
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              className="h-10 w-full rounded-md border border-border bg-background px-3 pr-10 text-sm outline-none transition focus-visible:ring-1"
              style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Переключить видимость пароля"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="h-10 w-full rounded-md text-sm font-medium text-background transition-opacity disabled:opacity-60"
          style={{ background: 'oklch(0.130 0.010 255)' }}
        >
          {isLoading ? 'Входим...' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
