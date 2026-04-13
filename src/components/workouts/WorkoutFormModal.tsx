import { useState, useEffect } from 'react'
import type { WorkoutWithExercises } from '../../hooks/useWorkouts'

interface ExerciseRow {
  exercise_name: string
  sets_count: number
  reps_min: number
  reps_max: number
}

const MUSCLE_GROUPS = [
  'Peito',
  'Costas',
  'Pernas',
  'Ombros',
  'Bracos',
  'Full Body',
  'Core',
  'Gluteos',
]

interface WorkoutFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (
    name: string,
    muscleGroup: string,
    exercises: ExerciseRow[]
  ) => Promise<void>
  workout?: WorkoutWithExercises | null
}

export function WorkoutFormModal({
  open,
  onClose,
  onSave,
  workout,
}: WorkoutFormModalProps) {
  const [name, setName] = useState('')
  const [muscleGroup, setMuscleGroup] = useState(MUSCLE_GROUPS[0])
  const [exercises, setExercises] = useState<ExerciseRow[]>([
    { exercise_name: '', sets_count: 3, reps_min: 8, reps_max: 12 },
  ])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (workout) {
      setName(workout.name)
      setMuscleGroup(workout.muscle_group)
      setExercises(
        workout.workout_exercises.map((ex) => ({
          exercise_name: ex.exercise_name,
          sets_count: ex.sets_count,
          reps_min: ex.reps_min,
          reps_max: ex.reps_max,
        }))
      )
    } else {
      setName('')
      setMuscleGroup(MUSCLE_GROUPS[0])
      setExercises([
        { exercise_name: '', sets_count: 3, reps_min: 8, reps_max: 12 },
      ])
    }
  }, [workout, open])

  if (!open) return null

  const addExercise = () => {
    setExercises([
      ...exercises,
      { exercise_name: '', sets_count: 3, reps_min: 8, reps_max: 12 },
    ])
  }

  const removeExercise = (index: number) => {
    if (exercises.length <= 1) return
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const updateExercise = (
    index: number,
    field: keyof ExerciseRow,
    value: string | number
  ) => {
    const updated = [...exercises]
    updated[index] = { ...updated[index], [field]: value }
    setExercises(updated)
  }

  const handleSubmit = async () => {
    if (!name.trim()) return
    const valid = exercises.filter((ex) => ex.exercise_name.trim())
    if (valid.length === 0) return

    setSaving(true)
    await onSave(name.trim(), muscleGroup, valid)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-surface-container-low rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-outline-variant/20">
        <div className="sticky top-0 bg-surface-container-low p-6 pb-4 border-b border-outline-variant/10 z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-headline font-bold">
              {workout ? 'Editar Treino' : 'Novo Treino'}
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
              Nome do Treino
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Hipertrofia A"
              className="w-full bg-surface-container-highest border-b-2 border-outline-variant focus:border-primary-fixed outline-none px-4 py-3 rounded-t-lg text-on-surface placeholder:text-on-surface-variant/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
              Grupo Muscular
            </label>
            <select
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value)}
              className="w-full bg-surface-container-highest border-b-2 border-outline-variant focus:border-primary-fixed outline-none px-4 py-3 rounded-t-lg text-on-surface transition-colors"
            >
              {MUSCLE_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Exercicios
              </label>
              <button
                onClick={addExercise}
                className="text-primary-fixed text-sm font-bold flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Adicionar
              </button>
            </div>

            <div className="space-y-3">
              {exercises.map((ex, i) => (
                <div
                  key={i}
                  className="bg-surface-container-highest rounded-xl p-4"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-xs text-on-surface-variant font-bold mt-3 min-w-[24px]">
                      {i + 1}.
                    </span>
                    <input
                      type="text"
                      value={ex.exercise_name}
                      onChange={(e) =>
                        updateExercise(i, 'exercise_name', e.target.value)
                      }
                      placeholder="Nome do exercicio"
                      className="flex-1 bg-transparent border-b border-outline-variant focus:border-primary-fixed outline-none py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 transition-colors"
                    />
                    {exercises.length > 1 && (
                      <button
                        onClick={() => removeExercise(i)}
                        className="p-1 text-on-surface-variant hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3 pl-7">
                    <div>
                      <label className="text-[10px] text-on-surface-variant block mb-1">
                        Series
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={ex.sets_count}
                        onChange={(e) =>
                          updateExercise(
                            i,
                            'sets_count',
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary-fixed outline-none py-1.5 px-2 text-sm text-center text-on-surface rounded transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-on-surface-variant block mb-1">
                        Reps Min
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={ex.reps_min}
                        onChange={(e) =>
                          updateExercise(
                            i,
                            'reps_min',
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary-fixed outline-none py-1.5 px-2 text-sm text-center text-on-surface rounded transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-on-surface-variant block mb-1">
                        Reps Max
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={ex.reps_max}
                        onChange={(e) =>
                          updateExercise(
                            i,
                            'reps_max',
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary-fixed outline-none py-1.5 px-2 text-sm text-center text-on-surface rounded transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
            className="kinetic-gradient text-on-primary-container px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
