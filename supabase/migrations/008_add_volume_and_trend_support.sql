-- Add a generated volume column so workout volume is computed once at write time.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'workout_logs'
      AND column_name = 'volume'
  ) THEN
    ALTER TABLE public.workout_logs
      ADD COLUMN volume numeric GENERATED ALWAYS AS (
        COALESCE(weight, 0) * COALESCE(avg_reps, 0) * COALESCE(sets, 0)
      ) STORED;
  END IF;
END $$;

-- Supports fast lookup of latest previous entry for the same exercise context.
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_exercise_day_date
  ON public.workout_logs (user_id, exercise_name, workout_day_id, performed_at DESC);

-- Returns trend state for each exercise logged on a target date.
CREATE OR REPLACE FUNCTION public.get_exercise_volume_trends(
  p_user_id uuid,
  p_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  exercise_name text,
  workout_day_id uuid,
  today_volume numeric,
  previous_volume numeric,
  trend text
)
LANGUAGE sql
STABLE
AS $$
  WITH daily_totals AS (
    SELECT
      wl.exercise_name,
      wl.workout_day_id,
      wl.performed_at,
      SUM(COALESCE(wl.volume, 0)) AS total_volume
    FROM public.workout_logs wl
    WHERE wl.user_id = p_user_id
      AND wl.avg_reps > 0
      AND wl.sets > 0
    GROUP BY wl.exercise_name, wl.workout_day_id, wl.performed_at
  ),
  today_totals AS (
    SELECT
      dt.exercise_name,
      dt.workout_day_id,
      dt.total_volume
    FROM daily_totals dt
    WHERE dt.performed_at = p_date
  ),
  latest_previous AS (
    SELECT DISTINCT ON (dt.exercise_name, dt.workout_day_id)
      dt.exercise_name,
      dt.workout_day_id,
      dt.total_volume
    FROM daily_totals dt
    INNER JOIN today_totals tt
      ON tt.exercise_name = dt.exercise_name
      AND tt.workout_day_id IS NOT DISTINCT FROM dt.workout_day_id
    WHERE dt.performed_at < p_date
    ORDER BY dt.exercise_name, dt.workout_day_id, dt.performed_at DESC
  )
  SELECT
    tt.exercise_name,
    tt.workout_day_id,
    tt.total_volume AS today_volume,
    lp.total_volume AS previous_volume,
    CASE
      WHEN lp.total_volume IS NULL THEN 'new'
      WHEN tt.total_volume > lp.total_volume THEN 'up'
      WHEN tt.total_volume < lp.total_volume THEN 'down'
      ELSE 'same'
    END AS trend
  FROM today_totals tt
  LEFT JOIN latest_previous lp
    ON lp.exercise_name = tt.exercise_name
    AND lp.workout_day_id IS NOT DISTINCT FROM tt.workout_day_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_exercise_volume_trends(uuid, date) TO authenticated;
