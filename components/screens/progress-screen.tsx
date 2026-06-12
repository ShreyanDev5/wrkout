"use client"

import { useMemo } from "react"
import type { WorkoutLog, WorkoutDay } from "@/lib/types"
import { getWorkoutDayColor, getExerciseWorkoutType, formatDate, getLocalDateYYYYMMDD, cn } from "@/lib/utils"
import { buildExerciseVolumeTrendMap, createExerciseTrendKey, type VolumeTrend } from "@/lib/progress-data-utils"
import { useTheme } from "@/components/theme-context"
import { motion } from "framer-motion"
import { ArrowDownRight, ArrowRight, ArrowUpRight, Dumbbell, Dot, TrendingUp } from "lucide-react"

const trendPillStyles: Record<VolumeTrend, { srLabel: string; className: string; Icon: typeof ArrowUpRight }> = {
  up: {
    srLabel: "Volume trend up",
    className: "text-emerald-300 border-emerald-400/20 bg-emerald-500/10",
    Icon: ArrowUpRight,
  },
  same: {
    srLabel: "Volume trend same",
    className: "text-zinc-300 border-zinc-500/20 bg-zinc-500/10",
    Icon: ArrowRight,
  },
  down: {
    srLabel: "Volume trend down",
    className: "text-rose-300 border-rose-400/20 bg-rose-500/10",
    Icon: ArrowDownRight,
  },
  new: {
    srLabel: "Volume trend new",
    className: "text-zinc-400 border-zinc-500/20 bg-zinc-500/10",
    Icon: Dot,
  },
}

interface ProgressScreenProps {
  logs: WorkoutLog[]
  workoutDays?: WorkoutDay[]
}

export function ProgressScreen({ logs, workoutDays }: ProgressScreenProps) {
  const { colorMode } = useTheme()
  const today = getLocalDateYYYYMMDD()

  // Process logs for TODAY ONLY
  const todayLogs = useMemo(() => {
    if (!logs || logs.length === 0) return []
    // Filter for today's logs and sort by creation time (Oldest -> Newest)
    // This ensures workouts appear in the strict order they were performed/logged
    return logs
      .filter(log => log.performed_at === today)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
  }, [logs, today])

  // Map workout_day_id to day_id (e.g., "UUID" -> "leg")
  const dayIdMap = useMemo(() => {
    const map = new Map<string, string>()
    if (workoutDays) {
      workoutDays.forEach(day => {
        if (day.id && day.day_id) {
          map.set(day.id, day.day_id.toLowerCase())
        }
      })
    }
    return map
  }, [workoutDays])

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  }

  return (
    <div className="w-full max-w-[540px] mx-auto pb-24 px-4 sm:px-6 animate-in fade-in duration-500" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Header - Today's Focus */}
      <div className="flex flex-col gap-1 mb-8 pt-4 sm:pt-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Today&apos;s Focus
        </h1>
        <p className="text-[10px] sm:text-[11px] font-bold tracking-widest text-muted-foreground/60 uppercase leading-none">
          {formatDate(new Date().toISOString())}
        </p>
      </div>

        {/* Detailed Session Breakdown */}
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {groupedLogs.length > 0 ? (
            groupedLogs.map(([groupKey, exerciseLogs]) => {
              const latestLog = exerciseLogs[exerciseLogs.length - 1]
              const exerciseName = latestLog.exercise_name
              const types = getExerciseWorkoutType(exerciseName)
              const dominantType = types[0] || 'mixed'

              // Detect the implicit day color from the session context
              // Use the latest log to determine context (usually all logs for one exercise are in one session)
              let effectiveDayType = dominantType // Fallback to keyword matching

              if (latestLog?.workout_day_id) {
                // If we have a robust DB link to the day, use it!
                const sessionDayType = dayIdMap.get(latestLog.workout_day_id)
                if (sessionDayType) {
                  effectiveDayType = sessionDayType
                }
              }

              const dayColor = getWorkoutDayColor(effectiveDayType, colorMode || 'dark')
              const sets = latestLog.sets ?? exerciseLogs.length
              const weight = latestLog.weight
              const reps = latestLog.avg_reps
              const trend = volumeTrendMap.get(groupKey)?.trend ?? "new"
              const trendPill = trendPillStyles[trend]

              return (
                <motion.div
                  key={groupKey}
                  variants={itemVariants}
                  className="group"
                >
                  <div
                    className="relative bg-zinc-900/30 backdrop-blur-md rounded-[18px] px-2.5 py-3.5 transition-all duration-300 overflow-hidden hover:bg-zinc-900/50 hover:!border-[var(--day-color)] hover:shadow-[0_4px_24px_-8px_var(--day-color)]"
                    style={{
                      '--day-color': dayColor,
                      border: `1px solid color-mix(in srgb, ${dayColor} 50%, transparent)`,
                      boxShadow: `0 0 0 1px color-mix(in srgb, ${dayColor} 30%, transparent)`
                    } as React.CSSProperties}
                  >

                    {/* Very faint background tint for premium feel */}
                    <div
                      className="absolute inset-0 opacity-[0.04] pointer-events-none"
                      style={{ backgroundColor: dayColor }}
                    />

                    <div className="flex flex-col gap-2.5 pl-2">
                      {/* Exercise Header - Compact */}

                      <div className="flex items-center justify-between gap-2 py-0.5">
                        <h3 className="text-base font-bold text-zinc-100 leading-none tracking-tight truncate">
                          {exerciseName}
                        </h3>

                        <span
                          className={cn(
                            "inline-flex h-5 w-5 items-center justify-center rounded-full border",
                            trendPill.className,
                          )}
                          aria-label={trendPill.srLabel}
                        >
                          <trendPill.Icon className="h-3 w-3" strokeWidth={2.25} />
                        </span>
                      </div>

                      {/* Integrated Metrics Grid - 3 Columns */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {/* Weight */}
                        <div className="bg-zinc-950/60 rounded-lg p-1.5 border border-zinc-800/50 flex flex-col items-center justify-center">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Weight</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-[15px] font-bold text-zinc-100">{weight}</span>
                            <span className="text-[9px] font-medium text-muted-foreground/50">kg</span>
                          </div>
                        </div>

                        {/* Reps */}
                        <div className="bg-zinc-950/60 rounded-lg p-1.5 border border-zinc-800/50 flex flex-col items-center justify-center">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Reps</span>
                          <span className="text-[15px] font-bold text-zinc-100">{reps}</span>
                        </div>

                        {/* Sets */}
                        <div className="bg-zinc-950/60 rounded-lg p-1.5 border border-zinc-800/50 flex flex-col items-center justify-center">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Sets</span>
                          <span className="text-[15px] font-bold text-zinc-100">{sets}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center select-none animate-in fade-in duration-500 rounded-[24px] bg-zinc-900/20 border border-zinc-800/40">
              <div className="w-12 h-12 rounded-full bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-center mb-4 shadow-lg">
                <TrendingUp className="h-5 w-5 text-zinc-400 opacity-60" />
              </div>
              <h3 className="text-sm font-bold text-zinc-200 mb-1">No Activity Today</h3>
              <p className="text-zinc-400 text-xs max-w-xs leading-relaxed">
                Log an exercise to start tracking your daily progress and trends.
              </p>
            </div>
          )}
        </motion.div>
    </div>
  )
}
