import { useState } from 'react'
import { useWorkouts } from '../hooks/useWorkouts'
import { useCycles } from '../hooks/useCycles'
import type { WorkoutWithExercises } from '../hooks/useWorkouts'
import type { CycleWithDays } from '../hooks/useCycles'
import { WorkoutCard } from '../components/workouts/WorkoutCard'
import { WorkoutFormModal } from '../components/workouts/WorkoutFormModal'
import { CycleBanner } from '../components/workouts/CycleBanner'
import { CycleFormModal } from '../components/workouts/CycleFormModal'

type Tab = 'biblioteca' | 'ciclos' | 'arquivados'

export function Workouts() {
  const {
    workouts,
    loading: workoutsLoading,
    createWorkout,
    updateWorkout,
    deleteWorkout,
  } = useWorkouts()
  const {
    cycles,
    activeCycle,
    loading: cyclesLoading,
    createCycle,
    activateCycle,
    archiveCycle,
    deleteCycle,
    getCurrentWeek,
  } = useCycles()

  const [activeTab, setActiveTab] = useState<Tab>('biblioteca')
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false)
  const [cycleModalOpen, setCycleModalOpen] = useState(false)
  const [editingWorkout, setEditingWorkout] =
    useState<WorkoutWithExercises | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'workout' | 'cycle'
    id: string
    name: string
  } | null>(null)

  const handleEditWorkout = (workout: WorkoutWithExercises) => {
    setEditingWorkout(workout)
    setWorkoutModalOpen(true)
  }

  const handleNewWorkout = () => {
    setEditingWorkout(null)
    setWorkoutModalOpen(true)
  }

  const handleSaveWorkout = async (
    name: string,
    muscleGroup: string,
    exercises: {
      exercise_name: string
      sets_count: number
      reps_min: number
      reps_max: number
    }[]
  ) => {
    const mapped = exercises.map((ex, i) => ({ ...ex, sort_order: i }))

    if (editingWorkout) {
      await updateWorkout(editingWorkout.id, name, muscleGroup, mapped)
    } else {
      await createWorkout(name, muscleGroup, mapped)
    }
  }

  const handleDeleteWorkout = (id: string) => {
    const w = workouts.find((w) => w.id === id)
    setConfirmDelete({
      type: 'workout',
      id,
      name: w?.name ?? 'Treino',
    })
  }

  const handleSaveCycle = async (
    name: string,
    durationWeeks: number,
    days: {
      day_of_week: number
      workout_id: string | null
      is_running: boolean
      is_rest: boolean
    }[],
    activateNow: boolean
  ) => {
    await createCycle(name, durationWeeks, days, activateNow)
  }

  const handleDeleteCycle = (cycle: CycleWithDays) => {
    setConfirmDelete({
      type: 'cycle',
      id: cycle.id,
      name: cycle.name,
    })
  }

  const executeDelete = async () => {
    if (!confirmDelete) return
    if (confirmDelete.type === 'workout') {
      await deleteWorkout(confirmDelete.id)
    } else {
      await deleteCycle(confirmDelete.id)
    }
    setConfirmDelete(null)
  }

  const activeCycles = cycles.filter((c) => c.is_active)
  const inactiveCycles = cycles.filter((c) => !c.is_active)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'biblioteca', label: 'Biblioteca' },
    { key: 'ciclos', label: 'Ciclos' },
    { key: 'arquivados', label: 'Arquivados' },
  ]

  const loading = workoutsLoading || cyclesLoading

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-primary-fixed uppercase tracking-widest text-[10px] font-bold mb-2 block">
            Performance Hub
          </span>
          <h2 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tighter text-on-surface">
            Treinos
          </h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleNewWorkout}
            className="bg-surface-container-high text-on-surface-variant px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-surface-container-highest transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">
              add_circle
            </span>
            <span>Treino</span>
          </button>
          <button
            onClick={() => setCycleModalOpen(true)}
            className="bg-primary-container text-on-primary-container px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity active:scale-95 shadow-[0_0_20px_rgba(207,252,0,0.2)]"
          >
            <span className="material-symbols-outlined text-lg">cycle</span>
            <span>Novo Ciclo</span>
          </button>
        </div>
      </div>

      <div className="flex gap-8 border-b border-outline-variant/10 mb-8 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-4 border-b-2 font-bold text-sm tracking-tight whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'border-primary-fixed text-primary-fixed'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && activeTab === 'biblioteca' && (
        <>
          {activeCycle && (
            <CycleBanner
              cycle={activeCycle}
              currentWeek={getCurrentWeek(activeCycle)}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onEdit={handleEditWorkout}
                onDelete={handleDeleteWorkout}
              />
            ))}

            <div
              onClick={handleNewWorkout}
              className="group border-2 border-dashed border-outline-variant/30 hover:border-primary-fixed/50 transition-all duration-300 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer min-h-[220px]"
            >
              <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center group-hover:bg-primary-container group-hover:text-on-primary-container transition-all">
                <span className="material-symbols-outlined text-3xl">add</span>
              </div>
              <p className="font-bold text-on-surface-variant group-hover:text-on-surface">
                Criar Novo Treino
              </p>
            </div>
          </div>
        </>
      )}

      {!loading && activeTab === 'ciclos' && (
        <div className="space-y-4">
          {activeCycles.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">
                cycle
              </span>
              <p className="text-on-surface-variant font-medium mb-2">
                Nenhum ciclo ativo
              </p>
              <p className="text-sm text-on-surface-variant/60 mb-6">
                Crie um novo ciclo para organizar seus treinos
              </p>
              <button
                onClick={() => setCycleModalOpen(true)}
                className="bg-primary-container text-on-primary-container px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity active:scale-95"
              >
                Criar Ciclo
              </button>
            </div>
          )}

          {activeCycles.map((cycle) => (
            <CycleCard
              key={cycle.id}
              cycle={cycle}
              currentWeek={getCurrentWeek(cycle)}
              onArchive={() => archiveCycle(cycle.id)}
              onDelete={() => handleDeleteCycle(cycle)}
              isActive
            />
          ))}

          {cycles.filter((c) => !c.is_active).length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-headline font-bold mb-4 text-on-surface-variant">
                Outros Ciclos
              </h3>
              {inactiveCycles.map((cycle) => (
                <CycleCard
                  key={cycle.id}
                  cycle={cycle}
                  currentWeek={getCurrentWeek(cycle)}
                  onActivate={() => activateCycle(cycle.id)}
                  onDelete={() => handleDeleteCycle(cycle)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && activeTab === 'arquivados' && (
        <div className="space-y-4">
          {inactiveCycles.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">
                inventory_2
              </span>
              <p className="text-on-surface-variant font-medium">
                Nenhum ciclo arquivado
              </p>
            </div>
          )}

          {inactiveCycles.map((cycle) => (
            <CycleCard
              key={cycle.id}
              cycle={cycle}
              currentWeek={getCurrentWeek(cycle)}
              onActivate={() => activateCycle(cycle.id)}
              onDelete={() => handleDeleteCycle(cycle)}
            />
          ))}
        </div>
      )}

      <WorkoutFormModal
        open={workoutModalOpen}
        onClose={() => {
          setWorkoutModalOpen(false)
          setEditingWorkout(null)
        }}
        onSave={handleSaveWorkout}
        workout={editingWorkout}
      />

      <CycleFormModal
        open={cycleModalOpen}
        onClose={() => setCycleModalOpen(false)}
        onSave={handleSaveCycle}
        workouts={workouts}
      />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          />
          <div className="relative bg-surface-container-low rounded-2xl p-6 max-w-sm w-full border border-outline-variant/20">
            <h3 className="text-lg font-headline font-bold mb-2">
              Confirmar exclusao
            </h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Tem certeza que deseja excluir{' '}
              <strong className="text-on-surface">{confirmDelete.name}</strong>?
              {confirmDelete.type === 'workout' &&
                ' Ciclos que referenciam este treino serao atualizados.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={executeDelete}
                className="bg-error text-on-error px-4 py-2 rounded-xl font-bold hover:opacity-90 transition-opacity active:scale-95"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CycleCard({
  cycle,
  currentWeek,
  onActivate,
  onArchive,
  onDelete,
  isActive,
}: {
  cycle: CycleWithDays
  currentWeek: number
  onActivate?: () => void
  onArchive?: () => void
  onDelete: () => void
  isActive?: boolean
}) {
  const dayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']

  return (
    <div
      className={`bg-surface-container-low rounded-2xl p-6 border transition-colors ${
        isActive
          ? 'border-primary-container/30'
          : 'border-outline-variant/10 hover:border-outline-variant/20'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isActive && (
              <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-[10px] font-black uppercase">
                Ativo
              </span>
            )}
            <h4 className="text-lg font-headline font-bold">{cycle.name}</h4>
          </div>
          <p className="text-sm text-on-surface-variant">
            {cycle.duration_weeks} semanas
            {cycle.start_date &&
              ` - Semana ${currentWeek} / ${cycle.duration_weeks}`}
          </p>
        </div>
        <div className="flex gap-2">
          {onActivate && !isActive && (
            <button
              onClick={onActivate}
              className="p-2 text-on-surface-variant hover:text-primary-fixed transition-colors"
              title="Ativar ciclo"
            >
              <span className="material-symbols-outlined text-lg">
                play_arrow
              </span>
            </button>
          )}
          {onArchive && isActive && (
            <button
              onClick={onArchive}
              className="p-2 text-on-surface-variant hover:text-on-surface transition-colors"
              title="Arquivar ciclo"
            >
              <span className="material-symbols-outlined text-lg">
                inventory_2
              </span>
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-2 text-on-surface-variant hover:text-error transition-colors"
            title="Excluir ciclo"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dayLabels.map((label, i) => {
          const day = cycle.cycle_days.find((d) => d.day_of_week === i + 1)
          const isRest = day?.is_rest
          const hasWorkout = !!day?.workout_id
          const isRunning = day?.is_running
          const workoutName =
            day?.workouts && 'name' in day.workouts ? day.workouts.name : null

          return (
            <div
              key={i}
              className={`rounded-lg p-2 text-center ${
                isRest
                  ? 'bg-surface-container-highest'
                  : hasWorkout
                    ? 'bg-primary-container/15'
                    : isRunning
                      ? 'bg-secondary-container/15'
                      : 'bg-surface-container-highest'
              }`}
            >
              <span className="text-[10px] font-bold block mb-1">{label}</span>
              <span className="material-symbols-outlined text-sm block">
                {isRest
                  ? 'bed'
                  : isRunning && !hasWorkout
                    ? 'directions_run'
                    : hasWorkout
                      ? 'fitness_center'
                      : 'remove'}
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
  )
}
