import { workoutData as initialWorkoutData } from "./workout-data"
import { demoWorkoutDays } from "./demo-data"
import type { AppData, WorkoutDay } from "./types"

// Updated AppData type for normalized structure
// export interface AppData {
//   workouts: Workout[]
//   workoutDays: WorkoutDay[]
//   lastSyncTime: string | null
// }

// Initialize workout data in localStorage if it doesn't exist
export async function initializeWorkoutData(): Promise<void> {
  const existingData = localStorage.getItem("workoutData")

  if (!existingData) {
    const initialData: any = {
      workouts: initialWorkoutData,
      workoutDays: demoWorkoutDays, // Add normalized days
      lastSyncTime: null,
    }
    localStorage.setItem("workoutData", JSON.stringify(initialData))
  }
}

// Load workout data from localStorage (normalized)
export async function loadWorkoutData(): Promise<any> {
  const data = localStorage.getItem("workoutData")

  if (data) {
    const parsed = JSON.parse(data)
    // Backward compatibility: if workoutDays missing, flatten from workouts
    if (!parsed.workoutDays && parsed.workouts) {
      parsed.workoutDays = parsed.workouts.flatMap((w: any) =>
        (w.days || []).map((d: any) => ({
          ...d,
          workout_id: w.id,
        }))
      )
    }
    return parsed
  }

  return {
    workouts: [],
    workoutDays: [],
    lastSyncTime: null,
  }
}

// Save workout data to localStorage (normalized)
export async function saveWorkoutData(data: any): Promise<void> {
  localStorage.setItem("workoutData", JSON.stringify(data))
}

// Save last selected workout section
export async function saveLastWorkoutSection(section: string): Promise<void> {
  localStorage.setItem("lastWorkoutSection", section)
}

// Load last selected workout section
export async function loadLastWorkoutSection(): Promise<string> {
  const section = localStorage.getItem("lastWorkoutSection")
  return section || "push" // Default to "push" if no section is saved
}

// Save last progress page state
export async function saveLastProgressState(state: { mainFilter: string | null, chartExerciseFilter: string | null }): Promise<void> {
  localStorage.setItem("lastProgressState", JSON.stringify(state))
}

// Load last progress page state
export async function loadLastProgressState(): Promise<{ mainFilter: string | null, chartExerciseFilter: string | null }> {
  const state = localStorage.getItem("lastProgressState")
  if (state) {
    return JSON.parse(state)
  }
  return { mainFilter: null, chartExerciseFilter: null } // Default state
}

// Clear all data from localStorage
export async function clearAllData(): Promise<void> {
  localStorage.removeItem("workoutData")
  localStorage.removeItem("lastWorkoutSection")
  localStorage.removeItem("lastProgressState")
}
