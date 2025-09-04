"use client"

import { format } from "date-fns"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { getWorkoutDayColor, getExerciseWorkoutType } from "@/lib/utils"
import { useTheme } from "@/components/theme-context"
import type { WeeklyWorkoutData } from "@/lib/types"
import { motion } from "framer-motion"

interface ExerciseSummaryCardProps {
  exercise: WeeklyWorkoutData
  weekLabels: string[]
}

export function ExerciseSummaryCard({ exercise, weekLabels }: ExerciseSummaryCardProps) {
  const { colorMode } = useTheme()
  const workoutType = getExerciseWorkoutType(exercise.exerciseName)
  const dayColor = workoutType ? getWorkoutDayColor(workoutType, colorMode) : 'hsl(var(--muted))'
  
  // Function to render simplified trend indicator
  const renderTrend = (current: number | null, previous: number | null) => {
    // Handle edge cases
    if (!current || !previous || previous === 0) return null
    const diff = current - previous
    
    // Consider changes less than 1kg/reps as neutral
    if (Math.abs(diff) < 1) return <Minus className="h-4 w-4 text-muted-foreground" />
    
    if (diff > 0) {
      return <TrendingUp className="h-4 w-4 text-emerald-500" />
    } else {
      return <TrendingDown className="h-4 w-4 text-rose-500" />
    }
  }

  // Get the most recent week data
  const weekData = exercise.weeks[weekLabels[0]]
  const previousWorkout = exercise.previousWorkout

  return (
    <motion.div 
      className="rounded-2xl p-4 transition-all duration-300 bg-background/80 backdrop-blur-xl border border-border/50 shadow-sm hover:shadow-md"
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div 
            className="w-1 h-8 rounded-full flex-shrink-0"
            style={{ backgroundColor: dayColor }}
          />
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate text-base" title={exercise.exerciseName}>
              {exercise.exerciseName}
            </h3>
          </div>
        </div>
      </div>
      
      {weekData ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-muted/20 rounded-xl p-3 backdrop-blur-sm border border-border/30">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground font-medium tracking-wide">Weight</div>
              {weekData && previousWorkout && (
                <motion.div 
                  className="flex items-center gap-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderTrend(weekData.weight, previousWorkout.weight)}
                </motion.div>
              )}
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-foreground">
                {weekData.weight}
              </span>
              <span className="text-sm text-muted-foreground">kg</span>
            </div>
          </div>
          
          <div className="bg-muted/20 rounded-xl p-3 backdrop-blur-sm border border-border/30">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground font-medium tracking-wide">Reps</div>
              {weekData && previousWorkout && (
                <motion.div 
                  className="flex items-center gap-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                >
                  {renderTrend(weekData.reps, previousWorkout.reps)}
                </motion.div>
              )}
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-foreground">
                {weekData.reps}
              </span>
              <span className="text-sm text-muted-foreground">reps</span>
            </div>
          </div>
          
          <div className="col-span-2 bg-muted/20 rounded-xl p-3 backdrop-blur-sm border border-border/30">
            <div className="text-xs text-muted-foreground font-medium tracking-wide">Last Performed</div>
            <div className="text-sm font-medium text-foreground mt-1">
              {format(new Date(weekData.date), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 text-center py-6 text-muted-foreground text-sm">
          No data available
        </div>
      )}
    </motion.div>
  )
}