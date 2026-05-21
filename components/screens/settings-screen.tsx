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
  AlertCircle,
  Mail,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatDate, getWorkoutDayIcon, getWorkoutDayColor } from "@/lib/utils"
import type { Workout, WorkoutDay, WorkoutExercise } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from '@/lib/auth/auth-context'
import { DeletionConfirmationModal } from "@/components/modals/deletion-confirmation-modal"
import { ResetConfirmationModal } from "@/components/modals/reset-confirmation-modal" // Re-trigger import check
import { updateWorkoutDayExercises, loadUserWorkoutDays, createDefaultRoutinesForWorkout } from '@/lib/supabase-data'
import { v4 as uuidv4 } from 'uuid'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import dynamic from 'next/dynamic'

const OnboardingGuide = dynamic(() => import("@/components/onboarding/onboarding-guide").then(mod => mod.OnboardingGuide), {
  loading: () => null,
  ssr: false
})

interface ExerciseItemProps {
  exercise: WorkoutExercise;
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
            className="h-8 w-8 p-0 rounded-full transition-all text-muted-foreground/40 hover:text-foreground hover:bg-zinc-700/50 disabled:opacity-10"
            aria-label={`Move ${exercise.name} up`}
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMoveDown(dayId, index)}
            disabled={index === totalExercises - 1}
            className="h-8 w-8 p-0 rounded-full transition-all text-muted-foreground/40 hover:text-foreground hover:bg-zinc-700/50 disabled:opacity-10"
            aria-label={`Move ${exercise.name} down`}
          >
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
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
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false)
  const [newWorkoutName, setNewWorkoutName] = useState("")
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

  const [recoveryEmailState, setRecoveryEmailState] = useState(user?.user_metadata?.recovery_email || '');
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (user?.user_metadata?.recovery_email) {
      setRecoveryEmailState(user.user_metadata.recovery_email);
    }
  }, [user]);

  const handleUpdateRecoveryEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMessage('');
    setEmailError('');
    setUpdatingEmail(true);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!recoveryEmailState) {
        setEmailError('Recovery email is required.');
        setUpdatingEmail(false);
        return;
      }
      if (!emailRegex.test(recoveryEmailState)) {
        setEmailError('Please enter a valid email address.');
        setUpdatingEmail(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          recovery_email: recoveryEmailState.trim().toLowerCase()
        }
      });

      if (error) {
        setEmailError(error.message);
      } else {
        setEmailMessage('Recovery email updated successfully.');
      }
    } catch (err) {
      setEmailError('Failed to update recovery email.');
    } finally {
      setUpdatingEmail(false);
    }
  };

  // Add a new state to track a pending exercise open request
  const [pendingExerciseOpen, setPendingExerciseOpen] = useState<{ workoutId: string, dayId: string } | null>(null)
  const [isDeleteAllWorkoutsOpen, setIsDeleteAllWorkoutsOpen] = useState(false);
  const [pendingDeleteWorkoutId, setPendingDeleteWorkoutId] = useState<string | null>(null);
  const [isDeleteWorkoutOpen, setIsDeleteWorkoutOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<{ id: string, name: string } | null>(null);
  const [isDeleteExerciseOpen, setIsDeleteExerciseOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<{ workoutId: string, dayId: string, id: string, name: string } | null>(null);

  // Autocomplete state
  const [availableExercises, setAvailableExercises] = useState<{ id: string, name: string }[]>([]);
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredExercises = useMemo(() => {
    if (!newExerciseName.trim()) return [];
    return availableExercises.filter(e => 
      e.name.toLowerCase().includes(newExerciseName.toLowerCase())
    );
  }, [availableExercises, newExerciseName]);

  useEffect(() => {
    if (user) {
      import('@/lib/supabase-data').then(m => {
        m.loadUserExercises(supabase, user.id).then(setAvailableExercises);
      });
    }
  }, [user, supabase]);

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
      setShowSuggestions(false)
      setHighlightedIndex(-1)
      setIsCreatingExercise(false)
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

  const handleAddWorkout = async () => {
    if (!newWorkoutName.trim() || !user) return

    const newWorkoutId = uuidv4()
    const newWorkout: Workout = {
      id: newWorkoutId,
      user_id: user.id,
      name: newWorkoutName,
      days: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    try {
      const defaultDays = await createDefaultRoutinesForWorkout(supabase, user.id, newWorkoutId)
      onUpdateWorkoutsAndDays([...workouts, newWorkout], [...workoutDays, ...defaultDays])
      setNewWorkoutName("")
      setIsAddWorkoutOpen(false)

      // Auto-expand the new workout
      setExpandedWorkouts((prev) => ({
        ...prev,
        [newWorkout.id]: true,
      }))

      toast({
        title: "Workout Added",
        description: `${newWorkoutName} created with default routines.`,
        className: "bg-emerald-950/90 border border-emerald-800/30 text-emerald-100 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-2xl",
      })
    } catch (error) {
      console.error("Failed to add workout with default days:", error)
      toast({
        title: "Error",
        description: "Failed to create workout.",
        className: "bg-red-950/90 border border-red-800/30 text-red-100 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-2xl",
      })
    }
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

    onUpdateWorkoutsAndDays(
      workouts.filter((w) => w.id !== workoutToDelete.id),
      workoutDays.filter((d) => d.workout_id !== workoutToDelete.id)
    );

    toast({
      title: "Workout Deleted",
      description: `${workoutToDelete.name} has been removed.`,
      className: "bg-red-950/90 border border-red-800/30 text-red-100 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-2xl",
    });
    setWorkoutToDelete(null);
    setIsDeleteWorkoutOpen(false);
  }

  // Custom day modification handlers removed since we pre-populate and restrict to default Push, Pull, and Legs routines

  const handleAddExercise = async () => {
    if (!newExerciseName.trim() || !selectedWorkoutId || !selectedDayId || !user) return;
    
    setIsCreatingExercise(true);
    
    try {
      const dayToUpdate = workoutDays.find(day => day.id === selectedDayId);
      if (!dayToUpdate) return;
      
      const { createExercise } = await import('@/lib/supabase-data');
      
      // Check if exact match exists in availableExercises
      const exactMatchName = newExerciseName.trim().toLowerCase();
      const existing = availableExercises.find(e => e.name.toLowerCase() === exactMatchName);
      
      let exercise_id = existing?.id;
      let finalExerciseName = existing ? existing.name : newExerciseName.trim();
      
      if (!exercise_id) {
         exercise_id = await createExercise(supabase, user.id, finalExerciseName) || undefined;
         if (exercise_id) {
            setAvailableExercises(prev => 
              [...prev, { id: exercise_id as string, name: finalExerciseName }]
              .sort((a, b) => a.name.localeCompare(b.name))
            );
         }
      }

      const updatedExercises = [
        ...(dayToUpdate.exercises || []),
        { id: uuidv4(), exercise_id, name: finalExerciseName }
      ];

      // Use map to update correct day in list
      const updatedWorkoutDays = workoutDays.map(day => {
        if (day.id === selectedDayId) {
          return {
            ...day,
            exercises: updatedExercises
          };
        }
        return day;
      });

      onUpdateWorkoutsAndDays(workouts, updatedWorkoutDays);
      setNewExerciseName("");
      setIsAddExerciseOpen(false);
      toast({
        title: "Exercise Added",
        description: `${finalExerciseName} added to routine.`,
        className: "bg-emerald-950/90 border border-emerald-800/30 text-emerald-100 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-2xl",
      });
    } catch (err) {
      console.error("Failed to add exercise:", err);
      toast({
        title: "Error",
        description: "Failed to save exercise.",
        className: "bg-red-950/90 border border-red-800/30 text-red-100 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-2xl",
      });
    } finally {
      setIsCreatingExercise(false);
    }
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

    // Update local state directly
    const updatedWorkoutDays = [...workoutDays];
    updatedWorkoutDays[dayIndex] = {
      ...dayToUpdate,
      exercises
    };

    onUpdateWorkoutsAndDays(workouts, updatedWorkoutDays);

    toast({
      title: "Exercise Reordered",
      description: "Moved up.",
      className: "bg-emerald-950/90 border border-emerald-800/30 text-emerald-100 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-2xl",
    });
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

    // Update local state directly without reloading from database
    const updatedWorkoutDays = [...workoutDays];
    updatedWorkoutDays[dayIndex] = {
      ...dayToUpdate,
      exercises
    };

    onUpdateWorkoutsAndDays(workouts, updatedWorkoutDays);

    toast({
      title: "Exercise Reordered",
      description: "Moved down.",
      className: "bg-emerald-950/90 border border-emerald-800/30 text-emerald-100 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-2xl",
    });
  };

  const confirmDeleteExercise = async () => {
    if (!exerciseToDelete || !user) return;

    const updatedWorkoutDays = workoutDays.map(day => {
      if (day.id === exerciseToDelete.dayId) {
        const updatedExercises = (day.exercises || []).filter((exercise) => exercise.id !== exerciseToDelete.id);
        return {
          ...day,
          exercises: updatedExercises
        };
      }
      return day;
    });

    onUpdateWorkoutsAndDays(workouts, updatedWorkoutDays);
    toast({
      title: "Exercise Deleted",
      description: `${exerciseToDelete.name} removed from routine.`,
      className: "bg-red-950/90 border border-red-800/30 text-red-100 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-2xl",
    });
    setExerciseToDelete(null);
    setIsDeleteExerciseOpen(false);
  }

  // ExerciseItem moved outside component for performance


  // Get day icon and color based on day ID
  const getDayIconAndColor = (dayId: string) => {
    const icon = getWorkoutDayIcon(dayId, true, "h-4 w-4")
    switch (dayId.toLowerCase()) {
      case "push":
      case "pushes":
        return {
          icon,
          color: "bg-push-dark/10 border border-push-dark/20",
          textColor: "text-push-dark",
          borderColor: "border-push-dark/20",
        }
      case "pull":
      case "pulls":
        return {
          icon,
          color: "bg-pull-dark/10 border border-pull-dark/20",
          textColor: "text-pull-dark",
          borderColor: "border-pull-dark/20",
        }
      case "leg":
      case "legs":
        return {
          icon,
          color: "bg-leg-dark/10 border border-leg-dark/20",
          textColor: "text-leg-dark",
          borderColor: "border-leg-dark/20",
        }
      default:
        return {
          icon,
          color: "bg-zinc-800/40 border border-zinc-700/30",
          textColor: "text-zinc-400",
          borderColor: "border-zinc-700/30",
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
      <div className="flex items-center gap-3 mb-5 sm:mb-6 pt-4 sm:pt-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 border border-zinc-700/40 shadow-lg shadow-zinc-900/50">
          <Settings className="h-5 w-5" strokeWidth={2.5} style={{ color: '#EA4335' }} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Settings
          </h1>
          <p className="text-[10px] text-muted-foreground font-medium">
            Manage routines
          </p>
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-4"
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
                                          borderLeftColor: getWorkoutDayColor(day.day_id)
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
                                                      className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/40 hover:border-zinc-600/50 shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
                                                      title="Add Exercise"
                                                      aria-label="Add Exercise"
                                                    >
                                                      <Plus className="h-4 w-4 text-zinc-300" />
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
                                <div className="text-center py-8 rounded-xl border border-dashed border-zinc-700/50 bg-zinc-900/20">
                                  <p className="text-sm text-zinc-400">No sessions in this routine.</p>
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
                className="text-center py-6 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700"
              >
                <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Dumbbell className="h-5 w-5 text-zinc-400" />
                </div>
                <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-1">No Workouts Yet</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 max-w-xs mx-auto">
                  Create your first routine to start tracking.
                </p>
                <Button onClick={() => setIsAddWorkoutOpen(true)}>
                  Create Workout
                </Button>
              </motion.div>
            )}
          </div>
        </section>

        {/* Recovery Email Section */}
        <section className="space-y-4 bg-zinc-900/30 border border-zinc-700/40 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-700/50 border border-zinc-600/40 flex-shrink-0">
              <Mail className="h-4 w-4" style={{ color: '#EA4335' }} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground text-sm">Recovery Email</h3>
              <p className="text-xs text-muted-foreground">Keep your recovery email updated for secure password resets.</p>
            </div>
          </div>
          
          <form onSubmit={handleUpdateRecoveryEmail} className="space-y-3 pt-1">
            {emailMessage && (
              <p className="text-xs text-pull-light font-medium bg-pull-light/10 border border-pull-light/20 px-3 py-2 rounded-lg animate-in fade-in duration-300">
                {emailMessage}
              </p>
            )}
            {emailError && (
              <p className="text-xs text-leg-light font-medium bg-leg-light/10 border border-leg-light/20 px-3 py-2 rounded-lg animate-in fade-in duration-300">
                {emailError}
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Input
                  id="settings-recovery-email"
                  type="email"
                  value={recoveryEmailState}
                  onChange={(e) => setRecoveryEmailState(e.target.value)}
                  placeholder="e.g. you@example.com"
                  required
                  className="h-9 rounded-xl border-white/10 bg-white/[0.03] text-sm text-zinc-100 placeholder-zinc-500 focus:border-red-500/50 focus:ring-red-500/20 w-full pl-9"
                />
                <div className="absolute left-3 top-0 h-full flex items-center text-zinc-500">
                  <Mail className="h-4 w-4" />
                </div>
              </div>
              <button
                type="submit"
                disabled={updatingEmail || recoveryEmailState === (user?.user_metadata?.recovery_email || '')}
                className="h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:pointer-events-none px-4 text-xs font-bold text-zinc-200 transition-all active:scale-95 border border-zinc-700/50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {updatingEmail ? 'Saving...' : 'Save Email'}
              </button>
            </div>
          </form>
        </section>

        {/* Account Actions */}
        <section className="pt-0">
          <div className="relative bg-zinc-900/30 border border-zinc-700/40 shadow-lg shadow-zinc-950/20 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-700/50 border border-zinc-600/40 flex-shrink-0">
                  <Sparkles className="h-4 w-4" style={{ color: '#f9d949' }} />
                </div>
                <div className="min-w-0 flex-1">
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
                  className="flex-1 sm:flex-none h-8 px-3 rounded-lg bg-zinc-800/40 hover:bg-red-900/20 text-red-400 hover:text-red-300 transition-all text-xs font-medium border border-zinc-700/30"
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
        <DialogContent 
          hideCloseButton
          className="w-[92%] max-w-[328px] overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/98 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl outline-none select-none mx-auto flex flex-col items-center"
        >
          <DialogHeader className="w-full flex flex-col items-center">
            {/* Floating Icon Box matching Onboarding */}
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-[0_6px_16px_rgba(0,0,0,0.18)]">
              <Plus className="h-5.5 w-5.5 text-blue-500" aria-hidden="true" />
            </div>
            <DialogTitle className="text-[1.1rem] font-extrabold tracking-tight text-foreground text-center w-full leading-snug">New Routine</DialogTitle>
          </DialogHeader>
          <div className="py-4 w-full">
            <Label htmlFor="workout-name" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2 px-1">Routine Name</Label>
            <Input
              id="workout-name"
              value={newWorkoutName}
              onChange={(e) => setNewWorkoutName(e.target.value)}
              placeholder="e.g. Summer Cut, Bulking..."
              className="h-10 rounded-xl border-white/10 bg-white/[0.03] text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20 w-full"
            />
          </div>
          {/* Buttons Row with premium pill styles */}
          <div className="flex flex-row justify-between gap-2.5 mt-2 w-full px-0.5">
            <button
              type="button"
              onClick={() => setIsAddWorkoutOpen(false)}
              className="flex-1 h-11 rounded-full border border-white/8 bg-white/[0.02] px-4 text-[13px] font-bold text-zinc-300 transition-all hover:bg-white/[0.06] hover:text-white active:scale-95 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddWorkout}
              disabled={!newWorkoutName.trim()}
              className="flex-1 h-11 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none px-4 text-[13px] font-bold text-white transition-all active:scale-95 shadow-[0_4px_16px_rgba(37,99,235,0.2)] border-none"
            >
              Create
            </button>
          </div>
        </DialogContent>
      </Dialog>



      {/* Add Exercise Dialog */}
      <Dialog open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
        <DialogContent 
          hideCloseButton
          className="w-[92%] max-w-[328px] overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/98 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl outline-none select-none mx-auto flex flex-col items-center"
        >
          <DialogHeader className="w-full flex flex-col items-center">
            {/* Floating Icon Box matching Onboarding */}
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-[0_6px_16px_rgba(0,0,0,0.18)]">
              <Dumbbell className="h-5.5 w-5.5 text-purple-500 animate-pulse" aria-hidden="true" />
            </div>
            <DialogTitle className="text-[1.1rem] font-extrabold tracking-tight text-foreground text-center w-full leading-snug">New Exercise</DialogTitle>
          </DialogHeader>
          <div className="py-4 relative w-full">
            <Label htmlFor="exercise-name" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2 px-1">Exercise Name</Label>
            <div className="relative mt-1 w-full">
              <Input
                id="exercise-name"
                ref={inputRef}
                value={newExerciseName}
                onChange={(e) => {
                  setNewExerciseName(e.target.value);
                  setShowSuggestions(true);
                  setHighlightedIndex(-1);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setHighlightedIndex(prev => Math.min(prev + 1, filteredExercises.length - 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setHighlightedIndex(prev => Math.max(prev - 1, -1));
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (highlightedIndex >= 0 && highlightedIndex < filteredExercises.length) {
                      setNewExerciseName(filteredExercises[highlightedIndex].name);
                      setShowSuggestions(false);
                    } else if (newExerciseName.trim()) {
                      handleAddExercise();
                    }
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                }}
                placeholder="e.g. Incline Bench Press"
                className="h-10 rounded-xl border-white/10 bg-white/[0.03] text-sm text-zinc-100 placeholder-zinc-500 focus:border-purple-500/50 focus:ring-purple-500/20 w-full"
                autoComplete="off"
              />
              <AnimatePresence>
                {showSuggestions && newExerciseName.trim().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 w-full mt-1.5 bg-zinc-900/95 border border-white/10 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.65)] max-h-[160px] overflow-y-auto backdrop-blur-xl select-none"
                  >
                    {filteredExercises.length > 0 ? (
                      <ul className="py-1">
                        {filteredExercises.map((ex, idx) => (
                          <li
                            key={ex.id}
                            className={`flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium cursor-pointer transition-all duration-150 border-l-[3px] ${
                              idx === highlightedIndex 
                                ? 'bg-purple-600/20 text-purple-200 border-purple-500 pl-[11px]' 
                                : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white border-transparent'
                            }`}
                            onClick={() => {
                              setNewExerciseName(ex.name);
                              setShowSuggestions(false);
                              inputRef.current?.focus();
                            }}
                          >
                            <Dumbbell className={`h-3.5 w-3.5 flex-shrink-0 transition-colors ${idx === highlightedIndex ? 'text-purple-400' : 'text-zinc-500/70'}`} />
                            <span className="truncate">{ex.name}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-3.5 text-xs text-zinc-400 flex flex-col gap-1.5 bg-zinc-900/30">
                        <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 text-zinc-600" />
                          <span>No matching exercises found</span>
                        </div>
                        <div className="text-[11px] font-bold text-purple-400/90 flex items-center gap-1 pl-5">
                          <Plus className="h-3 w-3" /> Press Enter or Add to create &quot;{newExerciseName.trim()}&quot;
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* Buttons Row with premium pill styles */}
          <div className="flex flex-row justify-between gap-2.5 mt-2 w-full px-0.5">
            <button
              type="button"
              onClick={() => setIsAddExerciseOpen(false)}
              className="flex-1 h-11 rounded-full border border-white/8 bg-white/[0.02] px-4 text-[13px] font-bold text-zinc-300 transition-all hover:bg-white/[0.06] hover:text-white active:scale-95 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddExercise}
              disabled={!newExerciseName.trim() || !selectedWorkoutId || !selectedDayId || isCreatingExercise}
              className="flex-1 h-11 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:pointer-events-none px-4 text-[13px] font-bold text-white transition-all active:scale-95 shadow-[0_4px_16px_rgba(147,51,234,0.2)] border-none"
            >
              {isCreatingExercise ? 'Adding...' : 'Add'}
            </button>
          </div>
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
              description: "Last workout routine removed.",
              className: "bg-red-950/90 border border-red-800/30 text-red-100 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-2xl",
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
        isOpen={isDeleteExerciseOpen}
        onClose={() => {
          setIsDeleteExerciseOpen(false);
          setExerciseToDelete(null);
        }}
        onConfirm={confirmDeleteExercise}
        itemType="exercise"
        itemName={exerciseToDelete?.name || ""}
      />



      <div className="my-6"></div>
    </div>
  )
}
