import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useCycles, type CycleDayWithWorkout } from './useCycles'
import type { TrainingSet } from '../types'

export type LastSessionData = {
  id: string
  date: string
  workout_name: string | null
  sets: TrainingSet[]
}

function getAppDayOfWeek(): number {
  const jsDay = new Date().getDay()
  return jsDay === 0 ? 7 : jsDay
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

export function useDashboard() {
  const { user } = useAuthStore()
  const { activeCycle, getDaysRemaining, loading: cyclesLoading } = useCycles()

  const [todayWorkout, setTodayWorkout] = useState<CycleDayWithWorkout | null>(null)
  const [lastSession, setLastSession] = useState<LastSessionData | null>(null)
  const [streak, setStreak] = useState(0)
  const [weeklyVolume, setWeeklyVolume] = useState(0)
  const [monthlyWorkouts, setMonthlyWorkouts] = useState(0)
  const [loading, setLoading] = useState(true)

  const daysRemaining = activeCycle ? getDaysRemaining(activeCycle) : null

  useEffect(() => {
    if (cyclesLoading) return

    if (activeCycle) {
      const dow = getAppDayOfWeek()
      const dayEntry = activeCycle.cycle_days.find((d) => d.day_of_week === dow) ?? null
      setTodayWorkout(dayEntry)
    } else {
      setTodayWorkout(null)
    }
  }, [activeCycle, cyclesLoading])

  useEffect(() => {
    if (!user || cyclesLoading) return

    async function fetchDashboardData() {
      setLoading(true)

      const [lastSessionResult, streakResult, volumeResult, monthResult] = await Promise.all([
        fetchLastSession(user!.id),
        fetchStreak(user!.id),
        fetchWeeklyVolume(user!.id),
        fetchMonthlyWorkouts(user!.id),
      ])

      setLastSession(lastSessionResult)
      setStreak(streakResult)
      setWeeklyVolume(volumeResult)
      setMonthlyWorkouts(monthResult)
      setLoading(false)
    }

    fetchDashboardData()
  }, [user, cyclesLoading])

  return { todayWorkout, lastSession, daysRemaining, streak, weeklyVolume, monthlyWorkouts, loading: loading || cyclesLoading, activeCycle }
}

async function fetchLastSession(userId: string): Promise<LastSessionData | null> {
  const { data: session } = await supabase
    .from('training_sessions')
    .select('id, date, workout_id')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!session) return null

  let workoutName: string | null = null
  if (session.workout_id) {
    const { data: workout } = await supabase
      .from('workouts')
      .select('name')
      .eq('id', session.workout_id)
      .single()
    workoutName = workout?.name ?? null
  }

  const { data: sets } = await supabase
    .from('training_sets')
    .select('*')
    .eq('session_id', session.id)
    .order('exercise_name')
    .order('set_number')

  const setsData = sets ?? []

  if (!workoutName && setsData.length > 0) {
    workoutName = setsData[0].exercise_name
  }

  return {
    id: session.id,
    date: session.date,
    workout_name: workoutName,
    sets: setsData,
  }
}

async function fetchStreak(userId: string): Promise<number> {
  const { data: sessions } = await supabase
    .from('training_sessions')
    .select('date')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .order('date', { ascending: false })
    .limit(90)

  if (!sessions || sessions.length === 0) return 0

  const uniqueDates = [...new Set(sessions.map((s) => s.date))].sort().reverse()

  let count = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let checkDate = new Date(today)

  if (uniqueDates[0] !== formatDate(checkDate)) {
    checkDate.setDate(checkDate.getDate() - 1)
    if (uniqueDates[0] !== formatDate(checkDate)) return 0
  }

  for (const dateStr of uniqueDates) {
    if (dateStr === formatDate(checkDate)) {
      count++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return count
}

async function fetchWeeklyVolume(userId: string): Promise<number> {
  const today = new Date()
  const jsDay = today.getDay()
  const mondayOffset = jsDay === 0 ? 6 : jsDay - 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - mondayOffset)
  const mondayStr = formatDate(monday)

  const { data: sessions } = await supabase
    .from('training_sessions')
    .select('id')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .gte('date', mondayStr)

  if (!sessions || sessions.length === 0) return 0

  const sessionIds = sessions.map((s) => s.id)

  const { data: sets } = await supabase
    .from('training_sets')
    .select('weight_kg, reps')
    .in('session_id', sessionIds)

  if (!sets) return 0

  return sets.reduce((acc, s) => acc + (s.weight_kg ?? 0) * (s.reps ?? 0), 0)
}

async function fetchMonthlyWorkouts(userId: string): Promise<number> {
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const firstStr = formatDate(firstOfMonth)

  const { count } = await supabase
    .from('training_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .gte('date', firstStr)

  return count ?? 0
}
