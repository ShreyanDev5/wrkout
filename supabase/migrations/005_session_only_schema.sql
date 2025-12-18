-- Create daily_summaries table for lightweight history
CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  workout_name TEXT,
  total_exercises INTEGER DEFAULT 0,
  completed_exercises INTEGER DEFAULT 0,
  summary_stats JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast retrieval of specific day summaries
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON daily_summaries(user_id, date);

-- Enable Row Level Security
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies (safe if they already exist, but using DO block to avoid errors)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_summaries' AND policyname = 'Users can view their own summaries') THEN
    CREATE POLICY "Users can view their own summaries" ON daily_summaries
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_summaries' AND policyname = 'Users can insert their own summaries') THEN
    CREATE POLICY "Users can insert their own summaries" ON daily_summaries
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_summaries' AND policyname = 'Users can update their own summaries') THEN
    CREATE POLICY "Users can update their own summaries" ON daily_summaries
      FOR UPDATE TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;
