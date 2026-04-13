import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { Cycle, CycleDay, Workout } from '../types'

export type CycleDayWithWorkout = CycleDay & {
  workouts: Workout | null
}

export type CycleWithDays = Cycle & {
  cycle_days: CycleDayWithWorkout[]
}

type DayInput = {
  day_of_week: number
  workout_id: string | null
  is_running: boolean
  is_rest: boolean
}

export function useCycles() {
  const { user } = useAuthStore()
  const [cycles, setCycles] = useState<CycleWithDays[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCycles = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data, error } = await supabase
      .from('cycles')
      .select('*, cycle_days(*, workouts:workout_id(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const sorted = data.map((c) => ({
        ...c,
        cycle_days: (c.cycle_days as CycleDayWithWorkout[]).sort(
          (a, b) => a.day_of_week - b.day_of_week
        ),
      }))
      setCycles(sorted)
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchCycles()
  }, [fetchCycles])

  const activeCycle = cycles.find((c) => c.is_active) ?? null

  const createCycle = async (
    name: string,
    duration_weeks: number,
    days: DayInput[],
    activateNow: boolean
  ) => {
    if (!user) return { error: 'Não autenticado' }

    if (activateNow) {
      await supabase
        .from('cycles')
        .update({ is_active: false })
        .eq('user_id', user.id)
    }

    const { data: cycle, error: cycleError } = await supabase
      .from('cycles')
      .insert({
        user_id: user.id,
        name,
        duration_weeks,
        is_active: activateNow,
        start_date: activateNow ? new Date().toISOString().split('T')[0] : null,
      })
      .select()
      .single()

    if (cycleError || !cycle) return { error: cycleError?.message }

    const rows = days.map((d) => ({
      cycle_id: cycle.id,
      day_of_week: d.day_of_week,
      workout_id: d.workout_id,
      is_running: d.is_running,
      is_rest: d.is_rest,
    }))

    if (rows.length > 0) {
      const { error: daysError } = await supabase
        .from('cycle_days')
        .insert(rows)

      if (daysError) return { error: daysError.message }
    }

    await fetchCycles()
    return { error: null }
  }

  const activateCycle = async (id: string) => {
    if (!user) return { error: 'Não autenticado' }

    await supabase
      .from('cycles')
      .update({ is_active: false })
      .eq('user_id', user.id)

    const { error } = await supabase
      .from('cycles')
      .update({
        is_active: true,
        start_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', id)

    if (error) return { error: error.message }

    await fetchCycles()
    return { error: null }
  }

  const archiveCycle = async (id: string) => {
    const { error } = await supabase
      .from('cycles')
      .update({ is_active: false })
      .eq('id', id)

    if (error) return { error: error.message }

    await fetchCycles()
    return { error: null }
  }

  const deleteCycle = async (id: string) => {
    const { error } = await supabase.from('cycles').delete().eq('id', id)
    if (error) return { error: error.message }

    await fetchCycles()
    return { error: null }
  }

  const getDaysRemaining = (cycle: Cycle) => {
    if (!cycle.start_date) return null
    const start = new Date(cycle.start_date)
    const end = new Date(start)
    end.setDate(end.getDate() + cycle.duration_weeks * 7)
    const today = new Date()
    const diff = Math.ceil(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
    return Math.max(0, diff)
  }

  const getCurrentWeek = (cycle: Cycle) => {
    if (!cycle.start_date) return 1
    const start = new Date(cycle.start_date)
    const today = new Date()
    const diff = Math.floor(
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    )
    return Math.min(Math.floor(diff / 7) + 1, cycle.duration_weeks)
  }

  return {
    cycles,
    activeCycle,
    loading,
    createCycle,
    activateCycle,
    archiveCycle,
    deleteCycle,
    getDaysRemaining,
    getCurrentWeek,
    refetch: fetchCycles,
  }
}
