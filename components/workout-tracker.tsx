"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { WorkoutScreen } from "@/components/screens/workout-screen"
import { ProgressScreen } from "@/components/screens/progress-screen"
import { NotesScreen } from "@/components/screens/notes-screen"
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
  loadWorkoutNotes,
  saveWorkoutNotes,
} from "@/lib/storage"
import { initAudioSystem } from "@/lib/audio-utils"
import type { Workout, WorkoutSession, WorkoutNote, AppData } from "@/lib/types"

export function WorkoutTracker() {
  const [activeTab, setActiveTab] = useState("workout")
  const [appData, setAppData] = useState<AppData>({
    workouts: [],
    completedExercises: {},
    lastSyncTime: null,
  })
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([])
  const [notes, setNotes] = useState<WorkoutNote[]>([])
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
      const savedNotes = await loadWorkoutNotes()

      setAppData(data)
      setWorkoutSessions(sessions)
      setNotes(
        savedNotes.length > 0
          ? savedNotes
          : [
              {
                id: "default-guidelines",
                content: `
            <h3>Workout Guidelines</h3>
            <ul>
              <li><strong>Weight Progression:</strong> Aim to increase by +2 kg/week when possible</li>
              <li><strong>Rep Progression:</strong> Add +1-2 reps if weight is stalled</li>
              <li><strong>Set & Rep Ranges:</strong> 2-3 sets of 5-8 reps for strength, 3-4 sets of 8-12 reps for hypertrophy</li>
              <li><strong>Rest Periods:</strong> 1-2 minutes between sets for smaller muscles, 2-3 minutes for compound movements</li>
            </ul>
          `,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
      )
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

  useEffect(() => {
    if (notes.length > 0) {
      saveWorkoutNotes(notes)
    }
  }, [notes])

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

  // Update notes
  const updateNotes = (updatedNotes: WorkoutNote[]) => {
    setNotes(updatedNotes)
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
          <h1 className="text-xl font-bold line-height-readable">wrkout</h1>
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

          <TabsContent value="notes" className="mt-0 p-0" id="notes-tab">
            <NotesScreen notes={notes} onUpdateNotes={updateNotes} />
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
