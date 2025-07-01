"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { Exercise, WorkoutLog } from "@/lib/types"
import { WorkoutLogModal } from "@/components/workout-log-modal"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

interface DayExercisesProps {
  exercises: Exercise[]
  dayId: string
  onLogWorkout: (log: WorkoutLog) => void | Promise<void>
  dayColor: string
}

export function DayExercises({ exercises, dayId, onLogWorkout, dayColor }: DayExercisesProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  return (
    <div className="space-y-2">
      {exercises.map((exercise) => (
        <div
          key={exercise.id}
          className={cn(
            "exercise-card relative py-3 px-4 rounded-xl border border-border/30 transition-all duration-200",
            "bg-transparent",
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
              <div className="min-w-0 flex-1">
                <Label
                  className={cn(
                    "text-sm font-medium cursor-pointer truncate block",
                    "text-foreground",
                  )}
                  title={exercise.name}
                >
                  {exercise.name}
                </Label>
                {exercise.description && (
                  <p className="text-xs text-muted-foreground truncate" title={exercise.description}>
                    {exercise.description}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground focus-visible-ring flex-shrink-0"
              onClick={() => handleOpenLogging(exercise)}
              aria-label={`Log session for ${exercise.name}`}
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
              Log
            </Button>
          </div>
        </div>
      ))}

      {exercises.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No exercises added for this day yet.</div>
      )}

      {selectedExercise && (
        <WorkoutLogModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          exercise={selectedExercise}
          workoutId="current-workout"
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
