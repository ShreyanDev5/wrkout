"use client"

import { useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTheme } from "@/components/theme-context"
import { getWorkoutDayColor } from "@/lib/utils"
import type { WorkoutLog } from "@/lib/types"
import { useIsMobile } from "@/hooks/use-mobile"
import { processWorkoutData } from "@/lib/progress-data-utils"

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

  return (
    <div className="relative">
      <div className="w-full overflow-x-auto rounded-lg border border-border/60 bg-background shadow">
        {weeklyData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg">
            No data available for the selected filters
          </div>
        ) : (
          <Table className="w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/60 bg-muted/20">
                <TableHead
                  className="w-[160px] sm:w-[200px] border-r border-border/60 text-center bg-muted/20 sticky left-0 z-10"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  <div className="font-medium text-sm sm:text-base">Exercise</div>
                </TableHead>
                {/* Single week indicator with improved spacing */}
                {weekLabels.map((label) => (
                  <TableHead 
                    key={label} 
                    className="text-center w-[140px] sm:w-[160px] px-3 sm:px-4 bg-muted/20"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-sm sm:text-base font-medium">{label}</div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeklyData.map((exercise) => {
                // Use a default color for now, or add color logic if you have day info
                const dayColor = getWorkoutDayColor("push", colorMode)
                return (
                  <TableRow 
                    key={exercise.exerciseName} 
                    className="hover:bg-muted/20 transition-colors group border-b border-border/40"
                  >
                    <TableCell
                      className="font-medium break-words whitespace-normal py-2.5 border-r border-border/60 bg-background sticky left-0 z-10"
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
                          className="block text-sm sm:text-base font-medium pl-5 pr-4" 
                          title={exercise.exerciseName}
                        >
                          {exercise.exerciseName}
                        </span>
                      </div>
                    </TableCell>

                    {weekLabels.map((weekLabel) => {
                      const weekData = exercise.weeks[weekLabel]
                      return (
                        <TableCell 
                          key={weekLabel} 
                          className="text-center py-2.5 px-3 sm:px-4 bg-background/95"
                        >
                          {weekData ? (
                            <div className="flex flex-col items-center justify-center gap-1">
                              {/* Reps with improved spacing and adjusted font */}
                              <div className="font-medium text-sm sm:text-base leading-tight">
                                {weekData.reps}<span className="text-base sm:text-lg mx-1">×</span>
                              </div>
                              {/* Weight with improved styling */}
                              <div
                                className="text-sm sm:text-base font-semibold rounded-full px-2.5 py-0.5 min-w-[80px] sm:min-w-[90px] leading-tight shadow-sm"
                                style={{
                                  backgroundColor: `${dayColor}25`,
                                  color: dayColor,
                                }}
                              >
                                {weekData.weight}kg
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
