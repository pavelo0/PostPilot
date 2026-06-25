import { ApiError } from '@/utils/auth/auth.api'

const DEFAULT_RETRY_ATTEMPTS = 20
const DEFAULT_RETRY_DELAY_MS = 400

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

/**
 * Returns true when the request likely failed because the API is not ready yet.
 */
export const isTransientRequestError = (error: unknown): boolean => {
  if (error instanceof ApiError) {
    return error.status === 502 || error.status === 503 || error.status === 504
  }

  return error instanceof TypeError
}

type RetryRequestOptions = {
  attempts?: number
  delayMs?: number
}

/**
 * Retries a request while the API is temporarily unavailable.
 */
export const retryTransientRequest = async <T>(
  request: () => Promise<T>,
  options: RetryRequestOptions = {},
): Promise<T> => {
  const attempts = options.attempts ?? DEFAULT_RETRY_ATTEMPTS
  const delayMs = options.delayMs ?? DEFAULT_RETRY_DELAY_MS

  let lastError: unknown

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await request()
    } catch (error) {
      lastError = error

      if (!isTransientRequestError(error) || attempt >= attempts - 1) {
        throw error
      }

      await sleep(delayMs)
    }
  }

  throw lastError
}
