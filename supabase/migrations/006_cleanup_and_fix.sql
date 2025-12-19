-- Drop unused column
ALTER TABLE public.workouts 
DROP COLUMN IF EXISTS last_sync_time;

-- Add rir column to workout_logs if it doesn't exist (it should, based on earlier analysis, but this makes it safe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workout_logs' AND column_name = 'rir') THEN
        ALTER TABLE public.workout_logs ADD COLUMN rir integer CHECK (rir >= 0 AND rir <= 5);
    END IF;
END $$;
