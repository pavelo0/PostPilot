import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      {/* Main content fills remaining width — sidebar is a flex sibling */}
      <div className="flex flex-col flex-1 min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-6 pb-20 lg:pb-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
