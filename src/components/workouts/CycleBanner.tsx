import type { CycleWithDays } from '../../hooks/useCycles'

interface CycleBannerProps {
  cycle: CycleWithDays
  currentWeek: number
}

export function CycleBanner({ cycle, currentWeek }: CycleBannerProps) {
  const startFormatted = cycle.start_date
    ? new Date(cycle.start_date + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null

  return (
    <section className="mb-12">
      <div className="relative group overflow-hidden rounded-2xl bg-surface-container-low p-8 border border-outline-variant/10">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-container/10 to-transparent pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-[10px] font-black uppercase">
                Ativo
              </span>
              {startFormatted && (
                <span className="text-on-surface-variant text-xs font-medium">
                  Iniciado em {startFormatted}
                </span>
              )}
            </div>

            <h3 className="text-2xl md:text-3xl font-headline font-bold mb-6">
              {cycle.name}
            </h3>

            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-on-surface-variant font-medium mb-1">
                  Progresso Atual
                </p>
                <p className="text-xl font-black text-primary-fixed">
                  Semana {currentWeek} / {cycle.duration_weeks}
                </p>
              </div>
              <div className="h-10 w-px bg-outline-variant/20" />
              <div>
                <p className="text-xs text-on-surface-variant font-medium mb-1">
                  Consistência
                </p>
                <p className="text-xl font-black text-on-surface">--</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/15">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-on-surface">
                  Dias da Semana
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((label, i) => {
                  const day = cycle.cycle_days.find(
                    (d) => d.day_of_week === i + 1
                  )
                  const isRest = day?.is_rest
                  const hasWorkout = !!day?.workout_id
                  const isRunning = day?.is_running

                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-on-surface-variant">
                        {label}
                      </span>
                      <div
                        className={`w-full aspect-square rounded-lg flex items-center justify-center ${
                          isRest
                            ? 'bg-surface-container-highest'
                            : hasWorkout
                              ? 'bg-primary-container/30'
                              : isRunning
                                ? 'bg-secondary-container/30'
                                : 'bg-surface-container-highest'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs">
                          {isRest
                            ? 'bed'
                            : isRunning && !hasWorkout
                              ? 'directions_run'
                              : hasWorkout
                                ? 'fitness_center'
                                : 'remove'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
