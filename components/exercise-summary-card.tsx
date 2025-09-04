"use client"

import { format } from "date-fns"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { getWorkoutDayColor, getExerciseWorkoutType } from "@/lib/utils"
import { useTheme } from "@/components/theme-context"
import type { WeeklyWorkoutData } from "@/lib/types"

interface ExerciseSummaryCardProps {
  exercise: WeeklyWorkoutData
  weekLabels: string[]
  isSelected: boolean
  onSelect: () => void
}

export function ExerciseSummaryCard({ exercise, weekLabels, isSelected, onSelect }: ExerciseSummaryCardProps) {
  const { colorMode } = useTheme()
  const workoutType = getExerciseWorkoutType(exercise.exerciseName)
  const dayColor = workoutType ? getWorkoutDayColor(workoutType, colorMode) : 'hsl(var(--muted))'
  
  // Function to render simplified trend indicator
  const renderTrend = (current: number | null, previous: number | null) => {
    // Handle edge cases
    if (!current || !previous || previous === 0) return null
    const diff = current - previous
    
    // Consider changes less than 1kg as neutral
    if (Math.abs(diff) < 1) return <Minus className="h-4 w-4 text-muted-foreground" />
    
    if (diff > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    }
  }

  // Get the most recent week data
  const weekData = exercise.weeks[weekLabels[0]]
  const previousWorkout = exercise.previousWorkout

  return (
    <div 
      className={`border rounded-xl p-4 shadow-sm transition-all cursor-pointer ${
        isSelected 
          ? 'bg-muted/30 border-primary ring-2 ring-primary/20' 
          : 'bg-background border-border/60 hover:bg-muted/10'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div 
            className="w-2 h-8 rounded-full flex-shrink-0"
            style={{ backgroundColor: dayColor }}
          />
          <div className="min-w-0">
            <h3 className="font-medium text-foreground truncate" title={exercise.exerciseName}>
              {exercise.exerciseName}
            </h3>
          </div>
        </div>
        
        {weekData && previousWorkout && (
          <div className="flex-shrink-0">
            {renderTrend(weekData.weight, previousWorkout.weight)}
          </div>
        )}
      </div>
      
      {weekData ? (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Weight</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-foreground">
                {weekData.weight}
              </span>
              <span className="text-sm text-muted-foreground">kg</span>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Reps</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-foreground">
                {weekData.reps}
              </span>
              <span className="text-sm text-muted-foreground">reps</span>
            </div>
          </div>
          
          <div className="col-span-2 bg-muted/30 rounded-lg p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Last Performed</div>
            <div className="text-sm font-medium text-foreground mt-1">
              {format(new Date(weekData.date), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 text-center py-6 text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  )
}