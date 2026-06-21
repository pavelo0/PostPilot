import type { ReactElement } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import LandingLayout from './layouts/LandingLayout';
import { DesignSystemPage } from './pages/DesignSystemPage';
import { LandingPage } from './pages/LandingPage';
import { ChannelConnectPage } from './pages/channel/ChannelConnectPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { useGetCurrentUserQuery } from './store/api';

/**
 * Returns cached authenticated user query used by route guards.
 */
function useAuthSession() {
  return useGetCurrentUserQuery();
}

/**
 * Allows only authenticated users to access nested routes.
 */
function ProtectedRoute(): ReactElement {
  const { data: user, isLoading } = useAuthSession();

  if (isLoading) {
    return <p className="centered-message">Loading session...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

/**
 * Redirects authenticated users away from guest routes.
 */
function GuestRoute(): ReactElement {
  const { data: user, isLoading } = useAuthSession();

  if (isLoading) {
    return <p className="centered-message">Loading session...</p>;
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}

/**
 * Defines public and protected application routes.
 */
export default function App(): ReactElement {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route element={<LandingLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/design-system" element={<DesignSystemPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="channel" element={<ChannelConnectPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
