import type { WorkoutLog, WorkoutDay } from "./types"

// Demo workout days (normalized)
export const demoWorkoutDays: WorkoutDay[] = [
  // For demo-workout
  {
    id: "demo-day-push",
    workout_id: "demo-workout",
    day_id: "push",
    name: "Push Day",
    exercises: [
      { id: "bench-press", name: "Barbell Bench Press" },
      { id: "dumbbell-overhead-press", name: "Dumbbell Overhead Press" },
      { id: "incline-dumbbell-press", name: "Incline Dumbbell Press" },
      { id: "triceps-pushdown", name: "Triceps Pushdown" },
    ],
  },
  {
    id: "demo-day-pull",
    workout_id: "demo-workout",
    day_id: "pull",
    name: "Pull Day",
    exercises: [
      { id: "pull-ups", name: "Pull-ups" },
      { id: "barbell-row", name: "Barbell Row" },
      { id: "lat-pulldown", name: "Lat Pulldown" },
      { id: "barbell-curl", name: "Barbell Curl" },
    ],
  },
  {
    id: "demo-day-leg",
    workout_id: "demo-workout",
    day_id: "leg",
    name: "Leg Day",
    exercises: [
      { id: "barbell-squat", name: "Barbell Squat" },
      { id: "romanian-deadlift", name: "Romanian Deadlift" },
      { id: "leg-press", name: "Leg Press" },
      { id: "standing-calf-raise", name: "Standing Calf Raise" },
    ],
  },
]

// Helper to map exercise_name to workout_day_id
const getDemoDayIdForExercise = (exercise_name: string): string => {
  const lower = exercise_name.toLowerCase()
  if (lower.includes("bench press") || lower.includes("overhead press") || lower.includes("incline") || lower.includes("triceps")) return "demo-day-push"
  if (lower.includes("pull") || lower.includes("row") || lower.includes("curl")) return "demo-day-pull"
  if (lower.includes("squat") || lower.includes("deadlift") || lower.includes("leg press") || lower.includes("calf")) return "demo-day-leg"
  return "demo-day-push" // fallback
}

// Realistic demo data for Monthly Summary Table
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

// Previous workout data for trend indicators
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

// Additional intermediate data points for better chart progression
export const demoIntermediateLogs: WorkoutLog[] = [
  // Barbell Bench Press progression
  {
    id: "demo-int-1",
    exercise_name: "Barbell Bench Press",
    workout_id: "demo-workout",
    weight: 180,
    avg_reps: 6,
    performed_at: "2025-06-25T10:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-int-2",
    exercise_name: "Barbell Bench Press",
    workout_id: "demo-workout",
    weight: 182,
    avg_reps: 6,
    performed_at: "2025-06-30T10:30:00Z",
    user_id: "demo-user"
  },
  
  // Dumbbell Overhead Press progression
  {
    id: "demo-int-3",
    exercise_name: "Dumbbell Overhead Press",
    workout_id: "demo-workout",
    weight: 62,
    avg_reps: 8,
    performed_at: "2025-06-24T14:20:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-int-4",
    exercise_name: "Dumbbell Overhead Press",
    workout_id: "demo-workout",
    weight: 64,
    avg_reps: 8,
    performed_at: "2025-06-29T14:20:00Z",
    user_id: "demo-user"
  },
  
  // Barbell Squat progression
  {
    id: "demo-int-5",
    exercise_name: "Barbell Squat",
    workout_id: "demo-workout",
    weight: 220,
    avg_reps: 5,
    performed_at: "2025-06-20T17:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-int-6",
    exercise_name: "Barbell Squat",
    workout_id: "demo-workout",
    weight: 222,
    avg_reps: 5,
    performed_at: "2025-06-23T17:30:00Z",
    user_id: "demo-user"
  },
  
  // Pull-ups progression
  {
    id: "demo-int-7",
    exercise_name: "Pull-ups",
    workout_id: "demo-workout",
    weight: 190,
    avg_reps: 7,
    performed_at: "2025-06-22T11:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-int-8",
    exercise_name: "Pull-ups",
    workout_id: "demo-workout",
    weight: 195,
    avg_reps: 8,
    performed_at: "2025-06-25T11:30:00Z",
    user_id: "demo-user"
  }
]

// Helper to get all demo logs (current + previous)
export const getDemoWorkoutLogs = (): WorkoutLog[] => [
  ...demoWorkoutLogs,
  ...demoPreviousWorkoutLogs,
] 