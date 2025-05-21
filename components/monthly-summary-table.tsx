"use client"

import { useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTheme } from "@/components/theme-context"
import { getWorkoutDayColor } from "@/lib/utils"
import type { WorkoutSession } from "@/lib/types"
import { useIsMobile } from "@/hooks/use-mobile"
import { processWorkoutData } from "@/lib/progress-data-utils"

interface MonthlySummaryTableProps {
  sessions: WorkoutSession[]
  mainFilter: string | null
}

export function MonthlySummaryTable({ sessions, mainFilter }: MonthlySummaryTableProps) {
  const { colorMode } = useTheme()
  const isMobile = useIsMobile()

  // Filter sessions by main filter
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      // Apply main filter
      if (mainFilter && session.dayId !== mainFilter) return false

      // Only include sessions with both weight and reps data
      if (session.weight <= 0 || session.reps <= 0) return false

      return true
    })
  }, [sessions, mainFilter])

  // Process workout data using our utility
  const { weeklyData, weekLabels } = useMemo(() => {
    return processWorkoutData(filteredSessions)
  }, [filteredSessions])

  return (
    <div className="relative">
      {/* Table with horizontal scroll - no chevron arrows */}
      <div
        id="summary-table-container"
        className="overflow-x-auto -mx-4 px-4 pb-4 hide-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {weeklyData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No data available for the selected filters</div>
        ) : (
          <div className="min-w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="w-[160px] sm:w-[220px] sticky left-0 z-20 border-r border-border/20"
                    style={{ backgroundColor: "hsl(var(--background))" }}
                  >
                    Exercise
                  </TableHead>
                  {/* Increased spacing between week indicators */}
                  {weekLabels.map((label) => (
                    <TableHead key={label} className="text-center min-w-[90px] px-3 sm:px-4">
                      <div className="text-base font-medium">{label}</div>
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
                        className="font-medium break-words whitespace-normal py-3 sticky left-0 z-10 border-r border-border/20"
                        style={{
                          borderLeft: `4px solid ${dayColor}`,
                          color: dayColor,
                          backgroundColor: "hsl(var(--background))",
                        }}
                      >
                        {/* Increased font size for workout names */}
                        <span className="block text-sm sm:text-base font-medium" title={exercise.exerciseName}>
                          {exercise.exerciseName}
                        </span>
                      </TableCell>

                      {weekLabels.map((weekLabel) => {
                        const weekData = exercise.weeks[weekLabel]
                        return (
                          <TableCell key={weekLabel} className="text-center p-2 px-3 sm:px-4">
                            {weekData ? (
                              <div className="flex flex-col items-center justify-center">
                                {/* Increased font size for data */}
                                <div className="font-medium text-sm sm:text-base">
                                  {isMobile ? (
                                    <>{weekData.reps}x</>
                                  ) : (
                                    <>
                                      {weekData.sets} × {weekData.reps}
                                    </>
                                  )}
                                </div>
                                <div
                                  className="text-sm font-semibold rounded-full px-2 py-0.5 mt-1.5"
                                  style={{
                                    backgroundColor: `${dayColor}20`,
                                    color: dayColor,
                                  }}
                                >
                                  {weekData.weight}kg
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
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
    </div>
  )
}
