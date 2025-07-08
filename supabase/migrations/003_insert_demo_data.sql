-- Insert demo PPL Split workout data
-- All IDs are randomly generated for demo purposes

-- Demo workout
INSERT INTO workouts (id, user_id, name, created_at) VALUES
  ('b1a7e8c2-1f2d-4c3e-8e4f-5a6b7c8d9e0f', NULL, 'PPL Split (Demo)', '2025-07-04T08:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Demo workout days
INSERT INTO workout_days (id, workout_id, day_id, name, created_at, updated_at) VALUES
  ('d1a7e8c2-1f2d-4c3e-8e4f-5a6b7c8d9e01', 'b1a7e8c2-1f2d-4c3e-8e4f-5a6b7c8d9e0f', 'push', 'Push Day', '2025-07-04T08:00:00Z', '2025-07-04T08:00:00Z'),
  ('d2b8f9d3-2e3f-5d4e-9f5a-6b7c8d9e0f1a', 'b1a7e8c2-1f2d-4c3e-8e4f-5a6b7c8d9e0f', 'pull', 'Pull Day', '2025-07-04T08:00:00Z', '2025-07-04T08:00:00Z'),
  ('a3b2c1d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b1a7e8c2-1f2d-4c3e-8e4f-5a6b7c8d9e0f', 'leg',  'Leg Day',  '2025-07-04T08:00:00Z', '2025-07-04T08:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Demo workout logs (3 per day)
INSERT INTO workout_logs (id, user_id, workout_id, workout_day_id, exercise_name, weight, avg_reps, performed_at, created_at, updated_at) VALUES
  -- Push Day (2025-07-07)
  ('e1a1a1a1-1111-1111-1111-111111111111', NULL, 'b1a7e8c2-1f2d-4c3e-8e4f-5a6b7c8d9e0f', 'd1a7e8c2-1f2d-4c3e-8e4f-5a6b7c8d9e01', 'Barbell Bench Press', 70, 8, '2025-07-07', '2025-07-07T09:00:00Z', '2025-07-07T09:00:00Z'),
  ('e2b2b2b2-2222-2222-2222-222222222222', NULL, 'b1a7e8c2-1f2d-4c3e-8e4f-5a6b7c8d9e0f', 'd1a7e8c2-1f2d-4c3e-8e4f-5a6b7c8d9e01', 'Seated Dumbbell Press', 22.5, 10, '2025-07-07', '2025-07-07T09:05:00Z', '2025-07-07T09:05:00Z'),
  ('e3c3c3c3-3333-3333-3333-333333333333', NULL, 'b1a7e8c2-1f2d-4c3e-8e4f-5a6b7c8d9e0f', 'd1a7e8c2-1f2d-4c3e-8e4f-5a6b7c8d9e01', 'Cable Tricep Pushdown', 30, 12, '2025-07-07', '2025-07-07T09:10:00Z', '2025-07-07T09:10:00Z'),
  -- Pull Day (2025-07-06)
  ('e4d4d4d4-4444-4444-4444-444444444444', NULL, 'b1a7e8c2-1f2d-4c3e-8e4f-5a6b7c8d9e0f', 'd2b8f9d3-2e3f-5d4e-9f5a-6b7c8d9e0f1a', 'Barbell Bent-over Row', 60, 8, '2025-07-06', '2025-07-06T09:00:00Z', '2025-07-06T09:00:00Z'),
  ('e5e5e5e5-5555-5555-5555-555555555555', NULL, 'b1a7e8c2-1f2d-4c3e-8e4f-5a6b7c8d9e0f', 'd2b8f9d3-2e3f-5d4e-9f5a-6b7c8d9e0f1a', 'Pull-ups (Assisted)', 67, 10, '2025-07-06', '2025-07-06T09:05:00Z', '2025-07-06T09:05:00Z'),
  ('e6f6f6f6-6666-6666-6666-666666666666', NULL, 'b1a7e8c2-1f2d-4c3e-8e4f-5a6b7c8d9e0f', 'd2b8f9d3-2e3f-5d4e-9f5a-6b7c8d9e0f1a', 'Dumbbell Hammer Curl', 15, 10, '2025-07-06', '2025-07-06T09:10:00Z', '2025-07-06T09:10:00Z'),
  -- Legs Day (2025-07-05)
  ('e7g7g7g7-7777-7777-7777-777777777777', NULL, 'b1a7e8c2-1f2d-4c3e-8e4f-5a6b7c8d9e0f', 'a3b2c1d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Barbell Back Squat', 90, 6, '2025-07-05', '2025-07-05T09:00:00Z', '2025-07-05T09:00:00Z'),
  ('e8h8h8h8-8888-8888-8888-888888888888', NULL, 'b1a7e8c2-1f2d-4c3e-8e4f-5a6b7c8d9e0f', 'a3b2c1d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Romanian Deadlift', 65, 10, '2025-07-05', '2025-07-05T09:05:00Z', '2025-07-05T09:05:00Z'),
  ('e9i9i9i9-9999-9999-9999-999999999999', NULL, 'b1a7e8c2-1f2d-4c3e-8e4f-5a6b7c8d9e0f', 'a3b2c1d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Standing Calf Raise', 50, 15, '2025-07-05', '2025-07-05T09:10:00Z', '2025-07-05T09:10:00Z')
ON CONFLICT (id) DO NOTHING; 