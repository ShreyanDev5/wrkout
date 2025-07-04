"use client"

import { useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTheme } from "@/components/theme-context"
import { getWorkoutDayColor } from "@/lib/utils"
import type { WorkoutLog } from "@/lib/types"
import { useIsMobile } from "@/hooks/use-mobile"
import { processWorkoutData } from "@/lib/progress-data-utils"
import { format } from "date-fns"
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MonthlySummaryTableProps {
  logs: WorkoutLog[]
  mainFilter: string | null
}

export function MonthlySummaryTable({ logs, mainFilter }: MonthlySummaryTableProps) {
  const { colorMode } = useTheme()
  const isMobile = useIsMobile()

  // Filter logs by main filter (if you have a way to associate logs with dayId, add it here)
  const filteredLogs = useMemo(() => {
    // For now, just return all logs (since dayId is not in WorkoutLog)
    return logs.filter((log) => log.weight > 0 && log.avg_reps > 0)
  }, [logs, mainFilter])

  // Process workout data using our utility
  const { weeklyData, weekLabels } = useMemo(() => {
    return processWorkoutData(filteredLogs)
  }, [filteredLogs])

  // Function to render trend indicator
  const renderTrend = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null
    const diff = ((current - previous) / previous) * 100
    
    if (Math.abs(diff) < 1) return <Minus className="h-4 w-4 text-muted-foreground mx-auto" />
    
    if (diff > 0) {
      return (
        <div className="flex items-center justify-center text-green-500">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">{Math.round(diff)}%</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center justify-center text-red-500">
          <TrendingDown className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">{Math.abs(Math.round(diff))}%</span>
        </div>
      )
    }
  }

  // Function to get workout type from exercise name (simple heuristic)
  const getWorkoutType = (exerciseName: string): string => {
    const lowerName = exerciseName.toLowerCase()
    if (lowerName.includes('bench') || lowerName.includes('press') || lowerName.includes('push')) return 'push'
    if (lowerName.includes('row') || lowerName.includes('pull') || lowerName.includes('curl')) return 'pull'
    if (lowerName.includes('squat') || lowerName.includes('leg') || lowerName.includes('calf')) return 'leg'
    return 'push' // default
  }

  // Check if we're in a loading state (no logs yet but might be loading)
  const isLoading = logs.length === 0 && filteredLogs.length === 0

  return (
    <div className="relative">
      <div className="w-full overflow-x-auto rounded-lg border border-border/60 bg-background shadow">
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
              <p className="text-sm text-muted-foreground">
                Log your first workout to start tracking your progress. Your improvements will appear here.
              </p>
              <div className="pt-2">
                <div className="text-xs text-muted-foreground">
                  <span className="inline-block px-2 py-1 bg-muted rounded-full">
                    Tip: Complete your first workout to see progress
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Table className="w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/60 bg-muted/20">
                <TableHead
                  className="w-[160px] sm:w-[220px] border-r border-border/60 text-center bg-muted/20 sticky left-0 z-10"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  <div className="font-medium text-sm sm:text-base">Exercise</div>
                </TableHead>
                {weekLabels.map((label, index) => (
                  <TableHead 
                    key={label} 
                    className="text-center w-[140px] sm:w-[180px] px-2 sm:px-3 bg-muted/20"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-sm sm:text-base font-medium">{label}</div>
                      {index > 0 && (
                        <div className="text-xs text-muted-foreground">
                          vs W{index}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeklyData.map((exercise) => {
                const workoutType = getWorkoutType(exercise.exerciseName)
                const dayColor = getWorkoutDayColor(workoutType, colorMode)
                
                return (
                  <TableRow 
                    key={exercise.exerciseName} 
                    className="hover:bg-muted/10 transition-colors group border-b border-border/40"
                  >
                    <TableCell
                      className="font-medium break-words whitespace-normal py-3 border-r border-border/60 bg-background sticky left-0 z-10"
                      style={{
                        position: 'relative',
                        color: dayColor,
                      }}
                    >
                      <div className="flex items-center">
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-1.5 rounded-r-sm"
                          style={{ backgroundColor: dayColor }}
                        />
                        <span 
                          className="block text-sm sm:text-base font-medium pl-5 pr-4 truncate" 
                          title={exercise.exerciseName}
                        >
                          {exercise.exerciseName}
                        </span>
                      </div>
                    </TableCell>

                    {weekLabels.map((weekLabel, weekIndex) => {
                      const weekData = exercise.weeks[weekLabel]
                      const previousWeekData = weekIndex > 0 ? exercise.weeks[weekLabels[weekIndex - 1]] : null
                      
                      return (
                        <TableCell 
                          key={weekLabel} 
                          className="text-center py-3 px-2 sm:px-3 bg-background/95"
                        >
                          {weekData ? (
                            <div className="flex flex-col items-center justify-center space-y-1.5 w-full">
                              {/* Main weight display with trend */}
                              <div className="flex flex-col items-center w-full">
                                <div className="flex items-center justify-center space-x-1.5">
                                  <span className="text-base font-bold text-foreground">
                                    {weekData.weight}
                                  </span>
                                  <span className="text-xs text-muted-foreground">kg</span>
                                </div>
                                
                                {/* Trend indicator for weight */}
                                {previousWeekData && (
                                  <div className="mt-0.5">
                                    {renderTrend(weekData.weight, previousWeekData.weight)}
                                  </div>
                                )}
                              </div>
                              
                              <div className="w-3/4 h-px bg-border/40 my-1" />
                              
                              {/* Reps display with trend */}
                              <div className="flex flex-col items-center w-full">
                                <div className="flex items-center justify-center space-x-1.5">
                                  <span className="text-sm font-medium text-foreground">
                                    {weekData.reps}
                                  </span>
                                  <span className="text-xs text-muted-foreground">reps</span>
                                </div>
                                
                                {/* Trend indicator for reps */}
                                {previousWeekData && (
                                  <div className="mt-0.5">
                                    {renderTrend(weekData.reps, previousWeekData.reps)}
                                  </div>
                                )}
                              </div>
                              
                              {/* Date indicator */}
                              <div className="text-[10px] text-muted-foreground opacity-70 mt-1">
                                {format(new Date(weekData.date), 'MMM d')}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/80">-</span>
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
