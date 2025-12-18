"use client"

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  PlusCircle,
  Trash2,
  Plus,
  Dumbbell,
  Calendar,
  ArrowUp,
  ArrowDown,
  Footprints,
  Sparkles,
  GripVertical,
  Settings,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import type { Workout, WorkoutDay } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from '@/lib/auth/auth-context'
import { DeletionConfirmationModal } from "@/components/modals/deletion-confirmation-modal"
import { ResetConfirmationModal } from "@/components/modals/reset-confirmation-modal" // Re-trigger import check
import { RestrictionConfirmationModal } from "@/components/modals/restriction-confirmation-modal"
import { updateWorkoutDayExercises, loadUserWorkoutDays } from '@/lib/supabase-data'
import { v4 as uuidv4 } from 'uuid'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import dynamic from 'next/dynamic'

const OnboardingGuide = dynamic(() => import("@/components/onboarding/onboarding-guide").then(mod => mod.OnboardingGuide), {
  loading: () => null,
  ssr: false
})

interface ExerciseItemProps {
  exercise: any;
  index: number;
  totalExercises: number;
  dayId: string;
  workoutId: string;
  onMoveUp: (dayId: string, index: number) => void;
  onMoveDown: (dayId: string, index: number) => void;
  onDelete: (workoutId: string, dayId: string, exerciseId: string, exerciseName: string) => void;
}

