import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="min-h-dvh bg-background">
      <Sidebar />
      <TopBar />
      <main className="md:ml-72 min-h-dvh pt-18 md:pt-10 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-10 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
