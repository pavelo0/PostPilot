import type { ReactElement } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useLogoutMutation } from '../store/api';

/**
 * Provides authenticated shell for application pages.
 */
export default function AppLayout(): ReactElement {
  const navigate = useNavigate();
  const [triggerLogout, { isLoading }] = useLogoutMutation();

  /**
   * Logs out current user and redirects to login.
   */
  async function handleLogout(): Promise<void> {
    await triggerLogout().unwrap();
    await navigate('/login');
  }

  return (
    <div className="layout layout--app">
      <Header mode="app" />
      <main className="layout__content">
        <div className="layout__toolbar">
          <button
            type="button"
            onClick={() => {
              void handleLogout();
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing out...' : 'Logout'}
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
