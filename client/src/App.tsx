import { useQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { getCurrentUser } from './api/auth';
import { LoginPage } from './pages/LoginPage';
import { PostEditorPage } from './pages/posts/PostEditorPage';
import { PostsListPage } from './pages/posts/PostsListPage';
import { RegisterPage } from './pages/RegisterPage';
import './App.css';

/**
 * Wraps routes that require authenticated user.
 */
function ProtectedRoute({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
  });

  if (isLoading) {
    return <p className="centered-message">Loading session...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Redirects authenticated users away from guest-only routes.
 */
function GuestRoute({ children }: { children: ReactElement }): ReactElement {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
  });

  if (isLoading) {
    return <p className="centered-message">Loading session...</p>;
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return children;
}

/**
 * Defines application routes for auth module.
 */
export default function App(): ReactElement {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/app/posts" replace />}
      />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Navigate to="/app/posts" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/posts"
        element={
          <ProtectedRoute>
            <PostsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/posts/new"
        element={
          <ProtectedRoute>
            <PostEditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/posts/:postId"
        element={
          <ProtectedRoute>
            <PostEditorPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/app/posts" replace />} />
    </Routes>
  );
}
