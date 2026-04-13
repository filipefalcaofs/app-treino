import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { OnlineIndicator } from './OnlineIndicator'

const navItems = [
  { to: '/', label: 'Inicio', icon: 'grid_view' },
  { to: '/semana', label: 'Semana', icon: 'calendar_view_week' },
  { to: '/treinos', label: 'Treinos', icon: 'fitness_center' },
  { to: '/evolucao', label: 'Evolucao', icon: 'trending_up' },
  { to: '/perfil', label: 'Perfil', icon: 'person' },
]

export function Sidebar() {
  const { user, signOut } = useAuth()

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 flex-col p-6 z-60 bg-surface-container-lowest h-full w-72 border-r border-outline-variant/15">
      <div className="mb-10 px-2">
        <span className="text-primary-container font-black italic tracking-tighter text-3xl font-headline">
          GAINLOG
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 font-headline font-semibold rounded-lg transition-all ${
                isActive
                  ? 'text-primary bg-surface-container-high'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-outline-variant/15">
        <div className="px-2 mb-3">
          <OnlineIndicator />
        </div>
        <div className="flex items-center gap-4 px-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container font-bold text-sm">
            {user?.email?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-headline font-bold text-sm truncate text-on-surface">
              {user?.email?.split('@')[0] ?? 'Usuario'}
            </p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
              Atleta
            </p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-4 px-4 py-3 text-error hover:bg-error/10 transition-all rounded-lg font-headline font-semibold w-full"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
