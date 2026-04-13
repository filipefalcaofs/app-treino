import { useNavigate } from 'react-router-dom'

interface HeroWorkoutCardProps {
  workoutName: string | null
  cycleName: string | null
  isRest: boolean
  isRunning: boolean
}

export function HeroWorkoutCard({ workoutName, cycleName, isRest, isRunning }: HeroWorkoutCardProps) {
  const navigate = useNavigate()

  if (isRest || (!workoutName && !isRunning)) {
    return (
      <div
        className="md:col-span-8 bg-surface-container-low rounded-xl p-8 min-h-[400px] flex flex-col justify-center items-center gap-6 relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(207, 252, 0, 0.03) 0%, transparent 60%), var(--color-surface-container-low)',
        }}
      >
        <span className="material-symbols-outlined text-primary-dim text-6xl opacity-60">self_improvement</span>
        <div className="text-center">
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-primary mb-3">
            Dia de Descanso
          </h2>
          <p className="text-on-surface-variant text-sm max-w-sm">
            Recuperação ativa. Seu corpo agradece o tempo de regeneração.
          </p>
        </div>
        {cycleName && (
          <span className="bg-surface-container-highest/60 text-on-surface-variant px-4 py-1.5 rounded-full text-xs font-medium">
            {cycleName}
          </span>
        )}
      </div>
    )
  }

  const displayName = isRunning ? 'Corrida' : workoutName

  return (
    <div
      className="md:col-span-8 bg-surface-container-low rounded-xl p-8 min-h-[400px] flex flex-col justify-between relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at top right, rgba(207, 252, 0, 0.05) 0%, transparent 50%), var(--color-surface-container-low)',
      }}
    >
      <div>
        <span className="inline-block bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6">
          Protocolo Atual
        </span>
        <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-primary leading-tight mb-3">
          {displayName}
        </h2>
        {cycleName && (
          <p className="text-on-surface-variant text-sm font-medium">
            {cycleName} {isRunning ? '/ Corrida' : '/ Musculação'}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <button
          onClick={() => navigate('/semana')}
          className="flex items-center justify-center gap-2 bg-[#cffc00] text-[#3b4a00] font-black px-8 py-4 rounded-xl text-sm uppercase tracking-wider shadow-[0_0_40px_rgba(207,252,0,0.2)] hover:brightness-110 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined filled text-xl">play_arrow</span>
          Iniciar Treino de Hoje
        </button>
        <button
          onClick={() => navigate('/semana')}
          className="flex items-center justify-center gap-2 bg-surface-container-highest/80 backdrop-blur-md border border-outline-variant/20 text-on-surface font-bold px-6 py-4 rounded-xl text-sm hover:bg-surface-container-highest transition-colors cursor-pointer"
        >
          Ver exercícios
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}
