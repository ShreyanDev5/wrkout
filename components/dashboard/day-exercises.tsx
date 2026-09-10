"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { Exercise, WorkoutLog } from "@/lib/types"
import { ChevronDown, Dumbbell } from "lucide-react"
import { AnimatedCheckbox } from "@/components/ui/animated-checkbox"
import { InlineWorkoutLogger } from "@/components/dashboard/inline-workout-logger"
import { motion, AnimatePresence } from "framer-motion"
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
    <div className="w-full">
      {exercises.length > 0 ? (
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/70 backdrop-blur-xl overflow-hidden shadow-sm divide-y divide-zinc-800/60">
          {exercises.map((exercise) => {
            const completed = completedExerciseNames.has(exercise.name)
            const isExpanded = expandedExerciseId === exercise.id

            return (
              <div
                key={exercise.id}
                id={`exercise-${exercise.id}`}
                className={cn(
                  "transition-colors duration-150 overflow-hidden",
                  isExpanded
                    ? "bg-black/25"
                    : completed
                      ? "bg-black/15 hover:bg-black/25"
                      : "hover:bg-white/[0.02]"
                )}
              >
                <div
                  className="relative py-3.5 px-4 flex items-center gap-3.5 cursor-pointer select-none"
                  onClick={() => handleToggleExpand(exercise.id)}
                >
                  <div onClick={(e) => e.stopPropagation()}>
                    <AnimatedCheckbox
                      checked={completed}
                      dayColor={dayColor}
                      className="mr-0.5 flex-shrink-0"
                      onClick={() => handleCheckboxToggle(exercise)}
                      aria-label={completed ? `Completed ${exercise.name}` : `Mark ${exercise.name} as completed`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Label
                      className={cn(
                        "text-sm font-semibold block leading-tight cursor-pointer tracking-tight",
                        isExpanded ? "text-white font-bold whitespace-normal" : "text-zinc-200 truncate",
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

                  <div className="flex-shrink-0 text-zinc-500 pl-1">
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isExpanded ? "text-zinc-300 rotate-180" : "text-zinc-500"
                      )}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Inline Logger - Smooth Motion Collapse */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                      className="overflow-hidden border-t border-zinc-800/50"
                    >
                      <div className="px-4 pb-4 pt-2">
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md select-none">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3.5 border shadow-sm"
            style={{
              backgroundColor: dayColor ? `color-mix(in srgb, ${dayColor} 16%, #18181b)` : '#18181b',
              borderColor: dayColor ? `color-mix(in srgb, ${dayColor} 30%, #27272a)` : '#27272a',
              color: dayColor || '#a1a1aa'
            }}
          >
            <Dumbbell className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <h3 className="text-base font-bold text-zinc-100 mb-1 tracking-tight">No exercises for this day</h3>
          <p className="text-zinc-400 text-xs max-w-xs leading-relaxed font-medium">Add exercises in Settings to get started.</p>
        </div>
      )}

      {/* Dynamic Spacer - Synchronized smooth collapse */}
      <motion.div
        initial={false}
        animate={{ height: expandedExerciseId ? '40vh' : 0 }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className="md:hidden overflow-hidden"
        aria-hidden="true"
      />
    </div >
  )
}
