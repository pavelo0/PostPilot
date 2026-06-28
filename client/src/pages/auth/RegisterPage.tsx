import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Eye, EyeOff } from 'lucide-react'
import { useMemo, useState, type CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader } from '@/components/ui/loader'
import {
  ApiError,
  register,
  type ApiValidationError,
} from '@/utils/auth/auth.api'
import {
  registerSchema,
  type RegisterFormData,
} from '@/utils/auth/register.schema'

type PasswordCheck = {
  label: string
  isValid: boolean
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register: registerField,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  })

  const passwordValue = watch('password')

  const checks = useMemo<PasswordCheck[]>(
    () => [
      { label: 'Минимум 8 символов', isValid: passwordValue.length >= 8 },
      {
        label: 'Прописные и строчные буквы',
        isValid: /[A-Z]/.test(passwordValue) && /[a-z]/.test(passwordValue),
      },
      { label: 'Хотя бы одна цифра', isValid: /\d/.test(passwordValue) },
    ],
    [passwordValue],
  )

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError(null)
    try {
      const response = await register(formData)
      const verificationCode = response.verificationCode
      const searchParams = new URLSearchParams({
        email: response.email,
        resend_in: String(response.resendAvailableInSeconds),
      })
      if (verificationCode) {
        searchParams.set('code_hint', verificationCode)
      }
      navigate(`/verify-email?${searchParams.toString()}`)
    } catch (error) {
      if (error instanceof ApiError) {
        error.validationErrors.forEach((issue) => {
          applyValidationErrorToRegisterForm(setError, issue)
        })
        setSubmitError(error.message)
      } else {
        setSubmitError('Не удалось отправить код подтверждения. Попробуйте снова.')
      }
    }
  })

  return (
    <div className="py-12">
      <h1 className="mb-1.5 text-2xl font-bold tracking-tight">Создать аккаунт</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Уже есть аккаунт?{' '}
        <Link
          to="/login"
          className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-foreground"
        >
          Войти
        </Link>
      </p>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="register-first-name">Имя</Label>
            <Input
              id="register-first-name"
              type="text"
              placeholder="Иван"
              aria-invalid={Boolean(errors.firstName)}
              className="h-10 rounded-md px-3 text-sm focus-visible:ring-1"
              style={{ '--tw-ring-color': 'var(--ring)' } as CSSProperties}
              {...registerField('firstName')}
            />
            {errors.firstName ? (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="register-last-name">Фамилия</Label>
            <Input
              id="register-last-name"
              type="text"
              placeholder="Петров"
              aria-invalid={Boolean(errors.lastName)}
              className="h-10 rounded-md px-3 text-sm focus-visible:ring-1"
              style={{ '--tw-ring-color': 'var(--ring)' } as CSSProperties}
              {...registerField('lastName')}
            />
            {errors.lastName ? (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="register-email">Email</Label>
          <Input
            id="register-email"
            type="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            className="h-10 rounded-md px-3 text-sm focus-visible:ring-1"
            style={{ '--tw-ring-color': 'var(--ring)' } as CSSProperties}
            {...registerField('email')}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="register-password">Пароль</Label>
          <div className="relative">
            <Input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Придумайте надежный пароль"
              aria-invalid={Boolean(errors.password)}
              className="h-10 rounded-md px-3 pr-10 text-sm focus-visible:ring-1"
              style={{ '--tw-ring-color': 'var(--ring)' } as CSSProperties}
              {...registerField('password')}
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

          {passwordValue.length > 0 ? (
            <div className="mt-2 space-y-1.5">
              {checks.map((check) => (
                <div key={check.label} className="flex items-center gap-2 text-xs">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      check.isValid
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`}
                  >
                    {check.isValid ? <Check size={9} className="text-primary-foreground" /> : null}
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
          disabled={isSubmitting}
          variant="primary"
          size="md"
          className="h-10 w-full disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader size="xs" />
              Отправляем код...
            </>
          ) : (
            'Зарегистрироваться'
          )}
        </Button>
        {submitError ? (
          <p className="text-center text-xs text-destructive">{submitError}</p>
        ) : null}
      </form>
    </div>
  )
}

const applyValidationErrorToRegisterForm = (
  setFieldError: (
    name: keyof RegisterFormData,
    error: { message: string },
  ) => void,
  issue: ApiValidationError,
): void => {
  if (
    issue.field !== 'firstName' &&
    issue.field !== 'lastName' &&
    issue.field !== 'email' &&
    issue.field !== 'password'
  ) {
    return
  }

  setFieldError(issue.field, { message: issue.message })
}
