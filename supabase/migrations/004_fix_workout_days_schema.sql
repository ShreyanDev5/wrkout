-- Fix workout_days table schema by adding missing columns
-- Check if exercises column exists and add it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'workout_days'
    AND column_name = 'exercises'
  ) THEN
    ALTER TABLE workout_days ADD COLUMN exercises JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Check if created_at column exists and add it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'workout_days'
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE workout_days ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Check if updated_at column exists and add it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'workout_days'
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE workout_days ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Create or replace the function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if the trigger exists and create it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_workout_days_updated_at'
  ) THEN
    CREATE TRIGGER set_workout_days_updated_at
    BEFORE UPDATE ON workout_days
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
  END IF;
END $$;

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'workout_days'
ORDER BY ordinal_position;