import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCurrentUserQuery, useLogoutMutation } from '../store/api';

/**
 * Protected placeholder dashboard shown after authentication.
 */
export function DashboardPage(): ReactElement {
  const navigate = useNavigate();
  const { data: user } = useGetCurrentUserQuery();
  const [triggerLogout, { isLoading }] = useLogoutMutation();

  /**
   * Executes logout and redirects user to login page.
   */
  async function handleLogout(): Promise<void> {
    await triggerLogout().unwrap();
    await navigate('/login');
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Welcome to PostPilot</h1>
        <p className="muted">
          Auth module is ready. Current user: <strong>{user?.email ?? 'unknown'}</strong>
        </p>
        <button type="button" onClick={handleLogout} disabled={isLoading}>
          {isLoading ? 'Signing out...' : 'Logout'}
        </button>
      </section>
    </main>
  );
}
