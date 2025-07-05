import type { WorkoutLog } from "./types"

// Deterministic demo data for Monthly Summary Table
// 10 items with broad coverage across all workout categories
export const demoWorkoutLogs: WorkoutLog[] = [
  // Push exercises
  {
    id: "demo-1",
    exercise_name: "Barbell Bench Press",
    workout_id: "demo-workout",
    weight: 85,
    avg_reps: 8,
    performed_at: "2024-01-15T10:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-2",
    exercise_name: "Dumbbell Overhead Press",
    workout_id: "demo-workout",
    weight: 45,
    avg_reps: 10,
    performed_at: "2024-01-14T14:20:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-3",
    exercise_name: "Triceps Pushdown",
    workout_id: "demo-workout",
    weight: 35,
    avg_reps: 12,
    performed_at: "2024-01-13T16:45:00Z",
    user_id: "demo-user"
  },
  
  // Pull exercises
  {
    id: "demo-4",
    exercise_name: "Pull-ups",
    workout_id: "demo-workout",
    weight: 75, // bodyweight + added weight
    avg_reps: 6,
    performed_at: "2024-01-12T09:15:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-5",
    exercise_name: "Barbell Row",
    workout_id: "demo-workout",
    weight: 70,
    avg_reps: 10,
    performed_at: "2024-01-11T11:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-6",
    exercise_name: "Barbell Curl",
    workout_id: "demo-workout",
    weight: 40,
    avg_reps: 12,
    performed_at: "2024-01-10T15:20:00Z",
    user_id: "demo-user"
  },
  
  // Leg exercises
  {
    id: "demo-7",
    exercise_name: "Barbell Squat",
    workout_id: "demo-workout",
    weight: 120,
    avg_reps: 6,
    performed_at: "2024-01-09T08:45:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-8",
    exercise_name: "Romanian Deadlift",
    workout_id: "demo-workout",
    weight: 95,
    avg_reps: 8,
    performed_at: "2024-01-08T13:10:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-9",
    exercise_name: "Leg Press",
    workout_id: "demo-workout",
    weight: 180,
    avg_reps: 10,
    performed_at: "2024-01-07T17:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-10",
    exercise_name: "Standing Calf Raise",
    workout_id: "demo-workout",
    weight: 60,
    avg_reps: 15,
    performed_at: "2024-01-06T10:00:00Z",
    user_id: "demo-user"
  }
]

// Previous workout data for trend indicators
// These represent the previous workout for each exercise to show progress
export const demoPreviousWorkoutLogs: WorkoutLog[] = [
  // Push exercises (previous data - showing improvement)
  {
    id: "demo-prev-1",
    exercise_name: "Barbell Bench Press",
    workout_id: "demo-workout",
    weight: 80, // +5kg improvement
    avg_reps: 7, // +1 rep improvement
    performed_at: "2024-01-08T10:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-2",
    exercise_name: "Dumbbell Overhead Press",
    workout_id: "demo-workout",
    weight: 42, // +3kg improvement
    avg_reps: 9, // +1 rep improvement
    performed_at: "2024-01-07T14:20:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-3",
    exercise_name: "Triceps Pushdown",
    workout_id: "demo-workout",
    weight: 32, // +3kg improvement
    avg_reps: 11, // +1 rep improvement
    performed_at: "2024-01-06T16:45:00Z",
    user_id: "demo-user"
  },
  
  // Pull exercises (previous data - mixed progress)
  {
    id: "demo-prev-4",
    exercise_name: "Pull-ups",
    workout_id: "demo-workout",
    weight: 70, // +5kg improvement
    avg_reps: 5, // +1 rep improvement
    performed_at: "2024-01-05T09:15:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-5",
    exercise_name: "Barbell Row",
    workout_id: "demo-workout",
    weight: 72, // -2kg (slight decrease)
    avg_reps: 11, // +1 rep improvement
    performed_at: "2024-01-04T11:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-6",
    exercise_name: "Barbell Curl",
    workout_id: "demo-workout",
    weight: 38, // +2kg improvement
    avg_reps: 10, // +2 reps improvement
    performed_at: "2024-01-03T15:20:00Z",
    user_id: "demo-user"
  },
  
  // Leg exercises (previous data - showing progress)
  {
    id: "demo-prev-7",
    exercise_name: "Barbell Squat",
    workout_id: "demo-workout",
    weight: 115, // +5kg improvement
    avg_reps: 5, // +1 rep improvement
    performed_at: "2024-01-02T08:45:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-8",
    exercise_name: "Romanian Deadlift",
    workout_id: "demo-workout",
    weight: 90, // +5kg improvement
    avg_reps: 7, // +1 rep improvement
    performed_at: "2024-01-01T13:10:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-9",
    exercise_name: "Leg Press",
    workout_id: "demo-workout",
    weight: 175, // +5kg improvement
    avg_reps: 9, // +1 rep improvement
    performed_at: "2023-12-31T17:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-10",
    exercise_name: "Standing Calf Raise",
    workout_id: "demo-workout",
    weight: 55, // +5kg improvement
    avg_reps: 13, // +2 reps improvement
    performed_at: "2023-12-30T10:00:00Z",
    user_id: "demo-user"
  }
]

// Combined demo data for easy use
export const getDemoWorkoutLogs = (): WorkoutLog[] => {
  return [...demoWorkoutLogs, ...demoPreviousWorkoutLogs]
} 