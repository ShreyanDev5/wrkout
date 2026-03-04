import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { WorkoutLog } from "./types"

interface ExerciseValues {
  weight: number
  reps: number
  sets: number
}

interface ExerciseStore {
  lastUsedValues: Record<string, ExerciseValues>
  setLastUsedValues: (exerciseId: string, values: ExerciseValues) => void
  getLastUsedValues: (exerciseId: string) => ExerciseValues
  lastLogs: Record<string, WorkoutLog | null>
  setLastLog: (exerciseId: string, log: WorkoutLog) => void
  getLastLog: (exerciseId: string) => WorkoutLog | null
}

// Default values for new exercises
const DEFAULT_VALUES: ExerciseValues = {
  weight: 20,
  reps: 8,
  sets: 3,
}

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set, get) => ({
      lastUsedValues: {},
      lastLogs: {},

      setLastUsedValues: (exerciseId, values) => {
        set((state) => ({
          lastUsedValues: {
            ...state.lastUsedValues,
            [exerciseId]: values,
          },
        }))
      },
      setLastLog: (exerciseId, log) => {
        set((state) => ({
          lastLogs: {
            ...state.lastLogs,
            [exerciseId]: log,
          },
        }))
      },
      getLastUsedValues: (exerciseId) => {
        const state = get()
        return state.lastUsedValues[exerciseId] || DEFAULT_VALUES
      },
      getLastLog: (exerciseId) => {
        const state = get()
        return state.lastLogs[exerciseId] || null
      },
    }),
    {
      name: "exercise-values-storage",
    },
  ),
)
