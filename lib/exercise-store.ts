import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ExerciseValues {
  weight: number
  reps: number
  sets: number
}

interface ExerciseStore {
  lastUsedValues: Record<string, ExerciseValues>
  setLastUsedValues: (exerciseId: string, values: ExerciseValues) => void
  getLastUsedValues: (exerciseId: string) => ExerciseValues
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

      setLastUsedValues: (exerciseId, values) => {
        set((state) => ({
          lastUsedValues: {
            ...state.lastUsedValues,
            [exerciseId]: values,
          },
        }))
      },

      getLastUsedValues: (exerciseId) => {
        const state = get()
        return state.lastUsedValues[exerciseId] || DEFAULT_VALUES
      },
    }),
    {
      name: "exercise-values-storage",
    },
  ),
)
