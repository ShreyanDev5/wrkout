"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { WeightStepper } from "@/components/ui/weight-stepper"
import { NumberStepper } from "@/components/ui/number-stepper"
import type { Exercise, WorkoutLog } from "@/lib/types"
import { useExerciseStore } from "@/lib/exercise-store"
import { v4 as uuidv4 } from 'uuid'
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"
import { ensureAudioContextRunning } from "@/lib/audio-utils"
import { useHaptics } from "@/hooks/use-haptics"
import { getLocalDateYYYYMMDD } from "@/lib/utils"
import { isBodyweightExerciseName } from "@/lib/bodyweight-utils"

interface InlineWorkoutLoggerProps {
    exercise: Exercise
    workoutId: string
    onSave: (log: WorkoutLog) => void
    onCancel: () => void
    dayColor: string
}

export function InlineWorkoutLogger({
    exercise,
    workoutId,
    onSave,
    onCancel,
    dayColor,
}: InlineWorkoutLoggerProps) {
    const { getLastUsedValues, setLastUsedValues, getLastLog, setLastLog } = useExerciseStore()
    const storeKey = exercise.id
    const lastValues = getLastUsedValues(storeKey)
    const lastLog = getLastLog(storeKey)
    const { trigger: haptic } = useHaptics()

    const isBodyweightExercise = useMemo(() => {
        return isBodyweightExerciseName(exercise.name)
    }, [exercise.name])

    const [weight, setWeight] = useState(lastValues.weight ?? (isBodyweightExercise ? 0 : 20))
    const [reps, setReps] = useState(lastValues.reps || 10)
    const [sets, setSets] = useState(lastValues.sets || 3)
    const [isSaving, setIsSaving] = useState(false)

    // Audio context init
    useEffect(() => {
        ensureAudioContextRunning().catch(() => { })
    }, [])

    const handleSave = () => {
        if (isSaving) return

        // Input validation: Prevent saving meaningless data
        // At least weight OR reps must have a meaningful value
        if (weight <= 0 && reps <= 0) {
            haptic("warning")
            // Silently cancel - user hasn't entered meaningful data
            onCancel()
            return
        }

        setIsSaving(true)
        haptic("medium")
        // Play tick sound for satisfaction
        window.playTickSound?.()

        // Store the actual logged values for the next session without any hidden background auto-increment logic
        // This ensures the system behaves reliably and naturally
        setLastUsedValues(storeKey, { weight, reps, sets })

        // Optimistic Save
        const log: WorkoutLog = {
            id: uuidv4(),
            user_id: "", // Filled by parent/API
            workout_id: workoutId,
            workout_day_id: null,
            exercise_id: exercise.exercise_id || exercise.id,
            exercise_name: exercise.name,
            weight,
            avg_reps: reps, // 'reps' UI state maps to 'avg_reps' in DB
            sets,
            performed_at: getLocalDateYYYYMMDD(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        setLastLog(storeKey, log)
        onSave(log)
        // Parent handles closing
    }

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
                duration: 0.22,
                ease: [0.16, 1, 0.3, 1],
                opacity: { duration: 0.15 },
                height: { duration: 0.22 }
            }}
            className="overflow-hidden"
        >
            <div className="pt-2 pb-4 px-1 space-y-3">
                {/* Top Row: Weight & Reps */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-3.5 sm:gap-3">
                    {/* Weight (Primary) */}
                    <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block text-center w-full">Weight (KG)</span>
                        <WeightStepper
                            value={weight}
                            onChange={setWeight}
                            min={0}
                            max={300}
                            className="w-full"
                            dayColor={dayColor}
                            size="default"
                        />
                    </div>

                    {/* Reps (Primary) */}
                    <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block text-center w-full">Reps</span>
                        <NumberStepper
                            value={reps}
                            onChange={setReps}
                            min={0}
                            max={100}
                            className="w-full"
                            dayColor={dayColor}
                            size="default"
                        />
                    </div>
                </div>

                {/* Bottom Row: Sets & Done Button */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-3.5 sm:gap-3 pt-0.5">
                    {/* Sets (Secondary) */}
                    <div className="flex flex-col justify-end space-y-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block text-center w-full">Sets</span>
                        <NumberStepper
                            value={sets}
                            onChange={setSets}
                            min={1}
                            max={20}
                            className="w-full"
                            dayColor={dayColor}
                            size="default"
                        />
                    </div>

                    {/* Done Button - Exactly matching stepper height for symmetry */}
                    <div className="flex flex-col justify-end">
                        <Button
                            onClick={handleSave}
                            style={{
                                backgroundColor: `color-mix(in srgb, ${dayColor} 10%, rgba(255, 255, 255, 0.02))`,
                                borderColor: `color-mix(in srgb, ${dayColor} 20%, rgba(255, 255, 255, 0.05))`,
                                color: dayColor
                            }}
                            className="h-[40px] w-full rounded-2xl border shadow-sm brightness-95 hover:brightness-100 active:scale-95 transition-all"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <span 
                                    className="h-5 w-5 rounded-full border-[3px] border-current/30 animate-spin" 
                                    style={{ borderTopColor: 'currentColor' }}
                                />
                            ) : (
                                <div className="flex items-center justify-center gap-1.5">
                                    <Check className="h-4.5 w-4.5 stroke-[2.5]" />
                                    <span className="font-bold text-sm tracking-wide">DONE</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

