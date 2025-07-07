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
import { loadUserWorkouts, saveUserWorkouts, saveWorkoutLog, loadWorkoutLogs, loadDemoWorkoutLogs } from "@/lib/supabase-storage"
import { initAudioSystem } from "@/lib/audio-utils"
import type { Workout, WorkoutLog, AppData } from "@/lib/types"
import { WorkoutProgressIcon } from "@/components/workout-progress-icon"
import { useAuth } from '@/lib/auth'
import { workoutData as demoWorkoutData } from "@/lib/workout-data"
import { getDemoWorkoutLogs } from "@/lib/demo-data"
import { OnboardingGuide } from "@/components/onboarding-guide"
import { v4 as uuidv4 } from 'uuid'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function WorkoutTracker() {
  const [activeTab, setActiveTab] = useState("workout")
  const [appData, setAppData] = useState<AppData>({
    workouts: [],
    lastSyncTime: null,
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

  // Main effect: load demo data for pre-login, user data for logged-in
  useEffect(() => {
    const initializeApp = async () => {
      if (!user) {
        // Not logged in: show demo data with sample logs
        setAppData({ workouts: demoWorkoutData, lastSyncTime: null })
        
        // Load demo data from Supabase (with fallback to client-side data)
        try {
          const demoLogs = await loadDemoWorkoutLogs(supabase)
          setWorkoutLogs(demoLogs)
        } catch (error) {
          console.error('Error loading demo logs, using fallback:', error)
          const demoLogs = getDemoWorkoutLogs()
          setWorkoutLogs(demoLogs)
        }
        return
      }
      // Logged in: load workouts from Supabase
      let workouts = await loadUserWorkouts(supabase, user.id)
      // If no workouts, create a single blank 'My Workouts' routine
      if (!workouts || workouts.length === 0) {
        await saveUserWorkouts(supabase, [{ id: crypto.randomUUID(), name: 'My Workouts', days: [] }], user.id)
        workouts = await loadUserWorkouts(supabase, user.id)
      }
      setAppData({ workouts, lastSyncTime: null })
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
      saveUserWorkouts(supabase, appData.workouts, user.id)
    }
  }, [appData, user?.id])

  // Add workout log (only for logged-in users)
  const addWorkoutLog = async (log: WorkoutLog) => {
    if (!user?.id) return
    // Ensure log.id is a UUID
    if (!log.id) log.id = uuidv4()
    try {
      await saveWorkoutLog(supabase, log, user.id)
      setWorkoutLogs((prev) => [log, ...prev]) // Add new log to the top
      toast({ title: "Workout logged!" })
    } catch (error) {
      toast({ title: "Failed to log workout", description: String(error), variant: "destructive" })
    }
  }

  // Update workouts (only for logged-in users)
  const updateWorkouts = (workouts: Workout[]) => {
    setAppData((prev) => ({
      ...prev,
      workouts,
    }))
    if (user?.id) {
      saveUserWorkouts(supabase, workouts, user.id)
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
              onAddWorkoutLog={addWorkoutLog}
            />
          </TabsContent>

          <TabsContent value="progress" className="mt-0 p-0" id="progress-tab">
            <ProgressScreen logs={workoutLogs} />
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
      
      {/* Onboarding Guide */}
      <OnboardingGuide 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
    </div>
  )
}
