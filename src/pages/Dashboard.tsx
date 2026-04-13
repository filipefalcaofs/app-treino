import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../hooks/useDashboard'
import { CycleAlert } from '../components/dashboard/CycleAlert'
import { HeroWorkoutCard } from '../components/dashboard/HeroWorkoutCard'
import { LastWorkoutCard } from '../components/dashboard/LastWorkoutCard'
import { MetricCard } from '../components/dashboard/MetricCard'

function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1).replace('.0', '')}K`
  }
  return String(Math.round(volume))
}

export function Dashboard() {
  const navigate = useNavigate()
  const {
    todayWorkout,
    lastSession,
    daysRemaining,
    streak,
    weeklyVolume,
    monthlyWorkouts,
    loading,
    activeCycle,
  } = useDashboard()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface">
            INICIO
          </h1>
          <p className="text-on-surface-variant font-medium mt-2 max-w-md">
            Monitore seu potencial e execute seus protocolos de performance.
          </p>
        </div>
      </header>

      {daysRemaining !== null && <CycleAlert daysRemaining={daysRemaining} />}

      {!activeCycle ? (
        <div className="bg-surface-container-low rounded-xl p-12 flex flex-col items-center justify-center gap-6 min-h-[400px]">
          <span className="material-symbols-outlined text-on-surface-variant text-5xl opacity-40">
            fitness_center
          </span>
          <div className="text-center max-w-sm">
            <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">
              Nenhum ciclo ativo
            </h2>
            <p className="text-on-surface-variant text-sm mb-6">
              Crie um ciclo de treinamento para comecar a acompanhar seus treinos e evolucao.
            </p>
            <button
              onClick={() => navigate('/treinos')}
              className="bg-[#cffc00] text-[#3b4a00] font-black px-8 py-3 rounded-xl text-sm uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer"
            >
              Criar Ciclo
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <HeroWorkoutCard
            workoutName={todayWorkout?.workouts?.name ?? null}
            cycleName={activeCycle.name}
            isRest={todayWorkout?.is_rest ?? false}
            isRunning={todayWorkout?.is_running ?? false}
          />

          <LastWorkoutCard session={lastSession} />

          <MetricCard
            icon="local_fire_department"
            label="Sequencia Ativa"
            value={`${streak} DIAS`}
            colorClass="bg-error/10 text-error"
          />
          <MetricCard
            icon="bolt"
            label="Volume Semanal"
            value={`${formatVolume(weeklyVolume)} KG`}
            colorClass="bg-tertiary-fixed/10 text-tertiary-fixed"
          />
          <MetricCard
            icon="pulse_alert"
            label="Treinos Este Mes"
            value={String(monthlyWorkouts)}
            colorClass="bg-primary-container/10 text-primary-container"
          />
        </div>
      )}
    </div>
  )
}
