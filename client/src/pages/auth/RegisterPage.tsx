import { Check, Eye, EyeOff } from 'lucide-react'
import {
  useMemo,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
} from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ApiError,
  register,
  type ApiValidationError,
} from '@/utils/auth/auth.api'
import {
  registerSchema,
  type RegisterFormData,
  type RegisterFormErrors,
} from '@/utils/auth/register.schema'

type PasswordCheck = {
  label: string
  isValid: boolean
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [formErrors, setFormErrors] = useState<RegisterFormErrors>({})

  const checks = useMemo<PasswordCheck[]>(
    () => [
      { label: 'Минимум 8 символов', isValid: formData.password.length >= 8 },
      {
        label: 'Прописные и строчные буквы',
        isValid:
          /[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password),
      },
      { label: 'Хотя бы одна цифра', isValid: /\d/.test(formData.password) },
    ],
    [formData.password],
  )

  const handleFieldChange =
    (field: keyof RegisterFormData) =>
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
    }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const validationResult = registerSchema.safeParse(formData)
    if (!validationResult.success) {
      const nextErrors = validationResult.error.issues.reduce<RegisterFormErrors>(
        (collectedErrors, issue) => {
          const field = issue.path[0]
          if (typeof field !== 'string') {
            return collectedErrors
          }
          if (collectedErrors[field as keyof RegisterFormData]) {
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
        const nextErrors = error.validationErrors.reduce<RegisterFormErrors>(
          (collectedErrors, issue) =>
            applyValidationErrorToRegisterForm(collectedErrors, issue),
          {},
        )
        setFormErrors(nextErrors)
        setSubmitError(error.message)
      } else {
        setSubmitError('Не удалось отправить код подтверждения. Попробуйте снова.')
      }
    } finally {
      setIsLoading(false)
    }
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

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Имя</span>
            <Input
              type="text"
              placeholder="Иван"
              value={formData.firstName}
              onChange={handleFieldChange('firstName')}
              aria-invalid={Boolean(formErrors.firstName)}
              className="h-10 rounded-md px-3 text-sm focus-visible:ring-1"
              style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as CSSProperties}
            />
            {formErrors.firstName ? (
              <p className="text-xs text-destructive">{formErrors.firstName}</p>
            ) : null}
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Фамилия</span>
            <Input
              type="text"
              placeholder="Петров"
              value={formData.lastName}
              onChange={handleFieldChange('lastName')}
              aria-invalid={Boolean(formErrors.lastName)}
              className="h-10 rounded-md px-3 text-sm focus-visible:ring-1"
              style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as CSSProperties}
            />
            {formErrors.lastName ? (
              <p className="text-xs text-destructive">{formErrors.lastName}</p>
            ) : null}
          </label>
        </div>

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
          <span className="text-sm font-medium">Пароль</span>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Придумайте надежный пароль"
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

          {formData.password.length > 0 ? (
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
          {isLoading ? 'Отправляем код...' : 'Зарегистрироваться'}
        </Button>
        {submitError ? (
          <p className="text-center text-xs text-destructive">{submitError}</p>
        ) : null}
      </form>
    </div>
  )
}

const applyValidationErrorToRegisterForm = (
  currentErrors: RegisterFormErrors,
  issue: ApiValidationError,
): RegisterFormErrors => {
  if (!isRegisterFormField(issue.field)) {
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

const isRegisterFormField = (
  field: string,
): field is keyof RegisterFormData =>
  field === 'firstName' ||
  field === 'lastName' ||
  field === 'email' ||
  field === 'password'
