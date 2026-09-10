"use client"

import { useMemo } from "react"
import type { WorkoutLog, WorkoutDay } from "@/lib/types"
import { formatDate, getLocalDateYYYYMMDD } from "@/lib/utils"
import { buildExerciseVolumeTrendMap, createExerciseTrendKey, calculateWorkoutVolume, type VolumeTrend } from "@/lib/progress-data-utils"
import { motion } from "framer-motion"
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react"

function renderTrendBadge(trend: VolumeTrend) {
  switch (trend) {
    case "up":
      return (
        <span 
          className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 select-none"
          title="Higher weight or reps vs previous session"
          aria-label="Higher weight or reps"
        >
          <ArrowUpRight className="h-3 w-3" strokeWidth={2.25} />
        </span>
      )
    case "down":
      return (
        <span 
          className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400 select-none"
          title="Lower weight or reps vs previous session"
          aria-label="Lower weight or reps"
        >
          <ArrowDownRight className="h-3 w-3" strokeWidth={2.25} />
        </span>
      )
    case "same":
    case "new":
    default:
      return null
  }
}

interface ProgressScreenProps {
  logs: WorkoutLog[]
  workoutDays?: WorkoutDay[]
}

export function ProgressScreen({ logs, workoutDays }: ProgressScreenProps) {
  const today = getLocalDateYYYYMMDD()

  // Process logs for TODAY ONLY
  const todayLogs = useMemo(() => {
    if (!logs || logs.length === 0) return []
    return logs
      .filter(log => log.performed_at === today)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
  }, [logs, today])

  const volumeTrendMap = useMemo(() => buildExerciseVolumeTrendMap(logs, today), [logs, today])

  // Group logs by exercise to show aggregated stats if multiple sets are logged
  const groupedLogs = useMemo(() => {
    const groups: Map<string, WorkoutLog[]> = new Map()
    for (const log of todayLogs) {
      const key = createExerciseTrendKey(log.exercise_id)

      if (!groups.has(key)) {
        groups.set(key, [])
      }

      groups.get(key)!.push(log)
    }

    return Array.from(groups.entries())
  }, [todayLogs])

  // Compute overall summary stats for today's workout
  const sessionSummary = useMemo(() => {
    if (!groupedLogs || groupedLogs.length === 0) return null
    let totalSets = 0
    let totalVolume = 0

    for (const [, exerciseLogs] of groupedLogs) {
      const latestLog = exerciseLogs[exerciseLogs.length - 1]
      const sets = latestLog.sets ?? exerciseLogs.length
      const weight = latestLog.weight ?? 0
      const reps = latestLog.avg_reps ?? 0
      totalSets += sets
      totalVolume += calculateWorkoutVolume(weight, reps, sets, latestLog.exercise_name)
    }

    return {
      exerciseCount: groupedLogs.length,
      totalSets,
      totalVolume,
    }
  }, [groupedLogs])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
  }

  return (
    <div className="w-full max-w-[410px] mx-auto pb-24 px-3 sm:px-4 animate-in fade-in duration-500" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Header - Progress */}
      <div className="flex flex-col mb-5 pt-2 sm:pt-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Progress
        </h1>
        <p className="text-xs text-zinc-400 font-medium mt-1">
          {formatDate(new Date().toISOString())}
        </p>
      </div>

      {/* Session Summary Pulse Strip */}
      {sessionSummary && (
        <div className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800/90 mb-4 text-xs select-none shadow-sm whitespace-nowrap overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="font-bold text-white tracking-tight">{sessionSummary.exerciseCount}</span>
            <span className="text-zinc-400 font-medium">{sessionSummary.exerciseCount === 1 ? "Exercise" : "Exercises"}</span>
          </div>
          <span className="text-zinc-600 font-bold flex-shrink-0">•</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="font-bold text-white tracking-tight">{sessionSummary.totalSets}</span>
            <span className="text-zinc-400 font-medium">Sets</span>
          </div>
          {sessionSummary.totalVolume > 0 && (
            <>
              <span className="text-zinc-600 font-bold flex-shrink-0">•</span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="font-bold text-white tracking-tight">{sessionSummary.totalVolume.toLocaleString()}</span>
                <span className="text-zinc-400 font-medium">kg Volume</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Detailed Session Breakdown */}
      <motion.div
        className="space-y-2.5"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {groupedLogs.length > 0 ? (
          groupedLogs.map(([groupKey, exerciseLogs]) => {
            const latestLog = exerciseLogs[exerciseLogs.length - 1]
            const exerciseName = latestLog.exercise_name
            const sets = latestLog.sets ?? exerciseLogs.length
            const weight = latestLog.weight
            const reps = latestLog.avg_reps
            const trend = volumeTrendMap.get(groupKey)?.trend ?? "new"

            return (
              <motion.div
                key={groupKey}
                variants={itemVariants}
                className="group"
              >
                <div className="relative rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-sm transition-all duration-200">
                  <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 space-y-2">
                    {/* Exercise Header */}
                    <div className="flex items-center justify-between gap-3 px-0.5 min-h-5">
                      <h3 className="text-sm sm:text-base font-bold text-zinc-100 leading-none tracking-tight truncate flex-1 min-w-0" title={exerciseName}>
                        {exerciseName}
                      </h3>

                      {renderTrendBadge(trend) ? (
                        <div className="flex-shrink-0">
                          {renderTrendBadge(trend)}
                        </div>
                      ) : (
                        <div className="w-5 h-5 flex-shrink-0 opacity-0 pointer-events-none" aria-hidden="true" />
                      )}
                    </div>

                    {/* Clean 3-Column Stats Row */}
                    <div className="grid grid-cols-3 pt-2 border-t border-zinc-800/70">
                      {/* Weight */}
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[11px] font-medium text-zinc-400">Weight</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-base font-bold text-white tracking-tight">{weight}</span>
                          <span className="text-xs font-medium text-zinc-400">kg</span>
                        </div>
                      </div>

                      {/* Reps */}
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[11px] font-medium text-zinc-400">Reps</span>
                        <span className="text-base font-bold text-white tracking-tight mt-0.5">{reps}</span>
                      </div>

                      {/* Sets */}
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[11px] font-medium text-zinc-400">Sets</span>
                        <span className="text-base font-bold text-white tracking-tight mt-0.5">{sets}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md">
            <div className="w-12 h-12 rounded-2xl border border-zinc-800 bg-zinc-900 flex items-center justify-center mb-3.5 shadow-sm text-zinc-300">
              <TrendingUp className="h-5 w-5 text-zinc-400" />
            </div>
            <h3 className="text-base font-bold text-zinc-100 mb-1 tracking-tight">No Activity Today</h3>
            <p className="text-zinc-400 text-xs max-w-xs leading-snug font-medium">
              Log an exercise today to track your progress.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
