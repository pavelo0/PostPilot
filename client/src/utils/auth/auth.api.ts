export type AuthUser = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  emailVerifiedAt: string | null
  createdAt: string
}

export type AuthResponse = {
  user: AuthUser
}

export type RegisterRequest = {
  firstName: string
  lastName: string
  email: string
  password: string
}

export type RegisterStartResponse = {
  requiresVerification: true
  email: string
  resendAvailableInSeconds: number
  verificationCode?: string
}

export type VerifyRegisterRequest = {
  email: string
  code: string
}

export type ResendRegisterCodeRequest = {
  email: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type ApiValidationError = {
  field: string
  message: string
}

type ApiErrorPayload = {
  message?:
    | string
    | {
        message?: string
        errors?: ApiValidationError[]
      }
  errors?: ApiValidationError[]
}

export class ApiError extends Error {
  readonly status: number
  readonly validationErrors: ApiValidationError[]
  readonly retryAfterSeconds: number | null

  constructor(
    message: string,
    status: number,
    validationErrors: ApiValidationError[],
    retryAfterSeconds: number | null,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.validationErrors = validationErrors
    this.retryAfterSeconds = retryAfterSeconds
  }
}

const parseErrorPayload = (payload: unknown): ApiErrorPayload | null => {
  if (!payload || typeof payload !== 'object') {
    return null
  }
  return payload as ApiErrorPayload
}

const resolveErrorMessage = (payload: ApiErrorPayload | null): string => {
  const message = payload?.message
  if (typeof message === 'string' && message.length > 0) {
    return message
  }
  if (message && typeof message === 'object' && typeof message.message === 'string') {
    return message.message
  }
  return 'Request failed'
}

const resolveValidationErrors = (
  payload: ApiErrorPayload | null,
): ApiValidationError[] => {
  const nestedErrors = payload?.message
  if (nestedErrors && typeof nestedErrors === 'object' && Array.isArray(nestedErrors.errors)) {
    return nestedErrors.errors
  }
  if (Array.isArray(payload?.errors)) {
    return payload.errors
  }
  return []
}

const resolveRetryAfterSeconds = (payload: ApiErrorPayload | null): number | null => {
  const message = payload?.message
  if (
    message &&
    typeof message === 'object' &&
    typeof (message as { retryAfterSeconds?: unknown }).retryAfterSeconds === 'number'
  ) {
    return (message as { retryAfterSeconds: number }).retryAfterSeconds
  }
  return null
}

const request = async <TResponse>(
  path: string,
  init: RequestInit,
): Promise<TResponse> => {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  const payload = parseErrorPayload(await response.json().catch(() => null))
  if (!response.ok) {
    throw new ApiError(
      resolveErrorMessage(payload),
      response.status,
      resolveValidationErrors(payload),
      resolveRetryAfterSeconds(payload),
    )
  }

  return payload as TResponse
}

export const register = async (
  body: RegisterRequest,
): Promise<RegisterStartResponse> =>
  request<RegisterStartResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const verifyRegister = async (
  body: VerifyRegisterRequest,
): Promise<AuthResponse> =>
  request<AuthResponse>('/api/auth/register/verify', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const login = async (body: LoginRequest): Promise<AuthResponse> =>
  request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const logout = async (): Promise<{ success: true }> =>
  request<{ success: true }>('/api/auth/logout', {
    method: 'POST',
  })

export const resendRegisterCode = async (
  body: ResendRegisterCodeRequest,
): Promise<RegisterStartResponse> =>
  request<RegisterStartResponse>('/api/auth/register/resend', {
    method: 'POST',
    body: JSON.stringify(body),
  })
