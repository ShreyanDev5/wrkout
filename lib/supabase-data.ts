import { PostgrestSingleResponse } from '@supabase/supabase-js';
import type { Workout, WorkoutDay, WorkoutLog } from './types';

// Load all workouts for a user
export async function loadUserWorkouts(supabase: any, userId: string): Promise<Workout[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId);
  if (error) return [];
  return data || [];
}

// Save all workouts for a user (non-destructive)
export async function saveUserWorkouts(supabase: any, workouts: Workout[], userId: string): Promise<void> {
  // 1. Load current workouts from DB
  const { data: currentWorkouts, error: loadError } = await supabase
    .from('workouts')
    .select('id')
    .eq('user_id', userId);
  if (loadError) {
    console.error('Failed to load current workouts:', loadError);
    throw loadError;
  }
  const currentIds = (currentWorkouts || []).map((w: any) => w.id);
  const newIds = workouts.map(w => w.id);
  // 2. Find workouts to delete (present in DB, not in newWorkouts)
  const toDelete = currentIds.filter((id: string) => !newIds.includes(id));
  // 3. Delete only those workouts
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase.from('workouts').delete().in('id', toDelete);
    if (deleteError) {
      console.error('Failed to delete workouts:', deleteError);
      throw deleteError;
    }
  }
  // 4. Upsert new/updated workouts
  if (workouts.length > 0) {
    const workoutsToInsert = workouts.map(w => ({
      id: w.id,
      name: w.name,
      user_id: userId,
      created_at: w.created_at,
      updated_at: w.updated_at
    }));
    const { error: insertError } = await supabase.from('workouts').upsert(workoutsToInsert, { onConflict: 'id' });
    if (insertError) {
      const errorMsg = (typeof insertError === 'string' && insertError) ||
        (insertError.message ? insertError.message : JSON.stringify(insertError) || 'Unknown error');
      console.error('Failed to insert workouts:', errorMsg, insertError);
      throw new Error('Failed to insert workouts: ' + errorMsg);
    }
  }
}

// Load all workout days for a user (by joining workouts)
export async function loadUserWorkoutDays(supabase: any, userId: string): Promise<WorkoutDay[]> {
  // First, get all workout IDs for this user
  const { data: workouts, error: workoutsError } = await supabase
    .from('workouts')
    .select('id')
    .eq('user_id', userId);

  if (workoutsError || !workouts) return [];

  const workoutIds = workouts.map((w: any) => w.id);

  if (!Array.isArray(workoutIds) || workoutIds.length === 0) return [];

  // Now, get all workout_days for those workout IDs
  const { data, error } = await supabase
    .from('workout_days')
    .select('*')
    .in('workout_id', workoutIds);

  if (error) return [];
  return data || [];
}

// Save all workout days for a user (non-destructive)
export async function saveUserWorkoutDays(supabase: any, workoutDays: WorkoutDay[], userId: string): Promise<void> {
  // Find all workout_ids for this user
  const { data: workouts, error: workoutFetchError } = await supabase.from('workouts').select('id').eq('user_id', userId);
  if (workoutFetchError) {
    console.error('Failed to fetch workouts for workoutDays delete:', workoutFetchError);
    throw workoutFetchError;
  }
  const userWorkoutIds = (workouts || []).map((w: any) => w.id);

  // Get current workout_days in DB for this user
  let currentDays: any[] = [];
  if (userWorkoutIds.length > 0) {
    const { data: dbDays, error: dbDaysError } = await supabase.from('workout_days').select('id').in('workout_id', userWorkoutIds);
    if (dbDaysError) {
      console.error('Failed to fetch current workout_days:', dbDaysError);
      throw dbDaysError;
    }
    currentDays = dbDays || [];
  }
  const currentDayIds = currentDays.map((d: any) => d.id);
  const newDayIds = workoutDays.map(d => d.id);
  // Only delete days that are in DB but not in the new list
  const toDelete = currentDayIds.filter((id: string) => !newDayIds.includes(id));
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase.from('workout_days').delete().in('id', toDelete);
    if (deleteError) {
      console.error('Failed to delete workout_days:', deleteError);
      throw deleteError;
    }
  }
  if (workoutDays.length > 0) {
    // Use upsert to avoid duplicate key errors
    const { error: insertError } = await supabase.from('workout_days').upsert(
      workoutDays.map(d => ({
        id: d.id,
        workout_id: d.workout_id,
        day_id: d.day_id,
        name: d.name,
        exercises: d.exercises || [],
        created_at: d.created_at,
        updated_at: d.updated_at
      })),
      { onConflict: 'id' }
    );
    if (insertError) {
      const errorMsg = (typeof insertError === 'string' && insertError) ||
        (insertError.message ? insertError.message : JSON.stringify(insertError) || 'Unknown error');
      console.error('Failed to insert workout_days:', errorMsg, insertError);
      throw new Error('Failed to insert workout_days: ' + errorMsg);
    }
  }
}

// Load all workout logs for a user
export async function loadWorkoutLogs(supabase: any, userId: string): Promise<WorkoutLog[]> {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .order('performed_at', { ascending: false });
  if (error) return [];
  return data || [];
}

// Save a workout log for a user
export async function saveWorkoutLog(supabase: any, log: WorkoutLog, userId: string): Promise<void> {
  await supabase.from('workout_logs').insert([{ 
    ...log, 
    user_id: userId,
    workout_day_id: log.workout_day_id ?? null,
    created_at: log.created_at,
    updated_at: log.updated_at
  }]);
}

export async function updateWorkoutDayExercises(supabase: any, workoutDayId: string, newExercises: any[]) {
  return await supabase
    .from('workout_days')
    .update({ exercises: newExercises })
    .eq('id', workoutDayId);
} 