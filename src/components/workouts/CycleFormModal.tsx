import { useState, useEffect } from 'react'
import type { WorkoutWithExercises } from '../../hooks/useWorkouts'

const DAY_LABELS = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
]

type DayConfig = {
  type: 'rest' | 'running' | 'workout' | 'workout_running'
  workout_id: string | null
}

interface CycleFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (
    name: string,
    durationWeeks: number,
    days: {
      day_of_week: number
      workout_id: string | null
      is_running: boolean
      is_rest: boolean
    }[],
    activateNow: boolean
  ) => Promise<void>
  workouts: WorkoutWithExercises[]
}

export function CycleFormModal({
  open,
  onClose,
  onSave,
  workouts,
}: CycleFormModalProps) {
  const [name, setName] = useState('')
  const [durationWeeks, setDurationWeeks] = useState(8)
  const [days, setDays] = useState<DayConfig[]>(
    Array(7).fill({ type: 'rest', workout_id: null })
  )
  const [activateNow, setActivateNow] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName('')
      setDurationWeeks(8)
      setDays(Array(7).fill({ type: 'rest', workout_id: null }))
      setActivateNow(true)
    }
  }, [open])

  if (!open) return null

  const updateDay = (index: number, config: Partial<DayConfig>) => {
    const updated = [...days]
    updated[index] = { ...updated[index], ...config }
    if (config.type === 'rest' || config.type === 'running') {
      updated[index].workout_id = null
    }
    setDays(updated)
  }

  const handleSubmit = async () => {
    if (!name.trim()) return

    setSaving(true)
    const formattedDays = days.map((d, i) => ({
      day_of_week: i + 1,
      workout_id:
        d.type === 'workout' || d.type === 'workout_running'
          ? d.workout_id
          : null,
      is_running: d.type === 'running' || d.type === 'workout_running',
      is_rest: d.type === 'rest',
    }))

    await onSave(name.trim(), durationWeeks, formattedDays, activateNow)
    setSaving(false)
    onClose()
  }

  const getTypeLabel = (type: DayConfig['type']) => {
    switch (type) {
      case 'rest':
        return 'Descanso'
      case 'running':
        return 'Corrida'
      case 'workout':
        return 'Treino'
      case 'workout_running':
        return 'Treino + Corrida'
    }
  }

  const getTypeIcon = (type: DayConfig['type']) => {
    switch (type) {
      case 'rest':
        return 'bed'
      case 'running':
        return 'directions_run'
      case 'workout':
        return 'fitness_center'
      case 'workout_running':
        return 'exercise'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-surface-container-low rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-outline-variant/20">
        <div className="sticky top-0 bg-surface-container-low p-6 pb-4 border-b border-outline-variant/10 z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-headline font-bold">Novo Ciclo</h3>
            <button
              onClick={onClose}
              className="p-1 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
                Nome do Ciclo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Hipertrofia Fase 1"
                className="w-full bg-surface-container-highest border-b-2 border-outline-variant focus:border-primary-fixed outline-none px-4 py-3 rounded-t-lg text-on-surface placeholder:text-on-surface-variant/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
                Duração (semanas)
              </label>
              <input
                type="number"
                min={1}
                max={52}
                value={durationWeeks}
                onChange={(e) =>
                  setDurationWeeks(parseInt(e.target.value) || 1)
                }
                className="w-full bg-surface-container-highest border-b-2 border-outline-variant focus:border-primary-fixed outline-none px-4 py-3 rounded-t-lg text-on-surface transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 block">
              Configuração dos dias
            </label>
            <div className="space-y-3">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="bg-surface-container-highest rounded-xl p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="material-symbols-outlined text-lg text-on-surface-variant">
                      {getTypeIcon(days[i].type)}
                    </span>
                    <span className="text-sm font-bold min-w-[80px]">
                      {label}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {getTypeLabel(days[i].type)}
                      {(days[i].type === 'workout' ||
                        days[i].type === 'workout_running') &&
                      days[i].workout_id
                        ? ` - ${workouts.find((w) => w.id === days[i].workout_id)?.name ?? ''}`
                        : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(
                      ['rest', 'running', 'workout', 'workout_running'] as const
                    ).map((type) => (
                      <button
                        key={type}
                        onClick={() => updateDay(i, { type })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          days[i].type === type
                            ? 'bg-primary-container text-on-primary-container'
                            : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {getTypeLabel(type)}
                      </button>
                    ))}
                  </div>

                  {(days[i].type === 'workout' ||
                    days[i].type === 'workout_running') && (
                    <select
                      value={days[i].workout_id ?? ''}
                      onChange={(e) =>
                        updateDay(i, {
                          workout_id: e.target.value || null,
                        })
                      }
                      className="mt-3 w-full bg-surface-container-high border-b border-outline-variant focus:border-primary-fixed outline-none py-2 px-3 rounded text-sm text-on-surface transition-colors"
                    >
                      <option value="">Selecionar treino...</option>
                      {workouts.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.muscle_group})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-highest rounded-xl p-4">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 block">
              Preview da Semana
            </label>
            <div className="grid grid-cols-7 gap-2">
              {DAY_LABELS.map((label, i) => {
                const d = days[i]
                const workoutName =
                  d.workout_id
                    ? workouts.find((w) => w.id === d.workout_id)?.name
                    : null

                return (
                  <div
                    key={i}
                    className={`rounded-lg p-2 text-center ${
                      d.type === 'rest'
                        ? 'bg-surface-container-high'
                        : d.type === 'running'
                          ? 'bg-secondary-container/20'
                          : 'bg-primary-container/20'
                    }`}
                  >
                    <span className="text-[10px] font-bold block mb-1">
                      {label.slice(0, 3)}
                    </span>
                    <span className="material-symbols-outlined text-sm block">
                      {getTypeIcon(d.type)}
                    </span>
                    {workoutName && (
                      <span className="text-[8px] text-on-surface-variant block mt-1 truncate">
                        {workoutName}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                activateNow
                  ? 'bg-primary-container border-primary-container'
                  : 'border-outline-variant'
              }`}
              onClick={() => setActivateNow(!activateNow)}
            >
              {activateNow && (
                <span className="material-symbols-outlined text-on-primary-container text-sm">
                  check
                </span>
              )}
            </div>
            <span className="text-sm font-medium">Ativar imediatamente</span>
          </label>
        </div>

        <div className="sticky bottom-0 bg-surface-container-low p-6 pt-4 border-t border-outline-variant/10 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-primary-container text-on-primary-container px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(207,252,0,0.2)]"
          >
            {saving ? 'Criando...' : 'Criar Ciclo'}
          </button>
        </div>
      </div>
    </div>
  )
}
