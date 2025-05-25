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

export interface WorkoutSession {
  id: string
  workoutId: string
  workoutName: string
  dayId: string
  dayName: string
  completedExercises: Record<string, Record<string, boolean>>
  duration: number
  notes?: string
  timestamp: string
  date: string
  exercises: string[]
  totalExercises: number
  completedCount: number
}

export interface AppData {
  workouts: Workout[]
  completedExercises: Record<string, Record<string, boolean>>
  lastSyncTime: string | null
}
