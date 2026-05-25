export interface Exercise {
  id: string
  name: string
  description?: string
  exercise_id?: string // Shared UUID from the exercises table
}

export interface WorkoutExercise {
  id: string
  exercise_id?: string // Shared UUID from the exercises table
  name: string
  [key: string]: unknown
}

export interface WorkoutDay {
  id: string // UUID
  workout_id: string // UUID, references parent workout
  day_id: string // e.g., 'push', 'pull', 'leg', or custom
  name: string // Human-friendly name
  exercises: WorkoutExercise[]
  created_at: string
  updated_at: string
}

export interface Workout {
  id: string
  user_id: string
  name: string
  days: WorkoutDay[]
  created_at: string
  updated_at: string
}

// Type matching the workout_logs table in Supabase
export interface WorkoutLog {
  id: string // UUID
  user_id: string
  workout_id: string
  workout_day_id: string | null
  exercise_id: string // Foreign key to exercises table
  exercise_name: string // Denormalized name for UI convenience
  weight: number
  avg_reps: number // Renamed from 'reps' to match DB schema
  sets: number // Default 1 in DB
  volume?: number // Precomputed volume (weight * avg_reps * sets, or avg_reps * sets for bodyweight exercises at 0kg)
  performed_at: string // ISO date string (YYYY-MM-DD)
  created_at: string
  updated_at: string
}

export interface AppData {
  workouts: Workout[]
  workoutDays: WorkoutDay[]
  lastSyncTime?: string | null
}

