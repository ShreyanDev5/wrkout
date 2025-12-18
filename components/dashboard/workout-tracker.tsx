"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { WorkoutScreen } from "@/components/screens/workout-screen"
import { ProgressScreen } from "@/components/screens/progress-screen"
import { SettingsScreen } from "@/components/screens/settings-screen"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { TabNavigation } from "./TabNavigation"
import { useTheme } from "@/components/theme-context"
import { loadUserWorkouts, saveUserWorkouts, saveWorkoutLog, loadWorkoutLogs, loadUserWorkoutDays, saveUserWorkoutDays } from "@/lib/supabase-data"
import { initAudioSystem } from "@/lib/audio-utils"
import type { Workout, WorkoutLog, WorkoutDay, AppData } from "@/lib/types"
import { WorkoutProgressIcon } from "@/components/charts/workout-progress-icon"
import { useAuth } from '@/lib/auth'
import { OnboardingGuide } from "@/components/onboarding/onboarding-guide"
import { ErrorBoundary } from "@/components/error-boundary"
import { v4 as uuidv4 } from 'uuid'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function WorkoutTracker() {
  const [activeTab, setActiveTab] = useState("workout")
  const [appData, setAppData] = useState<any>({
    workouts: [],
    workoutDays: [],
  })
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([])
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // Initialize audio system on mount
  useEffect(() => {
    initAudioSystem()
  }, [])

  // Main effect: load user data for logged-in users only
  useEffect(() => {
    const initializeApp = async () => {
      if (!user) return;
      try {
        // Logged in: load workouts and workout days from Supabase
        let workouts = await loadUserWorkouts(supabase, user.id)
        let workoutDays: WorkoutDay[] = await loadUserWorkoutDays(supabase, user.id)
        // Remove all logic that auto-creates a default 'My Workouts' routine
        setAppData({ workouts, workoutDays })
        const logs = await loadWorkoutLogs(supabase, user.id)
        setWorkoutLogs(logs)
        // Check if this is the user's first time (onboarding not completed)
        const onboardingCompleted = localStorage.getItem(`onboarding-completed-${user.id}`)
        if (!onboardingCompleted) {
          // Show onboarding after a short delay to ensure the app is loaded
          setTimeout(() => {
            setShowOnboarding(true)
          }, 1000)
        }
      } catch (err) {
        console.error('Error initializing app data:', err)
      }
    }
    initializeApp()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Save data when it changes (only for logged-in users)
  useEffect(() => {
    if (user?.id && appData.workouts.length > 0) {
      (async () => {
        try {
          await saveUserWorkouts(supabase, appData.workouts, user.id)
          if (appData.workoutDays) {
            await saveUserWorkoutDays(supabase, appData.workoutDays, user.id)
          }
        } catch (err) {
          console.error('Error saving workout data:', err)
        }
      })()
    } else if (user?.id && appData.workouts.length === 0) {
      // Prevent destructive save if list is empty (unless user explicitly deletes all workouts)
      // Optionally, show a warning or log here
      console.warn('Attempted to save empty workout list. Skipping destructive save.');
    }
  }, [appData, user?.id, supabase])

  // Add workout log (only for logged-in users)
  const addWorkoutLog = async (log: WorkoutLog) => {
    if (!user?.id) return
    // Ensure log.id is a UUID
    if (!log.id) log.id = uuidv4()
    // Ensure all required fields are present
    const now = new Date().toISOString()
    const logToSave: WorkoutLog = {
      ...log,
      id: log.id,
      user_id: user.id,
      workout_day_id: log.workout_day_id ?? null,
      created_at: now,
      updated_at: now
    }
    try {
      await saveWorkoutLog(supabase, logToSave, user.id)
      setWorkoutLogs((prev) => [logToSave, ...prev]) // Add new log to the top
      toast({ title: "Workout logged!" })
    } catch (error) {
      toast({ title: "Failed to log workout", description: String(error), variant: "destructive" })
    }
  }

  // Update workouts and workoutDays
  const updateWorkoutsAndDays = (workouts: Workout[], workoutDays: WorkoutDay[]) => {
    setAppData((prev: any) => ({
      ...prev,
      workouts,
      workoutDays,
    }))
    if (user?.id) {
      (async () => {
        await saveUserWorkouts(supabase, workouts, user.id)
        await saveUserWorkoutDays(supabase, workoutDays, user.id)
      })()
    }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ WebkitOverflowScrolling: 'touch' }}>
      <header className="sticky top-0 z-10 bg-background border-b dark:border-opacity-10">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1
            className="text-2xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-100 cursor-default select-none flex items-baseline"
          >
            wrkout
            <span
              className="ml-1 h-2 w-2 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #FBBC04 0deg 120deg, #34A853 120deg 240deg, #EA4335 240deg 360deg)',
              }}
            />
          </h1>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo_1.0.png"
              alt="wrkout logo"
              className="h-12 w-12 rounded-xl shadow-lg border border-border/50 bg-background/50 backdrop-blur-sm object-contain transition-all duration-300 hover:scale-105 hover:rotate-3"
              style={{ minHeight: 48, minWidth: 48 }}
            />
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col min-h-0 flex-1">
        <div className="flex-1 container px-4 py-6 md:py-8" style={{ WebkitOverflowScrolling: 'touch' }}>
          <TabsContent value="workout" className="mt-0 p-0" id="workout-tab">
            <ErrorBoundary>
              <WorkoutScreen
                workouts={appData.workouts}
                workoutDays={appData.workoutDays}
                onAddWorkoutLog={addWorkoutLog}
                onUpdateWorkoutsAndDays={updateWorkoutsAndDays}
              />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="progress" className="mt-0 p-0" id="progress-tab">
            <ErrorBoundary>
              <ProgressScreen logs={workoutLogs} />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="settings" className="mt-0 p-0" id="settings-tab">
            <ErrorBoundary>
              <SettingsScreen
                workouts={appData.workouts}
                workoutDays={appData.workoutDays}
                onUpdateWorkoutsAndDays={updateWorkoutsAndDays}
              />
            </ErrorBoundary>
          </TabsContent>
        </div>

        <footer className="sticky bottom-0 z-10 bg-background">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </footer>
      </Tabs>

      <Toaster />

      {/* Onboarding Guide */}
      <OnboardingGuide
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  )
}
