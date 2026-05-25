import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import type { Workout, WorkoutDay, WorkoutExercise, WorkoutLog } from './types'

type SupabaseClientLike = SupabaseClient<Database>

interface IdRow {
  id: string
}

const mapIds = (rows: IdRow[] | null | undefined): string[] => (rows || []).map((row) => row.id)

export interface ExerciseVolumeTrendRow {
  exercise_name: string
  workout_day_id: string | null
  today_volume: number
  previous_volume: number | null
  trend: 'up' | 'same' | 'down' | 'new'
}

// Load all workouts for a user
export async function loadUserWorkouts(supabase: SupabaseClientLike, userId: string): Promise<Workout[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId);
  if (error) return [];
  return data || [];
}

// Save all workouts for a user (non-destructive)
//
// Cascading delete logic:
// - Deleting a workout in the DB will automatically delete all associated workout_days (ON DELETE CASCADE in schema).
// - This function now prevents accidental mass deletion: if the new list is empty, it throws unless allowDeleteAll is true.
// - Only call with allowDeleteAll=true after explicit user confirmation (e.g., via a confirmation dialog in the UI).
export async function saveUserWorkouts(
  supabase: SupabaseClientLike,
  workouts: Workout[],
  userId: string,
  allowDeleteAll: boolean = false,
): Promise<void> {
  // Defensive: Prevent accidental mass deletion unless explicitly allowed
  if (workouts.length === 0 && !allowDeleteAll) {
    throw new Error('Attempted to delete all workouts. This action requires explicit confirmation.');
  }
  // 1. Load current workouts from DB
  const { data: currentWorkouts, error: loadError } = await supabase
    .from('workouts')
    .select('id')
    .eq('user_id', userId);
  if (loadError) {
    console.error('Failed to load current workouts:', loadError);
    throw loadError;
  }
  const currentIds = mapIds((currentWorkouts || []) as IdRow[]);
  const newIds = workouts.map((workout) => workout.id);
  // 2. Find workouts to delete (present in DB, not in newWorkouts)
  const toDelete = currentIds.filter((id) => !newIds.includes(id));
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
    const workoutsToInsert = workouts.map((workout) => ({
      id: workout.id,
      name: workout.name,
      user_id: userId,
      created_at: workout.created_at,
      updated_at: workout.updated_at,
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
export async function loadUserWorkoutDays(supabase: SupabaseClientLike, userId: string): Promise<WorkoutDay[]> {
  // First, get all workout IDs for this user
  const { data: workouts, error: workoutsError } = await supabase
    .from('workouts')
    .select('id')
    .eq('user_id', userId);

  if (workoutsError || !workouts) return [];

  const workoutIds = mapIds((workouts || []) as IdRow[]);

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
//
// Cascading delete logic:
// - Deleting a workout_day in the DB will delete all its exercises (since exercises are embedded JSON, not a separate table).
// - This function now prevents accidental mass deletion: if the new list is empty, it throws unless allowDeleteAll is true.
// - Only call with allowDeleteAll=true after explicit user confirmation (e.g., via a confirmation dialog in the UI).
export async function saveUserWorkoutDays(
  supabase: SupabaseClientLike,
  workoutDays: WorkoutDay[],
  userId: string,
  allowDeleteAll: boolean = false,
): Promise<void> {
  // Defensive: Prevent accidental mass deletion unless explicitly allowed
  if (workoutDays.length === 0 && !allowDeleteAll) {
    throw new Error('Attempted to delete all workout days. This action requires explicit confirmation.');
  }

  // 1. Get all workout_ids for this user to scope the deletion check
  const { data: workouts, error: workoutFetchError } = await supabase
    .from('workouts')
    .select('id')
    .eq('user_id', userId);

  if (workoutFetchError) {
    console.error('Failed to fetch workouts for workoutDays upsert:', workoutFetchError);
    throw workoutFetchError;
  }

  const userWorkoutIds = mapIds((workouts || []) as IdRow[]);

  if (userWorkoutIds.length === 0) {
    if (workoutDays.length > 0) {
      throw new Error('Cannot save workout days because no workouts exist for this user.');
    }
    return;
  }

  // 2. Load current workout days from DB (IDs only)
  // We need to know what exists to know what to delete
  const { data: currentDays, error: loadError } = await supabase
    .from('workout_days')
    .select('id')
    .in('workout_id', userWorkoutIds);

  if (loadError) {
    console.error('Failed to load current workout days:', loadError);
    throw loadError;
  }

  const currentIds = mapIds((currentDays || []) as IdRow[]);
  const newIds = workoutDays.map((day) => day.id);

  // 3. Find days to delete (present in DB, not in newDays)
  const toDelete = currentIds.filter((id) => !newIds.includes(id));

  // 4. Delete only those days
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase.from('workout_days').delete().in('id', toDelete);
    if (deleteError) {
      console.error('Failed to delete workout days:', deleteError);
      throw deleteError;
    }
  }

  // 5. Upsert new/updated workout days
  if (workoutDays.length > 0) {
    // Use upsert to avoid duplicate key errors
    const { error: insertError } = await supabase.from('workout_days').upsert(
      workoutDays.map((day) => ({
        id: day.id,
        workout_id: day.workout_id,
        day_id: day.day_id,
        name: day.name,
        exercises: day.exercises || [],
        created_at: day.created_at,
        updated_at: day.updated_at,
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

// Load workout logs for a user with pagination
export async function loadWorkoutLogs(
  supabase: SupabaseClientLike,
  userId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<WorkoutLog[]> {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .order('performed_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Error loading workout logs:', error);
    return [];
  }
  return data || [];
}

// Save a workout log for a user
export async function saveWorkoutLog(supabase: SupabaseClientLike, log: WorkoutLog, userId: string): Promise<void> {
  // Upsert by user_id, exercise_id, performed_at (date), and workout_day_id to avoid duplicates for the same day/exercise/routine
  const { error } = await supabase.from('workout_logs').upsert([
    {
      ...log,
      user_id: userId,
      workout_day_id: log.workout_day_id ?? null,
      created_at: log.created_at,
      updated_at: log.updated_at
    }
  ], {
    onConflict: 'user_id,exercise_id,performed_at,workout_day_id'
  });

  if (error) {
    console.error('Error saving workout log:', error);
    throw error;
  }
}

export async function updateWorkoutDayExercises(
  supabase: SupabaseClientLike,
  workoutDayId: string,
  newExercises: WorkoutExercise[],
) {
  return await supabase
    .from('workout_days')
    .update({ exercises: newExercises })
    .eq('id', workoutDayId);
} 

// Load today's volume trend state per exercise from the backend RPC.
export async function loadExerciseVolumeTrendsForDate(
  supabase: SupabaseClientLike,
  userId: string,
  date?: string,
): Promise<ExerciseVolumeTrendRow[]> {
  const { data, error } = await supabase.rpc('get_exercise_volume_trends', {
    p_user_id: userId,
    p_date: date,
  })

  if (error) {
    console.error('Error loading exercise volume trends:', error)
    return []
  }

  return (data || []) as ExerciseVolumeTrendRow[]
}

// Load all unique exercises for a user
export async function loadUserExercises(
  supabase: SupabaseClientLike,
  userId: string
): Promise<{ id: string, name: string }[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('id, name')
    .eq('user_id', userId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error loading exercises:', error)
    return []
  }

  return data || []
}

// Create a new global exercise entity
export async function createExercise(
  supabase: SupabaseClientLike,
  userId: string,
  name: string
): Promise<string | null> {
  const normalized_name = name.trim().toLowerCase()
  
  // Upsert to handle accidental duplicates gracefully
  const { data, error } = await supabase
    .from('exercises')
    .upsert({
      user_id: userId,
      name: name.trim(),
      normalized_name
    }, {
      onConflict: 'user_id,normalized_name'
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating exercise:', error)
    return null
  }

  return data?.id || null
}

// Create default days (Push, Pull, Legs) with default exercises for a workout
export async function createDefaultRoutinesForWorkout(
  supabase: SupabaseClientLike,
  userId: string,
  workoutId: string
): Promise<WorkoutDay[]> {
  const defaultExercises = [
    // Push
    { name: "Incline Dumbbell Press", type: "push" },
    { name: "Shoulder Press", type: "push" },
    { name: "Triceps Pushdown", type: "push" },
    // Pull
    { name: "Lat Pulldown", type: "pull" },
    { name: "Barbell Row", type: "pull" },
    { name: "Bicep Curl", type: "pull" },
    // Legs
    { name: "Squat", type: "leg" },
    { name: "Romanian Deadlift", type: "leg" },
    { name: "Calf Raise", type: "leg" },
  ]

  // 1. Upsert exercises to database
  const exercisesToInsert = defaultExercises.map(ex => ({
    user_id: userId,
    name: ex.name,
    normalized_name: ex.name.trim().toLowerCase(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))

  const { data: insertedExercises, error: exError } = await supabase
    .from('exercises')
    .upsert(exercisesToInsert, { onConflict: 'user_id,normalized_name' })
    .select('id, name')

  if (exError) {
    console.error('Error upserting default exercises:', exError)
  }

  // Helper to find ID of an exercise by name
  const findExId = (name: string): string | undefined => {
    return insertedExercises?.find(
      (e) => e.name.toLowerCase() === name.toLowerCase()
    )?.id
  }

  // 2. Create the 3 default days
  const uuidv4 = (await import('uuid')).v4
  const now = new Date().toISOString()

  const defaultDays: WorkoutDay[] = [
    {
      id: uuidv4(),
      workout_id: workoutId,
      day_id: "push",
      name: "Push Day",
      exercises: [
        { id: uuidv4(), exercise_id: findExId("Incline Dumbbell Press"), name: "Incline Dumbbell Press" },
        { id: uuidv4(), exercise_id: findExId("Shoulder Press"), name: "Shoulder Press" },
        { id: uuidv4(), exercise_id: findExId("Triceps Pushdown"), name: "Triceps Pushdown" },
      ],
      created_at: now,
      updated_at: now
    },
    {
      id: uuidv4(),
      workout_id: workoutId,
      day_id: "pull",
      name: "Pull Day",
      exercises: [
        { id: uuidv4(), exercise_id: findExId("Lat Pulldown"), name: "Lat Pulldown" },
        { id: uuidv4(), exercise_id: findExId("Barbell Row"), name: "Barbell Row" },
        { id: uuidv4(), exercise_id: findExId("Bicep Curl"), name: "Bicep Curl" },
      ],
      created_at: now,
      updated_at: now
    },
    {
      id: uuidv4(),
      workout_id: workoutId,
      day_id: "leg",
      name: "Legs Day",
      exercises: [
        { id: uuidv4(), exercise_id: findExId("Squat"), name: "Squat" },
        { id: uuidv4(), exercise_id: findExId("Romanian Deadlift"), name: "Romanian Deadlift" },
        { id: uuidv4(), exercise_id: findExId("Calf Raise"), name: "Calf Raise" },
      ],
      created_at: now,
      updated_at: now
    }
  ]

  // 3. Save these days to Supabase
  const { error: daysError } = await supabase
    .from('workout_days')
    .insert(
      defaultDays.map((day) => ({
        id: day.id,
        workout_id: day.workout_id,
        day_id: day.day_id,
        name: day.name,
        exercises: day.exercises || [],
        created_at: day.created_at,
        updated_at: day.updated_at
      }))
    )

  if (daysError) {
    console.error('Error inserting default workout days:', daysError)
  }

  return defaultDays
}