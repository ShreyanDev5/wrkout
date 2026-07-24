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
    className: "text-zinc-400 border-zinc-700/60 bg-zinc-900/80",
    Icon: ArrowUpRight,
  },
  same: {
    srLabel: "Volume trend same",
    className: "text-zinc-400 border-zinc-700/60 bg-zinc-900/80",
    Icon: ArrowRight,
  },
  down: {
    srLabel: "Volume trend down",
    className: "text-zinc-400 border-zinc-700/60 bg-zinc-900/80",
    Icon: ArrowDownRight,
  },
  new: {
    srLabel: "Volume trend new",
    className: "text-zinc-400 border-zinc-700/60 bg-zinc-900/80",
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
    <div className="w-full max-w-[480px] mx-auto pb-24 px-4 sm:px-6 animate-in fade-in duration-500" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Header - Progress */}
      <div className="flex flex-col gap-1 mb-6 pt-2 sm:pt-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Progress
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

            let effectiveDayType = dominantType
            if (latestLog?.workout_day_id) {
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
                  className="relative rounded-2xl p-3.5 sm:p-4 border transition-all duration-300 overflow-hidden backdrop-blur-md"
                  style={{
                    borderColor: `color-mix(in srgb, ${dayColor} 25%, #27272a)`,
                    backgroundColor: `color-mix(in srgb, ${dayColor} 6%, #18181b)`,
                  }}
                >
                  {/* Subtle Category Accent Ambient Tint */}
                  <div
                    className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{ backgroundColor: dayColor }}
                  />

                  <div className="relative z-10 flex flex-col gap-3">
                    {/* Exercise Header */}
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: dayColor }}
                        />
                        <h3 className="text-base font-bold text-zinc-100 leading-tight tracking-tight truncate" title={exerciseName}>
                          {exerciseName}
                        </h3>
                      </div>

                      <span
                        className={cn(
                          "inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border",
                          trendPill.className,
                        )}
                        aria-label={trendPill.srLabel}
                      >
                        <trendPill.Icon className="h-3 w-3 flex-shrink-0" strokeWidth={2.25} />
                      </span>
                    </div>

                    {/* Integrated Metrics Grid - 3 High-Contrast Elevated Dark Tiles on Colored Surface */}
                    <div className="grid grid-cols-3 gap-2">
                      {/* Weight */}
                      <div className="bg-zinc-950/85 rounded-xl p-2 sm:p-2.5 border border-zinc-800/90 flex flex-col items-center justify-center shadow-sm">
                        <span className="text-[11px] font-semibold text-zinc-400">Weight</span>
                        <div className="flex items-baseline gap-0.5 mt-0.5">
                          <span className="text-base font-bold text-white">{weight}</span>
                          <span className="text-[10px] font-medium text-zinc-400">kg</span>
                        </div>
                      </div>

                      {/* Reps */}
                      <div className="bg-zinc-950/85 rounded-xl p-2 sm:p-2.5 border border-zinc-800/90 flex flex-col items-center justify-center shadow-sm">
                        <span className="text-[11px] font-semibold text-zinc-400">Reps</span>
                        <span className="text-base font-bold text-white mt-0.5">{reps}</span>
                      </div>

                      {/* Sets */}
                      <div className="bg-zinc-950/85 rounded-xl p-2 sm:p-2.5 border border-zinc-800/90 flex flex-col items-center justify-center shadow-sm">
                        <span className="text-[11px] font-semibold text-zinc-400">Sets</span>
                        <span className="text-base font-bold text-white mt-0.5">{sets}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md">
            <div className="w-14 h-14 rounded-2xl border border-zinc-800 bg-zinc-900 flex items-center justify-center mb-4 shadow-sm text-zinc-300">
              <TrendingUp className="h-7 w-7 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-1.5 tracking-tight">No Activity Today</h3>
            <p className="text-zinc-400 text-xs max-w-xs leading-snug font-medium">
              Log an exercise today to track your progress.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
