"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { WeightStepper } from "@/components/ui/weight-stepper"
import { NumberStepper } from "@/components/ui/number-stepper"
import type { Exercise, WorkoutLog } from "@/lib/types"
import { useExerciseStore } from "@/lib/exercise-store"
import { v4 as uuidv4 } from 'uuid'
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, RefreshCw, TrendingUp, ArrowUp } from "lucide-react"
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

    // List of common bodyweight exercises that should default to 0kg (B.W.) if no history exists
    const isBodyweightExercise = useMemo(() => {
        const name = exercise.name.toLowerCase()
        const bwKeywords = [
            'pull up', 'chin up', 'dip', 'hanging leg raise', 'push up',
            'sit up', 'crunch', 'plank', 'muscle up', 'burpee',
            'lunge', 'squat', 'glute bridge', 'air squat', 'jump squat',
            'calf raise', 'step up', 'mountain climber', 'box jump', 'jumping jack',
            'hollow body', 'v-up', 'flutter kick', 'russian twist', 'superman',
            'inverted row', 'pistol squat', 'nordic', 'bicycle crunch', 'toes to bar'
        ]
        return bwKeywords.some(k => name.includes(k))
    }, [exercise.name])

    // Pre-fill weight, reps, sets from last session - RIR always defaults to 1 (neutral)
    const [weight, setWeight] = useState(lastValues.weight ?? (isBodyweightExercise ? 0 : 20))
    const [reps, setReps] = useState(lastValues.reps || 10)
    const [sets, setSets] = useState(lastValues.sets || 3)
    const [rir, setRir] = useState(1) // Deliberate entry: Default to neutral 1 each time
    const [isSaving, setIsSaving] = useState(false)

    // Smart guidance based on last log's RIR - with colors matching Progress screen
    const guidance = useMemo(() => {
        if (!lastLog || lastLog.rir === undefined || lastLog.rir === null) return null

        const lastRir = lastLog.rir
        if (lastRir === 0) {
            // RIR 0: At limit, repeat same weight/reps - Red accent
            return {
                type: 'repeat',
                text: 'Repeat',
                icon: RefreshCw,
                colorClass: 'text-red-500',
                bgClass: 'bg-red-500/10 border-red-500/20'
            }
        } else if (lastRir <= 2) {
            // RIR 1-2: Room for 1 more rep - Amber accent
            return {
                type: 'add-rep',
                text: 'Rep',
                icon: TrendingUp,
                colorClass: 'text-amber-500',
                bgClass: 'bg-amber-500/10 border-amber-500/20'
            }
        } else {
            // RIR 3+: Ready to increase weight - Emerald accent
            return {
                type: 'add-weight',
                text: 'Weight',
                icon: ArrowUp,
                colorClass: 'text-emerald-500',
                bgClass: 'bg-emerald-500/10 border-emerald-500/20'
            }
        }
    }, [lastLog])


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
        setLastUsedValues(exercise.id, { weight, reps, sets, rir: 1 }) // Reset to neutral 1 in storage

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
                    {/* Smart Guidance Indicator - Premium minimal with RIR colors */}
                    {guidance ? (
                        <div className={`flex items-center gap-2.5 h-11 px-4 rounded-full border mr-auto select-none ${guidance.bgClass}`}>
                            <guidance.icon className={`h-[18px] w-[18px] shrink-0 ${guidance.colorClass}`} strokeWidth={2.5} />
                            <span className={`text-sm font-semibold tracking-tight ${guidance.colorClass}`}>{guidance.text}</span>
                        </div>
                    ) : (
                        <div className="flex-1" /> // Unused spacer
                    )}

                    {/* Actions - Right Aligned & Symmetrical */}
                    <div className="flex items-center gap-2.5 flex-1 justify-end">
                        {/* Cancel Button - Matches Done button styling with neutral colors */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onCancel}
                            className="h-11 w-11 rounded-full bg-zinc-700/40 hover:bg-zinc-600/50 text-zinc-300 transition-colors shrink-0 border-none"
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        {/* Done Button */}
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

