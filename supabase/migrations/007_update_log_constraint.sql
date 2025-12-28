-- Drop the old constraint that was too restrictive (one per day globally)
ALTER TABLE workout_logs DROP CONSTRAINT IF EXISTS unique_user_exercise_date;

-- Add the new constraint that allows one per day PER ROUTINE (workout_day_id)
-- This allows "Hanging Leg Raises" to be logged in Pull Day AND Leg Day on the same date.
ALTER TABLE workout_logs ADD CONSTRAINT unique_user_exercise_date_day UNIQUE (user_id, exercise_name, performed_at, workout_day_id);

-- Performance Index: Essential for filtering logs by routine context efficiently
CREATE INDEX IF NOT EXISTS idx_workout_logs_workout_day_id ON workout_logs(workout_day_id);
