import { useState, useRef, useEffect } from 'react'
import type { WorkoutWithExercises } from '../../hooks/useWorkouts'

interface WorkoutCardProps {
  workout: WorkoutWithExercises
  onEdit: (workout: WorkoutWithExercises) => void
  onDelete: (id: string) => void
}

export function WorkoutCard({ workout, onEdit, onDelete }: WorkoutCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const exerciseCount = workout.workout_exercises.length
  const groupAbbreviations = workout.muscle_group
    .split(',')
    .map((g) => g.trim().substring(0, 2).toUpperCase())
    .slice(0, 3)

  return (
    <div
      className="group bg-surface-container-low hover:bg-surface-container-high transition-all duration-300 rounded-2xl p-6 flex flex-col cursor-pointer border border-transparent hover:border-outline-variant/20 min-h-[220px]"
      onClick={() => onEdit(workout)}
    >
      <div className="flex justify-between items-start mb-8">
        <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary-fixed">
          <span className="material-symbols-outlined text-2xl">
            fitness_center
          </span>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(!menuOpen)
            }}
            className="p-1 text-on-surface-variant group-hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">more_vert</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 bg-surface-container-highest rounded-xl shadow-lg py-1 min-w-[160px] z-20 border border-outline-variant/20">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  onEdit(workout)
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-container-high flex items-center gap-3 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
                Editar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  onDelete(workout.id)
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-container-high flex items-center gap-3 text-error transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  delete
                </span>
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      <h4 className="text-xl font-bold font-headline mb-1">{workout.name}</h4>
      <p className="text-sm text-on-surface-variant mb-6">
        {workout.muscle_group} &bull; {exerciseCount}{' '}
        {exerciseCount === 1 ? 'Exercicio' : 'Exercicios'}
      </p>

      <div className="mt-auto flex items-center justify-between">
        <div className="flex -space-x-2">
          {groupAbbreviations.map((abbr, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-surface-container-highest border-2 border-surface-container-low flex items-center justify-center text-[10px] font-bold"
            >
              {abbr}
            </div>
          ))}
        </div>
        <span className="text-xs font-bold text-on-surface-variant group-hover:text-primary-fixed transition-colors">
          {exerciseCount * 12} min med.
        </span>
      </div>
    </div>
  )
}
