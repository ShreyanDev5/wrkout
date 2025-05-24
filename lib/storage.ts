import { workoutData as initialWorkoutData } from "./workout-data"
import type { WorkoutSession, AppData } from "./types"

// Initialize workout data in localStorage if it doesn't exist
export async function initializeWorkoutData(): Promise<void> {
  const existingData = localStorage.getItem("workoutData")

  if (!existingData) {
    const initialData: AppData = {
      workouts: initialWorkoutData,
      completedExercises: {},
      lastSyncTime: null,
    }

    localStorage.setItem("workoutData", JSON.stringify(initialData))
  }
}

// Load workout data from localStorage
export async function loadWorkoutData(): Promise<AppData> {
  const data = localStorage.getItem("workoutData")

  if (data) {
    return JSON.parse(data)
  }

  return {
    workouts: [],
    completedExercises: {},
    lastSyncTime: null,
  }
}

// Save workout data to localStorage
export async function saveWorkoutData(data: AppData): Promise<void> {
  localStorage.setItem("workoutData", JSON.stringify(data))
}

// Load workout sessions from localStorage
export async function loadWorkoutSessions(): Promise<WorkoutSession[]> {
  const sessions = localStorage.getItem("workoutSessions")

  if (sessions) {
    return JSON.parse(sessions)
  }

  return []
}

// Save workout sessions to localStorage
export async function saveWorkoutSessions(sessions: WorkoutSession[]): Promise<void> {
  localStorage.setItem("workoutSessions", JSON.stringify(sessions))
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
  localStorage.removeItem("workoutSessions")
  localStorage.removeItem("lastWorkoutSection")
  localStorage.removeItem("lastProgressState")
}
