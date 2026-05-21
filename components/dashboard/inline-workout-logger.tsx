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
            exercise_id: storeKey,
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
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.96 }}
            transition={{
                duration: 0.35,
                ease: [0.4, 0, 0.2, 1],
                opacity: { duration: 0.25 },
                scale: { duration: 0.3 },
                height: { duration: 0.35 }
            }}
            className="overflow-hidden origin-top"
        >
            <div className="pt-3 pb-5 px-1 space-y-4">
                {/* Top Row: Weight & Reps */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-4">
                    {/* Weight (Primary) */}
                    <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block text-center w-full">Weight (KG)</span>
                        <WeightStepper
                            value={weight}
                            onChange={setWeight}
                            min={0}
                            max={300}
                            className="w-full"
                            dayColor={dayColor}
                            size="large"
                        />
                    </div>

                    {/* Reps (Primary) */}
                    <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block text-center w-full">Reps</span>
                        <NumberStepper
                            value={reps}
                            onChange={setReps}
                            min={0}
                            max={100}
                            className="w-full"
                            dayColor={dayColor}
                            size="large"
                        />
                    </div>
                </div>

                {/* Bottom Row: Sets & Done Button */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-4 pt-1">
                    {/* Sets (Secondary) */}
                    <div className="flex flex-col justify-end space-y-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block text-center w-full">Sets</span>
                        <NumberStepper
                            value={sets}
                            onChange={setSets}
                            min={1}
                            max={20}
                            className="w-full"
                            dayColor={dayColor}
                            size="large"
                        />
                    </div>

                    {/* Done Button - Exactly matching stepper height for symmetry */}
                    <div className="flex flex-col justify-end">
                        <Button
                            onClick={handleSave}
                            style={{ backgroundColor: dayColor }}
                            className="h-[46px] w-full rounded-2xl text-white shadow-md brightness-[0.85] hover:brightness-100 active:scale-95 transition-all border-none"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <span className="h-5 w-5 rounded-full border-[3px] border-white/30 border-t-white animate-spin" />
                            ) : (
                                <div className="flex items-center justify-center gap-1.5">
                                    <Check className="h-5 w-5 stroke-[2.5]" />
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

