import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader } from '@/components/ui/loader'
import { setAuthenticatedUser } from '@/store/auth.slice'
import { useAppDispatch } from '@/store/hooks'
import { ApiError, login, type ApiValidationError } from '@/utils/auth/auth.api'
import {
  loginSchema,
  type LoginFormData,
} from '@/utils/auth/login.schema'

export function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [requiresVerification, setRequiresVerification] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const emailValue = watch('email')

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError(null)
    setRequiresVerification(false)
    try {
      const response = await login(formData)
      dispatch(setAuthenticatedUser(response.user))
      navigate(resolveRedirectPath(searchParams.get('redirect')), { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        error.validationErrors.forEach((issue) => {
          applyValidationErrorToLoginForm(setError, issue)
        })
        setSubmitError(error.message)
        setRequiresVerification(error.message === 'Email is not verified')
      } else {
        setSubmitError('Не удалось выполнить вход. Попробуйте снова.')
      }
    }
  })

  return (
    <div className="py-12">
      <h1 className="mb-1.5 text-2xl font-bold tracking-tight">Вход в систему</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Нет аккаунта?{' '}
        <Link
          to="/register"
          className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-foreground"
        >
          Зарегистрироваться
        </Link>
      </p>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            className="h-10 rounded-md px-3 text-sm focus-visible:ring-1"
            style={{ '--tw-ring-color': 'var(--ring)' } as CSSProperties}
            {...register('email')}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Пароль</Label>
            <Link
              to="/forgot-password"
              className="text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Забыли пароль?
            </Link>
          </div>

          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              className="h-10 rounded-md px-3 pr-10 text-sm focus-visible:ring-1"
              style={{ '--tw-ring-color': 'var(--ring)' } as CSSProperties}
              {...register('password')}
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
          {errors.password ? (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          variant="primary"
          size="md"
          className="h-10 w-full disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader size="xs" />
              Входим...
            </>
          ) : (
            'Войти'
          )}
        </Button>

        {submitError ? (
          <p className="text-center text-xs text-destructive">{submitError}</p>
        ) : null}

        {requiresVerification ? (
          <p className="text-center text-xs text-muted-foreground">
            Подтвердите email перед входом.{' '}
            <Link
              to={`/verify-email?email=${encodeURIComponent(emailValue.trim())}`}
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

/**
 * Keeps login redirects on local routes only.
 */
const resolveRedirectPath = (rawRedirect: string | null): string => {
  if (!rawRedirect || !rawRedirect.startsWith('/')) {
    return '/dashboard'
  }

  if (rawRedirect.startsWith('//')) {
    return '/dashboard'
  }

  return rawRedirect
}

const applyValidationErrorToLoginForm = (
  setFieldError: (name: keyof LoginFormData, error: { message: string }) => void,
  issue: ApiValidationError,
): void => {
  if (issue.field !== 'email' && issue.field !== 'password') {
    return
  }

  setFieldError(issue.field, { message: issue.message })
}
