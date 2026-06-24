import { Eye, EyeOff } from 'lucide-react'
import {
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError, login, type ApiValidationError } from '@/utils/auth/auth.api'
import {
  loginSchema,
  type LoginFormData,
  type LoginFormErrors,
} from '@/utils/auth/login.schema'

export function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [requiresVerification, setRequiresVerification] = useState(false)
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [formErrors, setFormErrors] = useState<LoginFormErrors>({})

  const handleFieldChange =
    (field: keyof LoginFormData) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      const nextValue = event.target.value
      setFormData((currentValues) => ({
        ...currentValues,
        [field]: nextValue,
      }))
      setFormErrors((currentErrors) => ({
        ...currentErrors,
        [field]: undefined,
      }))
      setSubmitError(null)
      setRequiresVerification(false)
    }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const validationResult = loginSchema.safeParse(formData)
    if (!validationResult.success) {
      const nextErrors = validationResult.error.issues.reduce<LoginFormErrors>(
        (collectedErrors, issue) => {
          const field = issue.path[0]
          if (!isLoginFormField(field)) {
            return collectedErrors
          }
          if (collectedErrors[field]) {
            return collectedErrors
          }
          return {
            ...collectedErrors,
            [field]: issue.message,
          }
        },
        {},
      )
      setFormErrors(nextErrors)
      return
    }

    setIsLoading(true)
    setSubmitError(null)
    setRequiresVerification(false)
    try {
      await login(validationResult.data)
      navigate('/dashboard')
    } catch (error) {
      if (error instanceof ApiError) {
        const nextErrors = error.validationErrors.reduce<LoginFormErrors>(
          (collectedErrors, issue) =>
            applyValidationErrorToLoginForm(collectedErrors, issue),
          {},
        )
        setFormErrors(nextErrors)
        setSubmitError(error.message)
        setRequiresVerification(error.message === 'Email is not verified')
      } else {
        setSubmitError('Не удалось выполнить вход. Попробуйте снова.')
      }
    } finally {
      setIsLoading(false)
    }
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

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Email</span>
          <Input
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleFieldChange('email')}
            aria-invalid={Boolean(formErrors.email)}
            className="h-10 rounded-md px-3 text-sm focus-visible:ring-1"
            style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as CSSProperties}
          />
          {formErrors.email ? (
            <p className="text-xs text-destructive">{formErrors.email}</p>
          ) : null}
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
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleFieldChange('password')}
              aria-invalid={Boolean(formErrors.password)}
              className="h-10 rounded-md px-3 pr-10 text-sm focus-visible:ring-1"
              style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as CSSProperties}
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
          {formErrors.password ? (
            <p className="text-xs text-destructive">{formErrors.password}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          variant="primary"
          size="md"
          className="h-10 w-full disabled:opacity-60"
        >
          {isLoading ? 'Входим...' : 'Войти'}
        </Button>

        {submitError ? (
          <p className="text-center text-xs text-destructive">{submitError}</p>
        ) : null}

        {requiresVerification ? (
          <p className="text-center text-xs text-muted-foreground">
            Подтвердите email перед входом.{' '}
            <Link
              to={`/verify-email?email=${encodeURIComponent(formData.email.trim())}`}
              className="underline underline-offset-4 hover:text-foreground"
            >
              Перейти к подтверждению
            </Link>
          </p>
        ) : null}
      </form>
    </div>
  )
}

const isLoginFormField = (field: unknown): field is keyof LoginFormData =>
  field === 'email' || field === 'password'

const applyValidationErrorToLoginForm = (
  currentErrors: LoginFormErrors,
  issue: ApiValidationError,
): LoginFormErrors => {
  if (!isLoginFormField(issue.field)) {
    return currentErrors
  }

  if (currentErrors[issue.field]) {
    return currentErrors
  }

  return {
    ...currentErrors,
    [issue.field]: issue.message,
  }
}
