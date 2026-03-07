CREATE OR REPLACE FUNCTION public.is_bodyweight_exercise_name(p_exercise_name text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM unnest(
      ARRAY[
        'pullup',
        'chinup',
        'dip',
        'hanginglegraise',
        'pushup',
        'situp',
        'crunch',
        'plank',
        'muscleup',
        'burpee',
        'lunge',
        'squat',
        'glutebridge',
        'airsquat',
        'jumpsquat',
        'calfraise',
        'stepup',
        'mountainclimber',
        'boxjump',
        'jumpingjack',
        'hollowbody',
        'vup',
        'flutterkick',
        'russiantwist',
        'superman',
        'invertedrow',
        'pistolsquat',
        'nordic',
        'bicyclecrunch',
        'toestobar'
      ]
    ) AS keyword
    WHERE regexp_replace(lower(COALESCE(p_exercise_name, '')), '[^a-z0-9]+', '', 'g') LIKE '%' || keyword || '%'
  );
$$;

ALTER TABLE public.workout_logs
  DROP COLUMN IF EXISTS volume;

ALTER TABLE public.workout_logs
  ADD COLUMN volume numeric GENERATED ALWAYS AS (
    CASE
      WHEN COALESCE(weight, 0) <= 0
        AND public.is_bodyweight_exercise_name(exercise_name)
      THEN COALESCE(avg_reps, 0) * COALESCE(sets, 0)
      ELSE COALESCE(weight, 0) * COALESCE(avg_reps, 0) * COALESCE(sets, 0)
    END
  ) STORED;

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