const ExerciseItem = memo(({
  exercise,
  index,
  totalExercises,
  dayId,
  workoutId,
  onMoveUp,
  onMoveDown,
  onDelete
}: ExerciseItemProps) => {
  return (
    <li
      className={`flex items-center justify-between p-1.5 sm:p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-lg transition-colors group/item`}
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <div className="flex flex-col gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMoveUp(dayId, index)}
            disabled={index === 0}
            className="h-5 w-5 p-0 rounded-full transition-all hover:bg-zinc-700 disabled:opacity-30"
            aria-label={`Move ${exercise.name} up`}
          >
            <ArrowUp className="h-2.5 w-2.5" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMoveDown(dayId, index)}
            disabled={index === totalExercises - 1}
            className="h-5 w-5 p-0 rounded-full transition-all hover:bg-zinc-700 disabled:opacity-30"
            aria-label={`Move ${exercise.name} down`}
          >
            <ArrowDown className="h-2.5 w-2.5" aria-hidden="true" />
          </Button>
        </div>
        <span className="text-xs sm:text-sm text-foreground min-w-0 flex-1" title={exercise.name}>
          {exercise.name}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(workoutId, dayId, exercise.id, exercise.name)}
        className="h-6 w-6 sm:h-6 sm:w-6 p-0 rounded-full transition-all hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-[#EA4335]"
        aria-label={`Delete ${exercise.name} exercise`}
      >
        <Trash2 className="h-3 w-3 sm:h-3 sm:w-3" aria-hidden="true" />
      </Button>
    </li>
  );
})
ExerciseItem.displayName = "ExerciseItem"

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
  const [pendingExerciseOpen, setPendingExerciseOpen] = useState<{ workoutId: string, dayId: string } | null>(null)
  const [isDeleteAllWorkoutsOpen, setIsDeleteAllWorkoutsOpen] = useState(false);
  const [pendingDeleteWorkoutId, setPendingDeleteWorkoutId] = useState<string | null>(null);
  const [isDeleteWorkoutOpen, setIsDeleteWorkoutOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<{ id: string, name: string } | null>(null);
  const [isDeleteDayOpen, setIsDeleteDayOpen] = useState(false);
  const [dayToDelete, setDayToDelete] = useState<{ workoutId: string, id: string, name: string } | null>(null);
  const [isDeleteExerciseOpen, setIsDeleteExerciseOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<{ workoutId: string, dayId: string, id: string, name: string } | null>(null);
  const [isDuplicateDayOpen, setIsDuplicateDayOpen] = useState(false);
  const [isMaxDaysOpen, setIsMaxDaysOpen] = useState(false);

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
    // Validate that we have required data
    if (!selectedWorkoutId || !user) return;

    // Validate that we have a day name and ID
    if (!newDayName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a day name.',
        className: 'bg-[#EA4335] border-none text-white'
      });
      return;
    }

    if (!newDayId.trim()) {
      toast({
        title: 'Error',
        description: 'Please select a day ID or enter a custom one.',
        className: 'bg-[#EA4335] border-none text-white'
      });
      return;
    }

    try {


      // Check if a day with this day_id already exists for this workout
      const existingDay = workoutDays.find(day =>
        day.workout_id === selectedWorkoutId &&
        day.day_id.toLowerCase() === newDayId.toLowerCase()
      );

      if (existingDay) {
        setIsDuplicateDayOpen(true);
        return;
      }

      // Check if this workout already has 3 days (max limit)
      const daysForWorkout = workoutDays.filter(day => day.workout_id === selectedWorkoutId);
      if (daysForWorkout.length >= 3) {
        setIsMaxDaysOpen(true);
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



      // First, let's check if the table exists by trying to query it
      const { data: tableCheck, error: tableError } = await supabase
        .from('workout_days')
        .select('id')
        .limit(1);


      const { data, error } = await supabase.from('workout_days').insert([newDay]);

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

  // Move exercise up in the list
  const moveExerciseUp = async (dayId: string, index: number) => {
    if (index === 0) return;

    // Find the workout day to update
    const dayIndex = workoutDays.findIndex(day => day.id === dayId);
    if (dayIndex === -1 || !user) return;

    const dayToUpdate = workoutDays[dayIndex];

    // Create a new array with the exercises reordered
    const exercises = [...dayToUpdate.exercises];
    [exercises[index], exercises[index - 1]] = [exercises[index - 1], exercises[index]];

    try {
      // Update the exercises in the database
      const { error } = await updateWorkoutDayExercises(supabase, dayId, exercises);
      if (error) {
        console.error('Supabase update error:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to move exercise. Please try again.',
          className: 'bg-[#EA4335] border-none text-white'
        });
        return;
      }

      // Update local state directly without reloading from database
      const updatedWorkoutDays = [...workoutDays];
      updatedWorkoutDays[dayIndex] = {
        ...dayToUpdate,
        exercises
      };

      onUpdateWorkoutsAndDays(workouts, updatedWorkoutDays);

      toast({
        title: "Exercise Moved",
        description: "The exercise has been moved up in the list.",
        className: "bg-[#34A853] border-none text-white",
      });
    } catch (err) {
      console.error('Unexpected error moving exercise:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        className: 'bg-[#EA4335] border-none text-white'
      });
    }
  };

  // Move exercise down in the list
  const moveExerciseDown = async (dayId: string, index: number) => {
    const dayIndex = workoutDays.findIndex(day => day.id === dayId);
    if (dayIndex === -1 || !user) return;

    const dayToUpdate = workoutDays[dayIndex];

    if (index === dayToUpdate.exercises.length - 1) return;

    // Create a new array with the exercises reordered
    const exercises = [...dayToUpdate.exercises];
    [exercises[index], exercises[index + 1]] = [exercises[index + 1], exercises[index]];

    try {
      // Update the exercises in the database
      const { error } = await updateWorkoutDayExercises(supabase, dayId, exercises);
      if (error) {
        console.error('Supabase update error:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to move exercise. Please try again.',
          className: 'bg-[#EA4335] border-none text-white'
        });
        return;
      }

      // Update local state directly without reloading from database
      const updatedWorkoutDays = [...workoutDays];
      updatedWorkoutDays[dayIndex] = {
        ...dayToUpdate,
        exercises
      };

      onUpdateWorkoutsAndDays(workouts, updatedWorkoutDays);

      toast({
        title: "Exercise Moved",
        description: "The exercise has been moved down in the list.",
        className: "bg-[#34A853] border-none text-white",
      });
    } catch (err) {
      console.error('Unexpected error moving exercise:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        className: 'bg-[#EA4335] border-none text-white'
      });
    }
  };

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

  // ExerciseItem moved outside component for performance


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
    <div className="w-full max-w-2xl mx-auto pb-20 sm:pb-24 px-4 sm:px-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-8 sm:mb-10 pt-4 sm:pt-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 border border-zinc-700/40 shadow-lg shadow-zinc-900/50">
          <Settings className="h-5 w-5" strokeWidth={2.5} style={{ color: '#EA4335' }} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Settings
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Manage routines & preferences
          </p>
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-10"
      >
        {/* Workouts Section */}
        <section className="space-y-4 bg-zinc-900/30 border border-zinc-700/40 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-700/50 border border-zinc-600/40">
                <Dumbbell className="h-4 w-4" style={{ color: '#4caf50' }} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Routines
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-zinc-800/50 text-[10px] font-medium text-zinc-400 mr-3">
                {workouts.length}
              </span>
            </div>
            <Button
              onClick={() => setIsAddWorkoutOpen(true)}
              size="sm"
              variant="ghost"
              className="h-8 px-3 rounded-lg bg-zinc-800/40 hover:bg-zinc-700/50 text-zinc-300 transition-all text-xs font-medium border border-zinc-700/30"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New
            </Button>
          </div>

          <div className="space-y-3">
            {workouts.length > 0 ? (
              workouts.map((workout) => {
                const daysForWorkout = workoutDays.filter((day) => day.workout_id === workout.id)
                const isExpanded = expandedWorkouts[workout.id]

                return (
                  <motion.div
                    key={workout.id}
                    variants={itemVariants}
                    layout
                    className={`group relative bg-zinc-800/60 hover:bg-zinc-800/80 border border-zinc-700/50 rounded-xl transition-all duration-300 overflow-hidden`}
                  >
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer"
                      onClick={() => toggleWorkoutExpanded(workout.id)}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
                          {workout.name}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                          {daysForWorkout.length} {daysForWorkout.length === 1 ? 'Session' : 'Sessions'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteWorkout(workout.id, workout.name)
                          }}
                          className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-zinc-100 dark:bg-zinc-800' : ''}`}>
                          <ArrowDown className="h-4 w-4 text-zinc-500" />
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-4 pb-4 pt-0">
                            <div className="w-full h-px bg-zinc-100 dark:bg-zinc-800 mb-4" />

                            <div className="space-y-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                                  Weekly Schedule
                                </h4>
                                <button
                                  onClick={() => {
                                    setSelectedWorkoutId(workout.id)
                                    setIsAddDayOpen(true)
                                  }}
                                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                                >
                                  <Plus className="h-3 w-3" />
                                  Add Day
                                </button>
                              </div>

                              {daysForWorkout.length > 0 ? (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                  {daysForWorkout.map((day) => {
                                    const dayKey = `${workout.id}-${day.id}`
                                    const { icon, color, textColor } = getDayIconAndColor(day.day_id)
                                    const isDayExpanded = expandedDays[dayKey]

                                    return (
                                      <div
                                        key={dayKey}
                                        className="relative rounded-xl border border-zinc-700/50 bg-zinc-800/40 overflow-hidden"
                                        style={{
                                          borderLeftWidth: '3px',
                                          borderLeftColor: day.day_id === 'push' ? '#f9d949' : day.day_id === 'pull' ? '#4caf50' : day.day_id === 'leg' ? '#EA4335' : '#71717a'
                                        }}
                                      >
                                        <div
                                          className="flex items-center justify-between p-3 cursor-pointer hover:bg-zinc-700/40 transition-colors"
                                          onClick={() => toggleDayExpanded(dayKey)}
                                        >
                                          <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${color} shadow-sm flex-shrink-0`}>
                                              <div className={`${textColor} [&>svg]:h-4 [&>svg]:w-4`}>{icon}</div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <p className="text-sm font-semibold text-zinc-100 break-words leading-tight">
                                                {day.name}
                                              </p>
                                              <p className="text-xs text-zinc-500 mt-0.5">
                                                {day.exercises?.length || 0} Exercises
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteDay(workout.id, day.id, day.name)
                                              }}
                                              className="h-7 w-7 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                          </div>
                                        </div>

                                        <AnimatePresence>
                                          {isDayExpanded && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.2 }}
                                            >
                                              <div className="px-3 pb-3 pt-1">
                                                <div className="mt-2 space-y-1">
                                                  <div className="flex items-center justify-between py-2 px-1">
                                                    <span className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">Exercise List</span>
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        setPendingExerciseOpen({ workoutId: workout.id, dayId: day.id })
                                                      }}
                                                      className="text-[10px] sm:text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                                    >
                                                      <Plus className="h-3 w-3" />
                                                      Add Exercise
                                                    </button>
                                                  </div>

                                                  {day.exercises.length > 0 ? (
                                                    <ul className="space-y-1.5">
                                                      {day.exercises.map((exercise, index) => (
                                                        <ExerciseItem
                                                          key={exercise.id}
                                                          exercise={exercise}
                                                          index={index}
                                                          totalExercises={day.exercises.length}
                                                          dayId={day.id}
                                                          workoutId={workout.id}
                                                          onMoveUp={moveExerciseUp}
                                                          onMoveDown={moveExerciseDown}
                                                          onDelete={handleDeleteExercise}
                                                        />
                                                      ))}
                                                    </ul>
                                                  ) : (
                                                    <div className="text-center py-4 text-zinc-400 text-xs italic">
                                                      No exercises added yet. Use the button above to add one.
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : (
                                <div className="text-center py-8 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">No days added to this routine.</p>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedWorkoutId(workout.id)
                                      setIsAddDayOpen(true)
                                    }}
                                    className="h-8 text-xs"
                                  >
                                    Add Your First Day
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })
            ) : (
              <motion.div
                variants={itemVariants}
                className="text-center py-12 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700"
              >
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="h-6 w-6 text-zinc-400" />
                </div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">No Workouts Yet</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-xs mx-auto">
                  Create your first workout routine to get started with tracking your progress.
                </p>
                <Button onClick={() => setIsAddWorkoutOpen(true)}>
                  Create Workout
                </Button>
              </motion.div>
            )}
          </div>
        </section>

        {/* Account Actions */}
        <section className="pt-6">
          <div className="relative bg-zinc-800/60 border border-zinc-700/50 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-700/50 border border-zinc-600/40">
                  <Sparkles className="h-4 w-4" style={{ color: '#f9d949' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Account & Guide</h3>
                  <p className="text-xs text-muted-foreground">Need help or switching accounts?</p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 sm:flex-none h-8 px-3 rounded-lg bg-zinc-800/40 hover:bg-zinc-700/50 text-zinc-300 transition-all text-xs font-medium border border-zinc-700/30"
                  onClick={() => setShowOnboarding(true)}
                >
                  View Guide
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 sm:flex-none h-8 px-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all text-xs font-medium"
                  onClick={() => setIsSignOutOpen(true)}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </section>
      </motion.div>

      {/* Dialogs - Kept functionally same but ensures classes match new aesthetic if needed. existing styling indialogs is mostly generic shadcn which is fine. */}
      {/* Add Workout Dialog */}
      <Dialog open={isAddWorkoutOpen} onOpenChange={setIsAddWorkoutOpen}>
        <DialogContent className="w-[92%] max-w-[320px] md:max-w-[400px] dark:bg-zinc-900 dark:border-zinc-800 rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <div className="flex flex-col items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <DialogTitle className="text-center text-lg font-semibold">New Routine</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="workout-name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</Label>
            <Input
              id="workout-name"
              value={newWorkoutName}
              onChange={(e) => setNewWorkoutName(e.target.value)}
              placeholder="e.g. Summer Cut, Bulking..."
              className="mt-2"
            />
          </div>
          <DialogFooter className="flex-row gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsAddWorkoutOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleAddWorkout} className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Day Dialog */}
      <Dialog open={isAddDayOpen} onOpenChange={setIsAddDayOpen}>
        <DialogContent className="w-[92%] max-w-[320px] md:max-w-[400px] dark:bg-zinc-900 dark:border-zinc-800 rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <div className="flex flex-col items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <DialogTitle className="text-center text-lg font-semibold">Add Session</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="day-name">Session Name</Label>
              <Input
                id="day-name"
                value={newDayName}
                onChange={(e) => setNewDayName(e.target.value)}
                placeholder="e.g. Upper Body"
              />
            </div>

            <div className="space-y-3">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Quick Select</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'push', name: 'Push', icon: ArrowUp, color: 'text-zinc-900', bg: 'bg-[#FBBC04]' },
                  { id: 'pull', name: 'Pull', icon: ArrowDown, color: 'text-white', bg: 'bg-[#34A853]' },
                  { id: 'leg', name: 'Legs', icon: Footprints, color: 'text-white', bg: 'bg-[#EA4335]' }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setNewDayId(type.id);
                      setNewDayName(type.name + (type.id === 'leg' ? '' : ' Day'));
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${newDayId === type.id
                      ? 'border-zinc-900 ring-1 ring-zinc-900 dark:border-zinc-100 dark:ring-zinc-100 bg-zinc-50 dark:bg-zinc-800'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${type.bg} flex items-center justify-center ${type.color}`}>
                      <type.icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-row gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsAddDayOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleAddDay} className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
              Add Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Exercise Dialog */}
      <Dialog open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
        <DialogContent className="w-[92%] max-w-[320px] md:max-w-[400px] dark:bg-zinc-900 dark:border-zinc-800 rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <div className="flex flex-col items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <DialogTitle className="text-center text-lg font-semibold">New Exercise</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="exercise-name">Exercise Name</Label>
            <Input
              id="exercise-name"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              placeholder="e.g. Incline Bench Press"
              className="mt-2"
            />
          </div>
          <DialogFooter className="flex-row gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsAddExerciseOpen(false)} className="flex-1">Cancel</Button>
            <Button
              onClick={handleAddExercise}
              disabled={!newExerciseName.trim() || !selectedWorkoutId || !selectedDayId}
              className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ResetConfirmationModal
        isOpen={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
        onConfirm={handleSignOut}
        dayColor="#EA4335"
        message={"Are you sure you want to sign out? You will need to log in again to access your workouts and progress."}
      />

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

      <RestrictionConfirmationModal
        isOpen={isDuplicateDayOpen}
        onClose={() => setIsDuplicateDayOpen(false)}
        title="Duplicate Day"
        message="This day already exists in the current workout routine. Each day type can only be added once per routine."
      />

      <RestrictionConfirmationModal
        isOpen={isMaxDaysOpen}
        onClose={() => setIsMaxDaysOpen(false)}
        title="Maximum Days Reached"
        message="A workout routine can only contain up to 3 days. Please remove an existing day if you want to add a different one."
      />

      <div className="my-6"></div>
    </div>
  )
}
