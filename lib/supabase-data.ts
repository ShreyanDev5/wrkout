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
  // Remove all existing workouts for user, then insert new
  await supabase.from('workouts').delete().eq('user_id', userId);
  if (workouts.length > 0) {
    await supabase.from('workouts').insert(workouts.map(w => ({ ...w, user_id: userId })));
  }
}

// Load all workout days for a user
export async function loadUserWorkoutDays(supabase: any, userId: string): Promise<WorkoutDay[]> {
  const { data, error } = await supabase
    .from('workout_days')
    .select('*')
    .eq('user_id', userId);
  if (error) return [];
  return data || [];
}

// Save all workout days for a user (overwrites existing)
export async function saveUserWorkoutDays(supabase: any, workoutDays: WorkoutDay[], userId: string): Promise<void> {
  await supabase.from('workout_days').delete().eq('user_id', userId);
  if (workoutDays.length > 0) {
    await supabase.from('workout_days').insert(workoutDays.map(d => ({ ...d, user_id: userId })));
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
  await supabase.from('workout_logs').insert([{ ...log, user_id: userId }]);
} 