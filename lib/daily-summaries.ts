import type { WorkoutLog } from './types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { calculateWorkoutVolume } from './progress-data-utils'

type SupabaseClientLike = SupabaseClient<Database>

/**
 * Daily Summary type matching the daily_summaries table in Supabase.
 * Used for performance optimization of the progress screen.
 */
export interface DailySummary {
    id: string
    user_id: string | null
    date: string
    workout_name: string | null
    total_exercises: number
    completed_exercises: number
    summary_stats: SummaryStats
    created_at: string
}

interface SummaryStats {
    workoutType?: string  // 'push', 'pull', 'leg', 'mixed'
    totalWeight?: number  // Sum of all weights lifted
    totalReps?: number    // Sum of all reps performed
    exerciseNames?: string[]  // List of exercises completed
}

/**
 * Load recent daily summaries for a user (last 7 days).
 * This is optimized for the progress screen - much faster than loading all logs.
 */
export async function loadRecentSummaries(
    supabase: SupabaseClientLike,
    userId: string,
    limit: number = 7
): Promise<DailySummary[]> {
    const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error loading daily summaries:', error)
        return []
    }

    return data || []
}

/**
 * Upsert a daily summary for a specific date.
 * Called after workout session completion.
 */
export async function saveDailySummary(
    supabase: SupabaseClientLike,
    summary: Omit<DailySummary, 'id' | 'created_at'>
): Promise<void> {
    const { error } = await supabase
        .from('daily_summaries')
        .upsert(
            {
                user_id: summary.user_id,
                date: summary.date,
                workout_name: summary.workout_name,
                total_exercises: summary.total_exercises,
                completed_exercises: summary.completed_exercises,
                summary_stats: summary.summary_stats,
            },
            { onConflict: 'user_id,date' }
        )

    if (error) {
        console.error('Error saving daily summary:', error)
    }
}

/**
 * Calculate and save a daily summary based on today's workout logs.
 * Call this after completing a workout session.
 */
export async function updateDailySummaryFromLogs(
    supabase: SupabaseClientLike,
    userId: string,
    logs: WorkoutLog[],
    workoutName?: string
): Promise<void> {
    const today = new Date().toISOString().split('T')[0]
    const todayLogs = logs.filter(log => log.performed_at === today)

    if (todayLogs.length === 0) return

    // Determine workout type based on exercise names
    const workoutType = determineWorkoutType(todayLogs)

    // Calculate summary stats
    const summaryStats: SummaryStats = {
        workoutType,
        totalWeight: todayLogs.reduce((sum, log) => {
            const volume = typeof log.volume === 'number'
                ? log.volume
                : calculateWorkoutVolume(log.weight, log.avg_reps, log.sets)

            return sum + volume
        }, 0),
        totalReps: todayLogs.reduce((sum, log) => sum + (log.avg_reps * log.sets), 0),
        exerciseNames: [...new Set(todayLogs.map(log => log.exercise_name))],
    }

    await saveDailySummary(supabase, {
        user_id: userId,
        date: today,
        workout_name: workoutName || `${workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} Day`,
        total_exercises: summaryStats.exerciseNames?.length || 0,
        completed_exercises: summaryStats.exerciseNames?.length || 0,
        summary_stats: summaryStats,
    })
}

/**
 * Determine workout type based on exercise names.
 * Uses common exercise naming patterns.
 */
function determineWorkoutType(logs: WorkoutLog[]): string {
    const pushKeywords = ['bench', 'press', 'push', 'chest', 'shoulder', 'tricep', 'dip']
    const pullKeywords = ['pull', 'row', 'lat', 'back', 'bicep', 'curl', 'deadlift']
    const legKeywords = ['squat', 'leg', 'lunge', 'calf', 'hamstring', 'quad', 'glute']

    const exerciseNames = logs.map(log => log.exercise_name.toLowerCase())

    let pushCount = 0
    let pullCount = 0
    let legCount = 0

    for (const name of exerciseNames) {
        if (pushKeywords.some(kw => name.includes(kw))) pushCount++
        if (pullKeywords.some(kw => name.includes(kw))) pullCount++
        if (legKeywords.some(kw => name.includes(kw))) legCount++
    }

    const max = Math.max(pushCount, pullCount, legCount)
    if (max === 0) return 'mixed'
    if (pushCount === max) return 'push'
    if (pullCount === max) return 'pull'
    if (legCount === max) return 'leg'
    return 'mixed'
}

/**
 * Check if daily summaries exist for optimized loading.
 * Returns true if summaries can be used, false if fallback to logs is needed.
 */
export async function hasDailySummaries(
    supabase: SupabaseClientLike,
    userId: string
): Promise<boolean> {
    const { count, error } = await supabase
        .from('daily_summaries')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)

    if (error) return false
    return (count || 0) > 0
}
