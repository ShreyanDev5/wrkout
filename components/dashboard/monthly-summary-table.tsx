"use client"

import { useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTheme } from "@/components/theme-context"
import { getWorkoutDayColor, getExerciseWorkoutType } from "@/lib/utils"
import type { WorkoutLog, WeeklyWorkoutData } from "@/lib/types"
import { useIsMobile } from "@/components/ui/use-mobile"
import { processWorkoutData } from "@/lib/progress-data-utils"
import { format } from "date-fns"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { ExerciseSummaryCard } from "@/components/dashboard/exercise-summary-card"

interface MonthlySummaryTableProps {
  logs: WorkoutLog[]
  mainFilter: string | null
}

export function MonthlySummaryTable({ logs, mainFilter }: MonthlySummaryTableProps) {
  const { colorMode } = useTheme()
  const isMobile = useIsMobile()

  // Filter logs by main filter
  const filteredLogs = useMemo(() => {
    const validLogs = logs.filter((log) => log.weight > 0 && log.avg_reps > 0)

    // If no filter is set, return all valid logs (shouldn't happen with our new implementation)
    if (!mainFilter) return validLogs

    return validLogs.filter((log) => {
      const exerciseType = getExerciseWorkoutType(log.exercise_name)
      return exerciseType === mainFilter.toLowerCase()
    })
  }, [logs, mainFilter])

  // Process workout data using our utility
  const { weeklyData, weekLabels } = useMemo(() => {
    return processWorkoutData(filteredLogs)
  }, [filteredLogs]) as { weeklyData: WeeklyWorkoutData[], weekLabels: string[] }

  // Function to render simplified trend indicator
  const renderTrend = (current: number | null, previous: number | null) => {
    // Handle edge cases
    if (!current || !previous || previous === 0) return null
    const diff = current - previous

    // Consider changes less than 1kg as neutral
    if (Math.abs(diff) < 1) return <Minus className="h-3.5 w-3.5 text-muted-foreground" />

    if (diff > 0) {
      return <TrendingUp className="h-3.5 w-3.5 text-green-500" />
    } else {
      return <TrendingDown className="h-3.5 w-3.5 text-red-500" />
    }
  }

  // Check if we're in a loading state (no logs yet but might be loading)
  const isLoading = logs.length === 0 && filteredLogs.length === 0

  if (isMobile) {
    return (
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-16 px-4">
            <div className="animate-pulse flex flex-col items-center space-y-4">
              <div className="h-3 w-48 bg-muted rounded"></div>
              <div className="h-3 w-32 bg-muted rounded"></div>
            </div>
          </div>
        ) : weeklyData.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="mx-auto flex flex-col items-center justify-center space-y-4 max-w-md">
              <div className="rounded-full bg-muted p-3">
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No workout data yet</h3>
              <p className="text-sm text-muted-foreground px-4">
                Log your first workout to start tracking progress. Your improvements will appear here.
              </p>
              <div className="pt-2">
                <div className="text-xs text-muted-foreground">
                  <span className="inline-block px-2 py-1 bg-muted rounded-full">
                    Tip: Complete a workout to see progress
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {weeklyData.map((exercise) => (
              <ExerciseSummaryCard
                key={exercise.exerciseName}
                exercise={exercise}
                weekLabels={weekLabels}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="w-full overflow-x-auto rounded-lg border border-border/60 bg-background shadow min-w-0" style={{ WebkitOverflowScrolling: 'touch' }}>
        {isLoading ? (
          <div className="text-center py-16 px-4">
            <div className="animate-pulse flex flex-col items-center space-y-4">
              <div className="h-3 w-48 bg-muted rounded"></div>
              <div className="h-3 w-32 bg-muted rounded"></div>
            </div>
          </div>
        ) : weeklyData.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="mx-auto flex flex-col items-center justify-center space-y-4 max-w-md">
              <div className="rounded-full bg-muted p-3">
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No workout data yet</h3>
              <p className="text-sm text-muted-foreground px-4">
                Log your first workout to start tracking progress. Your improvements will appear here.
              </p>
              <div className="pt-2">
                <div className="text-xs text-muted-foreground">
                  <span className="inline-block px-2 py-1 bg-muted rounded-full">
                    Tip: Complete a workout to see progress
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Table className="w-full min-w-[280px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/60 bg-muted/30">
                <TableHead
                  className="w-[120px] sm:w-[180px] border-r border-border/60 text-center bg-muted/30"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  <div className="font-semibold text-xs sm:text-sm text-foreground">Exercise</div>
                </TableHead>
                {weekLabels.map((label, index) => (
                  <TableHead
                    key={label}
                    className="text-center w-[100px] sm:w-[140px] px-1 sm:px-3 bg-muted/30"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-xs sm:text-sm font-semibold text-foreground">Current</div>
                      <div className="text-[10px] text-muted-foreground font-medium">Performance</div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeklyData.map((exercise) => {
                const workoutType = getExerciseWorkoutType(exercise.exerciseName);
                const dayColor = workoutType ? getWorkoutDayColor(workoutType, colorMode) : 'hsl(var(--muted))';

                return (
                  <TableRow
                    key={exercise.exerciseName}
                    className="transition-colors group border-b border-border/40 hover:bg-muted/10"
                  >
                    <TableCell
                      className="font-medium break-words whitespace-normal py-3 sm:py-4 border-r border-border/60 bg-background"
                      style={{
                        color: dayColor,
                      }}
                    >
                      <span
                        className="block text-xs sm:text-sm font-medium px-2 sm:px-4 leading-tight"
                        title={exercise.exerciseName}
                      >
                        {exercise.exerciseName}
                      </span>
                    </TableCell>

                    {weekLabels.map((weekLabel, weekIndex) => {
                      const weekData = exercise.weeks[weekLabel]
                      const previousWorkout = exercise.previousWorkout

                      return (
                        <TableCell
                          key={weekLabel}
                          className="text-center py-3 sm:py-4 px-1 sm:px-3 bg-background/95"
                        >
                          {weekData ? (
                            <div className="flex flex-col items-center justify-center space-y-1.5 w-full">
                              {/* Main weight display with trend */}
                              <div className="flex items-center justify-center space-x-1.5">
                                <span className="text-base sm:text-lg font-bold text-foreground">
                                  {weekData.weight}
                                </span>
                                <span className="text-xs sm:text-sm text-muted-foreground font-medium">kg</span>
                                {/* Simplified trend indicator for weight */}
                                {previousWorkout && (
                                  <div className="ml-1 flex items-center">
                                    {renderTrend(weekData.weight, previousWorkout.weight)}
                                  </div>
                                )}
                              </div>

                              {/* Reps display with trend */}
                              <div className="flex items-center justify-center space-x-1.5 mt-1">
                                <span className="text-sm sm:text-base text-foreground font-medium">
                                  {weekData.reps}
                                </span>
                                <span className="text-xs sm:text-sm text-muted-foreground">reps</span>
                                {/* Simplified trend indicator for reps */}
                                {previousWorkout && (
                                  <div className="ml-1 flex items-center">
                                    {renderTrend(weekData.reps, previousWorkout.reps)}
                                  </div>
                                )}
                              </div>

                              {/* Date indicator */}
                              <div className="text-[10px] sm:text-xs text-muted-foreground/80 mt-1">
                                {format(new Date(weekData.date), 'MMM d')}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/80 text-sm">-</span>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
