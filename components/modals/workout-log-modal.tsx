"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { NumberStepper } from "@/components/ui/number-stepper"
import { WeightStepper } from "@/components/ui/weight-stepper"
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
  const [isSaving, setIsSaving] = useState(false)

  // If the modal is opened, reset to last used values
  useEffect(() => {
    if (isOpen) {
      setWeight(lastValues.weight || 20)
      setReps(lastValues.reps || 8)
    }
  }, [isOpen, lastValues])

  // Ensure audio context is running when the modal opens
  useEffect(() => {
    if (isOpen) {
      ensureAudioContextRunning().catch(() => { })
    }
  }, [isOpen])

  const handleSave = () => {
    if (isSaving) return
    if (weight <= 0 || reps <= 0) {
      setIsSaving(false)
      return
    }
    setIsSaving(true)
    setLastUsedValues(exercise.id, { weight, reps, sets: 1 })
    const log: WorkoutLog = {
      id: uuidv4(),
      user_id: "",
      workout_id: workoutId,
      workout_day_id: null,
      exercise_name: exercise.name,
      weight,
      reps: reps,
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
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-full max-w-sm sm:max-w-md mobile-narrow-modal dark:bg-background/90 dark:border-opacity-10 rounded-2xl mx-auto border-none shadow-2xl backdrop-blur-xl overflow-hidden"
        hideCloseButton={true}
      >
        {/* Header with gradient background */}
        <div
          className="relative pt-5 pb-6 px-6 rounded-t-2xl"
          style={{
            background: `linear-gradient(135deg, ${dayColor}20 0%, ${dayColor}10 100%)`,
            borderBottom: `1px solid ${dayColor}20`
          }}
        >
          <DialogHeader className="items-center">
            <DialogTitle className="flex flex-col items-center gap-2.5 text-white">
              <div className="flex items-center justify-center w-11 h-11 rounded-full bg-background/30 backdrop-blur-sm border border-white/10">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: dayColor }}
                  aria-hidden="true"
                ></span>
              </div>
              <span className="font-semibold text-lg">{exercise.name}</span>
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Main content */}
        <div className="flex flex-col items-center py-5 px-5">
          <div className="w-full space-y-6">
            {/* Weight Section */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-white/80">Weight</h3>
              </div>
              <WeightStepper
                value={weight}
                onChange={setWeight}
                min={0}
                max={250}
                step={2.5}
                className="w-full"
                dayColor={dayColor}
              />
            </div>

            {/* Reps Section */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-white/80">Reps</h3>
              </div>
              <NumberStepper
                value={reps}
                onChange={setReps}
                min={0}
                max={30}
                className="w-full"
                dayColor={dayColor}
              />
            </div>

            {/* Last Log Section */}
            {lastLog && (
              <div className="mt-3 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs text-muted-foreground">Last log</span>
                  <span className="text-xs font-medium text-white" style={{ color: dayColor }}>
                    {lastLog.weight} kg × {lastLog.avg_reps} reps
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRecallLastLog}
                  className="w-full h-10 px-4 text-xs font-medium rounded-lg bg-background/50 border-white/10 hover:bg-white/5 transition-all duration-200"
                >
                  Use Last Log
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 px-5 pb-5 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-12 rounded-xl font-medium border-white/10 bg-background/50 hover:bg-white/5 text-white transition-all duration-200"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            style={{ backgroundColor: dayColor }}
            className="h-12 rounded-xl font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:brightness-110"
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                Saving...
              </span>
            ) : (
              "Save Log"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
