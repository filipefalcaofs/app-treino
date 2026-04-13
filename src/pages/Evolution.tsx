import { useState, useEffect, useMemo } from 'react'
import { useEvolution } from '../hooks/useEvolution'
import { useRunningLogs } from '../hooks/useRunningLogs'
import { ExerciseSelector } from '../components/evolution/ExerciseSelector'
import { PerformanceChart } from '../components/evolution/PerformanceChart'
import { SessionHistory } from '../components/evolution/SessionHistory'
import { PRCard } from '../components/evolution/PRCard'
import { RunningHistory } from '../components/evolution/RunningHistory'
import { RunningFormModal } from '../components/running/RunningFormModal'

type Tab = 'musculacao' | 'corrida'

export function Evolution() {
  const [tab, setTab] = useState<Tab>('musculacao')
  const [selectedExercise, setSelectedExercise] = useState('')
  const [runModalOpen, setRunModalOpen] = useState(false)

  const {
    exercises,
    history,
    pr,
    loading: evoLoading,
    getExerciseHistory,
    getUniqueExercises,
    getPersonalRecord,
  } = useEvolution()

  const {
    logs,
    loading: runLoading,
    createRunningLog,
    prs: runPRs,
    refetch: fetchLogs,
    getRunningPRs,
  } = useRunningLogs()

  useEffect(() => {
    getUniqueExercises()
  }, [getUniqueExercises])

  useEffect(() => {
    if (exercises.length > 0 && !selectedExercise) {
      setSelectedExercise(exercises[0])
    }
  }, [exercises, selectedExercise])

  useEffect(() => {
    if (selectedExercise) {
      getExerciseHistory(selectedExercise)
      getPersonalRecord(selectedExercise)
    }
  }, [selectedExercise, getExerciseHistory, getPersonalRecord])

  useEffect(() => {
    if (tab === 'corrida') {
      fetchLogs()
      getRunningPRs()
    }
  }, [tab, fetchLogs, getRunningPRs])

  const chartData = useMemo(() => {
    const grouped = new Map<string, { total: number; count: number }>()

    for (const h of history) {
      if (h.weight_kg == null) continue
      const existing = grouped.get(h.date)
      if (existing) {
        existing.total += h.weight_kg
        existing.count++
      } else {
        grouped.set(h.date, { total: h.weight_kg, count: 1 })
      }
    }

    return Array.from(grouped.entries())
      .map(([date, { total, count }]) => ({
        date,
        value: Math.round((total / count) * 10) / 10,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [history])

  const sessionEntries = useMemo(() => {
    const grouped = new Map<string, {
      date: string
      weight_kg: number | null
      reps: number[]
      note: string | null
    }>()

    for (const h of history) {
      const key = h.date
      const existing = grouped.get(key)
      if (existing) {
        if (h.reps != null) existing.reps.push(h.reps)
        if (h.weight_kg != null && (existing.weight_kg == null || h.weight_kg > existing.weight_kg)) {
          existing.weight_kg = h.weight_kg
        }
        if (h.note && !existing.note) existing.note = h.note
      } else {
        grouped.set(key, {
          date: h.date,
          weight_kg: h.weight_kg,
          reps: h.reps != null ? [h.reps] : [],
          note: h.note,
        })
      }
    }

    return Array.from(grouped.values()).sort((a, b) => b.date.localeCompare(a.date))
  }, [history])

  const volumeAvg = useMemo(() => {
    if (sessionEntries.length === 0) return null
    const totalVol = sessionEntries.reduce((sum, s) => {
      const w = s.weight_kg ?? 0
      const totalReps = s.reps.reduce((a, b) => a + b, 0)
      return sum + w * totalReps
    }, 0)
    return Math.round(totalVol / sessionEntries.length)
  }, [sessionEntries])

  const runDistanceChartData = useMemo(() => {
    return logs
      .filter(l => l.distance_km != null)
      .map(l => ({ date: l.date, value: l.distance_km! }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [logs])

  const runPaceChartData = useMemo(() => {
    return logs
      .filter(l => l.avg_pace != null)
      .map(l => {
        const parts = l.avg_pace!.split(':')
        const mins = parseInt(parts[0]) + parseInt(parts[1]) / 60
        return { date: l.date, value: Math.round(mins * 100) / 100 }
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [logs])

  const loading = evoLoading || runLoading

  return (
    <div>
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline font-extrabold text-5xl tracking-tighter text-on-surface mb-2">
              EVOLUCAO
            </h1>
            <p className="text-on-surface-variant font-medium">
              Acompanhe suas metricas de desempenho e trajetoria fisica.
            </p>
          </div>
          <div className="flex bg-surface-container-low p-1 rounded-xl">
            <button
              onClick={() => setTab('musculacao')}
              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                tab === 'musculacao'
                  ? 'bg-surface-container-highest text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Musculacao
            </button>
            <button
              onClick={() => setTab('corrida')}
              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                tab === 'corrida'
                  ? 'bg-surface-container-highest text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Corrida
            </button>
          </div>
        </div>
      </header>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && tab === 'musculacao' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-surface-container-low rounded-xl p-6">
              <ExerciseSelector
                exercises={exercises}
                selected={selectedExercise}
                onSelect={setSelectedExercise}
              />
            </div>

            {selectedExercise && (
              <>
                <PerformanceChart
                  data={chartData}
                  unit="kg"
                  label={`Evolucao de carga - ${selectedExercise}`}
                />

                <div>
                  <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">
                    Historico de Sessoes
                  </h4>
                  <SessionHistory sessions={sessionEntries} />
                </div>
              </>
            )}

            {!selectedExercise && exercises.length === 0 && (
              <div className="bg-surface-container-low rounded-xl p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">
                  fitness_center
                </span>
                <p className="text-on-surface-variant text-lg font-medium mb-2">
                  Nenhum exercicio registrado
                </p>
                <p className="text-on-surface-variant/60 text-sm">
                  Registre treinos na pagina Semana para ver seus graficos de evolucao.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            {pr && (
              <PRCard
                value={`${pr.weight_kg} KG`}
                label="Recorde Pessoal"
                sublabel={`${new Date(pr.date + 'T00:00:00').toLocaleDateString('pt-BR')}${pr.reps ? ` - ${pr.reps} reps` : ''}`}
              />
            )}

            {!pr && selectedExercise && (
              <PRCard
                value="--"
                label="Recorde Pessoal"
                sublabel="Sem dados suficientes"
              />
            )}

            <div className="bg-surface-container-low rounded-xl p-6 space-y-4">
              <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
                Metricas
              </h4>

              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">Volume medio</span>
                <span className="font-bold text-on-surface font-headline">
                  {volumeAvg != null ? `${volumeAvg.toLocaleString('pt-BR')} kg` : '--'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">Sessoes registradas</span>
                <span className="font-bold text-on-surface font-headline">
                  {sessionEntries.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">Exercicios unicos</span>
                <span className="font-bold text-on-surface font-headline">
                  {exercises.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && tab === 'corrida' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setRunModalOpen(true)}
              className="kinetic-gradient text-on-primary-container px-5 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Registrar Corrida
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {runPRs.maxDistance && (
              <PRCard
                value={`${runPRs.maxDistance.value} KM`}
                label="Maior Distancia"
                sublabel={new Date(runPRs.maxDistance.date + 'T00:00:00').toLocaleDateString('pt-BR')}
              />
            )}
            {runPRs.bestPace && (
              <PRCard
                value={`${runPRs.bestPace.value} /KM`}
                label="Melhor Pace"
                sublabel={new Date(runPRs.bestPace.date + 'T00:00:00').toLocaleDateString('pt-BR')}
              />
            )}
          </div>

          {runDistanceChartData.length > 1 && (
            <PerformanceChart
              data={runDistanceChartData}
              unit="km"
              label="Evolucao de Distancia"
            />
          )}

          {runPaceChartData.length > 1 && (
            <PerformanceChart
              data={runPaceChartData}
              unit="min/km"
              label="Evolucao de Pace"
            />
          )}

          <div>
            <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">
              Historico de Corridas
            </h4>
            <RunningHistory
              logs={logs}
              distancePR={runPRs.maxDistance?.value}
              pacePR={runPRs.bestPace?.value}
            />
          </div>

          <RunningFormModal
            open={runModalOpen}
            onClose={() => setRunModalOpen(false)}
            onSave={async (data) => {
              await createRunningLog(data)
              await getRunningPRs()
            }}
          />
        </div>
      )}
    </div>
  )
}
