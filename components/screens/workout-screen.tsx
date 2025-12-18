"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CircularProgress } from "@/components/ui/circular-progress"
import { WorkoutLogModal } from "@/components/modals/workout-log-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DayExercises } from "@/components/day-exercises"
import { EmptyWorkoutState } from "@/components/dashboard/empty-workout-state"
import { useTheme } from "@/components/theme-context"
import type { Workout, WorkoutLog, WorkoutDay } from "@/lib/types"
import { getWorkoutDayColor, getWorkoutDayIcon } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { saveLastWorkoutSection, loadLastWorkoutSection, saveSelectedWorkout, loadSelectedWorkout } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { supabase } from "@/lib/supabase"
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
import { ResetConfirmationModal } from "@/components/modals/reset-confirmation-modal"

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
  const [selectedWorkout, setSelectedWorkout] = useState("")

  // Get the current workout data
  const currentWorkout = workouts.find((w) => w.id === selectedWorkout)
  // Get the days for the current workout
  const currentWorkoutDays = workoutDays.filter((d) => d.workout_id === selectedWorkout)

  const handleDayChange = (val: string) => {
    setSelectedDay(val as "push" | "pull" | "leg")
    // Optional: Save to local storage or URL state
    saveLastWorkoutSection(val)
  }


  const [selectedDay, setSelectedDay] = useState<"push" | "pull" | "leg">("push") // Default value, will be updated from localStorage
  const { colorMode } = useTheme()
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false)
  const [newWorkoutName, setNewWorkoutName] = useState("")
  const [isInitialized, setIsInitialized] = useState(false)

  // Start a workout (for empty state)
  const startWorkout = useCallback(() => {
    // Placeholder for specific start workout logic
  }, [])

  // Load saved data
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedDay = await loadLastWorkoutSection()
        if (savedDay && ["push", "pull", "leg"].includes(savedDay)) {
          setSelectedDay(savedDay as "push" | "pull" | "leg")
        }
        const savedWorkout = await loadSelectedWorkout()
        if (savedWorkout && workouts.some(w => w.id === savedWorkout)) {
          setSelectedWorkout(savedWorkout)
        } else if (workouts.length > 0) {
          setSelectedWorkout(workouts[0].id)
        }
        setIsInitialized(true)
      } catch (error) {
        if (workouts.length > 0 && !selectedWorkout) {
          setSelectedWorkout(workouts[0].id)
        }
        setIsInitialized(true)
      }
    }
    if (workouts.length > 0 && !selectedWorkout) {
      loadSavedData()
    }
  }, [workouts, selectedWorkout])

  /* -------------------------------------------------------------------------
   *  SESSION & STATE MANAGEMENT (SUPABASE)
   * ------------------------------------------------------------------------- */
  const [completedExerciseNames, setCompletedExerciseNames] = useState<Set<string>>(new Set())
  const [activeProgress, setActiveProgress] = useState(0)

  // Fetch today's logs for the selected workout to populate "completed" state
  const fetchSessionLogs = useCallback(async () => {
    if (!selectedWorkout) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('workout_logs')
        .select('exercise_name')
        .eq('workout_id', selectedWorkout)
        .eq('performed_at', today)

      if (error) {
        console.error('Error fetching session logs:', error)
        return
      }

      const completedSet = new Set(data?.map(log => log.exercise_name) || [])
      setCompletedExerciseNames(completedSet)
    } catch (err) {
      console.error('Failed to fetch session logs:', err)
    }
  }, [selectedWorkout])

  // Initial Fetch on changes
  useEffect(() => {
    fetchSessionLogs()
  }, [fetchSessionLogs])


  // Calculate Progress based on DB State (not localStorage)
  useEffect(() => {
    const day = currentWorkoutDays.find(d => d.day_id === selectedDay)
    if (!day || !day.exercises?.length) {
      setActiveProgress(0)
      return
    }
    const total = day.exercises.length
    const completed = day.exercises.filter(ex => completedExerciseNames.has(ex.name)).length

    // Smooth progress calculation
    const progress = Math.round((completed / total) * 100)
    setActiveProgress(progress)
  }, [selectedDay, currentWorkoutDays, completedExerciseNames])


  // Toggle Exercise (DB Operation)
  const handleToggleExercise = async (exerciseName: string, isCompleted: boolean) => {
    // 1. Optimistic Update
    setCompletedExerciseNames(prev => {
      const next = new Set(prev)
      if (isCompleted) next.add(exerciseName)
      else next.delete(exerciseName)
      return next
    })

    // 2. DB Operation
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (isCompleted) {
        // Create a log entry (Simplified "Checkmark" log)
        // Note: If you want to log real weight, user should use the "+" button. 
        // This is the "Quick Check" feature. We'll verify if we want to use last weights or just a placeholder.
        // For now, we'll insert a placeholder record to mark completion.
        await supabase.from('workout_logs').upsert({
          user_id: user.id,
          workout_id: selectedWorkout,
          exercise_name: exerciseName,
          weight: 0, // Placeholder
          avg_reps: 0, // Placeholder
          performed_at: today,
        }, { onConflict: 'user_id, exercise_name, performed_at' })
      } else {
        // Delete the log entry
        await supabase.from('workout_logs')
          .delete()
          .eq('user_id', user.id)
          .eq('workout_id', selectedWorkout)
          .eq('exercise_name', exerciseName)
          .eq('performed_at', today)
      }
    } catch (error) {
      console.error('Error toggling exercise:', error)
      // Revert if error (optional, but good practice)
      fetchSessionLogs() // Re-sync
    }
  }


  // Reset Session (Delete all today's logs for this day)
  const resetSession = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Find exercises for current day
      const day = currentWorkoutDays.find(d => d.day_id === selectedDay)
      if (!day) return

      const names = day.exercises.map(ex => ex.name)

      await supabase.from('workout_logs')
        .delete()
        .eq('user_id', user.id)
        .eq('performed_at', today)
        .in('exercise_name', names)

      // Refresh
      fetchSessionLogs()
      setIsResetDialogOpen(false)
    } catch (err) {
      console.error('Failed to reset session', err)
    }
  }

  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <p className="text-muted-foreground text-base sm:text-lg text-center px-4 py-2 leading-tight">
          No workouts available.<br className="hidden sm:block" />
          <span className="block mt-0.5">Add a workout to get started.</span>
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
          <div className={`transition-all duration-200 workout-select ${selectedWorkout && activeProgress > 0 ? 'flex-1' : 'w-full'}`}>
            <Select
              value={selectedWorkout}
              onValueChange={(value) => {
                if (workouts.some(w => w.id === value)) {
                  setSelectedWorkout(value)
                  saveSelectedWorkout(value).catch((error) => {
                    // Error handling
                  })
                }
              }}
              disabled={workouts.length === 0}
            >
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
          {selectedWorkout && activeProgress > 0 && (
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
          <TabsList className="flex flex-nowrap justify-center mb-6 rounded-full bg-secondary/30 backdrop-blur-sm border border-border/50 h-auto p-1 gap-2 w-full md:justify-center md:gap-3">
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
                  boxShadow: selectedDay === day ? `0 2px 8px 0 rgba(${day === 'push' ? '249,217,73' : day === 'pull' ? '76,175,80' : '244,67,54'}, 0.12)` : 'none',
                }}
                aria-label={`${day.charAt(0).toUpperCase() + day.slice(1)} day`}
              >
                {getWorkoutDayIcon(day, true, 'h-4 w-4 xs:h-4 xs:w-4 sm:h-4 sm:w-4 md:h-5 md:w-5')}
                <span className="hidden xs:inline">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Progress Header - Minimalist Session Only */}
          {activeProgress > 0 && (
            <div className="mb-6 px-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Session Progress</span>
                <span>{activeProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${activeProgress}%`,
                    backgroundColor: getWorkoutDayColor(selectedDay, colorMode)
                  }}
                />
              </div>
            </div>
          )}

          {currentWorkoutDays.map((day) => (
            <TabsContent key={day.id} value={day.day_id} className="mt-0">
              {day.exercises.length > 0 ? (
                <DayExercises
                  key={day.id}
                  exercises={day.exercises}
                  dayId={day.day_id}
                  workoutId={day.workout_id}
                  completedExerciseNames={completedExerciseNames}
                  onLogWorkout={async (log) => {
                    await onAddWorkoutLog({ ...log, workout_day_id: day.id })
                    fetchSessionLogs() // Refresh logs after adding one
                  }}
                  onToggleExercise={handleToggleExercise}
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
        onConfirm={resetSession}
        dayColor={getWorkoutDayColor(selectedDay, colorMode)}
        message={`Start fresh on ${selectedDay.toUpperCase()} day? This will clear your current session.`}
      />
    </Card>
  )
}
