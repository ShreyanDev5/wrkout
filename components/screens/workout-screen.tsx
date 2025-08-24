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
import { ResetConfirmationModal } from '@/components/reset-confirmation-modal'

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
  }, [currentWorkoutDays, loadTickedExercises])
  
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
          <DialogContent className="w-[92%] max-w-[320px] md:max-w-[400px] dark:bg-background/90 dark:border-opacity-10 rounded-xl mx-auto p-4 shadow-lg backdrop-blur-xl">
            <DialogHeader>
              <div className="flex flex-col items-center gap-1.5 mb-1.5">
                <PlusCircle className="h-5 w-5 text-[#34A853]" aria-hidden="true" />
                <DialogTitle className="line-height-readable text-center text-base">Add New Workout</DialogTitle>
              </div>
            </DialogHeader>
            <div className="pt-2 pb-3">
              <p className="line-height-readable text-center mb-4 text-sm md:text-base text-muted-foreground">
                Create a new workout routine. Workouts contain days and exercises.
              </p>
              <Label htmlFor="workout-name" className="block text-center mb-1.5 text-sm">Workout Name</Label>
              <Input
                id="workout-name"
                value={newWorkoutName}
                onChange={(e) => setNewWorkoutName(e.target.value)}
                placeholder="Enter workout name"
                className="mt-1.5 text-sm px-2.5 py-1.5 rounded-md"
              />
            </div>
            <div className="flex flex-row justify-between gap-2 mt-3.5 w-full">
              <button
                type="button"
                onClick={() => setIsAddWorkoutOpen(false)}
                className="flex-1 px-2.5 py-2 rounded-md border font-semibold bg-muted hover:bg-muted/80 transition-colors focus-visible:ring outline-none dark:border-opacity-10 dark:hover:bg-secondary text-sm"
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
                className="flex-1 px-2.5 py-2 rounded-md border font-semibold bg-[#34A853] text-white hover:bg-[#2D9249] transition-colors focus-visible:ring outline-none dark:border-none dark:shadow-none text-sm"
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
    <Card className="border-0 shadow-none dark:bg-background max-w-3xl mx-auto w-full workout-selector premium-card">
      <CardHeader className="px-4 sm:px-5 pt-5 pb-3">
        <div className="workout-header-container">
          <div className={`transition-all duration-200 workout-select ${selectedWorkout && hasTickedExercises ? 'flex-1' : 'w-full'}`}>
            <Select value={selectedWorkout} onValueChange={setSelectedWorkout} disabled={workouts.length === 0}>
              <SelectTrigger className="w-full min-touch-target">
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
              className="reset-button-premium"
              onClick={() => setIsResetDialogOpen(true)}
              aria-label="Reset workout progress"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-4 pt-0 pb-2">
        <Tabs value={selectedDay} onValueChange={handleDayChange} className="w-full">
          <TabsList className="flex flex-nowrap justify-center mb-3 rounded-full bg-secondary/30 backdrop-blur-sm border border-border/50 h-auto p-1 gap-2 w-full md:justify-center md:gap-3">
            {['push', 'pull', 'leg'].map((day) => (
              <TabsTrigger
                key={day}
                value={day}
                className={cn(
                  'flex-1 text-xs whitespace-nowrap',
                  'flex items-center justify-center gap-1 focus-visible-ring modern-tab-trigger workout-tab-button rounded-full transition-all duration-200 data-[state=active]:shadow-sm',
                  'py-1.5 px-2 xs:py-2 xs:px-2.5 sm:py-2 sm:px-3 md:py-2 md:px-4 lg:py-2.5 lg:px-5',
                  'md:flex-none md:w-auto md:min-w-[100px] lg:min-w-[120px]'
                )}
                style={{
                  backgroundColor:
                    selectedDay === day
                      ? `color-mix(in srgb, ${getWorkoutDayColor(day, colorMode)} 15%, transparent)`
                      : 'transparent',
                  color: selectedDay === day ? getWorkoutDayColor(day, colorMode) : 'hsl(var(--muted-foreground))',
                  fontWeight: selectedDay === day ? 600 : 500,
                  boxShadow: selectedDay === day ? `0 2px 8px 0 rgba(${day === 'push' ? '249,217,73' : day === 'pull' ? '76,175,80' : '244,67,54'},0.12)` : 'none',
                }}
                aria-label={`${day.charAt(0).toUpperCase() + day.slice(1)} day`}
              >
                {getWorkoutDayIcon(day, true, 'h-4 w-4 xs:h-4 xs:w-4 sm:h-4 sm:w-4 md:h-5 md:w-5')}
                <span className="hidden xs:inline">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="flex justify-center progress-container">
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
      <ResetConfirmationModal
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={resetTickedExercises}
        dayColor="#EA4335"
        message={`Are you sure you want to reset all completed exercises for ${selectedDay.toUpperCase()} day? This will clear your checkmarks but will not affect your workout history.`}
      />
    </Card>
  )
}
