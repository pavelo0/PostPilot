import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { LandingLayout } from '@/layouts/LandingLayout'
import { ServiceLayout } from '@/layouts/ServiceLayout'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { AnalyticsDashboardPage } from '@/pages/dashboard/AnalyticsDashboardPage'
import { AIAssistantDashboardPage } from '@/pages/dashboard/AIAssistantDashboardPage'
import { CalendarDashboardPage } from '@/pages/dashboard/CalendarDashboardPage'
import { ChannelsDashboardPage } from '@/pages/dashboard/ChannelsDashboardPage'
import { DashboardOverviewPage } from '@/pages/dashboard/DashboardOverviewPage'
import { DraftsDashboardPage } from '@/pages/dashboard/DraftsDashboardPage'
import { PostsDashboardPage } from '@/pages/dashboard/PostsDashboardPage'
import { SettingsDashboardPage } from '@/pages/dashboard/SettingsDashboardPage'
import { LandingPage } from '@/pages/LandingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { SubscribePage } from '@/pages/SubscribePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingLayout />}>
          <Route index element={<LandingPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route path="/subscribe" element={<SubscribePage />} />

        <Route path="/dashboard" element={<ServiceLayout />}>
          <Route index element={<DashboardOverviewPage />} />
          <Route path="posts" element={<PostsDashboardPage />} />
          <Route path="ai-assistant" element={<AIAssistantDashboardPage />} />
          <Route path="calendar" element={<CalendarDashboardPage />} />
          <Route path="channels" element={<ChannelsDashboardPage />} />
          <Route path="analytics" element={<AnalyticsDashboardPage />} />
          <Route path="drafts" element={<DraftsDashboardPage />} />
          <Route path="settings" element={<SettingsDashboardPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
