import Dexie, { type EntityTable } from 'dexie'

interface Profile {
  id: string
}

interface Workout {
  id: string
  user_id: string
}

interface WorkoutExercise {
  id: string
  workout_id: string
}

interface Cycle {
  id: string
  user_id: string
}

interface CycleDay {
  id: string
  cycle_id: string
}

interface TrainingSession {
  id: string
  user_id: string
  date: string
}

interface TrainingSet {
  id: string
  session_id: string
}

interface RunningLog {
  id: string
  user_id: string
  date: string
}

interface ProgressPhoto {
  id: string
  user_id: string
}

export interface SyncQueueItem {
  id?: number
  table_name: string
  operation: 'insert' | 'update' | 'delete'
  record_id: string
  data: Record<string, unknown> | null
  created_at: string
}

class GainLogDB extends Dexie {
  profiles!: EntityTable<Profile, 'id'>
  workouts!: EntityTable<Workout, 'id'>
  workout_exercises!: EntityTable<WorkoutExercise, 'id'>
  cycles!: EntityTable<Cycle, 'id'>
  cycle_days!: EntityTable<CycleDay, 'id'>
  training_sessions!: EntityTable<TrainingSession, 'id'>
  training_sets!: EntityTable<TrainingSet, 'id'>
  running_logs!: EntityTable<RunningLog, 'id'>
  progress_photos!: EntityTable<ProgressPhoto, 'id'>
  sync_queue!: EntityTable<SyncQueueItem, 'id'>

  constructor() {
    super('GainLogDB')

    this.version(1).stores({
      profiles: 'id',
      workouts: 'id, user_id',
      workout_exercises: 'id, workout_id',
      cycles: 'id, user_id',
      cycle_days: 'id, cycle_id',
      training_sessions: 'id, user_id, date',
      training_sets: 'id, session_id',
      running_logs: 'id, user_id, date',
      progress_photos: 'id, user_id',
      sync_queue: '++id, table_name, operation, record_id, created_at',
    })
  }
}

export const db = new GainLogDB()
