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
    
    // Consider changes less than 1kg/reps as neutral
    if (Math.abs(diff) < 1) return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
    
    if (diff > 0) {
      return <TrendingUp className="h-3.5 w-3.5 text-green-500" />
    } else {
      return <TrendingDown className="h-3.5 w-3.5 text-red-500" />
    }
  }

  // Get the most recent week data
  const weekData = exercise.weeks[weekLabels[0]]
  const previousWorkout = exercise.previousWorkout

  return (
    <div 
      className={`border rounded-xl p-3 transition-all cursor-pointer relative ${
        isSelected 
          ? 'ring-2 ring-offset-2 ring-offset-background border-transparent' 
          : 'bg-background border-border/60 hover:bg-muted/10'
      }`}
      style={{
        ...(isSelected && {
          boxShadow: `0 0 0 1px ${dayColor}, 0 0 15px 3px ${dayColor}30`
        })
      }}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            className="w-1.5 h-6 rounded-full flex-shrink-0"
            style={{ backgroundColor: dayColor }}
          />
          <div className="min-w-0">
            <h3 className="font-medium text-foreground truncate text-sm" title={exercise.exerciseName}>
              {exercise.exerciseName}
            </h3>
          </div>
        </div>
        
        {weekData && previousWorkout && (
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              {renderTrend(weekData.weight, previousWorkout.weight)}
              <span className="text-xs text-muted-foreground">kg</span>
            </div>
            <div className="flex items-center gap-1">
              {renderTrend(weekData.reps, previousWorkout.reps)}
              <span className="text-xs text-muted-foreground">reps</span>
            </div>
          </div>
        )}
      </div>
      
      {weekData ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Weight</div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold text-foreground">
                {weekData.weight}
              </span>
              <span className="text-xs text-muted-foreground">kg</span>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Reps</div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold text-foreground">
                {weekData.reps}
              </span>
              <span className="text-xs text-muted-foreground">reps</span>
            </div>
          </div>
          
          <div className="col-span-2 bg-muted/30 rounded-lg p-2">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Last Performed</div>
            <div className="text-xs font-medium text-foreground mt-0.5">
              {format(new Date(weekData.date), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 text-center py-4 text-muted-foreground text-sm">
          No data available
        </div>
      )}
    </div>
  )
}