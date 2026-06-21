import { ApiError } from './auth';
import type { ConnectChannelInput, ChannelItem } from '../types/channels';

type ChannelResponse = {
  channel: ChannelItem;
};

/**
 * Executes channels API request with cookie credentials.
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

  return (await response.json()) as TResponse;
}

/**
 * Returns current user's connected channel.
 */
export async function getMyChannel(): Promise<ChannelItem> {
  const response = await request<ChannelResponse>('/api/channels/me', {
    method: 'GET',
  });
  return response.channel;
}

/**
 * Connects user channel and verifies bot permissions.
 */
export async function connectChannel(
  input: ConnectChannelInput,
): Promise<ChannelItem> {
  const response = await request<ChannelResponse>('/api/channels/connect', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return response.channel;
}
