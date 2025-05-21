"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { NumberStepper } from "@/components/ui/number-stepper"
import { WeightSlider } from "@/components/ui/weight-slider"
import type { Exercise, WorkoutSession } from "@/lib/types"
import { useExerciseStore } from "@/lib/exercise-store"
import { ensureAudioContextRunning } from "@/lib/audio-utils"

interface WorkoutLogModalProps {
  isOpen: boolean
  onClose: () => void
  exercise: Exercise
  workoutId: string
  dayId: string
  workoutName: string
  dayName: string
  dayColor: string
  onSave: (session: WorkoutSession) => void
}

export function WorkoutLogModal({
  isOpen,
  onClose,
  exercise,
  workoutId,
  dayId,
  workoutName,
  dayName,
  dayColor,
  onSave,
}: WorkoutLogModalProps) {
  const { getLastUsedValues, setLastUsedValues } = useExerciseStore()
  const lastValues = getLastUsedValues(exercise.id)

  const [weight, setWeight] = useState(lastValues.weight || 20)
  const [reps, setReps] = useState(lastValues.reps || 8)
  const [sets, setSets] = useState(lastValues.sets || 3)
  const [isSaving, setIsSaving] = useState(false)

  // Ensure audio context is running when the modal opens
  useEffect(() => {
    if (isOpen) {
      ensureAudioContextRunning().catch(() => {})
    }
  }, [isOpen])

  const handleSave = () => {
    if (isSaving) return
    setIsSaving(true)

    // Save the current values for this exercise
    setLastUsedValues(exercise.id, { weight, reps, sets })

    const session: WorkoutSession = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString(),
      workoutId,
      workoutName,
      dayId,
      dayName,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      weight,
      reps,
      sets,
    }

    // Save the session
    onSave(session)

    // Reset saving state
    setIsSaving(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] dark:bg-background dark:border-opacity-10 rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: dayColor }}
              aria-hidden="true"
            ></span>
            Log: {exercise.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <WeightSlider
            value={weight}
            onChange={setWeight}
            min={0}
            max={500}
            step={2.5}
            label="Weight"
            className="mb-6"
            accentColor={dayColor}
          />

          <div className="grid grid-cols-2 gap-8">
            <NumberStepper value={reps} onChange={setReps} min={0} max={30} label="Reps" accentColor={dayColor} />
            <NumberStepper value={sets} onChange={setSets} min={0} max={10} label="Sets" accentColor={dayColor} />
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 focus-visible-ring dark:border-opacity-10 dark:hover:bg-secondary"
            aria-label="Cancel logging session"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            style={{ backgroundColor: dayColor }}
            className="h-10 focus-visible-ring dark:border-none dark:shadow-none"
            aria-label="Save workout session"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
