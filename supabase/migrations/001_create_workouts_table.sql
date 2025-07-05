-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workouts' AND policyname = 'Users can view their own workouts') THEN
    CREATE POLICY "Users can view their own workouts" ON workouts
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workouts' AND policyname = 'Users can insert their own workouts') THEN
    CREATE POLICY "Users can insert their own workouts" ON workouts
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workouts' AND policyname = 'Users can update their own workouts') THEN
    CREATE POLICY "Users can update their own workouts" ON workouts
      FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workouts' AND policyname = 'Users can delete their own workouts') THEN
    CREATE POLICY "Users can delete their own workouts" ON workouts
      FOR DELETE TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Create policy for demo data access (NULL user_id) - only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workouts' AND policyname = 'Anyone can view demo workouts') THEN
    CREATE POLICY "Anyone can view demo workouts" ON workouts
      FOR SELECT
      USING (user_id IS NULL);
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id); 