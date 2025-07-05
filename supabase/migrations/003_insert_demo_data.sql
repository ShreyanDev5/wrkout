-- Insert demo workout data
-- This creates a demo workout that new users can see before signing up

INSERT INTO workouts (id, user_id, name, created_at) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  NULL, -- NULL user_id means it's demo data
  'Demo PPL Workout',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert demo workout logs
-- Note: workout_id references the demo workout UUID above
INSERT INTO workout_logs (id, user_id, workout_id, exercise_name, weight, avg_reps, performed_at) 
VALUES 
  -- Push exercises
  (gen_random_uuid(), NULL, '00000000-0000-0000-0000-000000000001', 'Bench Press', 135, 8, CURRENT_DATE - INTERVAL '7 days'),
  (gen_random_uuid(), NULL, '00000000-0000-0000-0000-000000000001', 'Overhead Press', 95, 6, CURRENT_DATE - INTERVAL '7 days'),
  (gen_random_uuid(), NULL, '00000000-0000-0000-0000-000000000001', 'Incline Dumbbell Press', 60, 10, CURRENT_DATE - INTERVAL '7 days'),
  (gen_random_uuid(), NULL, '00000000-0000-0000-0000-000000000001', 'Dips', 1, 12, CURRENT_DATE - INTERVAL '7 days'),
  (gen_random_uuid(), NULL, '00000000-0000-0000-0000-000000000001', 'Lateral Raises', 20, 15, CURRENT_DATE - INTERVAL '7 days'),
  
  -- Pull exercises
  (gen_random_uuid(), NULL, '00000000-0000-0000-0000-000000000001', 'Deadlift', 225, 5, CURRENT_DATE - INTERVAL '6 days'),
  (gen_random_uuid(), NULL, '00000000-0000-0000-0000-000000000001', 'Barbell Rows', 135, 8, CURRENT_DATE - INTERVAL '6 days'),
  (gen_random_uuid(), NULL, '00000000-0000-0000-0000-000000000001', 'Pull-ups', 1, 8, CURRENT_DATE - INTERVAL '6 days'),
  (gen_random_uuid(), NULL, '00000000-0000-0000-0000-000000000001', 'Bicep Curls', 30, 12, CURRENT_DATE - INTERVAL '6 days'),
  (gen_random_uuid(), NULL, '00000000-0000-0000-0000-000000000001', 'Face Pulls', 15, 15, CURRENT_DATE - INTERVAL '6 days'),
  
  -- Leg exercises
  (gen_random_uuid(), NULL, '00000000-0000-0000-0000-000000000001', 'Squats', 185, 8, CURRENT_DATE - INTERVAL '5 days'),
  (gen_random_uuid(), NULL, '00000000-0000-0000-0000-000000000001', 'Romanian Deadlift', 155, 10, CURRENT_DATE - INTERVAL '5 days'),
  (gen_random_uuid(), NULL, '00000000-0000-0000-0000-000000000001', 'Leg Press', 225, 12, CURRENT_DATE - INTERVAL '5 days'),
  (gen_random_uuid(), NULL, '00000000-0000-0000-0000-000000000001', 'Calf Raises', 90, 20, CURRENT_DATE - INTERVAL '5 days'),
  (gen_random_uuid(), NULL, '00000000-0000-0000-0000-000000000001', 'Leg Extensions', 80, 15, CURRENT_DATE - INTERVAL '5 days')
ON CONFLICT DO NOTHING; 