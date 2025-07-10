-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create or replace the function to update the updated_at timestamp
-- Only create if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'update_modified_column'
  ) THEN
    CREATE FUNCTION update_modified_column()
    RETURNS TRIGGER AS $BODY$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $BODY$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
  END IF;
END $$;

-- Check if the trigger exists and create it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_workouts_updated_at'
  ) THEN
    CREATE TRIGGER set_workouts_updated_at
    BEFORE UPDATE ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
  END IF;
END $$;

-- Enable RLS (Row Level Security)
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workouts' AND policyname = 'Users can view their own workouts') THEN
    CREATE POLICY "Users can view their own workouts" ON workouts
      FOR SELECT TO authenticated
      USING (user_id = (auth.uid()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workouts' AND policyname = 'Users can insert their own workouts') THEN
    CREATE POLICY "Users can insert their own workouts" ON workouts
      FOR INSERT TO authenticated
      WITH CHECK (user_id = (auth.uid()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workouts' AND policyname = 'Users can update their own workouts') THEN
    CREATE POLICY "Users can update their own workouts" ON workouts
      FOR UPDATE TO authenticated
      USING (user_id = (auth.uid()))
      WITH CHECK (user_id = (auth.uid()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workouts' AND policyname = 'Users can delete their own workouts') THEN
    CREATE POLICY "Users can delete their own workouts" ON workouts
      FOR DELETE TO authenticated
      USING (user_id = (auth.uid()));
  END IF;
END $$;

-- Create policy for demo data access (NULL user_id) - only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workouts' AND policyname = 'Anyone can view demo workouts') THEN
    CREATE POLICY "Anyone can view demo workouts" ON workouts
      FOR SELECT TO authenticated, anon
      USING (user_id IS NULL);
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);

-- Comment on table and columns for better documentation
COMMENT ON TABLE workouts IS 'Workout plans created by users';
COMMENT ON COLUMN workouts.id IS 'Primary key for the workout';
COMMENT ON COLUMN workouts.user_id IS 'Foreign key to auth.users - the user who created the workout';
COMMENT ON COLUMN workouts.name IS 'Name of the workout plan';
COMMENT ON COLUMN workouts.created_at IS 'Timestamp when this workout was created';
COMMENT ON COLUMN workouts.updated_at IS 'Timestamp when this workout was last updated';