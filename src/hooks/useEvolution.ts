import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

interface ExerciseHistoryEntry {
  date: string
  weight_kg: number | null
  reps: number | null
  set_number: number
  note: string | null
}

interface PersonalRecord {
  weight_kg: number
  date: string
  reps: number | null
}

export function useEvolution() {
  const { user } = useAuth()
  const [exercises, setExercises] = useState<string[]>([])
  const [history, setHistory] = useState<ExerciseHistoryEntry[]>([])
  const [pr, setPr] = useState<PersonalRecord | null>(null)
  const [loading, setLoading] = useState(false)

  const getUniqueExercises = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data } = await supabase
      .from('training_sets')
      .select('exercise_name, session_id, training_sessions!inner(user_id)')
      .eq('training_sessions.user_id', user.id)

    if (data) {
      const unique = [...new Set(
        (data as unknown as { exercise_name: string }[])
          .map(d => d.exercise_name)
      )].sort()
      setExercises(unique)
    }

    setLoading(false)
  }, [user])

  const getExerciseHistory = useCallback(async (exerciseName: string) => {
    if (!user) return
    setLoading(true)

    const { data } = await supabase
      .from('training_sets')
      .select('weight_kg, reps, set_number, note, training_sessions!inner(date, user_id)')
      .eq('exercise_name', exerciseName)
      .eq('training_sessions.user_id', user.id)
      .order('set_number', { ascending: true })

    if (data) {
      const entries: ExerciseHistoryEntry[] = (data as unknown as {
        weight_kg: number | null
        reps: number | null
        set_number: number
        note: string | null
        training_sessions: { date: string; user_id: string }
      }[]).map(d => ({
        date: d.training_sessions.date,
        weight_kg: d.weight_kg,
        reps: d.reps,
        set_number: d.set_number,
        note: d.note,
      }))

      entries.sort((a, b) => a.date.localeCompare(b.date))
      setHistory(entries)
    } else {
      setHistory([])
    }

    setLoading(false)
  }, [user])

  const getPersonalRecord = useCallback(async (exerciseName: string) => {
    if (!user) return
    setLoading(true)

    const { data } = await supabase
      .from('training_sets')
      .select('weight_kg, reps, training_sessions!inner(date, user_id)')
      .eq('exercise_name', exerciseName)
      .eq('training_sessions.user_id', user.id)
      .not('weight_kg', 'is', null)
      .order('weight_kg', { ascending: false })
      .limit(1)

    if (data && data.length > 0) {
      const d = data[0] as unknown as {
        weight_kg: number
        reps: number | null
        training_sessions: { date: string }
      }
      setPr({
        weight_kg: d.weight_kg,
        date: d.training_sessions.date,
        reps: d.reps,
      })
    } else {
      setPr(null)
    }

    setLoading(false)
  }, [user])

  return {
    exercises,
    history,
    pr,
    loading,
    getExerciseHistory,
    getUniqueExercises,
    getPersonalRecord,
  }
}
