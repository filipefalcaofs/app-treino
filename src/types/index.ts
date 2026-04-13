export interface Profile {
  id: string
  name: string
  age: number | null
  weight_kg: number | null
  height_cm: number | null
  body_fat_pct: number | null
  goal: string | null
  avatar_url: string | null
  created_at: string
}

export interface Workout {
  id: string
  user_id: string
  name: string
  muscle_group: string
  created_at: string
}

export interface WorkoutExercise {
  id: string
  workout_id: string
  exercise_name: string
  sets_count: number
  reps_min: number
  reps_max: number
  sort_order: number
}

export interface Cycle {
  id: string
  user_id: string
  name: string
  duration_weeks: number
  start_date: string
  is_active: boolean
  created_at: string
}

export interface CycleDay {
  id: string
  cycle_id: string
  day_of_week: number
  workout_id: string | null
  is_running: boolean
  is_rest: boolean
}

export interface TrainingSession {
  id: string
  user_id: string
  cycle_id: string | null
  date: string
  workout_id: string | null
  completed_at: string | null
}

export interface TrainingSet {
  id: string
  session_id: string
  exercise_name: string
  set_number: number
  weight_kg: number | null
  reps: number | null
  note: string | null
}

export interface RunningLog {
  id: string
  user_id: string
  date: string
  description: string | null
  distance_km: number | null
  total_time: string | null
  avg_pace: string | null
  moving_time: string | null
  elevation_m: number | null
  elevation_gain_m: number | null
  steps: number | null
  heart_rate: number | null
  surface: string | null
  intensity: string | null
  note: string | null
}

export interface ProgressPhoto {
  id: string
  user_id: string
  photo_url: string
  weight_kg: number | null
  body_fat_pct: number | null
  taken_at: string
}
