"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { Exercise, WorkoutLog } from "@/lib/types"
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

  /* -------------------------------------------------------------------------
   *  AUTO-SCROLL EFFECT
   * ------------------------------------------------------------------------- */
  useEffect(() => {
    if (expandedExerciseId) {
      // Small timeout to allow the expansion animation to start/layout to update
      const timer = setTimeout(() => {
        const element = document.getElementById(`exercise-${expandedExerciseId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100) // 100ms delay to ensure DOM update
      return () => clearTimeout(timer)
    }
  }, [expandedExerciseId])

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
    <div className="space-y-1.5 md:space-y-2 flex flex-col w-full">
      {exercises.map((exercise) => {
        const completed = completedExerciseNames.has(exercise.name)
        const isExpanded = expandedExerciseId === exercise.id

        return (
          <div
            key={exercise.id}
            id={`exercise-${exercise.id}`}
            className={cn(
              "rounded-xl transition-all duration-200 border h-fit",
              isExpanded
                ? "scale-[1.002]"
                : completed
                  ? "opacity-40 hover:opacity-85 hover:!border-[var(--day-color-glow-hover)] hover:!bg-[var(--day-bg-glow-hover)]"
                  : "hover:!border-[var(--day-color-glow-hover)] hover:!bg-[var(--day-bg-glow-hover)]",
            )}
            style={{
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              '--day-color-glow': completed
                ? `rgba(255, 255, 255, 0.03)`
                : `rgba(255, 255, 255, 0.05)`,
              '--day-color-glow-hover': completed
                ? `rgba(255, 255, 255, 0.06)`
                : `color-mix(in srgb, ${dayColor} 15%, rgba(255, 255, 255, 0.06))`,
              '--day-color-glow-active': `color-mix(in srgb, ${dayColor} 30%, rgba(255, 255, 255, 0.1))`,
              '--day-bg-glow': `transparent`,
              '--day-bg-glow-hover': completed
                ? `rgba(255, 255, 255, 0.01)`
                : `rgba(255, 255, 255, 0.015)`,
              '--day-bg-glow-active': `rgba(255, 255, 255, 0.02)`,
              borderColor: isExpanded ? 'var(--day-color-glow-active)' : 'var(--day-color-glow)',
              backgroundColor: isExpanded ? 'var(--day-bg-glow-active)' : 'var(--day-bg-glow)',
            } as React.CSSProperties}
          >
            <div
              className={cn(
                "relative py-4 px-4 md:py-3.5 md:px-3.5 flex items-center gap-4 cursor-pointer select-none",
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
                    "text-[0.9375rem] md:text-sm font-semibold block leading-tight cursor-pointer tracking-tight",
                    "text-foreground",
                    isExpanded ? "whitespace-normal" : "truncate",
                    completed && "exercise-label-checked opacity-40 font-medium"
                  )}
                  title={exercise.name}
                >
                  {exercise.name}
                </Label>
                {exercise.description && (
                  <p className={cn(
                    "text-[0.75rem] text-muted-foreground/70 mt-1 tracking-normal font-medium",
                    isExpanded ? "whitespace-normal" : "truncate"
                  )} title={exercise.description}>
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
                <div className="px-4 pb-4 pt-2 border-t border-white/[0.05]">
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

      {/* Dynamic Spacer to ensure last item can be scrolled to center - Mobile only */}
      <div
        className="md:hidden transition-all duration-300 ease-in-out"
        style={{ height: expandedExerciseId ? '45vh' : '0px' }}
        aria-hidden="true"
      />
    </div >
  )
}
