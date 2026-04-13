import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useCycles } from '../hooks/useCycles'
import { useTrainingSessions } from '../hooks/useTrainingSessions'
import { supabase } from '../lib/supabase'
import { DaySelector } from '../components/week/DaySelector'
import { ExerciseCard } from '../components/week/ExerciseCard'
import type { WorkoutExercise } from '../types'

function getTodayDow(): number {
  const d = new Date().getDay()
  return d === 0 ? 7 : d
}

function getDateForDow(dow: number): string {
  const now = new Date()
  const currentDow = now.getDay() === 0 ? 7 : now.getDay()
  const diff = dow - currentDow
  const target = new Date(now)
  target.setDate(now.getDate() + diff)
  return target.toISOString().split('T')[0]
}

export function Week() {
  const { activeCycle, loading: cyclesLoading, getCurrentWeek } = useCycles()
  const {
    session,
    sets,
    loading: sessionLoading,
    getSessionByDate,
    createSession,
    saveSet,
    updateSetNote,
    completeSession,
  } = useTrainingSessions()

  const [selectedDay, setSelectedDay] = useState(getTodayDow)
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [exercisesLoading, setExercisesLoading] = useState(false)

  const selectedCycleDay = activeCycle?.cycle_days.find(
    (cd) => cd.day_of_week === selectedDay
  )

  const workout = selectedCycleDay?.workouts ?? null
  const isRest =
    !selectedCycleDay || (selectedCycleDay.is_rest && !selectedCycleDay.workout_id && !selectedCycleDay.is_running)
  const isRunningOnly =
    selectedCycleDay?.is_running && !selectedCycleDay.workout_id

  const fetchExercises = useCallback(async (workoutId: string) => {
    setExercisesLoading(true)
    const { data } = await supabase
      .from('workout_exercises')
      .select('*')
      .eq('workout_id', workoutId)
      .order('sort_order')

    setExercises(data ?? [])
    setExercisesLoading(false)
  }, [])

  const loadDayData = useCallback(
    async (dow: number) => {
      if (!activeCycle) return

      const cycleDay = activeCycle.cycle_days.find(
        (cd) => cd.day_of_week === dow
      )
      const date = getDateForDow(dow)

      if (cycleDay?.workout_id) {
        await fetchExercises(cycleDay.workout_id)

        const existing = await getSessionByDate(date)
        if (!existing) {
          await createSession(activeCycle.id, cycleDay.workout_id, date)
        }
      } else {
        setExercises([])
        await getSessionByDate(date)
      }
    },
    [activeCycle, fetchExercises, getSessionByDate, createSession]
  )

  useEffect(() => {
    if (activeCycle) {
      loadDayData(selectedDay)
    }
  }, [activeCycle, selectedDay, loadDayData])

  const handleSelectDay = (dow: number) => {
    setSelectedDay(dow)
  }

  const handleSaveSet = async (
    exerciseName: string,
    setNumber: number,
    weightKg: number,
    reps: number
  ) => {
    if (!session) return
    await saveSet(session.id, exerciseName, setNumber, weightKg, reps)
  }

  const handleUpdateNote = async (setId: string, note: string) => {
    await updateSetNote(setId, note)
  }

  const handleCompleteSession = async () => {
    if (!session) return
    await completeSession(session.id)
  }

  const allSetsCompleted = exercises.length > 0 && exercises.every((ex) => {
    const exerciseSets = sets.filter(
      (s) => s.exercise_name === ex.exercise_name
    )
    return exerciseSets.filter(
      (s) => s.weight_kg !== null && s.reps !== null
    ).length >= ex.sets_count
  })

  const firstIncompleteExercise = exercises.find((ex) => {
    const exerciseSets = sets.filter(
      (s) => s.exercise_name === ex.exercise_name
    )
    return (
      exerciseSets.filter((s) => s.weight_kg !== null && s.reps !== null)
        .length < ex.sets_count
    )
  })

  if (cyclesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!activeCycle) {
    return (
      <div>
      <section className="mb-6 md:mb-10">
        <h2 className="font-headline font-extrabold text-3xl md:text-4xl tracking-tighter mb-1">
          SEMANA
        </h2>
        <p className="text-on-surface-variant font-medium text-sm md:text-base">
          Selecione um dia para registrar seu treino.
        </p>
      </section>

        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">
              calendar_view_week
            </span>
          </div>
          <div className="text-center">
            <p className="text-on-surface font-headline font-bold text-lg mb-2">
              Nenhum ciclo ativo
            </p>
            <p className="text-on-surface-variant text-sm max-w-sm">
              Crie um ciclo de treino para ver a programação semanal e registrar
              seus treinos.
            </p>
          </div>
          <Link
            to="/treinos"
            className="px-8 py-3 bg-primary-container text-on-primary-container rounded-full font-bold text-sm hover:scale-105 transition-transform active:scale-95"
          >
            Ir para Treinos
          </Link>
        </div>
      </div>
    )
  }

  const currentWeek = getCurrentWeek(activeCycle)

  return (
    <div>
      <section className="mb-6 md:mb-10">
        <h2 className="font-headline font-extrabold text-3xl md:text-4xl tracking-tighter mb-1">
          SEMANA
        </h2>
        <p className="text-on-surface-variant font-medium text-sm md:text-base">
          {activeCycle.name}
          <span className="ml-2 text-xs text-on-surface-variant/60">
            Semana {currentWeek} de {activeCycle.duration_weeks}
          </span>
        </p>
      </section>

      <DaySelector
        activeCycle={activeCycle}
        selectedDay={selectedDay}
        onSelectDay={handleSelectDay}
      />

      {isRest ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant">
              bedtime
            </span>
          </div>
          <p className="text-on-surface font-headline font-bold text-lg">
            Dia de descanso
          </p>
          <p className="text-on-surface-variant text-sm">
            Aproveite para recuperar e se preparar para o próximo treino.
          </p>
        </div>
      ) : isRunningOnly ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-primary-fixed-dim">
              directions_run
            </span>
          </div>
          <p className="text-on-surface font-headline font-bold text-lg">
            Dia de corrida
          </p>
          <p className="text-on-surface-variant text-sm">
            Registre sua corrida na aba de evolução.
          </p>
          <Link
            to="/evolucao"
            className="px-6 py-2.5 bg-surface-container-high text-primary rounded-full font-bold text-sm hover:bg-surface-container-highest transition-colors"
          >
            Registrar corrida
          </Link>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-2xl font-headline font-bold text-primary">
                {workout?.name ?? 'Treino'}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-on-surface-variant text-sm">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    schedule
                  </span>
                  {exercises.length * 12} min est.
                </span>
                {selectedCycleDay?.is_running && (
                  <span className="flex items-center gap-1 text-primary-fixed-dim">
                    <span className="material-symbols-outlined text-sm">
                      directions_run
                    </span>
                    + Corrida
                  </span>
                )}
              </div>
            </div>
            {selectedCycleDay?.is_running && (
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary-fixed-dim border border-outline-variant/20">
                <span className="material-symbols-outlined">
                  directions_run
                </span>
              </div>
            )}
          </div>

          {exercisesLoading || sessionLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {exercises.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  exerciseName={ex.exercise_name}
                  setsCount={ex.sets_count}
                  repsMin={ex.reps_min}
                  repsMax={ex.reps_max}
                  sets={sets.filter(
                    (s) => s.exercise_name === ex.exercise_name
                  )}
                  isActive={firstIncompleteExercise?.id === ex.id}
                  onSaveSet={handleSaveSet}
                  onUpdateNote={handleUpdateNote}
                />
              ))}

              {session && !session.completed_at && allSetsCompleted && (
                <div className="lg:col-span-12 bg-primary-container rounded-2xl p-8 flex flex-col justify-center items-center text-center">
                  <p className="text-on-primary-container font-black text-3xl italic tracking-tighter mb-2">
                    TREINO COMPLETO
                  </p>
                  <p className="text-on-primary-container/80 text-sm font-medium mb-6">
                    Todos os exercícios foram preenchidos. Finalize a sessão
                    para registrar.
                  </p>
                  <button
                    onClick={handleCompleteSession}
                    className="px-8 py-3 bg-on-primary-container text-primary-container rounded-full font-bold text-sm hover:scale-105 transition-transform active:scale-95"
                  >
                    Finalizar sessão
                  </button>
                </div>
              )}

              {session?.completed_at && (
                <div className="lg:col-span-12 bg-surface-container-high rounded-2xl p-8 flex flex-col items-center text-center">
                  <span className="material-symbols-outlined text-4xl text-primary-container mb-3">
                    check_circle
                  </span>
                  <p className="text-on-surface font-headline font-bold text-lg">
                    Sessão finalizada
                  </p>
                  <p className="text-on-surface-variant text-sm mt-1">
                    Treino registrado com sucesso.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
