import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

type ErrorPayload = {
  message?: string;
};

/**
 * Returns true when RTK Query error has given HTTP status.
 */
export function hasErrorStatus(error: unknown, status: number): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as FetchBaseQueryError;
  return 'status' in candidate && candidate.status === status;
}

/**
 * Extracts user-friendly message from RTK Query error.
 */
export function getApiErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Request failed';
  }

  const candidate = error as FetchBaseQueryError;
  if ('data' in candidate && candidate.data && typeof candidate.data === 'object') {
    const payload = candidate.data as ErrorPayload;
    if (typeof payload.message === 'string' && payload.message.length > 0) {
      return payload.message;
    }
  }

  return 'Request failed';
}
