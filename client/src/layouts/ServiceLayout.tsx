import { Outlet } from 'react-router-dom'
import { ServiceHeader } from '@/components/service/ServiceHeader'
import { ServiceSidebar } from '@/components/service/ServiceSidebar'

export function ServiceLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <ServiceSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <ServiceHeader />
        <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
