import { useState, useRef, useEffect } from 'react'

interface ExerciseSelectorProps {
  exercises: string[]
  selected: string
  onSelect: (name: string) => void
}

export function ExerciseSelector({ exercises, selected, onSelect }: ExerciseSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-primary-container text-3xl">
          fitness_center
        </span>
        <h3 className="font-headline font-bold text-2xl text-on-surface flex-1">
          {selected || 'Selecionar exercicio'}
        </h3>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">swap_horiz</span>
        </button>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-highest rounded-xl shadow-2xl z-30 max-h-72 overflow-y-auto border border-outline-variant/20">
          {exercises.length === 0 ? (
            <p className="p-4 text-sm text-on-surface-variant text-center">
              Nenhum exercicio registrado
            </p>
          ) : (
            exercises.map(name => (
              <button
                key={name}
                onClick={() => {
                  onSelect(name)
                  setOpen(false)
                }}
                className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors ${
                  name === selected
                    ? 'bg-primary-container/20 text-primary'
                    : 'text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
