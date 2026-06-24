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
import { WorkoutProgressIcon } from "./workout-progress-icon"
import { useAuth } from '@/lib/auth'
import { OnboardingGuide } from "@/components/onboarding/onboarding-guide"
import { ErrorBoundary } from "@/components/error-boundary"
import { v4 as uuidv4 } from 'uuid'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function WorkoutTracker() {
  const [activeTab, setActiveTab] = useState("workout")
  const [appData, setAppData] = useState<AppData>({
    workouts: [],
    workoutDays: [],
    lastSyncTime: null,
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
    let isMounted = true;
    const initializeApp = async () => {
      if (!user) return;
      try {
        // Parallel data fetching for better performance
        // Only fetch the last 100 logs initially to prevent data overloading
        const [workouts, workoutDaysData, logs] = await Promise.all([
          loadUserWorkouts(supabase, user.id),
          loadUserWorkoutDays(supabase, user.id),
          loadWorkoutLogs(supabase, user.id, 100) // Limit to 100 logs
        ]);

        if (isMounted) {
          setAppData({ workouts, workoutDays: workoutDaysData })
          setWorkoutLogs(logs)

          // Check if this is the user's first time (onboarding not completed)
          const onboardingCompleted = localStorage.getItem(`onboarding-completed-${user.id}`)
          if (!onboardingCompleted) {
            // Show onboarding after a short delay to ensure the app is loaded
            setTimeout(() => {
              setShowOnboarding(true)
            }, 1000)
          }
        }
      } catch (err) {
        console.error('Error initializing app data:', err)
      }
    }
    initializeApp()
    return () => { isMounted = false }

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

    // Optimistic Update: Update UI immediately
    setWorkoutLogs((prev) => [logToSave, ...prev])

    try {
      await saveWorkoutLog(supabase, logToSave, user.id)
    } catch (error) {
      console.error('Error logging workout:', error)
      toast({ title: "Failed to log workout", description: String(error), variant: "destructive" })
      // Revert optimistic update
      setWorkoutLogs((prev) => prev.filter(l => l.id !== logToSave.id))
    }
  }

  // Delete workout log (only for logged-in users)
  const deleteWorkoutLog = async (logId: string) => {
    if (!user?.id) return

    // Optimistic delete
    const logToDelete = workoutLogs.find(l => l.id === logId)
    setWorkoutLogs((prev) => prev.filter((l) => l.id !== logId))

    try {
      const { error } = await supabase
        .from('workout_logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', user.id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting log:', error)
      toast({ title: "Failed to delete log", description: String(error), variant: "destructive" })

      // Revert optimism if fail
      if (logToDelete) {
        setWorkoutLogs(prev => [...prev, logToDelete].sort((a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime()))
      }
    }
  }

  // Update workouts and workoutDays
  const updateWorkoutsAndDays = (workouts: Workout[], workoutDays: WorkoutDay[]) => {
    setAppData((prev) => ({
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
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-zinc-800/20 dark:border-zinc-800/40">
        <div className="max-w-[540px] mx-auto flex items-center justify-between h-16 md:h-14 px-4 sm:px-4">
          <h1
            className="text-2xl md:text-xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-100 cursor-default select-none transition-all"
          >
            wrkout
          </h1>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo_1.0-transparent.png"
              alt="wrkout logo"
              className="h-12 w-12 md:h-[42px] md:w-[42px] object-contain transition-all duration-300 hover:scale-105 hover:rotate-3"
              style={{ minHeight: 40, minWidth: 40, marginTop: 1 }}
            />
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col min-h-0 flex-1">
        <div className="flex-1 container max-w-4xl mx-auto px-4 pt-6 pb-28 md:py-8 md:pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
          <TabsContent value="workout" className="mt-0 p-0" id="workout-tab">
            <ErrorBoundary>
              <WorkoutScreen
                workouts={appData.workouts}
                workoutDays={appData.workoutDays}
                onAddWorkoutLog={addWorkoutLog}
                onUpdateWorkoutsAndDays={updateWorkoutsAndDays}
                logs={workoutLogs}
                onDeleteWorkoutLog={deleteWorkoutLog}
              />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="progress" className="mt-0 p-0" id="progress-tab">
            <ErrorBoundary>
              <ProgressScreen
                logs={workoutLogs}
                workoutDays={appData.workoutDays}
              />
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

        <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-[540px] flex justify-center pointer-events-none bg-transparent border-none">
          <div className="w-full pointer-events-auto flex justify-center">
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
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
