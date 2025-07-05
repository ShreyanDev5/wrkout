import type { WorkoutLog } from "./types"

// Realistic demo data for Monthly Summary Table
// 12 items with broad coverage across all workout categories
export const demoWorkoutLogs: WorkoutLog[] = [
  // Push exercises (4 items)
  {
    id: "demo-1",
    exercise_name: "Barbell Bench Press",
    workout_id: "demo-workout",
    weight: 185, // More realistic weight for intermediate lifter
    avg_reps: 6,
    performed_at: "2025-07-05T10:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-2",
    exercise_name: "Dumbbell Overhead Press",
    workout_id: "demo-workout",
    weight: 65, // More realistic weight
    avg_reps: 8,
    performed_at: "2025-07-04T14:20:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-3",
    exercise_name: "Incline Dumbbell Press",
    workout_id: "demo-workout",
    weight: 75,
    avg_reps: 8,
    performed_at: "2025-07-03T16:45:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-4",
    exercise_name: "Triceps Pushdown",
    workout_id: "demo-workout",
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
    weight: 200, // bodyweight + added weight (more realistic)
    avg_reps: 8,
    performed_at: "2025-07-01T11:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-6",
    exercise_name: "Barbell Row",
    workout_id: "demo-workout",
    weight: 155,
    avg_reps: 8,
    performed_at: "2025-06-30T15:20:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-7",
    exercise_name: "Barbell Curl",
    workout_id: "demo-workout",
    weight: 85,
    avg_reps: 10,
    performed_at: "2025-06-29T08:45:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-8",
    exercise_name: "Lat Pulldown",
    workout_id: "demo-workout",
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
    weight: 225, // More realistic weight
    avg_reps: 5,
    performed_at: "2025-06-27T17:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-10",
    exercise_name: "Romanian Deadlift",
    workout_id: "demo-workout",
    weight: 185,
    avg_reps: 8,
    performed_at: "2025-06-26T10:00:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-11",
    exercise_name: "Leg Press",
    workout_id: "demo-workout",
    weight: 315, // More realistic weight for leg press
    avg_reps: 10,
    performed_at: "2025-06-25T10:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-12",
    exercise_name: "Standing Calf Raise",
    workout_id: "demo-workout",
    weight: 135,
    avg_reps: 15,
    performed_at: "2025-06-24T14:20:00Z",
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
    weight: 175, // +10kg improvement
    avg_reps: 5, // +1 rep improvement
    performed_at: "2025-06-15T10:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-2",
    exercise_name: "Dumbbell Overhead Press",
    workout_id: "demo-workout",
    weight: 60, // +5kg improvement
    avg_reps: 7, // +1 rep improvement
    performed_at: "2025-06-14T14:20:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-3",
    exercise_name: "Incline Dumbbell Press",
    workout_id: "demo-workout",
    weight: 70, // +5kg improvement
    avg_reps: 7, // +1 rep improvement
    performed_at: "2025-06-13T16:45:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-4",
    exercise_name: "Triceps Pushdown",
    workout_id: "demo-workout",
    weight: 40, // +5kg improvement
    avg_reps: 10, // +2 reps improvement
    performed_at: "2025-06-12T09:15:00Z",
    user_id: "demo-user"
  },
  
  // Pull exercises (previous data - mixed progress)
  {
    id: "demo-prev-5",
    exercise_name: "Pull-ups",
    workout_id: "demo-workout",
    weight: 185, // +15kg improvement
    avg_reps: 6, // +2 reps improvement
    performed_at: "2025-06-11T11:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-6",
    exercise_name: "Barbell Row",
    workout_id: "demo-workout",
    weight: 150, // +5kg improvement
    avg_reps: 7, // +1 rep improvement
    performed_at: "2025-06-10T15:20:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-7",
    exercise_name: "Barbell Curl",
    workout_id: "demo-workout",
    weight: 80, // +5kg improvement
    avg_reps: 8, // +2 reps improvement
    performed_at: "2025-06-09T08:45:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-8",
    exercise_name: "Lat Pulldown",
    workout_id: "demo-workout",
    weight: 135, // +5kg improvement
    avg_reps: 9, // +1 rep improvement
    performed_at: "2025-06-08T13:10:00Z",
    user_id: "demo-user"
  },
  
  // Leg exercises (previous data - showing progress)
  {
    id: "demo-prev-9",
    exercise_name: "Barbell Squat",
    workout_id: "demo-workout",
    weight: 215, // +10kg improvement
    avg_reps: 4, // +1 rep improvement
    performed_at: "2025-06-07T17:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-10",
    exercise_name: "Romanian Deadlift",
    workout_id: "demo-workout",
    weight: 175, // +10kg improvement
    avg_reps: 7, // +1 rep improvement
    performed_at: "2025-06-06T10:00:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-11",
    exercise_name: "Leg Press",
    workout_id: "demo-workout",
    weight: 300, // +15kg improvement
    avg_reps: 9, // +1 rep improvement
    performed_at: "2025-06-05T10:30:00Z",
    user_id: "demo-user"
  },
  {
    id: "demo-prev-12",
    exercise_name: "Standing Calf Raise",
    workout_id: "demo-workout",
    weight: 125, // +10kg improvement
    avg_reps: 13, // +2 reps improvement
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

// Combined demo data for easy use
export const getDemoWorkoutLogs = (): WorkoutLog[] => {
  return [...demoWorkoutLogs, ...demoPreviousWorkoutLogs, ...demoIntermediateLogs]
} 