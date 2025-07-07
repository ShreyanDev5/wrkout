"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CircularProgress } from "@/components/ui/circular-progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DayExercises } from "@/components/day-exercises"
import { EmptyWorkoutState } from "@/components/empty-workout-state"
import { useTheme } from "@/components/theme-context"
import type { Workout, WorkoutLog, WorkoutDay } from "@/lib/types"
import { getWorkoutDayColor, getWorkoutDayIcon } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { saveLastWorkoutSection, loadLastWorkoutSection } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface WorkoutScreenProps {
  workouts: Workout[]
  workoutDays: WorkoutDay[]
  onAddWorkoutLog: (log: WorkoutLog) => void | Promise<void>
}

export function WorkoutScreen({
  workouts,
  workoutDays,
  onAddWorkoutLog,
}: WorkoutScreenProps) {
  const [selectedWorkout, setSelectedWorkout] = useState(workouts[0]?.id || "")
  const [selectedDay, setSelectedDay] = useState<"push" | "pull" | "leg">("push") // Default value, will be updated from localStorage
  const [tickCounter, setTickCounter] = useState(0) // Force re-render when exercises are toggled
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [hasTickedExercises, setHasTickedExercises] = useState(false)
  const { colorMode } = useTheme()
  
  // Check if there are any ticked exercises for the current day
  const checkTickedExercises = useCallback(() => {
    if (typeof window !== 'undefined' && selectedDay) {
      const ticked = localStorage.getItem(`tickedExercises-${selectedDay}`)
      setHasTickedExercises(!!ticked && JSON.parse(ticked).length > 0)
    } else {
      setHasTickedExercises(false)
    }
  }, [selectedDay])

  // Clear all ticked exercises for the current day
  const resetTickedExercises = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`tickedExercises-${selectedDay}`)
      setTickCounter(prev => prev + 1)
      setIsResetDialogOpen(false)
      setHasTickedExercises(false)
    }
  }, [selectedDay])

  // Check for ticked exercises when selectedDay changes
  useEffect(() => {
    checkTickedExercises()
  }, [checkTickedExercises, tickCounter])

  // Force a re-render when exercises are toggled
  const handleExerciseToggled = useCallback(() => {
    setTickCounter(prev => prev + 1)
  }, [])

  const [isInitialized, setIsInitialized] = useState(false)

  // Load the last selected day from localStorage on component mount
  useEffect(() => {
    const loadSavedSection = async () => {
      try {
        const savedDay = await loadLastWorkoutSection()
        if (savedDay && ["push", "pull", "leg"].includes(savedDay)) {
          setSelectedDay(savedDay as "push" | "pull" | "leg")
        }
        setIsInitialized(true)
      } catch (error) {
        console.error("Error loading last workout section:", error)
        setIsInitialized(true)
      }
    }
    
    loadSavedSection()
  }, [])
  
  // Load ticked exercises when selectedDay changes
  const loadTickedExercises = useCallback((day: string) => {
    try {
      if (typeof window === 'undefined') return []
      const stored = localStorage.getItem(`tickedExercises-${day}`)
      return stored ? JSON.parse(stored) as string[] : []
    } catch (error) {
      console.error('Error loading ticked exercises:', error)
      return []
    }
  }, [])

  // Save the selected workout section to localStorage whenever it changes
  useEffect(() => {
    // Only save after initial load to prevent overwriting with default value
    if (isInitialized) {
      saveLastWorkoutSection(selectedDay).catch((error) => {
        console.error("Error saving last workout section:", error)
      })
    }
  }, [selectedDay, isInitialized])

  // Handle workout day selection
  const handleDayChange = (day: string) => {
    if (day === "push" || day === "pull" || day === "leg") {
      setSelectedDay(day)
    }
  }

  // Start a workout (for empty state)
  const startWorkout = useCallback(() => {
    // This function is used by EmptyWorkoutState component
    // In a real app, you might want to do something specific when starting a workout
  }, [])

  // Get the current workout data
  const currentWorkout = workouts.find((w) => w.id === selectedWorkout)
  // Get the days for the current workout
  const currentWorkoutDays = workoutDays.filter((d) => d.workout_id === selectedWorkout)

  // Calculate progress for the current day
  const calculateProgress = useCallback((dayType: string) => {
    const day = currentWorkoutDays.find(d => d.day_id === dayType)
    if (!day || !day.exercises?.length) return 0
    // Force dependency on tickCounter to recalculate when exercises are toggled
    const ticked = loadTickedExercises(dayType)
    const totalExercises = day.exercises.length
    const completedExercises = day.exercises.filter(ex => ticked.includes(ex.id)).length
    return totalExercises > 0 
      ? Math.min(Math.round((completedExercises / totalExercises) * 100), 100)
      : 0
  }, [currentWorkoutDays, tickCounter, loadTickedExercises])
  
  // Calculate progress for the current day
  const activeProgress = useMemo(() => calculateProgress(selectedDay), [calculateProgress, selectedDay])

  if (workouts.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">No workouts available. Add a workout in Settings.</p>
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-none dark:bg-background max-w-3xl mx-auto w-full workout-selector">
      <CardHeader className="px-4">
        <div className="flex items-center w-full">
          <div className={`transition-all duration-200 ${selectedWorkout && hasTickedExercises ? 'flex-1' : 'w-full'}`}>
            <Select value={selectedWorkout} onValueChange={setSelectedWorkout} disabled={workouts.length === 0}>
              <SelectTrigger className="w-full h-9 text-sm">
                <SelectValue placeholder="Select Workout" className="truncate" />
              </SelectTrigger>
              <SelectContent>
                {workouts.map((workout) => (
                  <SelectItem key={workout.id} value={workout.id}>
                    {workout.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedWorkout && hasTickedExercises && (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-9 w-9 flex-shrink-0 ml-1.5"
              onClick={() => setIsResetDialogOpen(true)}
              aria-label="Reset workout progress"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <Tabs value={selectedDay} onValueChange={handleDayChange} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4 modern-tabs-list workout-tabs-container">
            <TabsTrigger
              value="push"
              className="flex items-center gap-2 min-touch-target focus-visible-ring modern-tab-trigger workout-tab-button"
              style={{
                backgroundColor:
                  selectedDay === "push"
                    ? `color-mix(in srgb, ${getWorkoutDayColor("push", colorMode)} 15%, transparent)`
                    : undefined,
                color: selectedDay === "push" ? getWorkoutDayColor("push", colorMode) : undefined,
              }}
              aria-label="Push day"
            >
              {getWorkoutDayIcon("push", true)}
              <span className="font-medium">PUSH</span>
            </TabsTrigger>
            <TabsTrigger
              value="pull"
              className="flex items-center gap-2 min-touch-target focus-visible-ring modern-tab-trigger workout-tab-button"
              style={{
                backgroundColor:
                  selectedDay === "pull"
                    ? `color-mix(in srgb, ${getWorkoutDayColor("pull", colorMode)} 15%, transparent)`
                    : undefined,
                color: selectedDay === "pull" ? getWorkoutDayColor("pull", colorMode) : undefined,
              }}
              aria-label="Pull day"
            >
              {getWorkoutDayIcon("pull", true)}
              <span className="font-medium">PULL</span>
            </TabsTrigger>
            <TabsTrigger
              value="leg"
              className="flex items-center gap-2 min-touch-target focus-visible-ring modern-tab-trigger workout-tab-button"
              style={{
                backgroundColor:
                  selectedDay === "leg"
                    ? `color-mix(in srgb, ${getWorkoutDayColor("leg", colorMode)} 15%, transparent)`
                    : undefined,
                color: selectedDay === "leg" ? getWorkoutDayColor("leg", colorMode) : undefined,
              }}
              aria-label="Leg day"
            >
              {getWorkoutDayIcon("leg", true)}
              <span className="font-medium">LEG</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex justify-center my-4">
            <CircularProgress 
              value={activeProgress}
              category={selectedDay}
              size="md"
              showLabel={false}
            />
          </div>
          {currentWorkoutDays.map((day) => (
            <TabsContent key={day.id} value={day.day_id} className="mt-0">
              {day.exercises.length > 0 ? (
                <DayExercises
                  key={`${day.id}-${tickCounter}`}
                  exercises={day.exercises}
                  dayId={day.day_id}
                  workoutId={day.workout_id}
                  onLogWorkout={(log) => {
                    onAddWorkoutLog({ ...log, workout_day_id: day.id })
                  }}
                  onExerciseToggled={handleExerciseToggled}
                  dayColor={getWorkoutDayColor(day.day_id, colorMode)}
                />
              ) : (
                <EmptyWorkoutState dayId={day.day_id} onStart={startWorkout} />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Workout Progress</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all completed exercises for {selectedDay.toUpperCase()} day? 
              This will clear your checkmarks but will not affect your workout history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetTickedExercises} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
