-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  normalized_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_exercise_name UNIQUE (user_id, normalized_name)
);

-- Add exercise_id to workout_logs
ALTER TABLE public.workout_logs
  ADD COLUMN exercise_id uuid REFERENCES public.exercises(id) ON DELETE CASCADE;

-- Create index on exercise_id
CREATE INDEX IF NOT EXISTS idx_workout_logs_exercise_id ON public.workout_logs(exercise_id);

-- Migrate data
DO $$
DECLARE
  v_user_id uuid;
  v_name text;
  v_norm_name text;
  v_ex_id uuid;
  
  rec record;
  day_rec record;
  ex_json jsonb;
  new_exercises jsonb;
BEGIN
  -- 1. Extract all unique names from workout_logs and workout_days
  FOR rec IN 
    SELECT DISTINCT user_id, exercise_name 
    FROM public.workout_logs 
    WHERE user_id IS NOT NULL AND exercise_name IS NOT NULL
  LOOP
    v_norm_name := lower(trim(rec.exercise_name));
    
    -- Insert if not exists
    INSERT INTO public.exercises (user_id, name, normalized_name)
    VALUES (rec.user_id, trim(rec.exercise_name), v_norm_name)
    ON CONFLICT (user_id, normalized_name) DO NOTHING;
  END LOOP;
  
  -- Extract from workout_days as well
  FOR day_rec IN 
    SELECT wd.id, wd.exercises, w.user_id
    FROM public.workout_days wd
    JOIN public.workouts w ON w.id = wd.workout_id
  LOOP
    IF day_rec.exercises IS NOT NULL AND jsonb_typeof(day_rec.exercises::jsonb) = 'array' THEN
      FOR ex_json IN SELECT * FROM jsonb_array_elements(day_rec.exercises::jsonb)
      LOOP
        v_name := ex_json->>'name';
        IF v_name IS NOT NULL THEN
          v_norm_name := lower(trim(v_name));
          INSERT INTO public.exercises (user_id, name, normalized_name)
          VALUES (day_rec.user_id, trim(v_name), v_norm_name)
          ON CONFLICT (user_id, normalized_name) DO NOTHING;
        END IF;
      END LOOP;
    END IF;
  END LOOP;

  -- 2. Update workout_logs with exercise_id
  UPDATE public.workout_logs wl
  SET exercise_id = e.id
  FROM public.exercises e
  WHERE wl.user_id = e.user_id 
    AND lower(trim(wl.exercise_name)) = e.normalized_name;

  -- 3. Update workout_days with new exercise IDs
  FOR day_rec IN 
    SELECT wd.id, wd.exercises, w.user_id
    FROM public.workout_days wd
    JOIN public.workouts w ON w.id = wd.workout_id
  LOOP
    IF day_rec.exercises IS NOT NULL AND jsonb_typeof(day_rec.exercises::jsonb) = 'array' THEN
      new_exercises := '[]'::jsonb;
      FOR ex_json IN SELECT * FROM jsonb_array_elements(day_rec.exercises::jsonb)
      LOOP
        v_name := ex_json->>'name';
        IF v_name IS NOT NULL THEN
          v_norm_name := lower(trim(v_name));
          -- Find matching exercise_id
          SELECT id INTO v_ex_id 
          FROM public.exercises 
          WHERE user_id = day_rec.user_id AND normalized_name = v_norm_name;
          
          IF v_ex_id IS NOT NULL THEN
            -- Add the shared UUID as exercise_id, keeping the old random id for UI uniqueness!
            ex_json := jsonb_set(ex_json, '{exercise_id}', to_jsonb(v_ex_id::text));
          END IF;
        END IF;
        new_exercises := new_exercises || ex_json;
      END LOOP;
      
      -- Update the row
      UPDATE public.workout_days 
      SET exercises = new_exercises 
      WHERE id = day_rec.id;
    END IF;
  END LOOP;
END $$;

-- Drop old unique constraint
ALTER TABLE public.workout_logs DROP CONSTRAINT IF EXISTS unique_user_exercise_date_day;

-- Add new constraint matching the new schema
-- We include workout_day_id to allow logging the same exercise in different routines on the same day.
ALTER TABLE public.workout_logs 
  ADD CONSTRAINT unique_user_exercise_date_day UNIQUE (user_id, exercise_id, performed_at, workout_day_id);

-- Make exercise_id NOT NULL and drop exercise_name if desired, but wait: dropping it breaks the old clients.
-- For safety and backward compatibility during migration, we can leave exercise_name but make exercise_id NOT NULL.
ALTER TABLE public.workout_logs ALTER COLUMN exercise_id SET NOT NULL;
