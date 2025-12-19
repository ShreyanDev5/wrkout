"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { WeightStepper } from "@/components/ui/weight-stepper"
import { NumberStepper } from "@/components/ui/number-stepper"
import type { Exercise, WorkoutLog } from "@/lib/types"
import { useExerciseStore } from "@/lib/exercise-store"
import { v4 as uuidv4 } from 'uuid'
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, RotateCcw } from "lucide-react"
import { ensureAudioContextRunning } from "@/lib/audio-utils"
import { useHaptics } from "@/hooks/use-haptics"
import { getLocalDateYYYYMMDD } from "@/lib/utils"

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
    const lastValues = getLastUsedValues(exercise.id)
    const lastLog = getLastLog(exercise.id)
    const { trigger: haptic } = useHaptics()

    // Default sets to 3 if not found
    const [weight, setWeight] = useState(lastValues.weight || 20)
    const [reps, setReps] = useState(lastValues.reps || 10)
    const [sets, setSets] = useState(lastValues.sets || 3)
    const [rir, setRir] = useState(2) // Deliberate entry: Default to neutral 2 each time
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
        haptic("success")
        // Play tick sound for satisfaction
        if ((window as any).playTickSound) {
            ; (window as any).playTickSound()
        }

        // Deliberate entry: DO NOT store RIR in lastUsedValues to prevent pre-filling
        setLastUsedValues(exercise.id, { weight, reps, sets, rir: 2 }) // Reset to neutral 2 in storage

        // Optimistic Save
        const log: WorkoutLog = {
            id: uuidv4(),
            user_id: "", // Filled by parent/API
            workout_id: workoutId,
            workout_day_id: null,
            exercise_name: exercise.name,
            weight,
            avg_reps: reps, // 'reps' UI state maps to 'avg_reps' in DB
            sets,
            rir,
            performed_at: getLocalDateYYYYMMDD(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        setLastLog(exercise.id, log)
        onSave(log)
        // Parent handles closing
    }

    const handleRecallLastLog = () => {
        if (lastLog) {
            setWeight(lastLog.weight)
            setReps(lastLog.avg_reps)
            // If last log has sets, use it, else keep current (likely 3)
            if (lastLog.sets) setSets(lastLog.sets)
            // Deliberate entry: DO NOT recall RIR from last sessions
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
        >
            <div className="pt-3 pb-5 px-1 space-y-5">
                {/* Controls Container - Responsive Grid */}
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

                    {/* Sets (Secondary) */}
                    <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block text-center w-full">Sets</span>
                        <NumberStepper
                            value={sets}
                            onChange={setSets}
                            min={1}
                            max={20}
                            className="w-full"
                            dayColor={dayColor}
                        />
                    </div>

                    {/* RIR (Secondary) */}
                    <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block text-center w-full">RIR</span>
                        <NumberStepper
                            value={rir}
                            onChange={setRir}
                            min={0}
                            max={5}
                            className="w-full"
                            dayColor={dayColor}
                        />
                    </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-3 pt-1">
                    {/* Last Log Recall Button - Left Aligned */}
                    {lastLog ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRecallLastLog}
                            className="h-11 px-4 text-xs text-muted-foreground hover:text-foreground hover:bg-zinc-800/50 rounded-xl w-auto max-w-[180px] sm:max-w-[220px] border border-zinc-800/50 mr-auto justify-start transition-all"
                        >
                            <RotateCcw className="h-3.5 w-3.5 mr-1.5 opacity-70 shrink-0" />
                            <span className="truncate">
                                Last: {lastLog.weight}kg · {lastLog.sets || 3}×{lastLog.avg_reps}
                            </span>
                        </Button>
                    ) : (
                        <div className="flex-1" /> // Unused spacer
                    )}

                    {/* Actions - Right Aligned & Symmetrical */}
                    <div className="flex items-center gap-2.5 flex-1 justify-end">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onCancel}
                            className="h-11 w-11 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        <Button
                            onClick={handleSave}
                            style={{ backgroundColor: dayColor }}
                            className="h-11 w-16 rounded-full text-white shadow-md hover:brightness-110 active:scale-95 transition-all shrink-0 border-none"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            ) : (
                                <Check className="h-6 w-6 stroke-[2.5]" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
