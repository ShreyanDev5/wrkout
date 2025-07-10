-- First, check if the workout_days table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS workout_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  day_id TEXT NOT NULL,
  name TEXT NOT NULL,
  exercises JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'workout_days'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE workout_days ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE workout_days ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workout_days' AND policyname = 'Users can view their own workout days') THEN
    CREATE POLICY "Users can view their own workout days" ON workout_days
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workout_days' AND policyname = 'Users can insert their own workout days') THEN
    CREATE POLICY "Users can insert their own workout days" ON workout_days
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workout_days' AND policyname = 'Users can update their own workout days') THEN
    CREATE POLICY "Users can update their own workout days" ON workout_days
      FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workout_days' AND policyname = 'Users can delete their own workout days') THEN
    CREATE POLICY "Users can delete their own workout days" ON workout_days
      FOR DELETE TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workout_days_user_id ON workout_days(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_days_workout_id ON workout_days(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_days_day_id ON workout_days(day_id);

-- Add unique constraint to prevent duplicate day_ids within the same workout
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'unique_workout_day_id'
  ) THEN
    ALTER TABLE workout_days ADD CONSTRAINT unique_workout_day_id UNIQUE (workout_id, day_id);
  END IF;
END $$;