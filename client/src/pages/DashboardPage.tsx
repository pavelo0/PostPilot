import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../api/auth';

/**
 * Protected placeholder dashboard shown after authentication.
 */
export function DashboardPage(): ReactElement {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      await navigate('/login');
    },
  });

  /**
   * Executes logout and redirects user to login page.
   */
  async function handleLogout(): Promise<void> {
    await logoutMutation.mutateAsync();
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Welcome to PostPilot</h1>
        <p className="muted">
          Auth module is ready. Current user: <strong>{user?.email ?? 'unknown'}</strong>
        </p>
        <button type="button" onClick={handleLogout} disabled={logoutMutation.isPending}>
          {logoutMutation.isPending ? 'Signing out...' : 'Logout'}
        </button>
      </section>
    </main>
  );
}
