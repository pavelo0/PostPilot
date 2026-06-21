import type { FormEvent, ReactElement } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useConnectChannelMutation,
  useGetMyChannelQuery,
} from '../../store/api';
import { getApiErrorMessage } from '../../store/error';

/**
 * Connects Telegram channel and shows current channel status.
 */
export function ChannelConnectPage(): ReactElement {
  const [triggerConnectChannel, { isLoading: isConnecting }] =
    useConnectChannelMutation();
  const [channelInput, setChannelInput] = useState('');
  const [connectError, setConnectError] = useState<string | null>(null);

  const channelQuery = useGetMyChannelQuery();

  /**
   * Submits channel connect form.
   */
  async function handleConnect(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setConnectError(null);
    try {
      const channel = await triggerConnectChannel({
        channel: channelInput,
      }).unwrap();
      setChannelInput(channel.telegramUsername ? `@${channel.telegramUsername}` : '');
    } catch (error) {
      setConnectError(getApiErrorMessage(error));
    }
  }

  if (channelQuery.isLoading) {
    return <p className="centered-message">Loading channel...</p>;
  }

  const connectedChannel = channelQuery.data;

  return (
    <main className="auth-page">
      <section className="auth-card posts-card">
        <h1>Connect channel</h1>
        <p className="muted">
          Add bot as admin in Telegram channel and enter @channel_username or chat id.
        </p>

        {connectedChannel ? (
          <div className="channel-status">
            <p className="muted">
              Connected: {connectedChannel.title ?? connectedChannel.telegramChatId}
            </p>
            <p className="muted">
              Username:{' '}
              {connectedChannel.telegramUsername
                ? `@${connectedChannel.telegramUsername}`
                : 'not set'}
            </p>
          </div>
        ) : null}

        {channelQuery.isError ? (
          <p className="error">Failed to load channel status.</p>
        ) : null}

        <form className="auth-form" onSubmit={handleConnect}>
          <label htmlFor="channel-id">Channel</label>
          <input
            id="channel-id"
            placeholder="@your_channel"
            value={channelInput}
            onChange={(event) => setChannelInput(event.target.value)}
            required
          />

          {connectError ? <p className="error">{connectError}</p> : null}

          <div className="posts-actions">
            <button type="submit" disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect channel'}
            </button>
            <Link className="ghost-link" to="/app/posts">
              Back to posts
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
