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

// Save all workouts for a user (overwrites existing)
export async function saveUserWorkouts(supabase: any, workouts: Workout[], userId: string): Promise<void> {
  await supabase.from('workouts').delete().eq('user_id', userId);
  if (workouts.length > 0) {
    await supabase.from('workouts').insert(
      workouts.map(w => ({
        id: w.id,
        name: w.name,
        user_id: userId,
        created_at: w.created_at,
        updated_at: w.updated_at
      }))
    );
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

// Save all workout days for a user (overwrites existing)
export async function saveUserWorkoutDays(supabase: any, workoutDays: WorkoutDay[], userId: string): Promise<void> {
  // Find all workout_ids for this user
  const { data: workouts } = await supabase.from('workouts').select('id').eq('user_id', userId);
  const userWorkoutIds = (workouts || []).map((w: any) => w.id);
  // Delete only workout_days belonging to user's workouts
  if (userWorkoutIds.length > 0) {
    await supabase.from('workout_days').delete().in('workout_id', userWorkoutIds);
  }
  if (workoutDays.length > 0) {
    await supabase.from('workout_days').insert(
      workoutDays.map(d => ({
        id: d.id,
        workout_id: d.workout_id,
        day_id: d.day_id,
        name: d.name,
        exercises: d.exercises || [],
        created_at: d.created_at,
        updated_at: d.updated_at
      }))
    );
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