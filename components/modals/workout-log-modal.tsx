"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
      exercise_id: exercise.exercise_id || exercise.id,
      exercise_name: exercise.name,
      weight,
      avg_reps: reps,
      sets: 1, // Default to 1 set for modal (matches DB default)
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
        className="w-[92%] max-w-[340px] overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/98 p-0 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl outline-none select-none mx-auto flex flex-col"
        hideCloseButton={true}
      >
        {/* Header with subtle color gradient background */}
        <div
          className="relative pt-6 pb-5 px-6 rounded-t-[24px] flex flex-col items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${dayColor}22 0%, ${dayColor}08 100%)`,
            borderBottom: `1px solid ${dayColor}18`
          }}
        >
          <DialogHeader className="items-center w-full">
            <DialogTitle className="flex flex-col items-center w-full">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 shadow-[0_6px_16px_rgba(0,0,0,0.18)] mb-3">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{ backgroundColor: dayColor, boxShadow: `0 0 10px ${dayColor}` }}
                  aria-hidden="true"
                ></span>
              </div>
              <span className="font-extrabold tracking-tight text-white text-center text-[1.15rem] leading-snug w-full px-2 truncate block">{exercise.name}</span>
            </DialogTitle>
          </DialogHeader>
          <span className="text-[9.5px] uppercase tracking-widest text-zinc-500 font-bold mt-1.5 block">
            {dayName} • {workoutName}
          </span>
        </div>

        {/* Main content */}
        <div className="flex flex-col items-center py-5 px-5 w-full">
          <div className="w-full space-y-5">
            <div className="grid grid-cols-2 gap-4 w-full">
              {/* Weight Section */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-center">Weight</h3>
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
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-center">Reps</h3>
                <NumberStepper
                  value={reps}
                  onChange={setReps}
                  min={0}
                  max={30}
                  className="w-full"
                  dayColor={dayColor}
                />
              </div>
            </div>

            {/* Last Log Section */}
            {lastLog && (
              <div className="w-full mt-1 pt-4 border-t border-white/5 flex flex-col">
                <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-[11px] font-semibold text-zinc-400">Previous Best Set</span>
                  <span className="text-[11.5px] font-extrabold text-white" style={{ color: dayColor }}>
                    {lastLog.weight} kg × {lastLog.avg_reps} reps
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRecallLastLog}
                  className="w-full h-10 rounded-full border border-white/8 bg-white/[0.02] hover:bg-white/[0.06] text-[12.5px] font-bold text-zinc-200 hover:text-white transition-all active:scale-95 shadow-sm"
                >
                  Replicate Previous Set
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-row gap-2.5 px-5 pb-5 pt-1 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-full border border-white/8 bg-white/[0.02] px-4 text-[13px] font-bold text-zinc-300 transition-all hover:bg-white/[0.06] hover:text-white active:scale-95 shadow-sm"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{ 
              backgroundColor: dayColor, 
              boxShadow: `0 4px 16px ${dayColor}33` 
            }}
            className="flex-1 h-11 rounded-full px-4 text-[13px] font-bold text-white transition-all active:scale-95 hover:brightness-110 border-none flex items-center justify-center"
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center gap-1.5 justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                Saving
              </span>
            ) : (
              "Log Set"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
