"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { WorkoutScreen } from "@/components/screens/workout-screen"
import { ProgressScreen } from "@/components/screens/progress-screen"
import { SettingsScreen } from "@/components/screens/settings-screen"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ModernTabNavigation } from "@/components/modern-tab-navigation"
import { useTheme } from "@/components/theme-context"
import { loadUserWorkouts, saveUserWorkouts, saveWorkoutLog, loadWorkoutLogs, loadUserWorkoutDays, saveUserWorkoutDays } from "@/lib/supabase-data"
import { initAudioSystem } from "@/lib/audio-utils"
import type { Workout, WorkoutLog, WorkoutDay, AppData } from "@/lib/types"
import { WorkoutProgressIcon } from "@/components/workout-progress-icon"
import { useAuth } from '@/lib/auth'
import { OnboardingGuide } from "@/components/onboarding-guide"
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
  const { colorMode, isFirstVisit, setIsFirstVisit } = useTheme()
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
      // Logged in: load workouts and workout days from Supabase
      let workouts = await loadUserWorkouts(supabase, user.id)
      let workoutDays: WorkoutDay[] = await loadUserWorkoutDays(supabase, user.id)
      // If no workouts, create a single blank 'My Workouts' routine
      if (!workouts || workouts.length === 0) {
        await saveUserWorkouts(supabase, [{
          id: crypto.randomUUID(),
          user_id: user.id,
          name: 'My Workouts',
          days: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }], user.id)
        workouts = await loadUserWorkouts(supabase, user.id)
      }
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
    }
    initializeApp()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Save data when it changes (only for logged-in users)
  useEffect(() => {
    if (appData.workouts.length > 0 && user?.id) {
      (async () => {
        await saveUserWorkouts(supabase, appData.workouts, user.id)
        if (appData.workoutDays) {
          await saveUserWorkoutDays(supabase, appData.workoutDays, user.id)
        }
      })()
    }
  }, [appData, user?.id])

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
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background border-b dark:border-opacity-10">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 
            className="text-2xl font-extrabold tracking-tight bg-[linear-gradient(to_right,#FFD700_0%,#FFD700_25%,#00FF00_45%,#00FF00_55%,#FF0000_75%,#FF0000_100%)] bg-clip-text text-transparent opacity-90 transition-all duration-300 hover:opacity-100 hover:scale-[1.02] active:scale-[0.98] cursor-default select-none"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              letterSpacing: '-0.02em'
            }}
          >
            wrkout
          </h1>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
              <WorkoutProgressIcon className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col min-h-0 flex-1">
        <div className="flex-1 container px-4 py-6 md:py-8">
          <TabsContent value="workout" className="mt-0 p-0" id="workout-tab">
            <WorkoutScreen
              workouts={appData.workouts}
              workoutDays={appData.workoutDays}
              onAddWorkoutLog={addWorkoutLog}
              onUpdateWorkoutsAndDays={updateWorkoutsAndDays}
            />
          </TabsContent>

          <TabsContent value="progress" className="mt-0 p-0" id="progress-tab">
            <ProgressScreen logs={workoutLogs} />
          </TabsContent>

          <TabsContent value="settings" className="mt-0 p-0" id="settings-tab">
            <SettingsScreen
              workouts={appData.workouts}
              workoutDays={appData.workoutDays}
              onUpdateWorkoutsAndDays={updateWorkoutsAndDays}
            />
          </TabsContent>
        </div>

        <footer className="sticky bottom-0 z-10 bg-background">
          <ModernTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
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
