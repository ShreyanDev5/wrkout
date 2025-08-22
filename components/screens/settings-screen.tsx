"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  PlusCircle,
  Trash2,
  Plus,
  Settings2,
  Dumbbell,
  Calendar,
  ArrowUp,
  ArrowDown,
  Footprints,
  Sparkles,
  Zap,
  RotateCcw,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"
import type { Workout, WorkoutDay } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from '@/lib/auth/auth-context'
import { ResetConfirmationModal } from '@/components/reset-confirmation-modal'
import { DeletionConfirmationModal } from '@/components/deletion-confirmation-modal'
import { OnboardingGuide } from '@/components/onboarding-guide'
import { v4 as uuidv4 } from 'uuid'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRef } from "react"
import { updateWorkoutDayExercises, loadUserWorkoutDays } from '@/lib/supabase-data'

interface SettingsScreenProps {
  workouts: Workout[]
  workoutDays: WorkoutDay[]
  onUpdateWorkoutsAndDays: (workouts: Workout[], workoutDays: WorkoutDay[]) => void
}

export function SettingsScreen({ workouts, workoutDays, onUpdateWorkoutsAndDays }: SettingsScreenProps) {
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false)
  const [isAddDayOpen, setIsAddDayOpen] = useState(false)
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false)
  const [newWorkoutName, setNewWorkoutName] = useState("")
  const [newDayName, setNewDayName] = useState("")
  const [newDayId, setNewDayId] = useState("")
  const [newExerciseName, setNewExerciseName] = useState("")
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null)
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null)
  const [expandedWorkouts, setExpandedWorkouts] = useState<Record<string, boolean>>({})
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({})
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { toast } = useToast()
  const { signOut, user, username } = useAuth()
  const [isSignOutOpen, setIsSignOutOpen] = useState(false)
  const supabase = createClientComponentClient();

  // Add a new state to track a pending exercise open request
  const [pendingExerciseOpen, setPendingExerciseOpen] = useState<{workoutId: string, dayId: string} | null>(null)
  const [isDeleteAllWorkoutsOpen, setIsDeleteAllWorkoutsOpen] = useState(false);
  const [pendingDeleteWorkoutId, setPendingDeleteWorkoutId] = useState<string | null>(null);
  const [isDeleteWorkoutOpen, setIsDeleteWorkoutOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<{id: string, name: string} | null>(null);
  const [isDeleteDayOpen, setIsDeleteDayOpen] = useState(false);
  const [dayToDelete, setDayToDelete] = useState<{workoutId: string, id: string, name: string} | null>(null);
  const [isDeleteExerciseOpen, setIsDeleteExerciseOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<{workoutId: string, dayId: string, id: string, name: string} | null>(null);

  useEffect(() => {
    if (!user) return;
    // Check if user has demo data
    // (Demo data check removed)
  }, [user]);

  // Removed: handleAddDemoData and handleRemoveDemoData

  // Reset scroll position when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (!isAddExerciseOpen) {
      setSelectedWorkoutId(null)
      setSelectedDayId(null)
      setNewExerciseName("")
    }
  }, [isAddExerciseOpen])

  // Add a useEffect to open the dialog only after IDs are set
  useEffect(() => {
    if (pendingExerciseOpen) {
      setSelectedWorkoutId(pendingExerciseOpen.workoutId)
      setSelectedDayId(pendingExerciseOpen.dayId)
      setIsAddExerciseOpen(true)
      setPendingExerciseOpen(null)
    }
  }, [pendingExerciseOpen])

  const toggleWorkoutExpanded = (workoutId: string) => {
    setExpandedWorkouts((prev) => ({
      ...prev,
      [workoutId]: !prev[workoutId],
    }))
  }

  const toggleDayExpanded = (dayKey: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayKey]: !prev[dayKey],
    }))
  }

  const handleAddWorkout = () => {
    if (!newWorkoutName.trim()) return

    const newWorkout: Workout = {
      id: uuidv4(),
      user_id: user?.id || '',
      name: newWorkoutName,
      days: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    onUpdateWorkoutsAndDays([...workouts, newWorkout], workoutDays)
    setNewWorkoutName("")
    setIsAddWorkoutOpen(false)

    // Auto-expand the new workout
    setExpandedWorkouts((prev) => ({
      ...prev,
      [newWorkout.id]: true,
    }))

    toast({
      title: "Workout Added",
      description: `${newWorkoutName} has been added to your workouts.`,
      className: "bg-[#34A853] border-none text-white",
    })
  }

  const handleDeleteWorkout = (workoutId: string, workoutName: string) => {
    if (workouts.length === 1) {
      setPendingDeleteWorkoutId(workoutId);
      setIsDeleteAllWorkoutsOpen(true);
      return;
    }
    setWorkoutToDelete({ id: workoutId, name: workoutName });
    setIsDeleteWorkoutOpen(true);
  }

  const confirmDeleteWorkout = async () => {
    if (!workoutToDelete || !user) return;
    
    try {
      // Delete workout from database (cascading delete will remove days and exercises)
      const { error } = await supabase.from('workouts').delete().eq('id', workoutToDelete.id);
      
      if (error) {
        console.error('Supabase delete error:', error);
        toast({ 
          title: 'Error', 
          description: error.message, 
          className: 'bg-[#EA4335] border-none text-white' 
        });
        return;
      }
      
      // Update local state
      onUpdateWorkoutsAndDays(
        workouts.filter((w) => w.id !== workoutToDelete.id), 
        workoutDays.filter((d) => d.workout_id !== workoutToDelete.id)
      );
      
      toast({
        title: "Workout Deleted",
        description: "The workout has been removed.",
        className: "bg-[#EA4335] border-none text-white",
      });
    } catch (err) {
      console.error('Unexpected error deleting workout:', err);
      toast({ 
        title: 'Error', 
        description: 'An unexpected error occurred. Please try again.', 
        className: 'bg-[#EA4335] border-none text-white' 
      });
    }
  }

  const handleAddDay = async () => {
    if (!newDayName.trim() || !newDayId.trim() || !selectedWorkoutId || !user) return;
    
    try {
      console.log('User info:', { id: user.id, email: user.email });
      console.log('Selected workout ID:', selectedWorkoutId);
      // Check if a day with this day_id already exists for this workout
      const existingDay = workoutDays.find(day => 
        day.workout_id === selectedWorkoutId && 
        day.day_id.toLowerCase() === newDayId.toLowerCase()
      );
      
      if (existingDay) {
        toast({ 
          title: 'Error', 
          description: `A day with ID "${newDayId}" already exists in this workout.`, 
          className: 'bg-[#EA4335] border-none text-white' 
        });
        return;
      }
      
      const newDay = {
        id: uuidv4(),
        workout_id: selectedWorkoutId,
        day_id: newDayId.toLowerCase(),
        name: newDayName,
        exercises: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Attempting to insert workout day:', newDay);
      
      // First, let's check if the table exists by trying to query it
      const { data: tableCheck, error: tableError } = await supabase
        .from('workout_days')
        .select('id')
        .limit(1);
      console.log('Table check response:', { tableCheck, tableError });
      
      const { data, error } = await supabase.from('workout_days').insert([newDay]);
      console.log('Supabase response:', { data, error });
      if (error) {
        console.error('Supabase insert error:', error);
        toast({ 
          title: 'Error', 
          description: error.message || 'Failed to add workout day. Please try again.', 
          className: 'bg-[#EA4335] border-none text-white' 
        });
        return;
      }
      
      const loadedWorkoutDays = await loadUserWorkoutDays(supabase, user.id);
      onUpdateWorkoutsAndDays(workouts, loadedWorkoutDays);
      setNewDayName("");
      setNewDayId("");
      setIsAddDayOpen(false);
      setExpandedDays((prev) => ({
        ...prev,
        [`${selectedWorkoutId}-${newDayId.toLowerCase()}`]: true,
      }));
      toast({
        title: "Day Added",
        description: `${newDayName} has been added to your workout.`,
        className: "bg-[#34A853] border-none text-white",
      });
    } catch (err) {
      console.error('Unexpected error adding workout day:', err);
      toast({ 
        title: 'Error', 
        description: 'An unexpected error occurred. Please try again.', 
        className: 'bg-[#EA4335] border-none text-white' 
      });
    }
  };

  const handleDeleteDay = async (workoutId: string, dayId: string, dayName: string) => {
    setDayToDelete({ workoutId, id: dayId, name: dayName });
    setIsDeleteDayOpen(true);
  }

  const confirmDeleteDay = async () => {
    if (!dayToDelete || !user) return;
    
    try {
      const { error } = await supabase.from('workout_days').delete().eq('id', dayToDelete.id);
      if (error) {
        console.error('Supabase delete error:', error);
        toast({ title: 'Error', description: error.message, className: 'bg-[#EA4335] border-none text-white' });
        return;
      }
      const loadedWorkoutDays = await loadUserWorkoutDays(supabase, user.id);
      onUpdateWorkoutsAndDays(workouts, loadedWorkoutDays);
      toast({
        title: "Day Deleted",
        description: "The day has been removed from your workout.",
        className: "bg-[#EA4335] border-none text-white",
      });
    } catch (err) {
      console.error('Unexpected error deleting day:', err);
      toast({ 
        title: 'Error', 
        description: 'An unexpected error occurred. Please try again.', 
        className: 'bg-[#EA4335] border-none text-white' 
      });
    }
  };

  const handleAddExercise = async () => {
    if (!newExerciseName.trim() || !selectedWorkoutId || !selectedDayId || !user) return;
    // Find the workout day to update
    const dayToUpdate = workoutDays.find(day => day.id === selectedDayId);
    if (!dayToUpdate) return;
    const updatedExercises = [
      ...(dayToUpdate.exercises || []),
      { id: uuidv4(), name: newExerciseName }
    ];
    const { error } = await updateWorkoutDayExercises(supabase, selectedDayId, updatedExercises);
    if (error) {
      console.error('Supabase update error:', error);
      toast({ title: 'Error', description: error.message, className: 'bg-[#EA4335] border-none text-white' });
      return;
    }
    const loadedWorkoutDays = await loadUserWorkoutDays(supabase, user.id);
    onUpdateWorkoutsAndDays(workouts, loadedWorkoutDays);
    setNewExerciseName("");
    setIsAddExerciseOpen(false);
    toast({
      title: "Exercise Added",
      description: `${newExerciseName} has been added to your workout.`,
      className: "bg-[#34A853] border-none text-white",
    });
  }

  const handleDeleteExercise = async (workoutId: string, dayId: string, exerciseId: string, exerciseName: string) => {
    setExerciseToDelete({ workoutId, dayId, id: exerciseId, name: exerciseName });
    setIsDeleteExerciseOpen(true);
  }

  const confirmDeleteExercise = async () => {
    if (!exerciseToDelete || !user) return;
    
    try {
      // Find the workout day to update
      const dayToUpdate = workoutDays.find(day => day.id === exerciseToDelete.dayId);
      if (!dayToUpdate) return;
      
      const updatedExercises = (dayToUpdate.exercises || []).filter((exercise: any) => exercise.id !== exerciseToDelete.id);
      const { error } = await updateWorkoutDayExercises(supabase, exerciseToDelete.dayId, updatedExercises);
      if (error) {
        console.error('Supabase update error:', error);
        toast({ title: 'Error', description: error.message, className: 'bg-[#EA4335] border-none text-white' });
        return;
      }
      const loadedWorkoutDays = await loadUserWorkoutDays(supabase, user.id);
      onUpdateWorkoutsAndDays(workouts, loadedWorkoutDays);
      toast({
        title: "Exercise Deleted",
        description: "The exercise has been removed from your workout.",
        className: "bg-[#EA4335] border-none text-white",
      });
    } catch (err) {
      console.error('Unexpected error deleting exercise:', err);
      toast({ 
        title: 'Error', 
        description: 'An unexpected error occurred. Please try again.', 
        className: 'bg-[#EA4335] border-none text-white' 
      });
    }
  }

  // Get day icon and color based on day ID
  const getDayIconAndColor = (dayId: string) => {
    switch (dayId.toLowerCase()) {
      case "push":
        return {
          icon: <ArrowUp className="h-4 w-4" />,
          color: "bg-[#FBBC04]",
          textColor: "text-zinc-900",
          borderColor: "border-[#FBBC04]",
        }
      case "pull":
        return {
          icon: <ArrowDown className="h-4 w-4" />,
          color: "bg-[#34A853]",
          textColor: "text-white",
          borderColor: "border-[#34A853]",
        }
      case "leg":
        return {
          icon: <Footprints className="h-4 w-4" />,
          color: "bg-[#EA4335]",
          textColor: "text-white",
          borderColor: "border-[#EA4335]",
        }
      default:
        return {
          icon: <Dumbbell className="h-4 w-4" />,
          color: "bg-zinc-700",
          textColor: "text-white",
          borderColor: "border-zinc-700",
        }
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  // Use username from context (case-sensitive)
  const displayUsername = username || (user?.email ? user.email.replace(/@wrkout\.app$/, '') : '');

  const handleSignOut = async () => {
    signOut();
  }

  return (
    <Card className="border-0 shadow-none dark:bg-background max-w-3xl mx-auto w-full">
      <CardHeader className="px-3 sm:px-4">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#EA4335] shadow-sm">
              <Settings2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Settings</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Customize your workout.</p>
            </div>
          </div>
          {/* Removed lastSyncTime display */}
        </div>
      </CardHeader>

      <CardContent className="px-3 sm:px-4">
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={containerVariants}
          className="space-y-8 sm:space-y-12"
        >
          <motion.div variants={itemVariants}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800">
                  <Dumbbell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-700 dark:text-zinc-300" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-foreground truncate">
                  {displayUsername && (
                    <span className="fitness-text-gradient font-bold mr-1">{displayUsername}&apos;s</span>
                  )}
                  Workout Routines
                </h3>
              </div>
              <Button
                onClick={() => setIsAddWorkoutOpen(true)}
                size="sm"
                className="w-full sm:w-auto rounded-md bg-[#34A853] hover:bg-[#2D9249] text-white border-none shadow-sm text-sm"
                aria-label="Add new workout"
              >
                <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" aria-hidden="true" />
                Add Workout
              </Button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {workouts.length > 0 ? (
                workouts.map((workout) => {
                  const daysForWorkout = workoutDays.filter((day) => day.workout_id === workout.id)
                  return (
                    <motion.div
                      key={workout.id}
                      variants={itemVariants}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div
                        className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        onClick={() => toggleWorkoutExpanded(workout.id)}
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <span className="font-medium text-foreground text-sm sm:text-base">{workout.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteWorkout(workout.id, workout.name)
                            }}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full transition-all hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-[#EA4335]"
                            aria-label={`Delete ${workout.name} workout`}
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                          </Button>
                          <div className="h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                            <svg
                              width="10"
                              height="6"
                              viewBox="0 0 10 6"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className={`transform transition-transform ${expandedWorkouts[workout.id] ? "rotate-180" : ""}`}
                            >
                              <path
                                d="M1 1L5 5L9 1"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <AnimatePresence>
                        {expandedWorkouts[workout.id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                              <div className="flex items-center justify-between mb-2.5 sm:mb-3 mt-1.5 sm:mt-2">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                    <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-zinc-700 dark:text-zinc-300" />
                                  </div>
                                  <h4 className="text-xs sm:text-sm font-medium text-foreground">Workout Days</h4>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedWorkoutId(workout.id)
                                    setIsAddDayOpen(true)
                                  }}
                                  className="h-7 sm:h-8 rounded-md border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm"
                                  aria-label={`Add day to ${workout.name}`}
                                >
                                  <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" aria-hidden="true" />
                                  Add Day
                                </Button>
                              </div>
                              {daysForWorkout.length > 0 ? (
                                <div className="space-y-2.5 sm:space-y-3">
                                  {daysForWorkout.map((day) => {
                                    const dayKey = `${workout.id}-${day.id}`
                                    const { icon, color, textColor, borderColor } = getDayIconAndColor(day.day_id)
                                    return (
                                      <div
                                        key={dayKey}
                                        className={`border ${borderColor} rounded-lg overflow-hidden bg-white dark:bg-zinc-900`}
                                      >
                                        <div
                                          className="flex items-center justify-between p-2.5 sm:p-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                          onClick={() => toggleDayExpanded(dayKey)}
                                        >
                                          <div className="flex items-center gap-1.5 sm:gap-2">
                                            <div
                                              className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-lg ${color}`}
                                            >
                                              {icon}
                                            </div>
                                            <span className={`font-medium text-foreground text-sm sm:text-base`}>{day.name}</span>
                                          </div>
                                          <div className="flex items-center gap-1.5 sm:gap-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteDay(workout.id, day.id, day.name)
                                              }}
                                              className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-full transition-all hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-[#EA4335]"
                                              aria-label={`Delete ${day.name} day`}
                                            >
                                              <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                                            </Button>
                                            <div className="h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                                              <svg
                                                width="8"
                                                height="5"
                                                viewBox="0 0 10 6"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`transform transition-transform ${expandedDays[dayKey] ? "rotate-180" : ""}`}
                                              >
                                                <path
                                                  d="M1 1L5 5L9 1"
                                                  stroke="currentColor"
                                                  strokeWidth="1.5"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            </div>
                                          </div>
                                        </div>
                                        <AnimatePresence>
                                          {expandedDays[dayKey] && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.2 }}
                                              className="overflow-hidden"
                                            >
                                              <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3">
                                                <div className="flex items-center justify-between mb-1.5 sm:mb-2 mt-1.5 sm:mt-2">
                                                  <h6
                                                    className={`text-xs font-medium text-zinc-500 dark:text-zinc-400`}
                                                  >
                                                    Exercises
                                                  </h6>
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      setPendingExerciseOpen({ workoutId: workout.id, dayId: day.id })
                                                    }}
                                                    className={`h-6 sm:h-7 text-xs rounded-md border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300`}
                                                    aria-label={`Add exercise to ${day.name}`}
                                                  >
                                                    <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" aria-hidden="true" />
                                                    Add Exercise
                                                  </Button>
                                                </div>
                                                {day.exercises.length > 0 ? (
                                                  <ul className="space-y-1 sm:space-y-1.5 mt-1.5 sm:mt-2">
                                                    {day.exercises.map((exercise) => (
                                                      <li
                                                        key={exercise.id}
                                                        className={`flex items-center justify-between p-1.5 sm:p-2 bg-zinc-50 dark:bg-zinc-800 rounded-md`}
                                                      >
                                                        <span className={`text-xs sm:text-sm text-foreground`}>
                                                          {exercise.name}
                                                        </span>
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          onClick={() =>
                                                            handleDeleteExercise(workout.id, day.id, exercise.id, exercise.name)
                                                          }
                                                          className="h-5 w-5 sm:h-6 sm:w-6 p-0 rounded-full transition-all hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-[#EA4335]"
                                                          aria-label={`Delete ${exercise.name} exercise`}
                                                        >
                                                          <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" aria-hidden="true" />
                                                        </Button>
                                                      </li>
                                                    ))}
                                                  </ul>
                                                ) : (
                                                  <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">No exercises added for this day yet.</div>
                                                )}
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : (
                                <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm px-2">No days added for this workout yet.</div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })
              ) : (
                <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">No workouts found.</div>
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col items-center gap-3 sm:gap-4">
            <Button
              variant="outline"
              className="rounded-md border-blue-500/20 text-blue-500 hover:bg-blue-500/10 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold"
              onClick={() => setShowOnboarding(true)}
            >
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              Guide Me
            </Button>
            <Button
              variant="destructive"
              className="rounded-md bg-[#EA4335] hover:bg-[#c62828] text-white border-none shadow-sm px-4 sm:px-6 py-2 text-sm sm:text-base font-semibold"
              onClick={() => setIsSignOutOpen(true)}
            >
              Sign Out
            </Button>
          </motion.div>
        </motion.div>
      </CardContent>

      {/* Add Workout Dialog */}
      <Dialog open={isAddWorkoutOpen} onOpenChange={setIsAddWorkoutOpen}>
        <DialogContent className="w-[92%] max-w-[320px] dark:bg-background/90 dark:border-opacity-10 rounded-xl mx-auto p-4 shadow-lg backdrop-blur-xl">
          <DialogHeader>
            <div className="flex flex-col items-center gap-1.5 mb-1.5">
              <PlusCircle className="h-5 w-5 text-[#34A853]" aria-hidden="true" />
              <DialogTitle className="line-height-readable text-center text-base">Add New Workout</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-3">
            <p className="line-height-readable text-center mb-3 text-xs text-muted-foreground">
              Create a new workout routine. Workouts contain days and exercises.
            </p>
            <Label htmlFor="workout-name" className="block text-center mb-1.5 text-sm">Workout Name</Label>
            <Input
              id="workout-name"
              value={newWorkoutName}
              onChange={(e) => setNewWorkoutName(e.target.value)}
              placeholder="Enter workout name"
              className="mt-1.5 text-sm px-2.5 py-1.5 rounded-md"
            />
          </div>
          <div className="flex flex-row justify-between gap-2 mt-3.5 w-full">
            <button
              type="button"
              onClick={() => setIsAddWorkoutOpen(false)}
              className="flex-1 px-2.5 py-2 rounded-md border font-semibold bg-muted hover:bg-muted/80 transition-colors focus-visible:ring outline-none dark:border-opacity-10 dark:hover:bg-secondary text-sm"
              aria-label="Cancel add workout"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddWorkout}
              className="flex-1 px-2.5 py-2 rounded-md border font-semibold bg-[#34A853] text-white hover:bg-[#2D9249] transition-colors focus-visible:ring outline-none dark:border-none dark:shadow-none text-sm"
              aria-label="Confirm add workout"
            >
              Add Workout
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Day Dialog */}
      <Dialog open={isAddDayOpen} onOpenChange={setIsAddDayOpen}>
        <DialogContent className="w-[92%] max-w-[320px] dark:bg-background/90 dark:border-opacity-10 rounded-xl mx-auto p-4 shadow-lg backdrop-blur-xl">
          <DialogHeader>
            <div className="flex flex-col items-center gap-1.5 mb-1.5">
              <PlusCircle className="h-5 w-5 text-[#34A853]" aria-hidden="true" />
              <DialogTitle className="line-height-readable text-center text-base">Add Workout Day</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-3 flex flex-col gap-4">
            <p className="line-height-readable text-center text-xs text-muted-foreground">
              Define a day's routine (e.g., push, pull, leg, or custom).
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="day-name" className="block text-center text-sm">Day Name</Label>
                <Input
                  id="day-name"
                  value={newDayName}
                  onChange={(e) => setNewDayName(e.target.value)}
                  placeholder="Enter day name (e.g. Push Day)"
                  className="mt-1 text-sm px-2.5 py-1.5 rounded-md"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="day-id" className="block text-center text-sm">Day ID</Label>
                <Input
                  id="day-id"
                  value={newDayId}
                  onChange={(e) => setNewDayId(e.target.value)}
                  placeholder="Enter day ID (e.g. 'push', 'pull', 'leg')"
                  className="mt-1 text-sm px-2.5 py-1.5 rounded-md"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 text-center">
                  Use "push", "pull", or "leg" for special styling
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-between gap-2 mt-3.5 w-full">
            <button
              type="button"
              onClick={() => setIsAddDayOpen(false)}
              className="flex-1 px-2.5 py-2 rounded-md border font-semibold bg-muted hover:bg-muted/80 transition-colors focus-visible:ring outline-none dark:border-opacity-10 dark:hover:bg-secondary text-sm"
              aria-label="Cancel add day"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddDay}
              className="flex-1 px-2.5 py-2 rounded-md border font-semibold bg-[#34A853] text-white hover:bg-[#2D9249] transition-colors focus-visible:ring outline-none dark:border-none dark:shadow-none text-sm"
              aria-label="Confirm add day"
            >
              Add Day
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Exercise Dialog */}
      <Dialog open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
        <DialogContent className="w-[92%] max-w-[320px] dark:bg-background/90 dark:border-opacity-10 rounded-xl mx-auto p-4 shadow-lg backdrop-blur-xl">
          <DialogHeader>
            <div className="flex flex-col items-center gap-1.5 mb-1.5">
              <PlusCircle className="h-5 w-5 text-[#34A853]" aria-hidden="true" />
              <DialogTitle className="line-height-readable text-center text-base">Add Exercise</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-3">
            <p className="line-height-readable text-center mb-1 text-xs text-muted-foreground">
              Add an exercise to your workout day.
            </p>
            <Label htmlFor="exercise-name" className="block text-center mt-4 mb-1.5 text-sm">Exercise Name</Label>
            <Input
              id="exercise-name"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              placeholder="Enter exercise name"
              className="mt-1.5 text-sm px-2.5 py-1.5 rounded-md"
            />
          </div>
          <div className="flex flex-row justify-between gap-2 mt-3.5 w-full">
            <button
              type="button"
              onClick={() => setIsAddExerciseOpen(false)}
              className="flex-1 px-2.5 py-2 rounded-md border font-semibold bg-muted hover:bg-muted/80 transition-colors focus-visible:ring outline-none dark:border-opacity-10 dark:hover:bg-secondary text-sm"
              aria-label="Cancel add exercise"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddExercise}
              className="flex-1 px-2.5 py-2 rounded-md border font-semibold bg-[#34A853] text-white hover:bg-[#2D9249] transition-colors focus-visible:ring outline-none dark:border-none dark:shadow-none text-sm"
              aria-label="Confirm add exercise"
              disabled={
                !newExerciseName.trim() || !selectedWorkoutId || !selectedDayId
              }
            >
              Add Exercise
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ResetConfirmationModal
        isOpen={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
        onConfirm={handleSignOut}
        dayColor="#EA4335"
        message={"Are you sure you want to sign out? You'll need to log in again to access your workouts and progress."}
      />
      
      {/* Onboarding Guide */}
      <OnboardingGuide 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />

      <ResetConfirmationModal
        isOpen={isDeleteAllWorkoutsOpen}
        onClose={() => setIsDeleteAllWorkoutsOpen(false)}
        onConfirm={() => {
          if (pendingDeleteWorkoutId) {
            onUpdateWorkoutsAndDays(workouts.filter((w) => w.id !== pendingDeleteWorkoutId), workoutDays);
            toast({
              title: "Workout Deleted",
              description: "The last workout routine has been removed.",
              className: "bg-[#EA4335] border-none text-white",
            });
            setPendingDeleteWorkoutId(null);
          }
        }}
        dayColor="#EA4335"
        message={"Are you sure you want to delete your last workout routine? This will remove all associated days and exercises. This action cannot be undone."}
      />

      {/* Workout Deletion Confirmation Modal */}
      <DeletionConfirmationModal
        isOpen={isDeleteWorkoutOpen}
        onClose={() => {
          setIsDeleteWorkoutOpen(false);
          setWorkoutToDelete(null);
        }}
        onConfirm={confirmDeleteWorkout}
        itemType="workout"
        itemName={workoutToDelete?.name || ""}
      />

      {/* Day Deletion Confirmation Modal */}
      <DeletionConfirmationModal
        isOpen={isDeleteDayOpen}
        onClose={() => {
          setIsDeleteDayOpen(false);
          setDayToDelete(null);
        }}
        onConfirm={confirmDeleteDay}
        itemType="day"
        itemName={dayToDelete?.name || ""}
      />

      {/* Exercise Deletion Confirmation Modal */}
      <DeletionConfirmationModal
        isOpen={isDeleteExerciseOpen}
        onClose={() => {
          setIsDeleteExerciseOpen(false);
          setExerciseToDelete(null);
        }}
        onConfirm={confirmDeleteExercise}
        itemType="exercise"
        itemName={exerciseToDelete?.name || ""}
      />

      <div className="my-6">
        {/* Removed all usages of getDemoWorkoutLogs, demoWorkoutLogs, demoPreviousWorkoutLogs, handleRemoveDemoData, and handleAddDemoData */}
      </div>
    </Card>
  )
}
