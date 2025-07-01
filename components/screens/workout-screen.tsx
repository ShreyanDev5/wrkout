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
import type { Workout, WorkoutLog } from "@/lib/types"
import { getWorkoutDayColor, getWorkoutDayIcon } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { saveLastWorkoutSection, loadLastWorkoutSection } from "@/lib/storage"

interface WorkoutScreenProps {
  workouts: Workout[]
  onAddWorkoutLog: (log: WorkoutLog) => void | Promise<void>
}

export function WorkoutScreen({
  workouts,
  onAddWorkoutLog,
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

  // Start a workout (for empty state)
  const startWorkout = () => {
    // This function is just a placeholder for now
    // In a real app, you might want to do something specific when starting a workout
  }

  // Get the current workout and day data
  const currentWorkout = workouts.find((w) => w.id === selectedWorkout)
  const currentDay = currentWorkout?.days.find((d) => d.id === selectedDay)
  const hasExercises = (currentDay?.exercises?.length ?? 0) > 0

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
              "w-full",
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
          {currentWorkout?.days.map((day) => (
            <TabsContent key={day.id} value={day.id} className="mt-0">
              {day.exercises.length > 0 ? (
                <DayExercises
                  exercises={day.exercises}
                  dayId={day.id}
                  onLogWorkout={onAddWorkoutLog}
                  dayColor={getWorkoutDayColor(day.id, colorMode)}
                />
              ) : (
                <EmptyWorkoutState dayId={day.id} onStart={startWorkout} />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
