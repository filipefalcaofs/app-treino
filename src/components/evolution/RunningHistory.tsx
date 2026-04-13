import type { RunningLog } from '../../types'

interface RunningHistoryProps {
  logs: RunningLog[]
  distancePR?: number | null
  pacePR?: string | null
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  })
}

function formatInterval(interval: string | null): string {
  if (!interval) return '--'
  const match = interval.match(/(\d+):(\d+):(\d+)/)
  if (match) return `${match[1]}h${match[2]}m`
  return interval
}

export function RunningHistory({ logs, distancePR, pacePR }: RunningHistoryProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-surface-container-low rounded-xl p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3 block">
          directions_run
        </span>
        <p className="text-on-surface-variant text-sm">
          Nenhuma corrida registrada ainda
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {logs.map(log => {
        const isDistancePR = distancePR != null && log.distance_km === distancePR
        const isPacePR = pacePR != null && log.avg_pace === pacePR

        return (
          <div
            key={log.id}
            className="group bg-surface-container-low hover:bg-surface-container-high p-5 rounded-xl transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-on-surface-variant font-medium">
                  {formatDate(log.date)}
                </span>
                {(isDistancePR || isPacePR) && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-primary-container text-on-primary-container px-2 py-0.5 rounded">
                    PR
                  </span>
                )}
              </div>
              {log.intensity && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  log.intensity === 'forte'
                    ? 'bg-error/20 text-error'
                    : log.intensity === 'moderado'
                      ? 'bg-secondary/20 text-secondary'
                      : 'bg-primary/20 text-primary'
                }`}>
                  {log.intensity}
                </span>
              )}
            </div>

            {log.description && (
              <p className="text-sm font-semibold text-on-surface mb-2">
                {log.description}
              </p>
            )}

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-on-surface-variant">
              {log.distance_km != null && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">straighten</span>
                  <span className={isDistancePR ? 'text-primary font-bold' : ''}>
                    {log.distance_km} km
                  </span>
                </span>
              )}
              {log.avg_pace && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">speed</span>
                  <span className={isPacePR ? 'text-primary font-bold' : ''}>
                    {log.avg_pace} /km
                  </span>
                </span>
              )}
              {log.total_time && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">timer</span>
                  {formatInterval(log.total_time)}
                </span>
              )}
              {log.elevation_gain_m != null && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">landscape</span>
                  +{log.elevation_gain_m}m
                </span>
              )}
              {log.heart_rate != null && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">favorite</span>
                  {log.heart_rate} bpm
                </span>
              )}
              {log.steps != null && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">footprint</span>
                  {log.steps.toLocaleString('pt-BR')}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
