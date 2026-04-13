import { useAuth } from '../../hooks/useAuth'
import { OnlineIndicator } from './OnlineIndicator'

export function TopBar() {
  const { user } = useAuth()

  return (
    <header className="fixed top-0 w-full z-50 bg-background flex justify-between items-center px-6 h-16 md:hidden">
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-primary-container">menu</span>
        <span className="text-primary-container font-black italic tracking-tighter text-2xl font-headline">
          GAINLOG
        </span>
      </div>
      <div className="flex items-center gap-3">
        <OnlineIndicator />
        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-primary-container font-bold text-xs border border-outline-variant/30">
          {user?.email?.charAt(0).toUpperCase() ?? 'U'}
        </div>
      </div>
    </header>
  )
}
