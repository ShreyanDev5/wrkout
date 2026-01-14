"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { WorkoutLog, WorkoutDay } from "@/lib/types"
import { getWorkoutDayColor, getExerciseWorkoutType, formatDate, getLocalDateYYYYMMDD, isCompoundExercise } from "@/lib/utils"
import { useTheme } from "@/components/theme-context"
import { motion } from "framer-motion"
import { TrendingUp, Dumbbell } from "lucide-react"
import { cn } from "@/lib/utils"

// Progression advice logic (mirrored from inline-workout-logger for consistency)
const getProgressionAdvice = (isCompound: boolean, reps: number, rir: number | null | undefined): string => {
  if (rir === null || rir === undefined) return 'none'

  // 1. Override Logic: High Rep Thresholds (Force Weight Increase)
  if (isCompound && reps >= 12) return 'increase-weight'
  if (!isCompound && reps >= 17) return 'increase-weight'

  // 2. Special Cases: Visual Indicator Only (No Automatic Rep Increment)
  if (isCompound && reps === 11 && rir === 0) return 'visual-increase-rep'
  if (!isCompound && reps === 16 && rir === 0) return 'visual-increase-rep'

  // 3. Standard Logic
  if (isCompound && reps === 11 && rir >= 1) return 'increase-weight'
  if (!isCompound && reps === 16 && rir >= 1) return 'increase-weight'

  // 4. Fallback Logic
  if (rir === 0) return 'repeat'
  if (rir <= 2) return 'increase-rep'
  return 'increase-weight'
}

