export interface Exercise {
  id: string
  name: string
  description?: string
}

export interface WorkoutDay {
  id: string
  name: string
  exercises: Exercise[]
}

export interface Workout {
  id: string
  name: string
  days: WorkoutDay[]
}

// New type matching the workout_logs table
export interface WorkoutLog {
  id: string
  user_id?: string
  workout_id: string
  exercise_name: string
  weight: number
  avg_reps: number
  performed_at: string // ISO date string
}

export interface AppData {
  workouts: Workout[]
  lastSyncTime: string | null
}
