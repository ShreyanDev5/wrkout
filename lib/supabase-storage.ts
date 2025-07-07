import { supabase, handleSupabaseError } from './supabase'
import type { Workout, WorkoutLog, WorkoutDay } from './types'
import { workoutData } from './workout-data'
import { getDemoWorkoutLogs } from './demo-data'
import { v4 as uuidv4 } from 'uuid'
import type { SupabaseClient } from '@supabase/supabase-js'

// Save all user workouts as separate rows in the workouts table
export async function saveUserWorkouts(supabaseClient: SupabaseClient, workouts: Workout[], userId: string): Promise<void> {
  if (!userId) throw new Error('saveUserWorkouts called without a valid userId');
  // Filter out blank/empty workouts
  const validWorkouts = workouts.filter(w => w.name && w.name.trim() && w.days && w.days.length > 0);
  // If there are no valid workouts, keep only one blank routine (if any)
  if (validWorkouts.length === 0) {
    // Check if a blank routine already exists
    const { data } = await supabaseClient
      .from('workouts')
      .select('id')
      .eq('user_id', userId)
      .or('name.is.null,name.eq.My Workouts,name.eq.,name.eq. ""')
      .limit(2);
    if (data && data.length > 1) {
      // Remove all but one blank
      const blankIdsToRemove = data.slice(1).map((w: any) => w.id);
      await supabaseClient.from('workouts').delete().in('id', blankIdsToRemove);
    }
    // If no blank exists, insert one
    if (!data || data.length === 0) {
      const blankWorkout = {
        id: workouts[0]?.id || crypto.randomUUID(),
        user_id: userId,
        name: 'My Workouts',
        created_at: new Date().toISOString(),
      };
      await supabaseClient.from('workouts').upsert([blankWorkout], { onConflict: 'id' });
    }
    return;
  }
  // Prepare rows for upsert
  const rows = validWorkouts.map(w => ({
    id: w.id,
    user_id: userId,
    name: w.name,
    created_at: new Date().toISOString(),
  }));
  // Upsert all workouts
  const { error } = await supabaseClient
    .from('workouts')
    .upsert(rows, { onConflict: 'id' });
  if (error) throw error;
}

// Save all user workout days as separate rows in the workout_days table
export async function saveUserWorkoutDays(supabaseClient: SupabaseClient, workoutDays: WorkoutDay[], userId: string): Promise<void> {
  if (!userId) throw new Error('saveUserWorkoutDays called without a valid userId');
  // Only upsert days that have a valid workout_id and name
  const validDays = workoutDays.filter(d => d.workout_id && d.name && d.day_id);
  if (validDays.length === 0) return;
  // Prepare rows for upsert
  const rows = validDays.map(d => ({
    id: d.id,
    workout_id: d.workout_id,
    day_id: d.day_id,
    name: d.name,
    created_at: d.created_at || new Date().toISOString(),
    updated_at: d.updated_at || new Date().toISOString(),
  }));
  // Upsert all workout days
  const { error } = await supabaseClient
    .from('workout_days')
    .upsert(rows, { onConflict: 'id' });
  if (error) throw error;
}

// Load all workout days for a user
export async function loadUserWorkoutDays(supabaseClient: SupabaseClient, userId: string): Promise<WorkoutDay[]> {
  const { data, error } = await supabaseClient
    .from('workout_days')
    .select('*')
    .in('workout_id',
      (await supabaseClient.from('workouts').select('id').eq('user_id', userId)).data?.map((w: any) => w.id) || []
    )
    .order('created_at', { ascending: true });
  if (error) throw error;
  // Add exercises: [] for now (exercises normalization is a future step)
  return (data || []).map((row: any) => ({ ...row, exercises: [] }));
}

// Load all workouts for a user (with empty days, days loaded separately)
export async function loadUserWorkouts(supabaseClient: SupabaseClient, userId: string): Promise<Workout[]> {
  const { data, error } = await supabaseClient
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  let workouts = (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    days: [], // days loaded separately
  }));
  // Deduplicate blank routines: keep only one blank (name empty or 'My Workouts', no days)
  const blanks = workouts.filter(w => (!w.name || w.name.trim() === '' || w.name.trim().toLowerCase() === 'my workouts') && (!w.days || w.days.length === 0));
  if (blanks.length > 1) {
    // Keep the first, remove the rest
    const blankIdsToRemove = blanks.slice(1).map(w => w.id);
    // Remove from workouts array
    workouts = workouts.filter(w => !blankIdsToRemove.includes(w.id));
    // Remove from DB
    await supabaseClient.from('workouts').delete().in('id', blankIdsToRemove);
  }
  return workouts;
}

// Load demo workout logs from Supabase (for non-authenticated users)
export async function loadDemoWorkoutLogs(supabaseClient: SupabaseClient): Promise<WorkoutLog[]> {
  try {
    const { data, error } = await supabaseClient
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
export async function saveWorkoutData(supabaseClient: SupabaseClient, appData: any, userId: string): Promise<void> {
  if (!userId) {
    throw new Error("saveWorkoutData called without a valid userId");
  }
  try {
    // Save workouts
    await saveUserWorkouts(supabaseClient, appData.workouts, userId)
    // Save workout days
    if (appData.workoutDays) {
      await saveUserWorkoutDays(supabaseClient, appData.workoutDays, userId)
    }
    // (Optionally: save logs, etc.)
  } catch (error) {
    handleSupabaseError(error)
  }
}

// Save a workout log to Supabase (requires workout_day_id)
export async function saveWorkoutLog(supabaseClient: SupabaseClient, log: WorkoutLog, userId: string): Promise<void> {
  try {
    if (!log.workout_day_id) throw new Error('workout_day_id is required for logs');
    // Ensure log.id is a UUID
    const logToSave = { ...log, id: log.id || uuidv4(), user_id: userId }
    const { error } = await supabaseClient
      .from('workout_logs')
      .insert(logToSave)

    if (error) throw error
  } catch (error) {
    handleSupabaseError(error)
  }
}

// Load workout days for a user (helper for UI)
export async function getUserWorkoutDaysForWorkout(supabaseClient: SupabaseClient, workoutId: string): Promise<WorkoutDay[]> {
  const { data, error } = await supabaseClient
    .from('workout_days')
    .select('*')
    .eq('workout_id', workoutId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map((row: any) => ({ ...row, exercises: [] }));
}

// Load workout logs from Supabase
export async function loadWorkoutLogs(supabaseClient: SupabaseClient, userId: string): Promise<WorkoutLog[]> {
  try {
    const { data, error } = await supabaseClient
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