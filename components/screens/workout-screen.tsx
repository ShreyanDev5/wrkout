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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle } from "lucide-react"
import { v4 as uuidv4 } from 'uuid'

interface WorkoutScreenProps {
  workouts: Workout[]
  workoutDays: WorkoutDay[]
  onAddWorkoutLog: (log: WorkoutLog) => void | Promise<void>
}

export function WorkoutScreen({
  workouts,
  workoutDays,
  onAddWorkoutLog,
  onUpdateWorkoutsAndDays, // <-- Add this prop
}: WorkoutScreenProps & { onUpdateWorkoutsAndDays: (workouts: Workout[], workoutDays: WorkoutDay[]) => void }) {
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
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false)
  const [newWorkoutName, setNewWorkoutName] = useState("")

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
      return []
    }
  }, [])

  // Save the selected workout section to localStorage whenever it changes
  useEffect(() => {
    // Only save after initial load to prevent overwriting with default value
    if (isInitialized) {
      saveLastWorkoutSection(selectedDay).catch((error) => {
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
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <p className="text-muted-foreground text-base sm:text-lg text-center px-4 py-2 leading-relaxed">
          No workouts available.<br className="hidden sm:block" />
          <span className="block mt-1">Add a workout to get started.</span>
        </p>
        <Button
          onClick={() => setIsAddWorkoutOpen(true)}
          className="rounded-md bg-[#34A853] hover:bg-[#2D9249] text-white border-none shadow-sm px-6 py-2 text-base font-semibold"
          aria-label="Add new workout"
        >
          <PlusCircle className="h-5 w-5 mr-2" aria-hidden="true" />
          Add Workout
        </Button>
        <Dialog open={isAddWorkoutOpen} onOpenChange={setIsAddWorkoutOpen}>
          <DialogContent className="w-full max-w-sm dark:bg-background dark:border-opacity-10 rounded-lg mx-auto">
            <DialogHeader>
              <div className="flex flex-col items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#34A853]" aria-hidden="true" />
                <DialogTitle className="line-height-readable text-center text-base sm:text-lg">Add New Workout</DialogTitle>
              </div>
            </DialogHeader>
            <div className="py-3 sm:py-4">
              <p className="line-height-readable text-center mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground">
                Create a new workout routine. Workouts contain days and exercises.
              </p>
              <Label htmlFor="workout-name" className="block text-center mb-1.5 sm:mb-2 text-sm">Workout Name</Label>
              <Input
                id="workout-name"
                value={newWorkoutName}
                onChange={(e) => setNewWorkoutName(e.target.value)}
                placeholder="Enter workout name"
                className="mt-1.5 sm:mt-2 text-sm"
              />
            </div>
            <div className="flex flex-row justify-between gap-2 mt-1.5 sm:mt-2 w-full">
              <button
                type="button"
                onClick={() => setIsAddWorkoutOpen(false)}
                className="min-w-[120px] sm:min-w-[140px] px-3 sm:px-4 py-2 rounded-lg border font-semibold bg-muted hover:bg-muted/80 transition-colors focus-visible:ring outline-none dark:border-opacity-10 dark:hover:bg-secondary text-sm"
                aria-label="Cancel add workout"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newWorkoutName.trim()) return
                  let userId = "";
                  if (workouts && workouts.length > 0) {
                    userId = workouts[0]?.user_id || "";
                  } else if (typeof window !== 'undefined') {
                    // Try to get userId from localStorage or a global context if available
                    userId = window.localStorage.getItem('wrkout-user-id') || "";
                  }
                  const newWorkout: Workout = {
                    id: uuidv4(),
                    user_id: userId,
                    name: newWorkoutName,
                    days: [],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  }
                  onUpdateWorkoutsAndDays([...(workouts || []), newWorkout], workoutDays)
                  setNewWorkoutName("")
                  setIsAddWorkoutOpen(false)
                }}
                className="min-w-[120px] sm:min-w-[140px] px-3 sm:px-4 py-2 rounded-lg border font-semibold bg-[#34A853] text-white hover:bg-[#2D9249] transition-colors focus-visible:ring outline-none dark:border-none dark:shadow-none text-sm"
                aria-label="Confirm add workout"
              >
                Add Workout
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-none dark:bg-background max-w-3xl mx-auto w-full workout-selector">
      <CardHeader className="px-3 sm:px-4">
        <div className="flex items-center w-full">
          <div className={`transition-all duration-200 ${selectedWorkout && hasTickedExercises ? 'flex-1' : 'w-full'}`}>
            <Select value={selectedWorkout} onValueChange={setSelectedWorkout} disabled={workouts.length === 0}>
              <SelectTrigger className="w-full h-8 sm:h-9 text-sm">
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
              className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 ml-1.5"
              onClick={() => setIsResetDialogOpen(true)}
              aria-label="Reset workout progress"
            >
              <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-4">
        <Tabs value={selectedDay} onValueChange={handleDayChange} className="w-full">
          <TabsList className="grid grid-cols-3 mb-3 sm:mb-4 modern-tabs-list workout-tabs-container">
            <TabsTrigger
              value="push"
              className="flex items-center gap-1.5 sm:gap-2 min-touch-target focus-visible-ring modern-tab-trigger workout-tab-button text-xs sm:text-sm"
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
              className="flex items-center gap-1.5 sm:gap-2 min-touch-target focus-visible-ring modern-tab-trigger workout-tab-button text-xs sm:text-sm"
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
              className="flex items-center gap-1.5 sm:gap-2 min-touch-target focus-visible-ring modern-tab-trigger workout-tab-button text-xs sm:text-sm"
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
          
          <div className="flex justify-center my-3 sm:my-4">
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
        <AlertDialogContent className="w-full max-w-sm mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Reset Workout Progress</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Are you sure you want to reset all completed exercises for {selectedDay.toUpperCase()} day? 
              This will clear your checkmarks but will not affect your workout history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetTickedExercises} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
