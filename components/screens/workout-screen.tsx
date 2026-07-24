"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Dumbbell, ChevronDown, Check } from "lucide-react"
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from '@/lib/auth'

import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

interface WorkoutScreenProps {
  workouts: Workout[]
  workoutDays: WorkoutDay[]
  onAddWorkoutLog: (log: WorkoutLog) => void | Promise<void>
  logs: WorkoutLog[]
  onDeleteWorkoutLog: (logId: string) => void | Promise<void>
  onUpdateWorkoutsAndDays?: (workouts: Workout[], workoutDays: WorkoutDay[]) => void
  onNavigateToSettings?: () => void
}

export function WorkoutScreen({
  workouts,
  workoutDays,
  onAddWorkoutLog,
  onUpdateWorkoutsAndDays,
  logs,
  onDeleteWorkoutLog,
  onNavigateToSettings,
}: WorkoutScreenProps) {
  const [selectedWorkout, setSelectedWorkout] = useState("")
  const { user } = useAuth()

  // Get the current workout data
  const currentWorkout = workouts.find((w) => w.id === selectedWorkout)
  // Get the days for the current workout
  const currentWorkoutDays = useMemo(() => {
    return workoutDays.filter((d) => d.workout_id === selectedWorkout)
  }, [workoutDays, selectedWorkout])

  const handleDayChange = (val: string) => {
    setSelectedDay(val)
    saveLastWorkoutSection(val)
  }

  const [selectedDay, setSelectedDay] = useState<string>("push")
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

  // Rebuilt Custom Routine Selector Dropdown state & outside click handler
  const [isRoutineDropdownOpen, setIsRoutineDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsRoutineDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Synthesize days so PPL and Custom days are always seamlessly available in strict order (Push, Pull, Legs, Custom)
  const displayDays = useMemo(() => {
    const standardIds = ['push', 'pull', 'leg', 'flex']
    const dayMap = new Map(currentWorkoutDays.map((d) => [d.day_id.toLowerCase(), d]))
    const allIds = Array.from(new Set([...standardIds, ...currentWorkoutDays.map((d) => d.day_id.toLowerCase())]))

    const categoryOrderMap: Record<string, number> = { push: 0, pull: 1, leg: 2, legs: 2, flex: 3, flexible: 3, custom: 3 }

    return allIds
      .map((dayId) => {
        const existing = dayMap.get(dayId)
        if (existing) return existing
        return {
          id: `${selectedWorkout || 'temp'}-${dayId}`,
          workout_id: selectedWorkout,
          day_id: dayId,
          name: (dayId === 'flex' || dayId === 'custom' || dayId === 'flexible') ? 'Custom Day' : `${dayId.charAt(0).toUpperCase() + dayId.slice(1)} Day`,
          exercises: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as WorkoutDay
      })
      .sort((a, b) => (categoryOrderMap[a.day_id.toLowerCase()] ?? 99) - (categoryOrderMap[b.day_id.toLowerCase()] ?? 99))
  }, [currentWorkoutDays, selectedWorkout])

  // Start a workout (for empty state)
  const startWorkout = useCallback(() => {
    // Placeholder for specific start workout logic
  }, [])

  // Load saved data
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedDay = await loadLastWorkoutSection()
        if (savedDay) {
          setSelectedDay(savedDay)
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

    // Trigger completion modal whenever activeProgress reaches 100% after user action
    if (activeProgress === 100) {
      if (!isInitialMountRef.current && !hasCelebratedRef.current) {
        setShowCompletionModal(true)
        hasCelebratedRef.current = true
      }
    } else {
      // Reset celebrated flag whenever progress is below 100%
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
        variant: "destructive",
        title: "Log deleted",
        description: `${exerciseName} unchecked`,
        action: (
          <ToastAction
            altText="Undo delete log"
            onClick={() => onAddWorkoutLog(log)}
          >
            Undo
          </ToastAction>
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

      const activeDay = currentWorkoutDays.find(d => d.day_id === selectedDay)
      const exercise = activeDay?.exercises.find(e => e.name === exerciseName)
      const exercise_id = exercise?.exercise_id || exercise?.id

      const { error } = await supabase.from('workout_logs').upsert({
        user_id: user.id,
        workout_id: selectedWorkout,
        exercise_name: exerciseName,
        exercise_id: exercise_id,
        weight: 0,
        avg_reps: 0,
        sets: 0,
        performed_at: today,
        workout_day_id: activeDay?.id
      }, { onConflict: 'user_id,exercise_id,performed_at,workout_day_id' })

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
      <div className="flex flex-col items-center justify-center min-h-[350px] p-8 text-center rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md max-w-[480px] mx-auto select-none my-8">
        <div className="w-14 h-14 rounded-2xl border border-zinc-800 bg-zinc-900 flex items-center justify-center mb-4 shadow-sm text-zinc-300">
          <Dumbbell className="h-7 w-7 text-zinc-400" />
        </div>
        <h3 className="text-lg font-bold text-zinc-100 mb-1.5 tracking-tight">No Workout Routines</h3>
        <p className="text-zinc-400 text-xs max-w-xs mb-5 leading-snug font-medium">
          Create a routine to start tracking your workouts.
        </p>
        <Button
          onClick={() => setIsAddWorkoutOpen(true)}
          className="h-9 px-4 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/80 shadow-sm transition-all flex items-center gap-2 active:scale-95"
          aria-label="Create routine"
        >
          <PlusCircle className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
          <span>Create Routine</span>
        </Button>
        <Dialog open={isAddWorkoutOpen} onOpenChange={setIsAddWorkoutOpen}>
          <DialogContent 
            hideCloseButton
            className="w-[92%] max-w-[330px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/98 p-5 shadow-2xl backdrop-blur-2xl outline-none select-none mx-auto flex flex-col items-center"
          >
            <DialogHeader className="w-full flex flex-col items-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-flex-dark/20 bg-flex-dark/10 shadow-sm">
                <PlusCircle className="h-5 w-5 text-flex-dark" aria-hidden="true" />
              </div>
              <DialogTitle className="text-base font-extrabold tracking-tight text-white text-center w-full leading-snug">New Routine</DialogTitle>
            </DialogHeader>
            
            <div className="py-2.5 w-full flex flex-col items-center">
              <p className="text-xs leading-relaxed text-zinc-400 text-center px-0.5 mb-3">
                Create a new workout routine. Push, Pull, Legs, and Custom days will be set up automatically.
              </p>
              <div className="w-full">
                <Label htmlFor="workout-name" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2 px-1">Routine Name</Label>
                <Input
                  id="workout-name"
                  value={newWorkoutName}
                  onChange={(e) => setNewWorkoutName(e.target.value)}
                  placeholder="e.g. Summer Cut, Bulking..."
                  className="h-10 rounded-xl border-zinc-800 bg-zinc-900/80 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 w-full"
                />
              </div>
            </div>

            {/* Buttons Row */}
            <div className="flex flex-row justify-between gap-2.5 mt-3 w-full px-0.5">
              <button
                type="button"
                onClick={() => setIsAddWorkoutOpen(false)}
                className="flex-1 h-10 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 text-xs font-semibold text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white active:scale-95 shadow-none"
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
                    onUpdateWorkoutsAndDays?.([...(workouts || []), newWorkout], [...workoutDays, ...defaultDays])
                    setNewWorkoutName("")
                    setIsAddWorkoutOpen(false)
                  } catch (error) {
                    console.error("Error creating workout with default days:", error)
                  }
                }}
                className="flex-1 h-10 rounded-xl bg-flex-dark hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none px-4 text-xs font-bold text-white transition-all active:scale-95 shadow-sm border-none"
                aria-label="Confirm add workout"
              >
                Add Routine
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <>
      <Card className="border-0 shadow-none bg-transparent max-w-[480px] mx-auto w-full workout-selector">
        <CardContent className="px-3 sm:px-4 pt-0 pb-2">
          <Tabs value={selectedDay} onValueChange={handleDayChange} className="w-full">
            {/* Unified Page Header */}
            <div className="flex flex-col gap-1 mb-6 pt-2 sm:pt-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Train
              </h1>
              <p className="text-[10px] sm:text-[11px] font-bold tracking-widest text-muted-foreground/60 uppercase leading-none">
                Today&apos;s Workout
              </p>
            </div>

            {/* Rebuilt Custom Routine Selector Dropdown (Edge-Safe & High Contrast) */}
            <div className="relative w-full mb-4" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsRoutineDropdownOpen((prev) => !prev)}
                className="w-full h-10 px-3.5 ios-segmented-container hover:bg-zinc-800/80 active:scale-[0.99] transition-all rounded-xl text-xs font-semibold text-zinc-200 focus:outline-none border border-zinc-800 shadow-sm flex items-center justify-between"
                aria-haspopup="listbox"
                aria-expanded={isRoutineDropdownOpen}
              >
                <div className="flex items-center gap-2 min-w-0 truncate">
                  <Dumbbell className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 font-semibold flex-shrink-0">Routine:</span>
                  <span className="truncate font-bold text-zinc-100">{currentWorkout?.name || "Select Routine"}</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform duration-200 flex-shrink-0 ml-2", isRoutineDropdownOpen && "rotate-180")} />
              </button>

              {isRoutineDropdownOpen && (
                <div className="absolute top-full left-0 right-0 w-full mt-1.5 z-50 bg-zinc-900 border border-zinc-700/90 rounded-xl p-1 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-100">
                  <div className="max-h-60 overflow-y-auto py-0.5 space-y-0.5" role="listbox">
                    {workouts.map((workout) => {
                      const isChecked = workout.id === selectedWorkout
                      return (
                        <button
                          key={workout.id}
                          type="button"
                          role="option"
                          aria-selected={isChecked}
                          onClick={() => {
                            setSelectedWorkout(workout.id)
                            saveSelectedWorkout(workout.id).catch(() => {})
                            setIsRoutineDropdownOpen(false)
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-3.5 py-2.5 text-xs rounded-lg transition-colors text-left",
                            isChecked
                              ? "bg-zinc-800 text-white font-bold"
                              : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white font-medium"
                          )}
                        >
                          <span className="truncate">{workout.name}</span>
                          {isChecked && <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 ml-2" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Day Tabs Selector - Native Apple iOS Segmented Control */}
            <div className="mb-6">
              <TabsList className="grid grid-cols-4 w-full h-auto min-h-[44px] ios-segmented-container p-[4px] rounded-xl gap-1 items-center overflow-hidden">
                {displayDays.map((d) => {
                  const day = d.day_id
                  const dayColor = getWorkoutDayColor(day, colorMode)
                  const label = (day === 'flex' || day === 'flexible' || day === 'custom') ? 'Custom' : day.charAt(0).toUpperCase() + day.slice(1)
                  const isSelected = selectedDay === day

                  return (
                    <TabsTrigger
                      key={day}
                      value={day}
                      className={cn(
                        'w-full min-w-0 h-9 rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-2 transition-all duration-150 ease-out select-none border',
                        'text-[11px] sm:text-xs font-semibold tracking-tight my-0',
                        isSelected
                          ? 'font-bold shadow-sm'
                          : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
                      )}
                      style={{
                        color: isSelected ? dayColor : undefined,
                        backgroundColor: isSelected
                          ? `color-mix(in srgb, ${dayColor} 10%, #202024)`
                          : undefined,
                        borderColor: isSelected
                          ? `color-mix(in srgb, ${dayColor} 22%, #38383c)`
                          : 'transparent'
                      }}
                      aria-label={`${label} day`}
                    >
                      {getWorkoutDayIcon(day, true, 'h-3.5 w-3.5 flex-shrink-0')}
                      <span className="truncate">{label}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>

            {displayDays.map((day) => (
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
                  <EmptyWorkoutState dayId={day.day_id} dayName={day.name} onStart={onNavigateToSettings || startWorkout} />
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
