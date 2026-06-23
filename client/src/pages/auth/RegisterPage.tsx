import { Check, Eye, EyeOff } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type PasswordCheck = {
  label: string
  isValid: boolean
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')

  const checks = useMemo<PasswordCheck[]>(
    () => [
      { label: 'Минимум 8 символов', isValid: password.length >= 8 },
      { label: 'Прописные и строчные буквы', isValid: /[A-Z]/.test(password) && /[a-z]/.test(password) },
      { label: 'Хотя бы одна цифра', isValid: /\d/.test(password) },
    ],
    [password],
  )


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    setIsLoading(false)
    navigate('/login')
  }

  return (
    <div className="py-12">
      <h1 className="mb-1.5 text-2xl font-bold tracking-tight">Создать аккаунт</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Уже есть аккаунт?{' '}
        <Link
          to="/login"
          className="font-medium underline underline-offset-4 transition-colors hover:text-foreground"
          style={{ color: 'oklch(0.420 0.095 200)' }}
        >
          Войти
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Имя</span>
            <Input
              type="text"
              placeholder="Иван"
              required
              className="h-10 rounded-md px-3 text-sm focus-visible:ring-1"
              style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Фамилия</span>
            <Input
              type="text"
              placeholder="Петров"
              className="h-10 rounded-md px-3 text-sm focus-visible:ring-1"
              style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
            />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Email</span>
          <Input
            type="email"
            placeholder="you@example.com"
            required
            className="h-10 rounded-md px-3 text-sm focus-visible:ring-1"
            style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
          />
        </label>

        <div className="space-y-1.5">
          <span className="text-sm font-medium">Пароль</span>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Придумайте надежный пароль"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-10 rounded-md px-3 pr-10 text-sm focus-visible:ring-1"
              style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
            />
            <Button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              variant="ghost"
              size="icon-sm"
              className="absolute top-1/2 right-1 -translate-y-1/2"
              aria-label="Переключить видимость пароля"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </Button>
          </div>

          {password.length > 0 ? (
            <div className="mt-2 space-y-1.5">
              {checks.map((check) => (
                <div key={check.label} className="flex items-center gap-2 text-xs">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      check.isValid
                        ? 'border-[oklch(0.420_0.095_200)] bg-[oklch(0.420_0.095_200)]'
                        : 'border-border'
                    }`}
                  >
                    {check.isValid ? <Check size={9} className="text-white" /> : null}
                  </div>
                  <span className={check.isValid ? 'text-foreground' : 'text-muted-foreground'}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          variant="primary"
          size="md"
          className="h-10 w-full disabled:opacity-60"
        >
          {isLoading ? 'Создаем аккаунт...' : 'Зарегистрироваться'}
        </Button>
      </form>
    </div>
  )
}
