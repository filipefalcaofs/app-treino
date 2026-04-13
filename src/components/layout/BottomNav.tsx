import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', icon: 'grid_view', label: 'Inicio' },
  { to: '/semana', icon: 'calendar_view_week', label: 'Semana' },
  { to: '/treinos', icon: 'fitness_center', label: 'Treinos' },
  { to: '/evolucao', icon: 'trending_up', label: 'Evolucao' },
  { to: '/perfil', icon: 'person', label: 'Perfil' },
]

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-16 px-4 bg-background/80 backdrop-blur-xl z-50 border-t border-outline-variant/15">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          title={item.label}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-transform active:scale-90 ${
              isActive ? 'text-primary-container scale-110' : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>
              {item.icon}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
