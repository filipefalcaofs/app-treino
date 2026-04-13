interface SessionEntry {
  date: string
  weight_kg: number | null
  reps: number[]
  note: string | null
}

interface SessionHistoryProps {
  sessions: SessionEntry[]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  })
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
  if (sessions.length === 0) {
    return (
      <div className="bg-surface-container-low rounded-xl p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3 block">
          history
        </span>
        <p className="text-on-surface-variant text-sm">
          Nenhum historico encontrado para este exercicio
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sessions.map((session, i) => (
        <div
          key={i}
          className="group bg-surface-container-low hover:bg-surface-container-high p-5 rounded-xl transition-colors flex items-center gap-4"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-1">
              <span className="text-xs text-on-surface-variant font-medium">
                {formatDate(session.date)}
              </span>
              {session.weight_kg != null && (
                <>
                  <span className="text-xs text-on-surface-variant">|</span>
                  <span className="font-bold text-primary text-sm">
                    {session.weight_kg} <span className="text-xs font-normal text-on-surface-variant">kg</span>
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {session.reps.length > 0 && (
                <span className="text-xs text-on-surface-variant">
                  {session.reps.join(' / ')} reps
                </span>
              )}
              {session.note && (
                <span className="text-xs text-on-surface-variant/60 truncate max-w-[200px]">
                  {session.note}
                </span>
              )}
            </div>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
            chevron_right
          </span>
        </div>
      ))}
    </div>
  )
}
