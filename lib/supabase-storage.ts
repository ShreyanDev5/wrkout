import { supabase, handleSupabaseError } from './supabase'
import type { Database } from './database.types'
import type { Workout, WorkoutSession, AppData } from './types'

// Temporary user ID until authentication is implemented
const TEMP_USER_ID = 'temp-user'

// Convert AppData to database format
const convertToDatabaseFormat = (appData: AppData) => ({
  user_id: TEMP_USER_ID,
  name: 'My Workouts',
  exercises: JSON.stringify(appData.workouts),
  completed_exercises: JSON.stringify(appData.completedExercises),
  last_sync_time: appData.lastSyncTime
})

// Convert database format to AppData
const convertFromDatabaseFormat = (data: Database['public']['Tables']['workouts']['Row']): AppData => ({
  workouts: JSON.parse(data.exercises as string) as Workout[],
  completedExercises: JSON.parse(data.completed_exercises as string) as Record<string, Record<string, boolean>>,
  lastSyncTime: data.last_sync_time
})

// Initialize workout data in Supabase
export async function initializeWorkoutData(initialData: AppData): Promise<void> {
  try {
    const { error } = await supabase
      .from('workouts')
      .upsert(convertToDatabaseFormat(initialData))
    
    if (error) throw error
  } catch (error) {
    handleSupabaseError(error)
  }
}

// Load workout data from Supabase
export async function loadWorkoutData(): Promise<AppData> {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', TEMP_USER_ID)
      .single()

    if (error) throw error
    if (!data) throw new Error('No workout data found')

    return convertFromDatabaseFormat(data)
  } catch (error) {
    handleSupabaseError(error)
    // Return empty data if there's an error
    return {
      workouts: [],
      completedExercises: {},
      lastSyncTime: null
    }
  }
}

// Save workout data to Supabase
export async function saveWorkoutData(appData: AppData): Promise<void> {
  try {
    const { error } = await supabase
      .from('workouts')
      .upsert({
        ...convertToDatabaseFormat(appData),
        last_sync_time: new Date().toISOString()
      })

    if (error) throw error
  } catch (error) {
    handleSupabaseError(error)
  }
}

// Convert WorkoutSession to database format
const convertSessionToDatabaseFormat = (session: WorkoutSession) => ({
  user_id: TEMP_USER_ID,
  workout_id: session.workoutId,
  completed_exercises: JSON.stringify(session.completedExercises),
  duration: session.duration,
  notes: session.notes || null
})

// Convert database format to WorkoutSession
const convertSessionFromDatabaseFormat = (
  data: Database['public']['Tables']['workout_sessions']['Row'],
  workoutName: string,
  dayId: string,
  dayName: string
): WorkoutSession => ({
  id: data.id,
  workoutId: data.workout_id,
  workoutName,
  dayId,
  dayName,
  completedExercises: JSON.parse(data.completed_exercises as string) as Record<string, Record<string, boolean>>,
  duration: data.duration,
  notes: data.notes || undefined,
  timestamp: data.created_at,
  date: new Date(data.created_at).toISOString().split('T')[0],
  exercises: [], // This will need to be populated from the workout data
  totalExercises: 0, // This will need to be calculated
  completedCount: 0 // This will need to be calculated
})

// Save workout session to Supabase
export async function saveWorkoutSession(session: WorkoutSession): Promise<void> {
  try {
    const { error } = await supabase
      .from('workout_sessions')
      .insert(convertSessionToDatabaseFormat(session))

    if (error) throw error
  } catch (error) {
    handleSupabaseError(error)
  }
}

// Load workout sessions from Supabase
export async function loadWorkoutSessions(): Promise<WorkoutSession[]> {
  try {
    // First, get the workout data to map workout names and day information
    const { data: workoutData, error: workoutError } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', TEMP_USER_ID)
      .single()

    if (workoutError) throw workoutError
    if (!workoutData) throw new Error('No workout data found')

    const workouts = JSON.parse(workoutData.exercises as string) as Workout[]
    const workoutMap = new Map(workouts.map(w => [w.id, w]))

    // Then get the sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', TEMP_USER_ID)
      .order('created_at', { ascending: false })

    if (sessionsError) throw sessionsError

    return (sessions || []).map(session => {
      const workout = workoutMap.get(session.workout_id)
      if (!workout) {
        throw new Error(`Workout not found for session ${session.id}`)
      }

      const day = workout.days.find(d => d.id === session.workout_id)
      if (!day) {
        throw new Error(`Day not found for session ${session.id}`)
      }

      const completedExercises = JSON.parse(session.completed_exercises as string) as Record<string, Record<string, boolean>>
      const exercises = day.exercises.map(e => e.id)
      const completedCount = Object.values(completedExercises).reduce(
        (count, dayExercises) => count + Object.values(dayExercises).filter(Boolean).length,
        0
      )

      return {
        ...convertSessionFromDatabaseFormat(session, workout.name, day.id, day.name),
        exercises,
        totalExercises: exercises.length,
        completedCount
      }
    })
  } catch (error) {
    handleSupabaseError(error)
    return []
  }
} 