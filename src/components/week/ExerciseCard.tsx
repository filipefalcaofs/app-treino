import { useState, useRef } from 'react'
import type { TrainingSet } from '../../types'

interface ExerciseCardProps {
  exerciseName: string
  setsCount: number
  repsMin: number
  repsMax: number
  sets: TrainingSet[]
  isActive: boolean
  onSaveSet: (
    exerciseName: string,
    setNumber: number,
    weightKg: number,
    reps: number
  ) => void
  onUpdateNote: (setId: string, note: string) => void
}

export function ExerciseCard({
  exerciseName,
  setsCount,
  repsMin,
  repsMax,
  sets,
  isActive,
  onSaveSet,
  onUpdateNote,
}: ExerciseCardProps) {
  const [localValues, setLocalValues] = useState<
    Record<number, { weight: string; reps: string }>
  >({})
  const [note, setNote] = useState('')
  const noteTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const repsLabel =
    repsMin === repsMax ? `${repsMin}` : `${repsMin}-${repsMax}`

  const firstSetWithNote = sets.find((s) => s.note)

  const getSetData = (setNumber: number) =>
    sets.find(
      (s) => s.exercise_name === exerciseName && s.set_number === setNumber
    )

  const filledCount = Array.from({ length: setsCount }, (_, i) =>
    getSetData(i + 1)
  ).filter((s) => s && s.weight_kg !== null && s.reps !== null).length

  const firstIncompleteIndex = (() => {
    for (let i = 0; i < setsCount; i++) {
      const s = getSetData(i + 1)
      if (!s || s.weight_kg === null || s.reps === null) return i
    }
    return -1
  })()

  const handleBlur = (setNumber: number) => {
    const local = localValues[setNumber]
    if (!local) return

    const weight = parseFloat(local.weight)
    const reps = parseInt(local.reps, 10)

    if (!isNaN(weight) && weight > 0 && !isNaN(reps) && reps > 0) {
      onSaveSet(exerciseName, setNumber, weight, reps)
    }
  }

  const updateLocal = (
    setNumber: number,
    field: 'weight' | 'reps',
    value: string
  ) => {
    setLocalValues((prev) => ({
      ...prev,
      [setNumber]: {
        weight: prev[setNumber]?.weight ?? '',
        reps: prev[setNumber]?.reps ?? '',
        [field]: value,
      },
    }))
  }

  const handleNoteChange = (value: string) => {
    setNote(value)
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current)

    if (firstSetWithNote) {
      noteTimerRef.current = setTimeout(() => {
        onUpdateNote(firstSetWithNote.id, value)
      }, 1000)
    }
  }

  return (
    <div
      className={`
        lg:col-span-12 bg-surface-container-low rounded-xl p-6 transition-all
        ${isActive ? 'border-l-4 border-primary shadow-sm' : ''}
      `}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 bg-surface-container-highest rounded-xl flex items-center justify-center ${
              isActive ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-3xl">
              fitness_center
            </span>
          </div>
          <div>
            <h4 className="font-headline font-bold text-xl">{exerciseName}</h4>
            <p className="text-on-surface-variant font-medium text-sm">
              {setsCount} Séries x {repsLabel} Reps
              {filledCount > 0 && (
                <span className="text-primary ml-2">
                  ({filledCount}/{setsCount} feitas)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: setsCount }, (_, i) => {
          const setNumber = i + 1
          const savedSet = getSetData(setNumber)
          const isFilled =
            savedSet && savedSet.weight_kg !== null && savedSet.reps !== null
          const isActiveSet = i === firstIncompleteIndex
          const isFuture = i > firstIncompleteIndex && firstIncompleteIndex >= 0

          const displayWeight =
            localValues[setNumber]?.weight ??
            (savedSet?.weight_kg != null ? String(savedSet.weight_kg) : '')
          const displayReps =
            localValues[setNumber]?.reps ??
            (savedSet?.reps != null ? String(savedSet.reps) : '')

          return (
            <div
              key={setNumber}
              className={`
                bg-surface-container-highest p-3 rounded-lg flex items-center justify-between
                ${isActiveSet ? 'border-2 border-primary-container/20' : ''}
                ${isFuture ? 'opacity-40' : ''}
              `}
            >
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">
                Série {setNumber}
              </span>
              {isFuture && !isFilled ? (
                <span className="text-xs italic text-on-surface-variant">
                  Em breve
                </span>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    className="w-20 bg-surface-container-low border-none rounded-md text-sm text-center font-bold text-primary focus:ring-1 focus:ring-primary"
                    placeholder="kg"
                    value={displayWeight}
                    onChange={(e) =>
                      updateLocal(setNumber, 'weight', e.target.value)
                    }
                    onBlur={() => handleBlur(setNumber)}
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    className="w-14 bg-surface-container-low border-none rounded-md text-sm text-center font-bold text-primary focus:ring-1 focus:ring-primary"
                    placeholder="reps"
                    value={displayReps}
                    onChange={(e) =>
                      updateLocal(setNumber, 'reps', e.target.value)
                    }
                    onBlur={() => handleBlur(setNumber)}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <details className="group">
        <summary className="list-none flex items-center gap-2 text-sm font-semibold text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined text-sm group-open:rotate-180 transition-transform">
            expand_more
          </span>
          Notas do exercício
        </summary>
        <div className="mt-4">
          <textarea
            className="w-full bg-surface-container-lowest border-none rounded-xl p-4 text-sm text-on-surface-variant italic focus:ring-1 focus:ring-primary h-24 resize-none"
            placeholder="Adicione observações sobre o exercício..."
            value={note || firstSetWithNote?.note || ''}
            onChange={(e) => handleNoteChange(e.target.value)}
          />
        </div>
      </details>
    </div>
  )
}
