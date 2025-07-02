import { supabase, handleSupabaseError } from './supabase'
import type { Workout, WorkoutLog, AppData } from './types'

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
    const { error } = await supabase
      .from('workouts')
      .upsert(convertToDatabaseFormat(initialData, userId))
    
    if (error) throw error
  } catch (error) {
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