"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ModernProgressChart } from "@/components/modern-progress-chart"
import { MonthlySummaryTable } from "@/components/monthly-summary-table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { WorkoutSession } from "@/lib/types"
import { getWorkoutDayColor } from "@/lib/utils"
import { useTheme } from "@/components/theme-context"
import { ArrowUp, ArrowDown, Footprints, BarChart3 } from "lucide-react"
import { motion } from "framer-motion"
import { saveLastProgressState, loadLastProgressState } from "@/lib/storage"
import { CollapsibleHeaderLayout } from "@/components/layouts/collapsible-header-layout"

interface ProgressScreenProps {
  sessions: WorkoutSession[]
}

export function ProgressScreen({ sessions }: ProgressScreenProps) {
  const { colorMode } = useTheme()
  const [mainFilter, setMainFilter] = useState<string | null>(null)
  const [chartExerciseFilter, setChartExerciseFilter] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load the last progress state from localStorage on component mount
  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const savedState = await loadLastProgressState()
        setMainFilter(savedState.mainFilter)
        setChartExerciseFilter(savedState.chartExerciseFilter)
        setIsInitialized(true)
      } catch (error) {
        console.error("Error loading last progress state:", error)
        setIsInitialized(true)
      }
    }

    loadSavedState()
  }, [])

  // Save the progress state to localStorage whenever it changes
  useEffect(() => {
    // Only save after initial load to prevent overwriting with default values
    if (isInitialized) {
      saveLastProgressState({ mainFilter, chartExerciseFilter }).catch((error) => {
        console.error("Error saving progress state:", error)
      })
    }
  }, [mainFilter, chartExerciseFilter, isInitialized])

  // Reset secondary filters when main filter changes
  useEffect(() => {
    setChartExerciseFilter(null)
  }, [mainFilter])

  // Filter exercises that have both rep and weight data
  const exercisesWithCompleteData = useMemo(() => {
    if (!sessions || sessions.length === 0) return []

    // Group sessions by exercise ID
    const exerciseGroups: Record<string, WorkoutSession[]> = {}

    sessions.forEach((session) => {
      if (!exerciseGroups[session.exerciseId]) {
        exerciseGroups[session.exerciseId] = []
      }
      exerciseGroups[session.exerciseId].push(session)
    })

    // Filter exercises that have both rep and weight data
    return Object.entries(exerciseGroups)
      .filter(([_, exerciseSessions]) => {
        return exerciseSessions.some((session) => session.weight > 0 && session.reps > 0)
      })
      .map(([exerciseId, exerciseSessions]) => {
        if (!exerciseSessions || exerciseSessions.length === 0) {
          return {
            id: exerciseId,
            name: "Unknown Exercise",
            dayId: "push", // Default value
          }
        }
        return {
          id: exerciseId,
          name: exerciseSessions[0]?.exerciseName || "Unknown Exercise",
          dayId: exerciseSessions[0]?.dayId || "push",
        }
      })
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
  }, [sessions])

  // Filter exercises by main filter for chart
  const filteredExercisesForChart = useMemo(() => {
    if (!mainFilter) return exercisesWithCompleteData
    return exercisesWithCompleteData.filter((exercise) => exercise.dayId === mainFilter)
  }, [exercisesWithCompleteData, mainFilter])

  // Get icon for workout type
  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case "push":
        return <ArrowUp className="h-4 w-4" />
      case "pull":
        return <ArrowDown className="h-4 w-4" />
      case "leg":
        return <Footprints className="h-4 w-4" />
      default:
        return <BarChart3 className="h-4 w-4" />
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const header = (
    <>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#34A853] shadow-sm">
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Progress</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Track your workout performance</p>
        </div>
      </div>

      <div className="mt-4">
        <Tabs
          value={mainFilter || "all"}
          onValueChange={(value) => setMainFilter(value === "all" ? null : value)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full rounded-full p-1.5 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/30">
            <TabsTrigger
              value="all"
              className="rounded-full data-[state=active]:bg-zinc-700 data-[state=active]:shadow-inner flex items-center gap-2 py-2"
            >
              {getWorkoutIcon("all")}
              <span>All</span>
            </TabsTrigger>
            <TabsTrigger
              value="push"
              className="rounded-full data-[state=active]:text-push-dark flex items-center gap-2 py-2"
              style={{
                backgroundColor:
                  mainFilter === "push"
                    ? `color-mix(in srgb, ${getWorkoutDayColor("push", colorMode)} 15%, transparent)`
                    : undefined,
              }}
            >
              {getWorkoutIcon("push")}
              <span>Push</span>
            </TabsTrigger>
            <TabsTrigger
              value="pull"
              className="rounded-full data-[state=active]:text-pull-dark flex items-center gap-2 py-2"
              style={{
                backgroundColor:
                  mainFilter === "pull"
                    ? `color-mix(in srgb, ${getWorkoutDayColor("pull", colorMode)} 15%, transparent)`
                    : undefined,
              }}
            >
              {getWorkoutIcon("pull")}
              <span>Pull</span>
            </TabsTrigger>
            <TabsTrigger
              value="leg"
              className="rounded-full data-[state=active]:text-leg-dark flex items-center gap-2 py-2"
              style={{
                backgroundColor:
                  mainFilter === "leg"
                    ? `color-mix(in srgb, ${getWorkoutDayColor("leg", colorMode)} 15%, transparent)`
                    : undefined,
              }}
            >
              {getWorkoutIcon("leg")}
              <span>Legs</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </>
  )

  return (
    <CollapsibleHeaderLayout
      header={header}
      initialHeaderHeight={160}
      collapseThreshold={60}
    >
      <motion.div 
        className="space-y-12" 
        initial="hidden" 
        animate="visible" 
        variants={containerVariants}
      >
        {/* Monthly Summary Table */}
        <motion.div className="space-y-4" variants={itemVariants}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="inline-block h-6 w-1 bg-gradient-to-b from-push-dark to-pull-dark rounded-full"></span>
              Monthly Summary
            </h3>
          </div>

          <MonthlySummaryTable sessions={sessions} mainFilter={mainFilter} />
        </motion.div>

        {/* Progress Chart */}
        <motion.div className="space-y-4" variants={itemVariants}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-medium flex items-center gap-2 whitespace-nowrap">
              <span className="inline-block h-6 w-1 bg-gradient-to-b from-pull-dark to-leg-dark rounded-full"></span>
              Progress Chart
            </h3>

            {/* Chart Exercise Filter */}
            <Select
              value={chartExerciseFilter || "all"}
              onValueChange={(value) => setChartExerciseFilter(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-full sm:w-[240px] h-10 min-touch-target rounded-full bg-zinc-800/50 backdrop-blur-sm border-zinc-700/30 px-4">
                <SelectValue placeholder="All exercises" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-zinc-700/30 backdrop-blur-sm bg-zinc-800/90 min-w-[240px]">
                <SelectItem value="all" className="rounded-lg my-1 px-4">
                  All exercises
                </SelectItem>
                {filteredExercisesForChart.length > 0 ? (
                  filteredExercisesForChart.map((exercise) => (
                    <SelectItem 
                      key={exercise.id} 
                      value={exercise.id} 
                      className="rounded-lg my-1 px-4"
                    >
                      <div className="flex items-center gap-2.5 whitespace-nowrap">
                        <span
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getWorkoutDayColor(exercise.dayId, colorMode) }}
                        ></span>
                        <span className="truncate">{exercise.name}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled className="rounded-lg my-1 px-4">
                    No exercises available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <ModernProgressChart sessions={sessions} mainFilter={mainFilter} exerciseFilter={chartExerciseFilter} />
          </div>
        </motion.div>
      </motion.div>
    </CollapsibleHeaderLayout>
  )
}
