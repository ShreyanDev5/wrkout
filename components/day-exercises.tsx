"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { Exercise, WorkoutLog } from "@/lib/types"
import { WorkoutLogModal } from "@/components/workout-log-modal"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { AnimatedCheckbox } from "@/components/ui/animated-checkbox"

interface DayExercisesProps {
  exercises: Exercise[]
  dayId: string
  workoutId: string
  onLogWorkout: (log: WorkoutLog) => void | Promise<void>
  onExerciseToggled?: () => void
  dayColor: string
}

function getTickStorageKey(dayId: string) {
  return `tickedExercises-${dayId}`
}

export function DayExercises({ exercises, dayId, workoutId, onLogWorkout, onExerciseToggled, dayColor }: DayExercisesProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [ticked, setTicked] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(getTickStorageKey(dayId))
      return stored ? JSON.parse(stored) : []
    }
    return []
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(getTickStorageKey(dayId), JSON.stringify(ticked))
    }
  }, [ticked, dayId])

  const handleTick = (exerciseId: string, checked: boolean) => {
    setTicked((prev) => {
      const newTicked = checked 
        ? [...prev, exerciseId]
        : prev.filter((id) => id !== exerciseId)
      
      // Notify parent component after state update
      setTimeout(() => {
        onExerciseToggled?.()
      }, 0)
      
      return newTicked
    })
  }

  const handleOpenLogging = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleLogWorkout = (log: WorkoutLog) => {
    onLogWorkout(log)
    setIsModalOpen(false)
  }

  const handleCheckboxToggle = (exerciseId: string) => {
    const isCurrentlyTicked = ticked.includes(exerciseId)
    const newState = !isCurrentlyTicked
    
    // Play tick sound when checking (not unchecking)
    if (newState && (window as any).playTickSound) {
      ;(window as any).playTickSound()
    }
    
    // Trigger haptic feedback if supported
    if (newState && "vibrate" in navigator) {
      navigator.vibrate(5) // Very subtle vibration
    }
    
    handleTick(exerciseId, newState)
  }

  return (
    <div className="space-y-2">
      {exercises.map((exercise) => {
        const completed = ticked.includes(exercise.id)
        return (
          <div
            key={exercise.id}
            className={cn(
              "exercise-card relative py-2.5 px-4 rounded-xl border border-border/30 transition-all duration-200 flex items-center gap-3",
              completed && "exercise-item-checked"
            )}
          >
            <AnimatedCheckbox
              checked={completed}
              dayColor={dayColor}
              className="mr-2 flex-shrink-0"
              onClick={() => handleCheckboxToggle(exercise.id)}
              aria-label={completed ? `Completed ${exercise.name}` : `Mark ${exercise.name} as completed`}
            />
            <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
              <div className="min-w-0 flex-1">
                <Label
                  className={cn(
                    "text-sm font-medium truncate block leading-tight",
                    "text-foreground",
                    completed && "exercise-label-checked"
                  )}
                  title={exercise.name}
                >
                  {exercise.name}
                </Label>
                {exercise.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5" title={exercise.description}>
                    {exercise.description}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground focus-visible-ring flex-shrink-0 h-8 px-2.5"
              onClick={() => handleOpenLogging(exercise)}
              aria-label={`Log session for ${exercise.name}`}
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
              Log
            </Button>
          </div>
        )
      })}

      {exercises.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No exercises added for this day yet.</div>
      )}

      {selectedExercise && (
        <WorkoutLogModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          exercise={selectedExercise}
          workoutId={workoutId}
          dayId={dayId}
          workoutName="Current Workout"
          dayName={dayId.toUpperCase()}
          dayColor={dayColor}
          onSave={handleLogWorkout}
        />
      )}
    </div>
  )
}