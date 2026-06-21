import type {
  AuthCredentials,
  AuthResponse,
  AuthUser,
} from '../types/auth';

/**
 * Error with HTTP status for API responses.
 */
export class ApiError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Executes API request with cookie credentials.
 */
async function request<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const payload = (await response.json()) as { message?: string };
      if (typeof payload.message === 'string' && payload.message.length > 0) {
        message = payload.message;
      }
    } catch {
      message = 'Request failed';
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return {} as TResponse;
  }

  return (await response.json()) as TResponse;
}

/**
 * Registers new user and starts session.
 */
export async function register(
  credentials: AuthCredentials,
): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

/**
 * Logs in existing user and starts session.
 */
export async function login(credentials: AuthCredentials): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

/**
 * Clears active user session.
 */
export async function logout(): Promise<{ success: true }> {
  return request<{ success: true }>('/api/auth/logout', {
    method: 'POST',
  });
}

/**
 * Returns current user; null means unauthenticated.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await request<AuthResponse>('/api/auth/me', {
      method: 'GET',
    });
    return response.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}
