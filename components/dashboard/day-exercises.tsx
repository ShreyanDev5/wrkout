"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { Exercise, WorkoutLog } from "@/lib/types"
import { WorkoutLogModal } from "@/components/modals/workout-log-modal" // Keep for fallback if needed, or remove if unused.
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { AnimatedCheckbox } from "@/components/ui/animated-checkbox"
import { InlineWorkoutLogger } from "@/components/dashboard/inline-workout-logger"
import { AnimatePresence } from "framer-motion"
import { useHaptics } from "@/hooks/use-haptics"

interface DayExercisesProps {
  exercises: Exercise[]
  dayId: string
  workoutId: string
  completedExerciseNames: Set<string>
  onLogWorkout: (log: WorkoutLog) => void | Promise<void>
  onToggleExercise: (exerciseName: string, isCompleted: boolean) => void
  dayColor: string
}

export function DayExercises({
  exercises,
  dayId,
  workoutId,
  completedExerciseNames,
  onLogWorkout,
  onToggleExercise,
  dayColor
}: DayExercisesProps) {
  /* -------------------------------------------------------------------------
   *  INLINE EXPANSION STATE
   * ------------------------------------------------------------------------- */
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null)

  /* -------------------------------------------------------------------------
   *  HAPTICS
   * ------------------------------------------------------------------------- */
  const { trigger: haptic } = useHaptics()

  // Handlers
  const handleToggleExpand = (exerciseId: string) => {
    haptic("light")
    setExpandedExerciseId(prev => (prev === exerciseId ? null : exerciseId))
  }

  const handleCheckboxToggle = (exercise: Exercise) => {
    const isCompleted = completedExerciseNames.has(exercise.name)

    if (!isCompleted) {
      // UX Improvement: Tapping checkmark opens logger for "Quick Complete" or detailed logging.
      // No sound/haptics here - defer to the actual "Save" action.
      setExpandedExerciseId(exercise.id)
    } else {
      // Uncheck flow (keep existing logic)
      haptic("light")
      onToggleExercise(exercise.name, false)
    }
  }

  return (
    <div className="space-y-1.5">
      {exercises.map((exercise) => {
        const completed = completedExerciseNames.has(exercise.name)
        const isExpanded = expandedExerciseId === exercise.id

        return (
          <div
            key={exercise.id}
            className={cn(
              "rounded-2xl transition-all duration-300 ease-in-out border",
              isExpanded
                ? "bg-secondary/10 border-border/50 shadow-sm"
                : "bg-transparent border-transparent hover:bg-secondary/5"
            )}
          >
            <div
              className={cn(
                "relative py-4 px-4 flex items-center gap-4 cursor-pointer select-none",
              )}
              onClick={() => handleToggleExpand(exercise.id)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <AnimatedCheckbox
                  checked={completed}
                  dayColor={dayColor}
                  className="mr-1 flex-shrink-0"
                  onClick={() => handleCheckboxToggle(exercise)}
                  aria-label={completed ? `Completed ${exercise.name}` : `Mark ${exercise.name} as completed`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <Label
                  className={cn(
                    "text-[0.9375rem] font-semibold truncate block leading-tight cursor-pointer tracking-tight",
                    "text-foreground",
                    completed && "exercise-label-checked opacity-40 font-medium"
                  )}
                  title={exercise.name}
                >
                  {exercise.name}
                </Label>
                {exercise.description && (
                  <p className="text-[0.75rem] text-muted-foreground/70 truncate mt-1 tracking-normal font-medium" title={exercise.description}>
                    {exercise.description}
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 rounded-full p-0 flex items-center justify-center transition-all duration-300",
                  isExpanded ? "bg-secondary text-foreground rotate-90" : "text-muted-foreground hover:bg-secondary/50"
                )}
                aria-label={isExpanded ? "Close logger" : "Log session"}
              >
                <PlusCircle
                  className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    isExpanded && "rotate-45"
                  )}
                />
              </Button>
            </div>

            {/* Inline Logger */}
            <AnimatePresence>
              {isExpanded && (
                <div className="px-2 pb-3">
                  <InlineWorkoutLogger
                    exercise={exercise}
                    workoutId={workoutId}
                    onSave={(log) => {
                      onLogWorkout(log)
                      setExpandedExerciseId(null) // Close on save
                    }}
                    onCancel={() => setExpandedExerciseId(null)}
                    dayColor={dayColor}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {
        exercises.length === 0 && (
          <div className="text-center py-12 text-muted-foreground/50 text-sm">
            <p>No exercises for this day.</p>
          </div>
        )
      }
    </div >
  )
}