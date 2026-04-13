import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { Workout, WorkoutExercise } from '../types'

export type WorkoutWithExercises = Workout & {
  workout_exercises: WorkoutExercise[]
}

type ExerciseInput = {
  exercise_name: string
  sets_count: number
  reps_min: number
  reps_max: number
  sort_order: number
}

export function useWorkouts() {
  const { user } = useAuthStore()
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWorkouts = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data, error } = await supabase
      .from('workouts')
      .select('*, workout_exercises(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const sorted = data.map((w) => ({
        ...w,
        workout_exercises: (w.workout_exercises as WorkoutExercise[]).sort(
          (a, b) => a.sort_order - b.sort_order
        ),
      }))
      setWorkouts(sorted)
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchWorkouts()
  }, [fetchWorkouts])

  const createWorkout = async (
    name: string,
    muscle_group: string,
    exercises: ExerciseInput[]
  ) => {
    if (!user) return { error: 'Não autenticado' }

    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({ user_id: user.id, name, muscle_group })
      .select()
      .single()

    if (workoutError || !workout) return { error: workoutError?.message }

    const rows = exercises.map((ex, i) => ({
      workout_id: workout.id,
      exercise_name: ex.exercise_name,
      sets_count: ex.sets_count,
      reps_min: ex.reps_min,
      reps_max: ex.reps_max,
      sort_order: i,
    }))

    if (rows.length > 0) {
      const { error: exError } = await supabase
        .from('workout_exercises')
        .insert(rows)

      if (exError) return { error: exError.message }
    }

    await fetchWorkouts()
    return { error: null }
  }

  const updateWorkout = async (
    id: string,
    name: string,
    muscle_group: string,
    exercises: ExerciseInput[]
  ) => {
    if (!user) return { error: 'Não autenticado' }

    const { error: updateError } = await supabase
      .from('workouts')
      .update({ name, muscle_group })
      .eq('id', id)

    if (updateError) return { error: updateError.message }

    const { error: deleteError } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('workout_id', id)

    if (deleteError) return { error: deleteError.message }

    const rows = exercises.map((ex, i) => ({
      workout_id: id,
      exercise_name: ex.exercise_name,
      sets_count: ex.sets_count,
      reps_min: ex.reps_min,
      reps_max: ex.reps_max,
      sort_order: i,
    }))

    if (rows.length > 0) {
      const { error: insertError } = await supabase
        .from('workout_exercises')
        .insert(rows)

      if (insertError) return { error: insertError.message }
    }

    await fetchWorkouts()
    return { error: null }
  }

  const deleteWorkout = async (id: string) => {
    if (!user) return { error: 'Não autenticado' }

    await supabase
      .from('cycle_days')
      .update({ workout_id: null })
      .eq('workout_id', id)

    const { error } = await supabase.from('workouts').delete().eq('id', id)
    if (error) return { error: error.message }

    await fetchWorkouts()
    return { error: null }
  }

  return {
    workouts,
    loading,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    refetch: fetchWorkouts,
  }
}
