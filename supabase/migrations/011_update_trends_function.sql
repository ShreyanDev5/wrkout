-- Update the get_exercise_volume_trends function to group by exercise_id
-- and ignore workout_day_id when computing previous volume trends.

-- First drop the old function to avoid return type conflicts if we change them.
DROP FUNCTION IF EXISTS public.get_exercise_volume_trends(uuid, date);

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
      wl.exercise_id,
      MAX(wl.exercise_name) AS exercise_name,
      -- Pick any workout_day_id from that day's sessions to pass along to the UI for styling context
      MAX(wl.workout_day_id::text)::uuid AS workout_day_id,
      wl.performed_at,
      SUM(COALESCE(wl.volume, 0)) AS total_volume
    FROM public.workout_logs wl
    WHERE wl.user_id = p_user_id
      AND wl.avg_reps > 0
      AND wl.sets > 0
    GROUP BY wl.exercise_id, wl.performed_at
  ),
  today_totals AS (
    SELECT
      dt.exercise_id,
      dt.exercise_name,
      dt.workout_day_id,
      dt.total_volume
    FROM daily_totals dt
    WHERE dt.performed_at = p_date
  ),
  latest_previous AS (
    SELECT DISTINCT ON (dt.exercise_id)
      dt.exercise_id,
      dt.total_volume
    FROM daily_totals dt
    INNER JOIN today_totals tt
      ON tt.exercise_id = dt.exercise_id
    WHERE dt.performed_at < p_date
    ORDER BY dt.exercise_id, dt.performed_at DESC
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
    ON lp.exercise_id = tt.exercise_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_exercise_volume_trends(uuid, date) TO authenticated;
