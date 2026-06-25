import { useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { LandingLayout } from '@/layouts/LandingLayout'
import { ServiceLayout } from '@/layouts/ServiceLayout'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage'
import { AnalyticsDashboardPage } from '@/pages/dashboard/AnalyticsDashboardPage'
import { AIAssistantDashboardPage } from '@/pages/dashboard/AIAssistantDashboardPage'
import { CalendarDashboardPage } from '@/pages/dashboard/CalendarDashboardPage'
import { ChannelsDashboardPage } from '@/pages/dashboard/ChannelsDashboardPage'
import { CreatePostDashboardPage } from '@/pages/dashboard/CreatePostDashboardPage'
import { DashboardOverviewPage } from '@/pages/dashboard/DashboardOverviewPage'
import { DraftsDashboardPage } from '@/pages/dashboard/DraftsDashboardPage'
import { PostsDashboardPage } from '@/pages/dashboard/PostsDashboardPage'
import { SettingsDashboardPage } from '@/pages/dashboard/SettingsDashboardPage'
import { DesignPage } from '@/pages/DesignPage'
import { LandingPage } from '@/pages/LandingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { SubscribePage } from '@/pages/SubscribePage'
import { bootstrapAuth } from '@/store/auth.slice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

function AuthBootstrapGate() {
  const dispatch = useAppDispatch()
  const authStatus = useAppSelector((state) => state.auth.status)
  const isBootstrapResolved = useAppSelector(
    (state) => state.auth.bootstrapResolved,
  )

  useEffect(() => {
    if (authStatus === 'idle') {
      void dispatch(bootstrapAuth())
    }
  }, [authStatus, dispatch])

  if (!isBootstrapResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Checking your session...
      </div>
    )
  }

  return <Outlet />
}

function GuestOnlyRoute() {
  const authStatus = useAppSelector((state) => state.auth.status)

  if (authStatus === 'authenticated') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

function ProtectedRoute() {
  const authStatus = useAppSelector((state) => state.auth.status)
  const location = useLocation()

  if (authStatus !== 'authenticated') {
    const redirectTarget = `${location.pathname}${location.search}`
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectTarget)}`}
        replace
      />
    )
  }

  return <Outlet />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthBootstrapGate />}>
          <Route element={<LandingLayout />}>
            <Route index element={<LandingPage />} />
          </Route>

          <Route element={<GuestOnlyRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>
          </Route>

          <Route path="/subscribe" element={<SubscribePage />} />
          <Route path="/design" element={<DesignPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<ServiceLayout />}>
              <Route index element={<DashboardOverviewPage />} />
              <Route path="posts" element={<PostsDashboardPage />} />
              <Route path="posts/new" element={<CreatePostDashboardPage />} />
              <Route path="ai-assistant" element={<AIAssistantDashboardPage />} />
              <Route path="calendar" element={<CalendarDashboardPage />} />
              <Route path="channels" element={<ChannelsDashboardPage />} />
              <Route path="analytics" element={<AnalyticsDashboardPage />} />
              <Route path="drafts" element={<DraftsDashboardPage />} />
              <Route path="settings" element={<SettingsDashboardPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
