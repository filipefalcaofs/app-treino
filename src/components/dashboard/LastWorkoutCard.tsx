import { useNavigate } from 'react-router-dom'
import type { TrainingSet } from '../../types'

interface LastWorkoutCardProps {
  session: {
    date: string
    workout_name: string | null
    sets: TrainingSet[]
  } | null
}

function getBestSets(sets: TrainingSet[]): { exercise: string; weight: number; reps: number }[] {
  const byExercise = new Map<string, TrainingSet>()

  for (const s of sets) {
    const current = byExercise.get(s.exercise_name)
    const volume = (s.weight_kg ?? 0) * (s.reps ?? 0)
    const currentVolume = current ? (current.weight_kg ?? 0) * (current.reps ?? 0) : 0

    if (!current || volume > currentVolume) {
      byExercise.set(s.exercise_name, s)
    }
  }

  return Array.from(byExercise.entries())
    .slice(0, 4)
    .map(([exercise, s]) => ({
      exercise,
      weight: s.weight_kg ?? 0,
      reps: s.reps ?? 0,
    }))
}

function formatSessionDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function LastWorkoutCard({ session }: LastWorkoutCardProps) {
  const navigate = useNavigate()

  return (
    <div className="md:col-span-4 bg-surface-container-low rounded-xl p-6 border border-outline-variant/5 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-headline font-bold text-on-surface-variant tracking-widest text-xs uppercase">
          Ultimo Treino
        </h3>
        {session && (
          <span className="text-primary-dim font-mono text-xs">{formatSessionDate(session.date)}</span>
        )}
      </div>

      {!session ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-on-surface-variant text-sm">Nenhum treino registrado ainda.</p>
        </div>
      ) : (
        <>
          <h4 className="font-headline text-2xl font-bold text-on-surface mb-5">
            {session.workout_name ?? 'Treino'}
          </h4>

          <div className="space-y-2 flex-1">
            {getBestSets(session.sets).map((item) => (
              <div
                key={item.exercise}
                className="bg-surface-container-lowest p-3 rounded-lg flex items-center justify-between"
              >
                <span className="text-on-surface-variant text-sm truncate mr-3">{item.exercise}</span>
                <span className="text-on-surface font-bold text-sm whitespace-nowrap">
                  {item.weight}kg x {item.reps}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/evolucao')}
            className="mt-5 flex items-center gap-1.5 text-primary-dim font-bold text-sm uppercase tracking-wider hover:opacity-80 transition-opacity cursor-pointer"
          >
            Ver Historico Completo
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </>
      )}
    </div>
  )
}
