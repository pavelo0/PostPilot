import { ApiError } from '@/utils/auth/auth.api'

type ApiValidationError = {
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

export type BotHealthStatus = 'connected' | 'missing' | 'token_invalid'

export type ChannelBotAdminStatus = 'admin' | 'not_admin' | 'unknown' | 'check_failed'

export type BotChannelStatus = {
  id: string
  telegramUsername: string | null
  title: string | null
  telegramChatId: string
  adminStatus: ChannelBotAdminStatus
}

export type BotConnection = {
  configured: boolean
  tokenMask: string | null
  health: BotHealthStatus
  username: string | null
  connectedAt: string | null
  disconnectedAt: string | null
  progressConnectedOnce: boolean
  progressConnectedOnceAt: string | null
}

export type BotSetup = {
  bot: BotConnection
  channels: BotChannelStatus[]
}

export type ConnectedChannel = {
  id: string
  userId: string
  telegramChatId: string
  telegramUsername: string | null
  title: string | null
  botConnectedAt: string
  createdAt: string
  updatedAt: string
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

const resolveValidationErrors = (payload: ApiErrorPayload | null): ApiValidationError[] => {
  const nestedMessage = payload?.message
  if (nestedMessage && typeof nestedMessage === 'object' && Array.isArray(nestedMessage.errors)) {
    return nestedMessage.errors
  }
  if (Array.isArray(payload?.errors)) {
    return payload.errors
  }
  return []
}

const request = async <TResponse>(path: string, init: RequestInit): Promise<TResponse> => {
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
    throw new ApiError(resolveErrorMessage(payload), response.status, resolveValidationErrors(payload), null)
  }

  return payload as TResponse
}

export const getBotSetup = async (): Promise<BotSetup> => {
  const response = await request<{ setup: BotSetup }>('/api/bot/me', {
    method: 'GET',
  })
  return response.setup
}

export const connectBot = async (token: string): Promise<BotSetup> => {
  const response = await request<{ setup: BotSetup }>('/api/bot/connect', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
  return response.setup
}

export const disconnectBot = async (): Promise<BotSetup> => {
  const response = await request<{ setup: BotSetup }>('/api/bot/disconnect', {
    method: 'DELETE',
  })
  return response.setup
}

export const recheckBot = async (): Promise<BotSetup> => {
  const response = await request<{ setup: BotSetup }>('/api/bot/recheck', {
    method: 'POST',
  })
  return response.setup
}

export const connectChannel = async (channel: string): Promise<ConnectedChannel> => {
  const response = await request<{ channel: ConnectedChannel }>('/api/channels/connect', {
    method: 'POST',
    body: JSON.stringify({ channel }),
  })
  return response.channel
}
