"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { WorkoutLog, WorkoutDay } from "@/lib/types"
import { getWorkoutDayColor, getExerciseWorkoutType, formatDate, getLocalDateYYYYMMDD } from "@/lib/utils"
import { useTheme } from "@/components/theme-context"
import { motion } from "framer-motion"
import { TrendingUp, Dumbbell } from "lucide-react"
import { cn } from "@/lib/utils"

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

  // Group logs by exercise to show aggregated stats if multiple sets are logged
  const groupedLogs = useMemo(() => {
    const groups: Map<string, WorkoutLog[]> = new Map()
    for (const log of todayLogs) {
      if (!groups.has(log.exercise_name)) {
        groups.set(log.exercise_name, [])
      }
      groups.get(log.exercise_name)!.push(log)
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
    <Card className="border-0 shadow-none dark:bg-background max-w-2xl mx-auto w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
      <CardContent className="px-4 pt-6 pb-24 space-y-8">

        {/* Header - Today's Focus */}
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl">
            <TrendingUp className="h-5 w-5 text-[#4caf50]" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-foreground tracking-tight leading-none mb-1">Today's Focus</h2>
            <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
              {formatDate(new Date().toISOString())}
            </p>
          </div>
        </div>

        {/* Detailed Session Breakdown */}
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {groupedLogs.length > 0 ? (
            groupedLogs.map(([exerciseName, logs]) => {
              const types = getExerciseWorkoutType(exerciseName)
              const dominantType = types[0] || 'mixed'
              const displayType = types.join(' / ').toUpperCase()

              // Detect the implicit day color from the session context
              // Use the latest log to determine context (usually all logs for one exercise are in one session)
              const latestLog = logs[logs.length - 1]

              let effectiveDayType = dominantType
              if (latestLog?.workout_day_id) {
                const sessionDayType = dayIdMap.get(latestLog.workout_day_id)
                if (sessionDayType) {
                  effectiveDayType = sessionDayType
                }
              }

              const dayColor = getWorkoutDayColor(effectiveDayType, colorMode || 'dark')
              const sets = latestLog.sets || logs.length
              const weight = latestLog.weight
              const reps = latestLog.avg_reps
              const rir = latestLog.rir

              return (
                <motion.div
                  key={exerciseName}
                  variants={itemVariants}
                  className="group"
                >
                  <div
                    className="relative bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 border-l-[3px] rounded-[18px] p-2.5 shadow-md transition-all hover:bg-zinc-900/60 overflow-hidden group-hover:border-zinc-700/50"
                    style={{ borderLeftColor: dayColor }}
                  >

                    {/* Very faint background tint for premium feel */}
                    <div
                      className="absolute inset-0 opacity-[0.03] pointer-events-none"
                      style={{ backgroundColor: dayColor }}
                    />

                    <div className="flex flex-col gap-2 pl-2">
                      {/* Exercise Header - Compact */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-0">
                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] opacity-90" style={{ color: dayColor }}>
                              {displayType}
                            </span>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-800 to-transparent opacity-50" />
                          </div>
                          <h3 className="text-sm font-bold text-zinc-100 leading-none tracking-tight py-0.5">
                            {exerciseName}
                          </h3>
                        </div>
                      </div>

                      {/* Integrated Metrics Grid - 4 Columns */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {/* Weight */}
                        <div className="bg-zinc-950/60 rounded-lg p-1.5 border border-zinc-800/50 flex flex-col items-center justify-center">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Weight</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-sm font-bold text-zinc-100">{weight}</span>
                            <span className="text-[9px] font-medium text-muted-foreground/50">kg</span>
                          </div>
                        </div>

                        {/* Reps */}
                        <div className="bg-zinc-950/60 rounded-lg p-1.5 border border-zinc-800/50 flex flex-col items-center justify-center">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Reps</span>
                          <span className="text-sm font-bold text-zinc-100">{reps}</span>
                        </div>

                        {/* Sets */}
                        <div className="bg-zinc-950/60 rounded-lg p-1.5 border border-zinc-800/50 flex flex-col items-center justify-center">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Sets</span>
                          <span className="text-sm font-bold text-zinc-100">{sets}</span>
                        </div>

                        {/* RIR */}
                        <div
                          className={cn(
                            "rounded-lg p-1.5 border flex flex-col items-center justify-center transition-opacity",
                            rir !== null && rir !== undefined ? "bg-zinc-950/60 border-zinc-800/50" : "bg-transparent border-transparent opacity-20"
                          )}
                        >
                          <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">RIR</span>
                          <span className="text-sm font-bold text-zinc-100">
                            {rir !== null && rir !== undefined ? rir : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          ) : (
            <div className="text-center py-16 px-8 rounded-[32px] border border-dashed border-zinc-800/50 bg-zinc-900/10">
              <div className="w-12 h-12 rounded-full bg-zinc-800/20 flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="h-6 w-6 text-muted-foreground opacity-30" />
              </div>
              <p className="text-muted-foreground font-medium text-xs leading-relaxed max-w-[180px] mx-auto opacity-50">
                Log a workout today to build your progress momentum!
              </p>
            </div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  )
}
