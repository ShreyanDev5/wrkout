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

import { Button } from "@/components/ui/button"
import { useWorkoutLogic } from "@/hooks/use-workout-logic"
import { CompletionModal } from "@/components/modals/completion-modal"

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
import { PlusCircle, Dumbbell } from "lucide-react"
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from '@/lib/auth'

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
  const { user } = useAuth()

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

  // Track if this is the initial data load
  const isInitialMountRef = useRef(true)
  const [showCompletionModal, setShowCompletionModal] = useState(false)

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

  // Completion Modal Logic
  useEffect(() => {
    // Skip if no workout selected
    if (!selectedWorkout) {
      previousProgressRef.current = activeProgress
      return
    }

    const previousProgress = previousProgressRef.current
    const isGenuineCompletion = previousProgress !== null && previousProgress < 100 && activeProgress === 100
    const isInitialLoad = isInitialMountRef.current

    if (activeProgress === 100 && isGenuineCompletion && !isInitialLoad && !hasCelebratedRef.current) {
      setShowCompletionModal(true)
      hasCelebratedRef.current = true
    } else if (activeProgress < 100) {
      hasCelebratedRef.current = false
    }

    previousProgressRef.current = activeProgress
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false
    }
  }, [activeProgress, selectedWorkout])

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
      <div className="flex flex-col items-center justify-center h-[65vh] px-6 text-center select-none animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center mb-6 shadow-xl">
          <Dumbbell className="h-7 w-7 text-zinc-400 opacity-60" />
        </div>
        <h3 className="text-lg font-bold text-zinc-100 mb-2">Welcome to Wrkout</h3>
        <p className="text-zinc-400 text-sm max-w-sm mb-6 leading-relaxed">
          You don&apos;t have any workout routines yet. Please create one to start tracking.
        </p>
        <Button
          onClick={() => setIsAddWorkoutOpen(true)}
          className="rounded-xl bg-[#34A853] hover:bg-[#2D9249] text-white border-none shadow-lg shadow-green-900/20 px-6 py-2.5 text-sm font-semibold tracking-tight transition-all active:scale-95"
          aria-label="Create routine"
        >
          <PlusCircle className="h-4 w-4 mr-2" aria-hidden="true" />
          Create Routine
        </Button>
        <Dialog open={isAddWorkoutOpen} onOpenChange={setIsAddWorkoutOpen}>
          <DialogContent 
            hideCloseButton
            className="w-[92%] max-w-[328px] overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/98 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl outline-none select-none mx-auto flex flex-col items-center"
          >
            <DialogHeader className="w-full flex flex-col items-center">
              {/* Floating Icon Box matching Onboarding */}
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-[0_6px_16px_rgba(0,0,0,0.18)]">
                <PlusCircle className="h-5.5 w-5.5 text-emerald-500 animate-pulse" aria-hidden="true" />
              </div>
              <DialogTitle className="text-[1.1rem] font-extrabold tracking-tight text-foreground text-center w-full leading-snug">New Routine</DialogTitle>
            </DialogHeader>
            
            <div className="py-2.5 w-full flex flex-col items-center">
              <p className="text-[11.5px] leading-relaxed text-zinc-400 text-center px-0.5 mb-4">
                Create a new workout routine. Push, Pull, and Legs days will be pre-populated automatically.
              </p>
              <div className="w-full">
                <Label htmlFor="workout-name" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2 px-1">Routine Name</Label>
                <Input
                  id="workout-name"
                  value={newWorkoutName}
                  onChange={(e) => setNewWorkoutName(e.target.value)}
                  placeholder="e.g. Summer Cut, Bulking..."
                  className="h-10 rounded-xl border-white/10 bg-white/[0.03] text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 w-full"
                />
              </div>
            </div>

            {/* Buttons Row with premium pill styles */}
            <div className="flex flex-row justify-between gap-2.5 mt-4 w-full px-0.5">
              <button
                type="button"
                onClick={() => setIsAddWorkoutOpen(false)}
                className="flex-1 h-11 rounded-full border border-white/8 bg-white/[0.02] px-4 text-[13px] font-bold text-zinc-300 transition-all hover:bg-white/[0.06] hover:text-white active:scale-95 shadow-sm"
                aria-label="Cancel add workout"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!newWorkoutName.trim()) return
                  let userId = user?.id || ""
                  if (!userId) {
                    if (workouts && workouts.length > 0) {
                      userId = workouts[0]?.user_id || ""
                    } else if (typeof window !== 'undefined') {
                      userId = window.localStorage.getItem('wrkout-user-id') || ""
                    }
                  }
                  
                  const newWorkoutId = uuidv4()
                  const newWorkout: Workout = {
                    id: newWorkoutId,
                    user_id: userId,
                    name: newWorkoutName,
                    days: [],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  }

                  try {
                    const { createDefaultRoutinesForWorkout } = await import('@/lib/supabase-data')
                    const defaultDays = await createDefaultRoutinesForWorkout(supabase, userId, newWorkoutId)
                    onUpdateWorkoutsAndDays([...(workouts || []), newWorkout], [...workoutDays, ...defaultDays])
                    setNewWorkoutName("")
                    setIsAddWorkoutOpen(false)
                  } catch (error) {
                    console.error("Error creating workout with default days:", error)
                  }
                }}
                className="flex-1 h-11 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none px-4 text-[13px] font-bold text-white transition-all active:scale-95 shadow-[0_4px_16px_rgba(16,185,129,0.2)] border-none"
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
      <Card className="border-0 shadow-none bg-transparent max-w-[540px] mx-auto w-full workout-selector">
        <CardContent className="px-0 sm:px-4 pt-0 pb-2">
          <Tabs value={selectedDay} onValueChange={handleDayChange} className="w-full">
            {/* Unified Controls Panel: side-by-side on desktop, stacked on mobile */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 md:p-3 mb-6 rounded-3xl md:rounded-2xl border border-zinc-800/10 dark:border-zinc-800/30 bg-zinc-900/10 dark:bg-zinc-900/30 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
              {/* Workout Routine Selector */}
              <div className="w-full md:w-48 flex-shrink-0 workout-select">
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
                  <SelectTrigger className="w-full h-10 min-h-0 py-2 px-4 border-zinc-800/20 dark:border-zinc-800/50 bg-zinc-900/40 dark:bg-zinc-900/60 hover:bg-zinc-900/80 transition-all rounded-full text-sm font-semibold text-zinc-200">
                    <SelectValue placeholder="Select Workout" className="truncate tracking-tight" />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-800/50 bg-zinc-950/98 backdrop-blur-xl">
                    {workouts.map((workout) => (
                      <SelectItem
                        key={workout.id}
                        value={workout.id}
                        className="pl-3 pr-3 py-2 cursor-pointer transition-colors"
                      >
                        {workout.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Day Tabs Selector */}
              <div className="w-full md:w-auto">
                <TabsList className="flex flex-nowrap w-full md:w-[276px] bg-zinc-900/60 dark:bg-zinc-900/85 border border-zinc-800/40 p-1 rounded-full gap-1">
                  {['push', 'pull', 'leg'].map((day) => {
                    const activeColorClass = day === 'push' ? 'text-push-dark' : day === 'pull' ? 'text-pull-dark' : 'text-leg-dark';

                    return (
                      <TabsTrigger
                        key={day}
                        value={day}
                        className={cn(
                          'flex-1 rounded-full flex items-center justify-center gap-1 py-1.5 px-2.5 transition-all',
                          'text-xs font-semibold',
                          selectedDay === day ? activeColorClass : 'text-muted-foreground hover:text-foreground/80'
                        )}
                        style={{
                          backgroundColor:
                            selectedDay === day
                              ? `color-mix(in srgb, ${getWorkoutDayColor(day, colorMode)} 15%, transparent)`
                              : undefined,
                          boxShadow: 'none',
                        }}
                        aria-label={`${day.charAt(0).toUpperCase() + day.slice(1)} day`}
                      >
                        {getWorkoutDayIcon(day, true, 'h-3.5 w-3.5')}
                        <span className="inline">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </div>
            </div>

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

      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
      />
    </>
  )
}
