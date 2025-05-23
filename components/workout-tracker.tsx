"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { WorkoutScreen } from "@/components/screens/workout-screen"
import { ProgressScreen } from "@/components/screens/progress-screen"
import { SettingsScreen } from "@/components/screens/settings-screen"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ModernTabNavigation } from "@/components/modern-tab-navigation"
import { StickFigureIcon } from "@/components/stick-figure-icon"
import { useTheme } from "@/components/theme-context"
import {
  initializeWorkoutData,
  loadWorkoutData,
  saveWorkoutData,
  loadWorkoutSessions,
  saveWorkoutSessions,
} from "@/lib/storage"
import { initAudioSystem } from "@/lib/audio-utils"
import type { Workout, WorkoutSession, AppData } from "@/lib/types"

export function WorkoutTracker() {
  const [activeTab, setActiveTab] = useState("workout")
  const [appData, setAppData] = useState<AppData>({
    workouts: [],
    completedExercises: {},
    lastSyncTime: null,
  })
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([])
  const { toast } = useToast()
  const { colorMode, isFirstVisit, setIsFirstVisit } = useTheme()

  // Initialize audio system on mount
  useEffect(() => {
    initAudioSystem()
  }, [])

  // Initialize app data from storage
  useEffect(() => {
    const initializeApp = async () => {
      // Initialize workout data if needed
      await initializeWorkoutData()

      // Load data from storage
      const data = await loadWorkoutData()
      const sessions = await loadWorkoutSessions()

      setAppData(data)
      setWorkoutSessions(sessions)
    }

    initializeApp()
  }, [isFirstVisit])

  // Save data when it changes
  useEffect(() => {
    if (appData.workouts.length > 0) {
      saveWorkoutData(appData)
    }
  }, [appData])

  useEffect(() => {
    if (workoutSessions.length > 0) {
      saveWorkoutSessions(workoutSessions)
    }
  }, [workoutSessions])

  // Update completed exercises
  const updateCompletedExercises = (completedExercises: Record<string, Record<string, boolean>>) => {
    setAppData((prev) => ({
      ...prev,
      completedExercises,
    }))
  }

  // Add workout session
  const addWorkoutSession = (session: WorkoutSession) => {
    setWorkoutSessions((prev) => [...prev, session])
  }

  // Update workouts
  const updateWorkouts = (workouts: Workout[]) => {
    setAppData((prev) => ({
      ...prev,
      workouts,
    }))
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background border-b dark:border-opacity-10">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 
            className="text-xl font-bold line-height-readable bg-[linear-gradient(to_right,#FFD700_0%,#FFD700_25%,#00FF00_45%,#00FF00_55%,#FF0000_75%,#FF0000_100%)] bg-clip-text text-transparent opacity-90"
          >
            wrkout
          </h1>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
              <StickFigureIcon className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col min-h-0 flex-1">
        <div className="flex-1 container px-4 py-6 md:py-8">
          <TabsContent value="workout" className="mt-0 p-0" id="workout-tab">
            <WorkoutScreen
              workouts={appData.workouts}
              completedExercises={appData.completedExercises}
              onUpdateCompletedExercises={updateCompletedExercises}
              onAddWorkoutSession={addWorkoutSession}
            />
          </TabsContent>

          <TabsContent value="progress" className="mt-0 p-0" id="progress-tab">
            <ProgressScreen sessions={workoutSessions} />
          </TabsContent>

          <TabsContent value="settings" className="mt-0 p-0" id="settings-tab">
            <SettingsScreen
              workouts={appData.workouts}
              onUpdateWorkouts={updateWorkouts}
              lastSyncTime={appData.lastSyncTime}
            />
          </TabsContent>
        </div>

        <footer className="sticky bottom-0 z-10 bg-background">
          <ModernTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </footer>
      </Tabs>

      <Toaster />
    </div>
  )
}
