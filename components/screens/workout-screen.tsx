"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DayExercises } from "@/components/day-exercises"
import { CircularProgress } from "@/components/ui/circular-progress"
import { EmptyWorkoutState } from "@/components/empty-workout-state"
import { ResetConfirmationModal } from "@/components/reset-confirmation-modal"
import { RotateCcw } from "lucide-react"
import { useTheme } from "@/components/theme-context"
import type { Workout, WorkoutSession } from "@/lib/types"
import { getWorkoutDayColor, getWorkoutDayIcon } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { saveLastWorkoutSection, loadLastWorkoutSection } from "@/lib/storage"

interface WorkoutScreenProps {
  workouts: Workout[]
  completedExercises: Record<string, Record<string, boolean>>
  onUpdateCompletedExercises: (completedExercises: Record<string, Record<string, boolean>>) => void
  onAddWorkoutSession: (session: WorkoutSession) => void
}

export function WorkoutScreen({
  workouts,
  completedExercises,
  onUpdateCompletedExercises,
  onAddWorkoutSession,
}: WorkoutScreenProps) {
  const [selectedWorkout, setSelectedWorkout] = useState(workouts[0]?.id || "")
  const [selectedDay, setSelectedDay] = useState<"push" | "pull" | "leg">("push") // Default value, will be updated from localStorage
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const { colorMode } = useTheme()

  // Load the last selected workout section from localStorage on component mount
  useEffect(() => {
    const loadSavedSection = async () => {
      try {
        const savedSection = await loadLastWorkoutSection()
        if (savedSection === "push" || savedSection === "pull" || savedSection === "leg") {
          setSelectedDay(savedSection)
        }
        setIsInitialized(true)
      } catch (error) {
        console.error("Error loading last workout section:", error)
        setIsInitialized(true)
      }
    }

    loadSavedSection()
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

  // Handle exercise completion toggle
  const toggleExercise = (dayId: string, exerciseId: string) => {
    onUpdateCompletedExercises({
      ...completedExercises,
      [selectedWorkout]: {
        ...(completedExercises[selectedWorkout] || {}),
        [`${dayId}-${exerciseId}`]: !(completedExercises[selectedWorkout]?.[`${dayId}-${exerciseId}`] || false),
      },
    })
  }

  // Reset all exercises for the current workout and day
  const resetDay = () => {
    setIsResetModalOpen(true)
  }

  const confirmReset = () => {
    const updated = { ...completedExercises }
    const currentDay = workouts.find((w) => w.id === selectedWorkout)?.days.find((d) => d.id === selectedDay)

    if (currentDay) {
      currentDay.exercises.forEach((exercise) => {
        const key = `${selectedDay}-${exercise.id}`
        if (updated[selectedWorkout]) {
          updated[selectedWorkout][key] = false
        }
      })
    }

    onUpdateCompletedExercises(updated)
  }

  // Calculate progress for the current day
  const calculateProgress = () => {
    const currentDay = workouts.find((w) => w.id === selectedWorkout)?.days.find((d) => d.id === selectedDay)
    if (!currentDay) return 0

    const totalExercises = currentDay.exercises.length
    if (totalExercises === 0) return 0

    let completed = 0
    currentDay.exercises.forEach((exercise) => {
      const key = `${selectedDay}-${exercise.id}`
      if (completedExercises[selectedWorkout]?.[key]) {
        completed++
      }
    })

    return (completed / totalExercises) * 100
  }

  // Add a new workout session
  const handleAddWorkoutSession = (session: WorkoutSession) => {
    onAddWorkoutSession(session)
  }

  // Start a workout (for empty state)
  const startWorkout = () => {
    // This function is just a placeholder for now
    // In a real app, you might want to do something specific when starting a workout
  }

  // Get the current workout and day data
  const currentWorkout = workouts.find((w) => w.id === selectedWorkout)
  const currentDay = currentWorkout?.days.find((d) => d.id === selectedDay)
  const progress = calculateProgress()
  const completedCount =
    currentDay?.exercises.filter((ex) => completedExercises[selectedWorkout]?.[`${selectedDay}-${ex.id}`]).length || 0
  const totalExercises = currentDay?.exercises.length || 0

  // Check if the current day has any exercises
  const hasExercises = (currentDay?.exercises?.length ?? 0) > 0

  // Check if any exercises have been completed for the current day
  const hasCompletedAnyExercise = completedCount > 0

  if (workouts.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">No workouts available. Add a workout in Settings.</p>
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-none dark:bg-background">
      <CardHeader className="px-0">
        <div className="workout-header-container">
          <div
            className={cn(
              "workout-select transition-all duration-200",
              hasExercises && hasCompletedAnyExercise ? "flex-1" : "w-full",
            )}
          >
            <Select value={selectedWorkout} onValueChange={setSelectedWorkout} disabled={workouts.length === 0}>
              <SelectTrigger className="min-touch-target w-full">
                <SelectValue placeholder="Select Workout" />
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

          {hasExercises && hasCompletedAnyExercise ? (
            <Button
              variant="outline"
              size="icon"
              onClick={resetDay}
              title="Reset current day"
              className="min-touch-target focus-visible-ring reset-button transition-opacity duration-200 opacity-100"
              disabled={workouts.length === 0}
              aria-label="Reset current day"
            >
              <RotateCcw className="h-4 w-4 modern-icon" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={resetDay}
              title="Reset current day"
              className="min-touch-target focus-visible-ring reset-button transition-opacity duration-200 opacity-0 invisible absolute"
              disabled={true}
              aria-label="Reset current day"
            >
              <RotateCcw className="h-4 w-4 modern-icon" aria-hidden="true" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-0">
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

          {hasExercises && (
            <div className="mb-6 flex justify-center">
              <CircularProgress
                value={progress}
                category={selectedDay}
                showLabel={true}
                labelText="Progress"
                aria-label={`Progress: ${Math.round(progress)}%`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
              />
            </div>
          )}

          {workouts
            .find((w) => w.id === selectedWorkout)
            ?.days.map((day) => (
              <TabsContent key={day.id} value={day.id} className="mt-0">
                {day.exercises.length > 0 ? (
                  <DayExercises
                    exercises={day.exercises}
                    dayId={day.id}
                    completed={completedExercises[selectedWorkout] || {}}
                    onToggle={toggleExercise}
                    onLogSession={handleAddWorkoutSession}
                    dayColor={getWorkoutDayColor(day.id, colorMode)}
                  />
                ) : (
                  <EmptyWorkoutState dayId={day.id} onStart={startWorkout} />
                )}
              </TabsContent>
            ))}
        </Tabs>
      </CardContent>

      <ResetConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={confirmReset}
        dayColor={getWorkoutDayColor(selectedDay, colorMode)}
      />
    </Card>
  )
}
