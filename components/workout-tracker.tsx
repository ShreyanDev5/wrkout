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
import {
  initializeWorkoutData,
  loadWorkoutData,
  saveWorkoutData,
} from "@/lib/storage"
import { initAudioSystem } from "@/lib/audio-utils"
import type { Workout, WorkoutLog, AppData } from "@/lib/types"
import { WorkoutProgressIcon } from "@/components/workout-progress-icon"
import { saveWorkoutLog, loadWorkoutLogs } from "@/lib/supabase-storage"
import { useAuth } from '@/lib/auth'

export function WorkoutTracker() {
  const [activeTab, setActiveTab] = useState("workout")
  const [appData, setAppData] = useState<AppData>({
    workouts: [],
    lastSyncTime: null,
  })
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([])
  const { toast } = useToast()
  const { colorMode, isFirstVisit, setIsFirstVisit } = useTheme()
  const { user } = useAuth()

  // Initialize audio system on mount
  useEffect(() => {
    initAudioSystem()
  }, [])

  // Initialize app data and logs from storage/Supabase
  useEffect(() => {
    const initializeApp = async () => {
      if (!user?.id) return;
      await initializeWorkoutData();
      const data = await loadWorkoutData();
      setAppData(data);
      const logs = await loadWorkoutLogs(user.id);
      setWorkoutLogs(logs);
    }
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFirstVisit, user?.id]);

  // Save data when it changes
  useEffect(() => {
    if (appData.workouts.length > 0 && user?.id) {
      saveWorkoutData(appData);
    }
  }, [appData, user?.id]);

  // Add workout log
  const addWorkoutLog = async (log: WorkoutLog) => {
    if (!user?.id) return;
    try {
      await saveWorkoutLog(log, user.id);
      setWorkoutLogs((prev) => [log, ...prev]); // Add new log to the top
      toast({ title: "Workout logged!" });
    } catch (error) {
      toast({ title: "Failed to log workout", description: String(error), variant: "destructive" });
    }
  };

  // Update workouts
  const updateWorkouts = (workouts: Workout[]) => {
    setAppData((prev) => ({
      ...prev,
      workouts,
    }));
    if (user?.id) {
      saveWorkoutData({ ...appData, workouts });
    }
  };

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
    </div>
  )
}
