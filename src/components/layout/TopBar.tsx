import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { OnlineIndicator } from './OnlineIndicator'

export function TopBar() {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <header className="fixed top-0 w-full z-50 bg-background flex justify-between items-center px-4 h-14 md:hidden">
      <div className="flex items-center gap-3">
        <span className="text-primary-container font-black italic tracking-tighter text-xl font-headline">
          GAINLOG
        </span>
        <OnlineIndicator />
      </div>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-primary-container font-bold text-xs border border-outline-variant/30"
        >
          {user?.email?.charAt(0).toUpperCase() ?? 'U'}
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-10 bg-surface-container rounded-xl shadow-xl border border-outline-variant/20 overflow-hidden min-w-[180px] animate-fade-in">
            <div className="px-4 py-3 border-b border-outline-variant/15">
              <p className="text-sm font-bold text-on-surface truncate">
                {user?.email?.split('@')[0] ?? 'Usuario'}
              </p>
              <p className="text-[11px] text-on-surface-variant truncate">
                {user?.email ?? ''}
              </p>
            </div>
            <button
              onClick={() => {
                setMenuOpen(false)
                signOut()
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-error hover:bg-error/10 transition-colors font-semibold text-sm"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
