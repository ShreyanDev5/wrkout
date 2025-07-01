"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { NumberStepper } from "@/components/ui/number-stepper"
import { WeightSlider } from "@/components/ui/weight-slider"
import type { Exercise, WorkoutLog } from "@/lib/types"
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
  onSave: (log: WorkoutLog) => void
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

    const log: WorkoutLog = {
      id: `log-${Date.now()}`,
      user_id: "temp-user", // Replace with real user id in production
      workout_id: workoutId,
      exercise_name: exercise.name,
      weight,
      avg_reps: reps,
      performed_at: new Date().toISOString().split("T")[0],
    }

    // Save the log
    onSave(log)

    // Reset saving state
    setIsSaving(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[425px] bg-[#0f0f0f] border-[#1a1a1a] rounded-xl shadow-2xl px-4 sm:px-6 text-white">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-white">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: dayColor }}
              aria-hidden="true"
            ></span>
            Log: {exercise.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-4">
          <WeightSlider
            value={weight}
            onChange={setWeight}
            min={0}
            max={500}
            step={2.5}
            label="Weight"
            className="mb-8 text-white"
            accentColor={dayColor}
          />

          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-medium text-white mb-3">Reps</h3>
              <NumberStepper 
                value={reps} 
                onChange={setReps} 
                min={0} 
                max={30} 
                accentColor={dayColor}
                className="hover:scale-[1.02] transition-transform duration-200 text-white"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-[#1a1a1a]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full h-11 px-8 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 border-[#1a1a1a] bg-[#1a1a1a] text-white hover:bg-[#1a1a1a]/80 transition-colors duration-200 sm:justify-self-start"
            aria-label="Cancel logging session"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            style={{ backgroundColor: dayColor, color: '#fff' }}
            className="w-full h-11 px-8 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 border-none shadow-none hover:brightness-110 transition-all duration-200 sm:justify-self-end"
            aria-label="Save workout log"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
