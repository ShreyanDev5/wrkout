-- Create workout_logs table
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  weight NUMERIC NOT NULL CHECK (weight > 0),
  avg_reps INTEGER NOT NULL CHECK (avg_reps > 0),
  performed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint for upsert support (user_id, exercise_name, performed_at)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'unique_user_exercise_date'
  ) THEN
    ALTER TABLE workout_logs ADD CONSTRAINT unique_user_exercise_date UNIQUE (user_id, exercise_name, performed_at);
  END IF;
END $$;

-- Create or replace the function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Check if the trigger exists and create it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_workout_logs_updated_at'
  ) THEN
    CREATE TRIGGER set_workout_logs_updated_at
    BEFORE UPDATE ON workout_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workout_logs' AND policyname = 'Users can view their own workout logs') THEN
    CREATE POLICY "Users can view their own workout logs" ON workout_logs
      FOR SELECT TO authenticated
      USING (user_id = (auth.uid()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workout_logs' AND policyname = 'Users can insert their own workout logs') THEN
    CREATE POLICY "Users can insert their own workout logs" ON workout_logs
      FOR INSERT TO authenticated
      WITH CHECK (user_id = (auth.uid()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workout_logs' AND policyname = 'Users can update their own workout logs') THEN
    CREATE POLICY "Users can update their own workout logs" ON workout_logs
      FOR UPDATE TO authenticated
      USING (user_id = (auth.uid()))
      WITH CHECK (user_id = (auth.uid()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workout_logs' AND policyname = 'Users can delete their own workout logs') THEN
    CREATE POLICY "Users can delete their own workout logs" ON workout_logs
      FOR DELETE TO authenticated
      USING (user_id = (auth.uid()));
  END IF;
END $$;

-- Create policy for demo data access (NULL user_id) - only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workout_logs' AND policyname = 'Anyone can view demo workout logs') THEN
    CREATE POLICY "Anyone can view demo workout logs" ON workout_logs
      FOR SELECT TO authenticated, anon
      USING (user_id IS NULL);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_workout_id ON workout_logs(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_performed_at ON workout_logs(performed_at);
-- Add composite index for common query pattern (user logs by date)
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON workout_logs(user_id, performed_at);

-- Comment on table and columns for better documentation
COMMENT ON TABLE workout_logs IS 'Records of user workout activities including exercises, weights, and repetitions';
COMMENT ON COLUMN workout_logs.id IS 'Primary key for the workout log';
COMMENT ON COLUMN workout_logs.user_id IS 'Foreign key to auth.users - the user who performed the workout';
COMMENT ON COLUMN workout_logs.workout_id IS 'Foreign key to workouts - the workout plan being followed';
COMMENT ON COLUMN workout_logs.exercise_name IS 'Name of the exercise performed';
COMMENT ON COLUMN workout_logs.weight IS 'Weight used for the exercise (must be positive)';
COMMENT ON COLUMN workout_logs.avg_reps IS 'Average number of repetitions performed (must be positive)';
COMMENT ON COLUMN workout_logs.performed_at IS 'Date when the workout was performed';
COMMENT ON COLUMN workout_logs.created_at IS 'Timestamp when this record was created';
COMMENT ON COLUMN workout_logs.updated_at IS 'Timestamp when this record was last updated';