export interface Exercise {
  id: string
  name: string
  description?: string
}

export interface WorkoutDay {
  id: string // UUID
  workout_id: string // UUID, references parent workout
  day_id: string // e.g., 'push', 'pull', 'leg', or custom
  name: string // Human-friendly name
  exercises: any[] // JSONB array, can be refined if structure is known
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

// New type matching the workout_logs table
export interface WorkoutLog {
  id: string // UUID
  user_id: string
  workout_id: string
  workout_day_id: string | null
  exercise_name: string
  weight: number
  reps: number
  sets?: number
  avg_reps: number
  performed_at: string // ISO date string
  created_at: string
  updated_at: string
}

export interface AppData {
  workouts: Workout[]
  lastSyncTime: string | null
}

export interface WeeklyWorkoutData {
  exerciseName: string
  weeks: Record<string, { reps: number; weight: number; date: string } | null>
  previousWorkout: { reps: number; weight: number; date: string } | null
}
