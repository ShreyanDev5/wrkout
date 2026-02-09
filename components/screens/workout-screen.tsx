"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CircularProgress } from "@/components/ui/circular-progress"
import { WorkoutLogModal } from "@/components/modals/workout-log-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DayExercises } from "@/components/dashboard/day-exercises"
import { EmptyWorkoutState } from "@/components/dashboard/empty-workout-state"
import { useTheme } from "@/components/theme-context"
import type { Workout, WorkoutLog, WorkoutDay } from "@/lib/types"
import { getWorkoutDayColor, getWorkoutDayIcon, getLocalDateYYYYMMDD } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { saveLastWorkoutSection, loadLastWorkoutSection, saveSelectedWorkout, loadSelectedWorkout } from "@/lib/storage"
import { triggerWorkoutCompletionConfetti } from "@/lib/confetti"
import { Button } from "@/components/ui/button"
import { useWorkoutLogic } from "@/hooks/use-workout-logic"

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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

import { useToast } from "@/hooks/use-toast"

interface WorkoutScreenProps {
  workouts: Workout[]
  workoutDays: WorkoutDay[]
  onAddWorkoutLog: (log: WorkoutLog) => void | Promise<void>
  logs: WorkoutLog[]
  onDeleteWorkoutLog: (logId: string) => void | Promise<void>
}

export function WorkoutScreen({
  workouts,
  workoutDays,
  onAddWorkoutLog,
  onUpdateWorkoutsAndDays, // <-- Add this prop
  logs,
  onDeleteWorkoutLog,
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
  const supabase = createClientComponentClient()

  // Track if we have already celebrated this session to prevent re-triggering on remounts/refreshes
  // unless the user intentionally completes it again in this session view.
  const hasCelebratedRef = useRef(false)

  // Track previous progress to detect genuine transitions to 100%
  const previousProgressRef = useRef<number | null>(null)

  // Track if this is the initial data load (to skip confetti on refresh with completed data)
  const isInitialMountRef = useRef(true)

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
   *  DATE & RESET LOGIC
   * ------------------------------------------------------------------------- */
  // Use local date state to trigger re-renders when the day changes
  const [today, setToday] = useState(getLocalDateYYYYMMDD())

  // Check for day change when app comes into foreground
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentDate = getLocalDateYYYYMMDD()
        if (currentDate !== today) {
          setToday(currentDate)
        }
      }
    }

    // Also set up an interval to check every minute if the app is open across midnight
    const interval = setInterval(() => {
      const currentDate = getLocalDateYYYYMMDD()
      if (currentDate !== today) {
        setToday(currentDate)
      }
    }, 60000)

    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleVisibilityChange)

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [today])

  /* -------------------------------------------------------------------------
   *  SESSION & STATE MANAGEMENT (SUPABASE)
   * ------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------
   *  SESSION & STATE MANAGEMENT (SUPABASE)
   * ------------------------------------------------------------------------- */
  // Use custom hook for logic extraction
  const { completedLogs, completedExerciseNames, activeProgress } = useWorkoutLogic({
    workoutId: selectedWorkout,
    dayId: selectedDay,
    logs,
    workoutDays
  })

  // Toggle Exercise (DB Operation)
  const handleToggleExercise = async (exerciseName: string, isCompleted: boolean) => {
    if (!isCompleted) {
      // 1. Uncheck Flow (Delete Log) - NON-BLOCKING "Undo" Pattern
      const log = completedLogs.get(exerciseName)
      if (!log) return

      // Optimistic delete handled by parent/props, but we need to trigger the actual delete
      // We will delete immediately and show a toast to undo
      await onDeleteWorkoutLog(log.id)

      toast({
        title: "Log deleted",
        description: `${exerciseName} unchecked`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddWorkoutLog(log)} // Restore the exact log
            className="border-none shadow-none bg-accent hover:bg-accent/80"
          >
            Undo
          </Button>
        ),
        duration: 4000,
      })
      return
    }

    // 2. Check Flow (Mark as Done - Create Placeholder)
    // Only insert if not already present
    if (completedLogs.has(exerciseName)) return

    // Celebration logic handled by the hook's effect on activeProgress change
    // We just need to persist the data
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from('workout_logs').upsert({
        user_id: user.id,
        workout_id: selectedWorkout,
        exercise_name: exerciseName,
        weight: 0,
        avg_reps: 0,
        sets: 0,
        performed_at: today,
        workout_day_id: currentWorkoutDays.find(d => d.day_id === selectedDay)?.id
      }, { onConflict: 'user_id, exercise_name, performed_at, workout_day_id' })

      if (error) throw error
    } catch (error) {
      console.error('Error toggling exercise:', error)
      toast({ title: "Failed to save log", variant: "destructive" })
    }
  }










  // ... inside component ...
  const { toast } = useToast()



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
    <>
      <Card className="border-0 shadow-none dark:bg-background max-w-4xl mx-auto w-full workout-selector premium-card">
        <CardHeader className="px-4 sm:px-5 pt-2 pb-3">
          <div className="workout-header-container">
            <div className="w-full workout-select">
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
                <SelectTrigger className="w-full min-touch-target border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                  <SelectValue placeholder="Select Workout" className="truncate font-medium tracking-tight" />
                </SelectTrigger>
                <SelectContent>
                  {workouts.map((workout) => (
                    <SelectItem
                      key={workout.id}
                      value={workout.id}
                      className="pl-3 pr-3 py-3 [&>span.absolute]:hidden data-[state=checked]:font-semibold data-[state=checked]:bg-white/10 data-[state=checked]:text-primary focus:bg-white/5 focus:text-primary-foreground cursor-pointer transition-colors"
                    >
                      {workout.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-4 pt-0 pb-2">
          <Tabs value={selectedDay} onValueChange={handleDayChange} className="w-full">
            <div className="mb-6 mx-auto max-w-[500px]">
              <TabsList className="flex flex-nowrap w-full bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/50 p-1.5 rounded-full gap-1.5 sm:gap-2">
                {['push', 'pull', 'leg'].map((day) => {
                  const activeColorClass = day === 'push' ? 'text-push-dark' : day === 'pull' ? 'text-pull-dark' : 'text-leg-dark';

                  return (
                    <TabsTrigger
                      key={day}
                      value={day}
                      className={cn(
                        'flex-1 rounded-full flex items-center justify-center gap-1.5 md:gap-2 py-2 md:py-2.5 px-3 transition-all',
                        'text-xs md:text-sm font-medium',
                        selectedDay === day ? activeColorClass : 'text-muted-foreground hover:text-foreground/80'
                      )}
                      style={{
                        backgroundColor:
                          selectedDay === day
                            ? `color-mix(in srgb, ${getWorkoutDayColor(day, colorMode)} 20%, transparent)`
                            : undefined,
                        boxShadow: 'none',
                      }}
                      aria-label={`${day.charAt(0).toUpperCase() + day.slice(1)} day`}
                    >
                      {getWorkoutDayIcon(day, true, 'h-3.5 w-3.5 md:h-4 md:w-4')}
                      <span className="hidden xs:inline">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>

            {/* Progress Header - Minimalist Session Only */}
            {activeProgress > 0 && (
              <div className="mb-6 px-1 mx-auto max-w-[95%]">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span className="font-medium tracking-tight">Session Progress</span>
                  <span className="font-mono tracking-tighter">{activeProgress}%</span>
                </div>
                <div className="h-1 w-full bg-secondary/30 rounded-full overflow-hidden">
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


      </Card>


    </>
  )
}