// Find the most recent log for an exercise from a PREVIOUS date (strictly before today)
const findPreviousLog = (exerciseName: string, todayDate: string, logs: WorkoutLog[]): WorkoutLog | null => {
  const previousLogs = logs
    .filter(log => log.exercise_name === exerciseName && log.performed_at < todayDate)
    .sort((a, b) => {
      // Primary sort: Date (Newest first)
      const dateComparison = b.performed_at.localeCompare(a.performed_at)
      if (dateComparison !== 0) return dateComparison
      // Secondary sort: Creation timestamp (Newest first)
      return b.created_at.localeCompare(a.created_at)
    })
  return previousLogs.length > 0 ? previousLogs[0] : null
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
            groupedLogs.map(([exerciseName, exerciseLogs]) => {
              const types = getExerciseWorkoutType(exerciseName)
              const dominantType = types[0] || 'mixed'
              const displayType = types.join(' / ').toUpperCase()

              // Detect the implicit day color from the session context
              // Use the latest log to determine context (usually all logs for one exercise are in one session)
              const latestLog = exerciseLogs[exerciseLogs.length - 1]

              let effectiveDayType = dominantType // Fallback to keyword matching

              if (latestLog?.workout_day_id) {
                // If we have a robust DB link to the day, use it!
                const sessionDayType = dayIdMap.get(latestLog.workout_day_id)
                if (sessionDayType) {
                  effectiveDayType = sessionDayType
                }
              }

              const dayColor = getWorkoutDayColor(effectiveDayType, colorMode || 'dark')
              const sets = latestLog.sets || exerciseLogs.length
              const weight = latestLog.weight
              const reps = latestLog.avg_reps
              const rir = latestLog.rir

              // Stagnation detection: compare against expected progression from previous log
              // Use the original 'logs' prop (all logs) to find previous sessions
              // Filter strictly by date < today to compare against the last SESSION, preventing intra-workout flags
              const prevLog = findPreviousLog(exerciseName, today, logs)
              let isWeightBelowExpected = false
              let isRepsBelowExpected = false

              if (prevLog && prevLog.rir !== null && prevLog.rir !== undefined) {
                const isCompound = isCompoundExercise(exerciseName)
                // Safe casting for RIR to ensure reliable advice logic
                const prevRir = Number(prevLog.rir)
                const advice = getProgressionAdvice(isCompound, prevLog.avg_reps, prevRir)

                // Safe number comparisons
                const currentWeight = Number(weight)
                const prevWeight = Number(prevLog.weight)
                const currentReps = Number(reps)
                const prevReps = Number(prevLog.avg_reps)

                // 1. Indicator = "repeat" (or visual nudge treated as strict repeat for validation)
                if (advice === 'repeat' || advice === 'visual-increase-rep') {
                  // Rule: User decreases reps or weight -> deep amber
                  // (Maintained or Increased -> Neutral/White)
                  isWeightBelowExpected = currentWeight < prevWeight
                  isRepsBelowExpected = currentReps < prevReps
                }
                // 2. Indicator = "increase reps"
                else if (advice === 'increase-rep') {
                  // Rule: User increases reps vs previous -> neutral white
                  // User keeps reps the same or decreases -> deep amber
                  isRepsBelowExpected = currentReps <= prevReps
                  // Weight: Neutral unless it drops (Implicit "don't drop" rule, but user stressed 'increase reps' rule)
                  // Prompt says: "Indicator = 'increase reps' ... User keeps reps same or decreases -> deep amber."
                  // It doesn't explicitly flag weight. To be safe/clean, we assume weight should ideally be maintained, 
                  // but we only STRICTLY flag the focus metric (Reps) as per the specific rule "Indicator = 'increase reps'" block.
                  // However, common sense: dropping weight is also bad.
                  // Let's stick STRICTLY to the prompt for the "amber" trigger on the specific fields.
                  // "Only the currently logged reps and/or weight... should turn amber"
                  // If advice is increase reps, and I drop weight, should weight be amber? 
                  // Prompt: "Indicator = 'repeat' ... User decreases... -> amber." 
                  // Prompt for Increase Reps doesn't mention weight. 
                  // I will add a safeguard: If weight drops, it's amber too, because 'Increase Reps' implies 'at same weight'.
                  isWeightBelowExpected = currentWeight < prevWeight
                }
                // 3. Indicator = "increase weight"
                else if (advice === 'increase-weight') {
                  // Rule: User increases weight compared to previous -> neutral white
                  // User keeps weight the same or decreases -> deep amber
                  isWeightBelowExpected = currentWeight <= prevWeight

                  // Reps Logic:
                  // If user SUCCESSFULLY increased weight (currentWeight > prevWeight), 
                  // a drop in reps is natural and expected (e.g. 12 reps -> 6 reps).
                  // So we only flag reps as 'stagnant' if the weight explicitly FAILED to increase.
                  if (currentWeight > prevWeight) {
                    isRepsBelowExpected = false
                  } else {
                    // Failed to increase weight: must at least maintain reps
                    isRepsBelowExpected = currentReps < prevReps
                  }
                }

                // 'none' → no expectation (no previous RIR data)
              }

              return (
                <motion.div
                  key={exerciseName}
                  variants={itemVariants}
                  className="group"
                >
                  <div
                    className="relative bg-zinc-900/40 backdrop-blur-md rounded-[18px] px-2.5 py-3.5 transition-all hover:bg-zinc-900/60 overflow-hidden"
                    style={{
                      borderLeft: `3px solid ${dayColor}`,
                      borderTop: `0.5px solid color-mix(in srgb, ${dayColor} 70%, transparent)`,
                      borderRight: `0.5px solid color-mix(in srgb, ${dayColor} 70%, transparent)`,
                      borderBottom: `0.5px solid color-mix(in srgb, ${dayColor} 70%, transparent)`,
                      boxShadow: `0 1px 8px -4px color-mix(in srgb, ${dayColor} 8%, transparent), 0 1px 2px rgba(0,0,0,0.1)`
                    }}
                  >

                    {/* Very faint background tint for premium feel */}
                    <div
                      className="absolute inset-0 opacity-[0.03] pointer-events-none"
                      style={{ backgroundColor: dayColor }}
                    />

                    <div className="flex flex-col gap-2.5 pl-2">
                      {/* Exercise Header - Compact */}

                      <h3 className="text-base font-bold text-zinc-100 leading-none tracking-tight py-0.5">
                        {exerciseName}
                      </h3>

                      {/* Integrated Metrics Grid - 4 Columns */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {/* Weight */}
                        <div className="bg-zinc-950/60 rounded-lg p-1.5 border border-zinc-800/50 flex flex-col items-center justify-center">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Weight</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className={cn("text-[15px] font-bold", isWeightBelowExpected ? "text-orange-600/90" : "text-zinc-100")}>{weight}</span>
                            <span className="text-[9px] font-medium text-muted-foreground/50">kg</span>
                          </div>
                        </div>

                        {/* Reps */}
                        <div className="bg-zinc-950/60 rounded-lg p-1.5 border border-zinc-800/50 flex flex-col items-center justify-center">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Reps</span>
                          <span className={cn("text-[15px] font-bold", isRepsBelowExpected ? "text-orange-600/90" : "text-zinc-100")}>{reps}</span>
                        </div>

                        {/* Sets */}
                        <div className="bg-zinc-950/60 rounded-lg p-1.5 border border-zinc-800/50 flex flex-col items-center justify-center">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Sets</span>
                          <span className="text-[15px] font-bold text-zinc-100">{sets}</span>
                        </div>

                        {/* RIR */}
                        <div
                          className={cn(
                            "rounded-lg p-1.5 border flex flex-col items-center justify-center transition-opacity",
                            rir !== null && rir !== undefined ? "bg-zinc-950/60 border-zinc-800/50" : "bg-transparent border-transparent opacity-20"
                          )}
                        >
                          <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">RIR</span>
                          <span className="text-[15px] font-bold text-zinc-100">
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
      </CardContent >
    </Card >
  )
}
