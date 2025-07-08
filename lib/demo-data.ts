import type { WorkoutLog } from "./types"

// Realistic demo data for Monthly Summary Table (used for onboarding demo logs)
export const demoWorkoutLogs: WorkoutLog[] = [
  // Push exercises (4 items)
  {
    id: "demo-1",
    exercise_name: "Barbell Bench Press",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-push",
    weight: 185,
    avg_reps: 6,
    performed_at: "2025-07-05T10:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-2",
    exercise_name: "Dumbbell Overhead Press",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-push",
    weight: 65,
    avg_reps: 8,
    performed_at: "2025-07-04T14:20:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-3",
    exercise_name: "Incline Dumbbell Press",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-push",
    weight: 75,
    avg_reps: 8,
    performed_at: "2025-07-03T16:45:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-4",
    exercise_name: "Triceps Pushdown",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-push",
    weight: 45,
    avg_reps: 12,
    performed_at: "2025-07-02T09:15:00Z",
    user_id: "demo-user"
  },
  // Pull exercises (4 items)
  {
    id: "demo-5",
    exercise_name: "Pull-ups",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-pull",
    weight: 200,
    avg_reps: 8,
    performed_at: "2025-07-01T11:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-6",
    exercise_name: "Barbell Row",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-pull",
    weight: 155,
    avg_reps: 8,
    performed_at: "2025-06-30T15:20:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-7",
    exercise_name: "Barbell Curl",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-pull",
    weight: 85,
    avg_reps: 10,
    performed_at: "2025-06-29T08:45:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-8",
    exercise_name: "Lat Pulldown",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-pull",
    weight: 140,
    avg_reps: 10,
    performed_at: "2025-06-28T13:10:00Z",
    user_id: "demo-user"
  },
  // Leg exercises (4 items)
  {
    id: "demo-9",
    exercise_name: "Barbell Squat",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-leg",
    weight: 225,
    avg_reps: 5,
    performed_at: "2025-06-27T17:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-10",
    exercise_name: "Romanian Deadlift",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-leg",
    weight: 185,
    avg_reps: 8,
    performed_at: "2025-06-26T10:00:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-11",
    exercise_name: "Leg Press",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-leg",
    weight: 315,
    avg_reps: 10,
    performed_at: "2025-06-25T10:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-12",
    exercise_name: "Standing Calf Raise",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-leg",
    weight: 135,
    avg_reps: 15,
    performed_at: "2025-06-24T14:20:00Z",
    user_id: "demo-user"
  }
]

// Previous workout data for trend indicators (used for onboarding demo logs)
export const demoPreviousWorkoutLogs: WorkoutLog[] = [
  // Push exercises (previous data - showing improvement)
  {
    id: "demo-prev-1",
    exercise_name: "Barbell Bench Press",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-push",
    weight: 175,
    avg_reps: 5,
    performed_at: "2025-06-15T10:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-2",
    exercise_name: "Dumbbell Overhead Press",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-push",
    weight: 60,
    avg_reps: 7,
    performed_at: "2025-06-14T14:20:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-3",
    exercise_name: "Incline Dumbbell Press",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-push",
    weight: 70,
    avg_reps: 7,
    performed_at: "2025-06-13T16:45:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-4",
    exercise_name: "Triceps Pushdown",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-push",
    weight: 40,
    avg_reps: 10,
    performed_at: "2025-06-12T09:15:00Z",
    user_id: "demo-user"
  },
  // Pull exercises (previous data - mixed progress)
  {
    id: "demo-prev-5",
    exercise_name: "Pull-ups",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-pull",
    weight: 185,
    avg_reps: 6,
    performed_at: "2025-06-11T11:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-6",
    exercise_name: "Barbell Row",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-pull",
    weight: 150,
    avg_reps: 7,
    performed_at: "2025-06-10T15:20:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-7",
    exercise_name: "Barbell Curl",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-pull",
    weight: 80,
    avg_reps: 8,
    performed_at: "2025-06-09T08:45:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-8",
    exercise_name: "Lat Pulldown",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-pull",
    weight: 135,
    avg_reps: 9,
    performed_at: "2025-06-08T13:10:00Z",
    user_id: "demo-user"
  },
  // Leg exercises (previous data - showing progress)
  {
    id: "demo-prev-9",
    exercise_name: "Barbell Squat",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-leg",
    weight: 215,
    avg_reps: 4,
    performed_at: "2025-06-07T17:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-10",
    exercise_name: "Romanian Deadlift",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-leg",
    weight: 175,
    avg_reps: 7,
    performed_at: "2025-06-06T10:00:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-11",
    exercise_name: "Leg Press",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-leg",
    weight: 300,
    avg_reps: 9,
    performed_at: "2025-06-05T10:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-12",
    exercise_name: "Standing Calf Raise",
    workout_id: "demo-workout",
    workout_day_id: "demo-day-leg",
    weight: 125,
    avg_reps: 13,
    performed_at: "2025-06-04T14:20:00Z",
    user_id: "demo-user"
  }
]

// Helper to get all demo logs (current + previous)
export const getDemoWorkoutLogs = (): WorkoutLog[] => [
  ...demoWorkoutLogs,
  ...demoPreviousWorkoutLogs,
] 