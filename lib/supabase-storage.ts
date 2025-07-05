import { supabase, handleSupabaseError } from './supabase'
import type { Workout, WorkoutLog, AppData } from './types'
import { workoutData } from './workout-data'
import { getDemoWorkoutLogs } from './demo-data'

// Convert AppData to database format
const convertToDatabaseFormat = (appData: AppData, userId: string) => ({
  user_id: userId,
  name: 'My Workouts',
  created_at: new Date().toISOString(),
  last_sync_time: appData.lastSyncTime
})

// Convert database format to AppData
const convertFromDatabaseFormat = (data: any): AppData => ({
  // The new schema does not store exercises in the workouts table
  workouts: [], // You may want to load workouts differently if you want to support multiple routines
  lastSyncTime: data.last_sync_time || null
})

// Initialize workout data in Supabase
export async function initializeWorkoutData(initialData: AppData, userId: string): Promise<void> {
  try {
    console.log('Initializing workout data for user:', userId)
    
    const { error } = await supabase
      .from('workouts')
      .upsert(convertToDatabaseFormat(initialData, userId))
    
    if (error) {
      console.error('Supabase error during initialization:', error)
      throw error
    }
    
    console.log('Workout data initialized successfully')
  } catch (error) {
    console.error('Error initializing workout data:', error)
    handleSupabaseError(error)
  }
}

// Load workout data from Supabase
export async function loadWorkoutData(userId: string): Promise<AppData> {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    if (!data) {
      // New user: return demo data from Supabase
      return {
        workouts: workoutData, // Fallback to client-side demo data
        lastSyncTime: null
      }
    }

    return convertFromDatabaseFormat(data)
  } catch (error) {
    handleSupabaseError(error)
    // On error, return demo data as fallback
    return {
      workouts: workoutData,
      lastSyncTime: null
    }
  }
}

// Load demo workout logs from Supabase (for non-authenticated users)
export async function loadDemoWorkoutLogs(): Promise<WorkoutLog[]> {
  try {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .is('user_id', null) // Demo data has NULL user_id
      .order('performed_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error loading demo workout logs:', error)
    // Fallback to client-side demo data
    return getDemoWorkoutLogs()
  }
}

// Save workout data to Supabase
export async function saveWorkoutData(appData: AppData, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('workouts')
      .upsert({
        ...convertToDatabaseFormat(appData, userId),
        last_sync_time: new Date().toISOString()
      })

    if (error) throw error
  } catch (error) {
    handleSupabaseError(error)
  }
}

// Save a workout log to Supabase
export async function saveWorkoutLog(log: WorkoutLog, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('workout_logs')
      .insert({ ...log, user_id: userId })

    if (error) throw error
  } catch (error) {
    handleSupabaseError(error)
  }
}

// Load workout logs from Supabase
export async function loadWorkoutLogs(userId: string): Promise<WorkoutLog[]> {
  try {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .order('performed_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    handleSupabaseError(error)
    return []
  }
} 