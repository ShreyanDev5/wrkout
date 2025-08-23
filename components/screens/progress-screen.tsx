"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ModernProgressChart } from "@/components/modern-progress-chart"
import { MonthlySummaryTable } from "@/components/monthly-summary-table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { WorkoutLog } from "@/lib/types"
import { getWorkoutDayColor, getExerciseWorkoutType } from "@/lib/utils"
import { useTheme } from "@/components/theme-context"
import { ArrowUp, ArrowDown, Footprints, BarChart3 } from "lucide-react"
import { motion } from "framer-motion"
import { saveLastProgressState, loadLastProgressState } from "@/lib/storage"


interface ProgressScreenProps {
  logs: WorkoutLog[]
}

export function ProgressScreen({ logs }: ProgressScreenProps) {
  const { colorMode } = useTheme()
  
  const [mainFilter, setMainFilter] = useState<string | null>("push")
  const [chartExerciseFilter, setChartExerciseFilter] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Set loading state based on logs
  useEffect(() => {
    // Only set loading to false if we have logs or if logs is an empty array (meaning data has been loaded)
    if (logs !== undefined) {
      setIsLoading(false)
    }
  }, [logs])

  // Load the last progress state from localStorage on component mount
  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const savedState = await loadLastProgressState()
        // Set to saved filter or default to "push"
        setMainFilter(savedState.mainFilter || "push")
        setChartExerciseFilter(savedState.chartExerciseFilter)
        setIsInitialized(true)
      } catch (error) {
        // Default to "push" if there's an error loading saved state
        setMainFilter("push")
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
      })
    }
  }, [mainFilter, chartExerciseFilter, isInitialized])

  // Reset secondary filters when main filter changes
  useEffect(() => {
    setChartExerciseFilter(null)
  }, [mainFilter])

  // Group logs by exercise_name
  const exercisesWithCompleteData = useMemo(() => {
    if (!logs || logs.length === 0) return []

    // Group logs by exercise_name
    const exerciseGroups: Record<string, WorkoutLog[]> = {}

    logs.forEach((log) => {
      if (!exerciseGroups[log.exercise_name]) {
        exerciseGroups[log.exercise_name] = []
      }
      exerciseGroups[log.exercise_name].push(log)
    })

    // Get exercises with valid data (both weight and reps)
    const validExercises = Object.entries(exerciseGroups)
      .filter(([_, exerciseLogs]) => {
        return exerciseLogs.some((log) => log.weight > 0 && log.avg_reps > 0)
      })
      .map(([name, exerciseLogs]) => {
        // Get the most recent log for this exercise
        const mostRecentLog = [...exerciseLogs]
          .sort((a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime())[0]
        
        return {
          name,
          lastPerformed: mostRecentLog?.performed_at,
          maxWeight: Math.max(...exerciseLogs.map(log => log.weight)),
          maxReps: Math.max(...exerciseLogs.map(log => log.avg_reps)),
        }
      })
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    
    return validExercises
  }, [logs])

  // Filter exercises by main filter for chart
  const filteredExercisesForChart = useMemo(() => {
    // If no filter is set, return all exercises (shouldn't happen with our new implementation)
    if (!mainFilter) return exercisesWithCompleteData
    
    return exercisesWithCompleteData.filter(exercise => {
      const exerciseType = getExerciseWorkoutType(exercise.name)
      return exerciseType === mainFilter.toLowerCase()
    })
  }, [exercisesWithCompleteData, mainFilter])

  // Get icon for workout type
  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case "push":
        return <ArrowUp className="h-4 w-4 md:h-5 md:w-5" />
      case "pull":
        return <ArrowDown className="h-4 w-4 md:h-5 md:w-5" />
      case "leg":
        return <Footprints className="h-4 w-4 md:h-5 md:w-5" />
      default:
        return <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
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

  return (
    <Card className="border-0 shadow-none dark:bg-background max-w-3xl mx-auto w-full">
      <CardHeader className="px-4">
        <div className="space-y-6 sm:space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#34A853] shadow-sm">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Progress</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Track your workout.</p>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="w-full">
            <Tabs
              value={mainFilter || "push"}
              onValueChange={(value) => setMainFilter(value)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 w-full rounded-full p-1.5 md:p-2 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/30 shadow-sm">
                <TabsTrigger
                  value="push"
                  className={`rounded-full flex items-center justify-center gap-1.5 md:gap-2 py-2 md:py-2.5 px-2.5 md:px-4 text-sm md:text-base font-medium transition-all ${mainFilter === "push" ? 'text-push-dark' : 'text-muted-foreground hover:text-foreground/80'}`}
                  style={{
                    backgroundColor: mainFilter === "push"
                      ? `color-mix(in srgb, ${getWorkoutDayColor("push", colorMode)} 15%, transparent)`
                      : undefined,
                  }}
                >
                  {getWorkoutIcon("push")}
                  <span>Push</span>
                  {mainFilter === "push" && (
                    <span className="ml-1.5 text-xs font-medium px-1.5 py-0.5 rounded-full bg-push-dark/10 text-push-dark">
                      {filteredExercisesForChart.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="pull"
                  className={`rounded-full flex items-center justify-center gap-1.5 md:gap-2 py-2 md:py-2.5 px-2.5 md:px-4 text-sm md:text-base font-medium transition-all ml-1 md:ml-1.5 ${mainFilter === "pull" ? 'text-pull-dark' : 'text-muted-foreground hover:text-foreground/80'}`}
                  style={{
                    backgroundColor: mainFilter === "pull"
                      ? `color-mix(in srgb, ${getWorkoutDayColor("pull", colorMode)} 15%, transparent)`
                      : undefined,
                  }}
                >
                  {getWorkoutIcon("pull")}
                  <span>Pull</span>
                  {mainFilter === "pull" && (
                    <span className="ml-1.5 text-xs font-medium px-1.5 py-0.5 rounded-full bg-pull-dark/10 text-pull-dark">
                      {filteredExercisesForChart.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="leg"
                  className={`rounded-full flex items-center justify-center gap-1.5 md:gap-2 py-2 md:py-2.5 px-2.5 md:px-4 text-sm md:text-base font-medium transition-all ml-1.5 md:ml-2 ${mainFilter === "leg" ? 'text-leg-dark' : 'text-muted-foreground hover:text-foreground/80'}`}
                  style={{
                    backgroundColor: mainFilter === "leg"
                      ? `color-mix(in srgb, ${getWorkoutDayColor("leg", colorMode)} 15%, transparent)`
                      : undefined,
                  }}
                >
                  {getWorkoutIcon("leg")}
                  <span>Legs</span>
                  {mainFilter === "leg" && (
                    <span className="ml-1.5 text-xs font-medium px-1.5 py-0.5 rounded-full bg-leg-dark/10 text-leg-dark">
                      {filteredExercisesForChart.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4">
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

            <MonthlySummaryTable logs={logs} mainFilter={mainFilter} />
          </motion.div>

          {/* Progress Chart */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
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
                        key={exercise.name} 
                        value={exercise.name} 
                        className="rounded-lg my-1 px-4"
                      >
                        <div className="flex items-center gap-2.5 whitespace-nowrap">
                          <span
                            className="h-2 w-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getWorkoutDayColor(getExerciseWorkoutType(exercise.name) || "push", colorMode) }}
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

            <div className="pt-2">
              <ModernProgressChart logs={logs} mainFilter={mainFilter} exerciseFilter={chartExerciseFilter} />
            </div>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  )
}
