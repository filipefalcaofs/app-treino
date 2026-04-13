import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />
      <main className="md:ml-72 min-h-screen pt-20 md:pt-10 pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
