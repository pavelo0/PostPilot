import { Outlet } from 'react-router-dom'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LandingHeader } from '@/components/landing/LandingHeader'

export function LandingLayout() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main className="pt-16">
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  )
}
