"use client"

import { useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTheme } from "@/components/theme-context"
import { getWorkoutDayColor } from "@/lib/utils"
import type { WorkoutSession } from "@/lib/types"

interface WeeklySummaryTableProps {
  sessions: WorkoutSession[]
  mainFilter: string | null
}

export function WeeklySummaryTable({ sessions, mainFilter }: WeeklySummaryTableProps) {
  const { colorMode } = useTheme()

  // Generate week labels for the last 4 weeks
  const weekLabels = useMemo(() => {
    const labels = []
    const today = new Date()

    for (let i = 4; i > 0; i--) {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - i * 7)
      labels.push(`W${5 - i}`)
    }

    return labels
  }, [])

  // Process sessions into weekly data
  const weeklyData = useMemo(() => {
    // Filter sessions by main filter
    const filteredSessions = sessions.filter((session) => {
      // Apply main filter
      if (mainFilter && session.dayId !== mainFilter) return false

      // Only include sessions with both weight and reps data
      if (session.weight <= 0 || session.reps <= 0) return false

      return true
    })

    // Group sessions by exercise
    const exerciseGroups: Record<string, WorkoutSession[]> = {}
    filteredSessions.forEach((session) => {
      if (!exerciseGroups[session.exerciseId]) {
        exerciseGroups[session.exerciseId] = []
      }
      exerciseGroups[session.exerciseId].push(session)
    })

    // Process each exercise's weekly data
    const result: {
      exerciseId: string
      exerciseName: string
      dayId: string
      weeks: {
        [weekKey: string]: {
          sets: number
          reps: number
          weight: number
        } | null
      }
    }[] = []

    Object.entries(exerciseGroups).forEach(([exerciseId, exerciseSessions]) => {
      const today = new Date()
      const weeks: Record<string, { sets: number; reps: number; weight: number } | null> = {}

      // Initialize all weeks as null
      weekLabels.forEach((label) => {
        weeks[label] = null
      })

      // Fill in data for weeks that have sessions
      exerciseSessions.forEach((session) => {
        const sessionDate = new Date(session.date)
        const diffTime = today.getTime() - sessionDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        const weekIndex = Math.floor(diffDays / 7)

        // Only consider the last 4 weeks
        if (weekIndex >= 0 && weekIndex < 4) {
          const weekLabel = `W${4 - weekIndex}`

          // If we already have data for this week, use the one with higher weight
          if (!weeks[weekLabel] || session.weight > weeks[weekLabel]!.weight) {
            weeks[weekLabel] = {
              sets: session.sets,
              reps: session.reps,
              weight: session.weight,
            }
          }
        }
      })

      result.push({
        exerciseId,
        exerciseName: exerciseSessions[0].exerciseName,
        dayId: exerciseSessions[0].dayId,
        weeks,
      })
    })

    // Sort by exercise name with null checks
    return result.sort((a, b) => (a.exerciseName || "").localeCompare(b.exerciseName || ""))
  }, [sessions, mainFilter, weekLabels])

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      {weeklyData.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No data available for the selected filters</div>
      ) : (
        <div className="min-w-full">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Exercise</TableHead>
                {weekLabels.map((label) => (
                  <TableHead key={label} className="text-center">
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeklyData.map((exercise) => {
                const dayColor = getWorkoutDayColor(exercise.dayId, colorMode)
                return (
                  <TableRow key={exercise.exerciseId} className="hover:bg-muted/5 transition-colors">
                    <TableCell
                      className="font-medium"
                      style={{
                        borderLeft: `3px solid ${dayColor}`,
                        color: dayColor,
                      }}
                    >
                      {exercise.exerciseName}
                    </TableCell>

                    {weekLabels.map((weekLabel) => {
                      const weekData = exercise.weeks[weekLabel]
                      return (
                        <TableCell key={weekLabel} className="text-center">
                          {weekData ? (
                            <div>
                              <div className="font-medium">
                                {weekData.sets} × {weekData.reps}
                              </div>
                              <div className="text-xs text-muted-foreground" style={{ color: dayColor }}>
                                {weekData.weight} kg
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
