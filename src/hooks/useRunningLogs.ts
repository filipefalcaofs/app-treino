import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { RunningLog } from '../types'

interface RunningPRs {
  maxDistance: { value: number; date: string } | null
  bestPace: { value: string; date: string } | null
}

type RunningLogInput = Omit<RunningLog, 'id' | 'user_id'>

export function useRunningLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<RunningLog[]>([])
  const [prs, setPrs] = useState<RunningPRs>({ maxDistance: null, bestPace: null })
  const [loading, setLoading] = useState(false)

  const fetchRunningLogs = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data } = await supabase
      .from('running_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (data) {
      setLogs(data as RunningLog[])
    }

    setLoading(false)
  }, [user])

  const createRunningLog = useCallback(async (input: RunningLogInput) => {
    if (!user) return

    const { error } = await supabase
      .from('running_logs')
      .insert({
        user_id: user.id,
        date: input.date,
        description: input.description,
        distance_km: input.distance_km,
        total_time: input.total_time,
        avg_pace: input.avg_pace,
        moving_time: input.moving_time,
        elevation_m: input.elevation_m,
        elevation_gain_m: input.elevation_gain_m,
        steps: input.steps,
        heart_rate: input.heart_rate,
        surface: input.surface,
        intensity: input.intensity,
        note: input.note,
      })

    if (error) throw error
    await fetchRunningLogs()
  }, [user, fetchRunningLogs])

  const getRunningPRs = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data: distData } = await supabase
      .from('running_logs')
      .select('distance_km, date')
      .eq('user_id', user.id)
      .not('distance_km', 'is', null)
      .order('distance_km', { ascending: false })
      .limit(1)

    const { data: paceData } = await supabase
      .from('running_logs')
      .select('avg_pace, date')
      .eq('user_id', user.id)
      .not('avg_pace', 'is', null)
      .order('avg_pace', { ascending: true })
      .limit(1)

    setPrs({
      maxDistance: distData?.[0]
        ? { value: distData[0].distance_km!, date: distData[0].date }
        : null,
      bestPace: paceData?.[0]
        ? { value: paceData[0].avg_pace!, date: paceData[0].date }
        : null,
    })

    setLoading(false)
  }, [user])

  return {
    logs,
    loading,
    createRunningLog,
    prs,
    refetch: fetchRunningLogs,
    getRunningPRs,
  }
}
