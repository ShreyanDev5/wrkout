import type { Workout } from "./types"

// Minimal fallback: matches new Supabase demo data structure
export const workoutData: Workout[] = [
  {
    id: "b1a7e8c2-1f2d-4c3e-8e4f-5a6b7c8d9e0f", // Matches Supabase demo workout ID
    name: "PPL Split (Demo)",
    days: [], // Days will be loaded separately or from fallback demoWorkoutDays
  },
]
