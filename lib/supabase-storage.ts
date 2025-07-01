import { supabase, handleSupabaseError } from './supabase'
import type { Workout, WorkoutLog, AppData } from './types'

// Temporary user ID until authentication is implemented
const TEMP_USER_ID = 'temp-user'

// Convert AppData to database format
const convertToDatabaseFormat = (appData: AppData) => ({
  user_id: TEMP_USER_ID,
  name: 'My Workouts',
  // No exercises/completed_exercises JSON columns in new schema
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

// Save a workout log to Supabase
export async function saveWorkoutLog(log: WorkoutLog): Promise<void> {
  try {
    const { error } = await supabase
      .from('workout_logs')
      .insert(log)

    if (error) throw error
  } catch (error) {
    handleSupabaseError(error)
  }
}

// Load workout logs from Supabase
export async function loadWorkoutLogs(): Promise<WorkoutLog[]> {
  try {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', TEMP_USER_ID)
      .order('performed_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    handleSupabaseError(error)
    return []
  }
} 