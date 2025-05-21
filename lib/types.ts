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
  date: string
  workoutId: string
  workoutName: string
  dayId: string
  dayName: string
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  sets: number
}

export interface WorkoutNote {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  color?: string
  category?: string
}

export interface AppData {
  workouts: Workout[]
  completedExercises: Record<string, Record<string, boolean>>
  lastSyncTime: string | null
}
