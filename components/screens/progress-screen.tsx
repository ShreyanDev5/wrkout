"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { WorkoutLog } from "@/lib/types"
import { getWorkoutDayColor, getExerciseWorkoutType, formatDate } from "@/lib/utils"
import { useTheme } from "@/components/theme-context"
import { motion } from "framer-motion"
import { BarChart3, Dumbbell } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressScreenProps {
  logs: WorkoutLog[]
}

interface Session {
  id: string // Date string
  date: Date
  workoutType: string // 'push', 'pull', 'leg' or 'mixed'
  exerciseCount: number
}

export function ProgressScreen({ logs }: ProgressScreenProps) {
  const { colorMode } = useTheme()

  // Process logs into sessions (Optimized: recent 7 only)
  const sessions = useMemo(() => {
    if (!logs || logs.length === 0) {
      return []
    }

    // 1. Group logs by date (YYYY-MM-DD)
    // We only need to iterate once to group
    const groups: Map<string, WorkoutLog[]> = new Map()

    for (const log of logs) {
      const dateKey = new Date(log.performed_at).toDateString()
      if (!groups.has(dateKey)) {
        groups.set(dateKey, [])
      }
      groups.get(dateKey)!.push(log)
    }

    // 2. Get keys and sort descending (Newest first)
    // Converting map keys to array and sorting
    const sortedDateKeys = Array.from(groups.keys()).sort((a, b) =>
      new Date(b).getTime() - new Date(a).getTime()
    )

    // 3. Slice top 7
    const recentSessionKeys = sortedDateKeys.slice(0, 7)

    // 4. Process ONLY these 7 sessions
    return recentSessionKeys.map(dateKey => {
      const sessionLogs = groups.get(dateKey)!
      const date = new Date(sessionLogs[0].performed_at)

      // Determine workout type based on majority of exercises
      const typeCounts: Record<string, number> = { push: 0, pull: 0, leg: 0, other: 0 }

      // Track unique exercises to count "checked off" correctly
      const uniqueExercises = new Set<string>()

      for (const log of sessionLogs) {
        uniqueExercises.add(log.exercise_name)

        const type = getExerciseWorkoutType(log.exercise_name)?.toLowerCase()
        if (type && type in typeCounts) {
          typeCounts[type]++
        } else {
          typeCounts.other++
        }
      }

      // Find dominant type
      let dominantType = 'mixed'
      let maxCount = 0
      for (const [type, count] of Object.entries(typeCounts)) {
        if (type !== 'other' && count > maxCount) {
          maxCount = count
          dominantType = type
        }
      }

      return {
        id: dateKey,
        date,
        workoutType: dominantType,
        exerciseCount: uniqueExercises.size
      }
    })
  }, [logs])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 } // Faster stagger for list
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 }, // Subtle movement
    visible: { opacity: 1, y: 0 }
  }

  return (
    <Card className="border-0 shadow-none dark:bg-background max-w-3xl mx-auto w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
      <CardContent className="px-4 pt-6 pb-20 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/50 shadow-sm">
            <BarChart3 className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Recent Sessions</h2>
            <p className="text-xs text-muted-foreground font-medium">Last 7 workouts</p>
          </div>
        </div>

        {/* Recent Sessions List */}
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {sessions.length > 0 ? (
            sessions.map((session) => {
              const dayColor = getWorkoutDayColor(session.workoutType, colorMode || 'dark')

              return (
                <motion.div
                  key={session.id}
                  variants={itemVariants}
                  className="group relative"
                >
                  <div
                    className={cn(
                      "relative bg-zinc-900/40 hover:bg-zinc-800/50 border border-zinc-800/60 rounded-2xl p-4 transition-all duration-300 backdrop-blur-sm cursor-default flex items-center justify-between",
                      // Subtle glow effect
                      "after:absolute after:inset-0 after:rounded-2xl after:opacity-0 after:transition-opacity hover:after:opacity-100 after:pointer-events-none"
                    )}
                    style={{
                      boxShadow: 'none',
                      // @ts-ignore
                      "--glow-color": dayColor
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="h-10 w-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: dayColor, boxShadow: `0 0 8px ${dayColor}` }}
                      />

                      <div className="flex flex-col">
                        <span className="text-base font-semibold capitalize text-foreground">
                          {session.workoutType} Day
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {formatDate(session.date.toISOString())}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-2 bg-zinc-800/50 px-3 py-1.5 rounded-full border border-zinc-700/30">
                      <Dumbbell className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="text-sm font-semibold text-foreground/90">{session.exerciseCount}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })
          ) : (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-zinc-800">
              <Dumbbell className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground text-sm">No sessions recorded yet.</p>
            </div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  )
}

