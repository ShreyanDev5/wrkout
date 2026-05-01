-- Enable Row Level Security on exercises table
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Users can only view their own exercises
CREATE POLICY "Users can view own exercises"
  ON public.exercises FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert exercises for themselves
CREATE POLICY "Users can insert own exercises"
  ON public.exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own exercises
CREATE POLICY "Users can update own exercises"
  ON public.exercises FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own exercises
CREATE POLICY "Users can delete own exercises"
  ON public.exercises FOR DELETE
  USING (auth.uid() = user_id);
