
import { useState, useRef, useMemo, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { triggerWorkoutCompletionConfetti } from "@/lib/confetti"
import type { Message } from "postcss" // Unused, can remove
import { getLocalDateYYYYMMDD } from "@/lib/utils"

// Types needed for logic
import type { WorkoutLog, WorkoutDay, Exercise } from "@/lib/types"

interface UseWorkoutLogicProps {
    workoutId: string
    dayId: string
    // Full list of logs for history checking
    logs: WorkoutLog[]
    // Current day's configuration
    workoutDays: WorkoutDay[]
}

export function useWorkoutLogic({ workoutId, dayId, logs, workoutDays }: UseWorkoutLogicProps) {
    const { toast } = useToast()
    const today = getLocalDateYYYYMMDD()

    // Refs for tracking completion state without re-renders
    const hasCelebratedRef = useRef(false)
    const previousProgressRef = useRef<number | null>(null)
    const isInitialMountRef = useRef(true)

    // Memoize completed logs for the current session
    const completedLogs = useMemo(() => {
        const logsMap = new Map<string, WorkoutLog>()

        // Find the specific day config to link logs correctly
        const currentDay = workoutDays.find(d => d.day_id === dayId && d.workout_id === workoutId)

        const todaysLogs = logs.filter(log =>
            log.workout_id === workoutId &&
            log.performed_at === today &&
            (currentDay ? log.workout_day_id === currentDay.id : true)
        )

        todaysLogs.forEach(log => {
            logsMap.set(log.exercise_name, log)
        })

        return logsMap
    }, [logs, workoutId, dayId, today, workoutDays])

    const completedExerciseNames = useMemo(() => new Set(completedLogs.keys()), [completedLogs])

    // Calculate Progress
    const activeProgress = useMemo(() => {
        const day = workoutDays.find(d => d.day_id === dayId && d.workout_id === workoutId)
        if (!day || !day.exercises?.length) return 0

        const total = day.exercises.length
        const completed = day.exercises.filter(ex => completedExerciseNames.has(ex.name)).length
        return Math.round((completed / total) * 100)
    }, [workoutDays, dayId, workoutId, completedExerciseNames])

    // Celebration Logic
    useEffect(() => {
        // Skip if no workout selected
        if (!workoutId) {
            previousProgressRef.current = activeProgress
            return
        }

        const celebrationKey = `confetti-celebrated-${workoutId}-${dayId}-${today}`
        let alreadyCelebrated = false
        try {
            alreadyCelebrated = localStorage.getItem(celebrationKey) === 'true'
        } catch (e) { }

        // Sync ref on mount
        if (alreadyCelebrated && !hasCelebratedRef.current) {
            hasCelebratedRef.current = true
        }

        const previousProgress = previousProgressRef.current
        const isGenuineCompletion = previousProgress !== null && previousProgress < 100 && activeProgress === 100
        const isInitialLoad = isInitialMountRef.current

        if (activeProgress === 100 && isGenuineCompletion && !isInitialLoad && !hasCelebratedRef.current && !alreadyCelebrated) {
            triggerWorkoutCompletionConfetti()
            hasCelebratedRef.current = true
            try { localStorage.setItem(celebrationKey, 'true') } catch (e) { }
        } else if (activeProgress < 100) {
            hasCelebratedRef.current = false
            try { localStorage.removeItem(celebrationKey) } catch (e) { }
        }

        previousProgressRef.current = activeProgress
        if (isInitialMountRef.current) {
            isInitialMountRef.current = false
        }
    }, [activeProgress, workoutId, dayId, today]) // Removed completedExerciseNames dependency as it is captured in activeProgress

    return {
        completedLogs,
        completedExerciseNames,
        activeProgress,
    }
}
