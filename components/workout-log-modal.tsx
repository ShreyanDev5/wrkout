"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { NumberStepper } from "@/components/ui/number-stepper"
import { WeightSlider } from "@/components/ui/weight-slider"
import type { Exercise, WorkoutLog } from "@/lib/types"
import { useExerciseStore } from "@/lib/exercise-store"
import { ensureAudioContextRunning } from "@/lib/audio-utils"
import { v4 as uuidv4 } from 'uuid'

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
  const { getLastUsedValues, setLastUsedValues, getLastLog, setLastLog } = useExerciseStore()
  const lastValues = getLastUsedValues(exercise.id)
  const lastLog = getLastLog(exercise.id)

  const [weight, setWeight] = useState(lastValues.weight || 20)
  const [reps, setReps] = useState(lastValues.reps || 8)
  const [sets, setSets] = useState(lastValues.sets || 3)
  const [isSaving, setIsSaving] = useState(false)

  // If the modal is opened, reset to last used values
  useEffect(() => {
    if (isOpen) {
      setWeight(lastValues.weight || 20)
      setReps(lastValues.reps || 8)
      setSets(lastValues.sets || 3)
    }
  }, [isOpen, lastValues])

  // Ensure audio context is running when the modal opens
  useEffect(() => {
    if (isOpen) {
      ensureAudioContextRunning().catch(() => {})
    }
  }, [isOpen])

  const handleSave = () => {
    if (isSaving) return
    if (weight <= 0 || reps <= 0) {
      setIsSaving(false)
      return
    }
    setIsSaving(true)
    setLastUsedValues(exercise.id, { weight, reps, sets })
    const log: WorkoutLog = {
      id: uuidv4(),
      user_id: "",
      workout_id: workoutId,
      workout_day_id: null,
      exercise_name: exercise.name,
      weight,
      avg_reps: reps,
      performed_at: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setLastLog(exercise.id, log)
    onSave(log)
    setIsSaving(false)
  }

  const handleRecallLastLog = () => {
    if (lastLog) {
      setWeight(lastLog.weight)
      setReps(lastLog.avg_reps)
      // Optionally set sets if you store it in the log
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm mobile-narrow-modal dark:bg-background dark:border-opacity-10 rounded-lg mx-auto [background:hsl(var(--background))] [border:1px_solid_hsl(var(--border))] [box-shadow:none] [backdrop-filter:none]">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="flex items-center gap-1.5 sm:gap-2 text-white text-base sm:text-lg">
            <span
              className="inline-block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
              style={{ backgroundColor: dayColor }}
              aria-hidden="true"
            ></span>
            Log: {exercise.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 sm:space-y-6 py-3 sm:py-4">
          <div className="w-full space-y-3 sm:space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-medium text-white text-center">Weight (kg)</h3>
              <WeightSlider
                value={weight}
                onChange={setWeight}
                min={0}
                max={250}
                step={2.5}
                className="w-full text-white"
                accentColor={dayColor}
              />
            </div>

            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-medium text-white text-center">Reps</h3>
              <NumberStepper 
                value={reps} 
                onChange={setReps} 
                min={0} 
                max={30} 
                accentColor={dayColor}
                className="hover:scale-[1.02] transition-transform duration-200 text-white w-full"
              />
            </div>
          </div>

          {lastLog && (
            <div
              className="w-full flex flex-col items-center"
              style={{ marginTop: 32 }}
            >
              <span className="text-xs text-muted-foreground mb-1">Last log: {lastLog.weight} kg × {lastLog.avg_reps} reps</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRecallLastLog}
                className="w-full h-8 px-2 text-xs"
                aria-label="Recall last log values"
              >
                Use Last Log
              </Button>
              <style>{`
                @media (min-width: 640px) {
                  .workout-log-modal-lastlog { margin-top: 48px !important; }
                }
              `}</style>
            </div>
          )}
        </div>

        <DialogFooter className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-[#1a1a1a]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full h-9 sm:h-10 px-3 sm:px-4 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 border-[#1a1a1a] bg-[#1a1a1a] text-white hover:bg-[#1a1a1a]/80 transition-colors duration-200 text-xs sm:text-sm"
            aria-label="Cancel logging session"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            style={{ backgroundColor: dayColor, color: '#fff' }}
            className="w-full h-9 sm:h-10 px-3 sm:px-4 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 border-none shadow-none hover:brightness-110 transition-all duration-200 text-xs sm:text-sm"
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
