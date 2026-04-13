import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { TrainingSession, TrainingSet } from '../types'

export function useTrainingSessions() {
  const { user } = useAuthStore()
  const [session, setSession] = useState<TrainingSession | null>(null)
  const [sets, setSets] = useState<TrainingSet[]>([])
  const [loading, setLoading] = useState(false)

  const getSessionByDate = useCallback(
    async (date: string) => {
      if (!user) return null
      setLoading(true)

      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle()

      if (error || !data) {
        setSession(null)
        setSets([])
        setLoading(false)
        return null
      }

      setSession(data)

      const { data: setsData } = await supabase
        .from('training_sets')
        .select('*')
        .eq('session_id', data.id)
        .order('exercise_name')
        .order('set_number')

      setSets(setsData ?? [])
      setLoading(false)
      return data
    },
    [user]
  )

  const createSession = useCallback(
    async (cycle_id: string, workout_id: string, date: string) => {
      if (!user) return null

      const existing = await getSessionByDate(date)
      if (existing) return existing

      const { data, error } = await supabase
        .from('training_sessions')
        .insert({
          user_id: user.id,
          cycle_id,
          workout_id,
          date,
        })
        .select()
        .single()

      if (error || !data) return null

      setSession(data)
      setSets([])
      return data
    },
    [user, getSessionByDate]
  )

  const saveSet = useCallback(
    async (
      session_id: string,
      exercise_name: string,
      set_number: number,
      weight_kg: number,
      reps: number
    ) => {
      const existing = sets.find(
        (s) =>
          s.session_id === session_id &&
          s.exercise_name === exercise_name &&
          s.set_number === set_number
      )

      if (existing) {
        const { data, error } = await supabase
          .from('training_sets')
          .update({ weight_kg, reps })
          .eq('id', existing.id)
          .select()
          .single()

        if (!error && data) {
          setSets((prev) => prev.map((s) => (s.id === data.id ? data : s)))
        }
        return data
      }

      const { data, error } = await supabase
        .from('training_sets')
        .insert({ session_id, exercise_name, set_number, weight_kg, reps })
        .select()
        .single()

      if (!error && data) {
        setSets((prev) => [...prev, data])
      }
      return data
    },
    [sets]
  )

  const updateSetNote = useCallback(async (set_id: string, note: string) => {
    const { data, error } = await supabase
      .from('training_sets')
      .update({ note })
      .eq('id', set_id)
      .select()
      .single()

    if (!error && data) {
      setSets((prev) => prev.map((s) => (s.id === data.id ? data : s)))
    }
    return data
  }, [])

  const completeSession = useCallback(async (session_id: string) => {
    const { data, error } = await supabase
      .from('training_sessions')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', session_id)
      .select()
      .single()

    if (!error && data) {
      setSession(data)
    }
    return data
  }, [])

  return {
    session,
    sets,
    loading,
    getSessionByDate,
    createSession,
    saveSet,
    updateSetNote,
    completeSession,
  }
}
