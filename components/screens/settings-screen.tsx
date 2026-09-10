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
  ChevronDown,
} from "lucide-react"

const DEFAULT_EXERCISE_SUGGESTIONS = [
  "Incline Dumbbell Press", "Bench Press", "Shoulder Press", "Triceps Pushdown",
  "Lat Pulldown", "Barbell Row", "Bicep Curl", "Squat", "Romanian Deadlift",
  "Calf Raise", "Leg Press", "Leg Curl", "Hammer Curl", "Chest Fly", "Overhead Extension",
  "Core Plank", "Jumping Jacks", "Kettlebell Swings", "Russian Twists", "Burpees",
  "Lateral Raise", "Face Pull"
]
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatDate, getWorkoutDayColor, cn } from "@/lib/utils"
import { v4 as uuidv4 } from 'uuid'
import type { Workout, WorkoutDay, WorkoutExercise } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from '@/lib/auth/auth-context'
import { useHaptics } from "@/hooks/use-haptics"
import { DeletionConfirmationModal } from "@/components/modals/deletion-confirmation-modal"
import { ResetConfirmationModal } from "@/components/modals/reset-confirmation-modal" // Re-trigger import check
import { updateWorkoutDayExercises, loadUserWorkoutDays, createDefaultRoutinesForWorkout } from '@/lib/supabase-data'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import dynamic from 'next/dynamic'
import { ShowcaseFooter } from "@/components/dashboard/showcase-footer"

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
  isEditMode: boolean;
}

const ExerciseItem = memo(({
  exercise,
  index,
  totalExercises,
  dayId,
  workoutId,
  onMoveUp,
  onMoveDown,
  onDelete,
  isEditMode
}: ExerciseItemProps) => {
  return (
    <li
      className={cn(
        "flex items-center justify-between py-2 px-2.5 rounded-lg transition-colors",
        isEditMode ? "bg-zinc-900/60" : "hover:bg-zinc-800/30"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {isEditMode ? (
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onMoveUp(dayId, index)}
              disabled={index === 0}
              className="h-6 w-6 p-0 rounded-md transition-all text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20"
              aria-label={`Move ${exercise.name} up`}
            >
              <ArrowUp className="h-3 w-3" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onMoveDown(dayId, index)}
              disabled={index === totalExercises - 1}
              className="h-6 w-6 p-0 rounded-md transition-all text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20"
              aria-label={`Move ${exercise.name} down`}
            >
              <ArrowDown className="h-3 w-3" aria-hidden="true" />
            </Button>
          </div>
        ) : (
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-600 flex-shrink-0 ml-1" />
        )}
        <span className="text-xs font-medium text-zinc-200 truncate py-0.5" title={exercise.name}>
          {exercise.name}
        </span>
      </div>
      {isEditMode && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(workoutId, dayId, exercise.id, exercise.name)}
          className="h-6 w-6 p-0 rounded-md transition-all text-zinc-400 hover:bg-red-950/40 hover:text-red-400 border border-transparent hover:border-red-900/40"
          aria-label={`Delete ${exercise.name} exercise`}
        >
          <Trash2 className="h-3 w-3" aria-hidden="true" />
        </Button>
      )}
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
  const { trigger: haptic } = useHaptics()
  const [isSignOutOpen, setIsSignOutOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isAccountExpanded, setIsAccountExpanded] = useState(false)
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

  const toggleWorkoutExpanded = (workoutId: string) => {
    haptic("light")
    setExpandedWorkouts((prev) => {
      const isCurrentlyExpanded = !!prev[workoutId]
      const nextExpanded = !isCurrentlyExpanded

      if (!nextExpanded) {
        // Reset nested day accordions after exit animation finishes so closing is smooth
        setTimeout(() => {
          setExpandedDays((prevDays) => {
            const newDays = { ...prevDays }
            let changed = false
            Object.keys(newDays).forEach((key) => {
              if (key.startsWith(`${workoutId}-`)) {
                delete newDays[key]
                changed = true
              }
            })
            return changed ? newDays : prevDays
          })
        }, 300)
      } else {
        // Guarantee that upon opening, all nested days start in default closed state
        setExpandedDays((prevDays) => {
          const newDays = { ...prevDays }
          let changed = false
          Object.keys(newDays).forEach((key) => {
            if (key.startsWith(`${workoutId}-`)) {
              delete newDays[key]
              changed = true
            }
          })
          return changed ? newDays : prevDays
        })
      }

      return {
        ...prev,
        [workoutId]: nextExpanded,
      }
    })
  }

  const toggleDayExpanded = (dayKey: string) => {
    haptic("light")
    setExpandedDays((prev) => ({
      ...prev,
      [dayKey]: !prev[dayKey],
    }))
  }

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
    const query = newExerciseName.toLowerCase().trim();
    const combinedMap = new Map<string, { id?: string; name: string }>();
    DEFAULT_EXERCISE_SUGGESTIONS.forEach(name => {
      combinedMap.set(name.toLowerCase(), { name });
    });
    availableExercises.forEach(e => {
      combinedMap.set(e.name.toLowerCase(), { id: e.id, name: e.name });
    });
    return Array.from(combinedMap.values()).filter(e => 
      e.name.toLowerCase().includes(query)
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
        title: "Routine created",
        description: newWorkoutName,
      })
    } catch (error) {
      console.error("Failed to add workout with default days:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create workout.",
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
      variant: "destructive",
      title: "Routine deleted",
      description: workoutToDelete.name,
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
        title: "Exercise added",
        description: finalExerciseName,
      });
    } catch (err) {
      console.error("Failed to add exercise:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save exercise.",
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
      title: "Exercise reordered",
      description: "Moved up.",
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
      title: "Exercise reordered",
      description: "Moved down.",
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
      variant: "destructive",
      title: "Exercise deleted",
      description: exerciseToDelete.name,
    });
    setExerciseToDelete(null);
    setIsDeleteExerciseOpen(false);
  }

  // ExerciseItem moved outside component for performance



  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.02,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.25, 1, 0.5, 1],
      },
    },
  }

  // Use username from context (case-sensitive)
  const displayUsername = username || (user?.email ? user.email.replace(/@wrkout\.app$/, '') : '');

  const handleSignOut = async () => {
    signOut();
  }

  return (
    <div className="w-full max-w-[410px] mx-auto pb-24 px-3 sm:px-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Unified Page Header */}
        <motion.div variants={itemVariants} className="flex flex-col mb-6 pt-2 sm:pt-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Settings
          </h1>
        </motion.div>

      <div className="space-y-6">
        {/* Workouts Section */}
        <motion.section variants={itemVariants} className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-base font-extrabold text-zinc-100 tracking-tight">
              Routines
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsEditMode(!isEditMode)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                  isEditMode
                    ? "bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/50"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                )}
              >
                {isEditMode ? "Done" : "Edit"}
              </button>
              <button
                type="button"
                onClick={() => setIsAddWorkoutOpen(true)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors cursor-pointer flex items-center justify-center"
                aria-label="New Routine"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {workouts.length > 0 ? (
              workouts.map((workout) => {
                const categoryOrderMap: Record<string, number> = { push: 0, pull: 1, leg: 2, legs: 2, flex: 3, flexible: 3, custom: 3 }
                const daysForWorkout = workoutDays
                  .filter((day) => day.workout_id === workout.id)
                  .sort((a, b) => (categoryOrderMap[a.day_id.toLowerCase()] ?? 99) - (categoryOrderMap[b.day_id.toLowerCase()] ?? 99))
                const isExpanded = expandedWorkouts[workout.id]

                return (
                  <motion.div
                    key={workout.id}
                    layout
                    className="group relative bg-zinc-900/90 hover:bg-zinc-900/95 border border-zinc-800 rounded-2xl transition-all duration-200 overflow-hidden shadow-sm"
                  >
                    <div
                      className="flex items-center justify-between py-3 px-3.5 cursor-pointer select-none"
                      onClick={() => toggleWorkoutExpanded(workout.id)}
                    >
                      <span className="font-bold text-zinc-100 text-sm tracking-tight">
                        {workout.name}
                      </span>

                      <div className="flex items-center gap-2">
                        {isEditMode && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteWorkout(workout.id, workout.name)
                            }}
                            className="h-7 w-7 text-zinc-400 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-900/40 rounded-lg transition-all"
                            aria-label={`Delete ${workout.name} routine`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform duration-200", isExpanded && "rotate-180")} />
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
                          <div className="px-3.5 pb-3.5 pt-0">
                            <div className="w-full h-px bg-zinc-800/80 mb-2.5" />

                            {daysForWorkout.length > 0 ? (
                              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
                                {daysForWorkout.map((day) => {
                                  const dayKey = `${workout.id}-${day.id}`
                                  const isDayExpanded = expandedDays[dayKey]

                                  return (
                                    <div
                                      key={dayKey}
                                      className="relative rounded-xl border border-zinc-700/60 bg-zinc-800/70 hover:bg-zinc-800/90 transition-colors overflow-hidden"
                                      style={{
                                        borderLeftWidth: '3px',
                                        borderLeftColor: getWorkoutDayColor(day.day_id)
                                      }}
                                    >
                                      <div
                                        className="flex items-center justify-between py-2.5 px-3.5 cursor-pointer hover:bg-zinc-700/30 transition-colors"
                                        onClick={() => toggleDayExpanded(dayKey)}
                                      >
                                        <p className="text-sm font-semibold text-zinc-100 truncate leading-tight pr-2">
                                          {(day.name === 'Flex / Custom' || day.name === 'Custom' || day.name === 'Custom Day' || day.name === 'Flex') ? 'Flex Day' : day.name}
                                        </p>
                                        <ChevronDown className={cn("h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 flex-shrink-0", isDayExpanded && "rotate-180")} />
                                      </div>

                                      <AnimatePresence>
                                        {isDayExpanded && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                          >
                                            <div className="pt-0 pb-1.5 px-1">
                                              <div className="w-full h-px bg-zinc-700/40 mb-0.5" />
                                              {day.exercises.length > 0 ? (
                                                <ul className="divide-y divide-zinc-700/30">
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
                                                      isEditMode={isEditMode}
                                                    />
                                                  ))}
                                                </ul>
                                              ) : (
                                                <div className="py-2.5 text-center text-xs text-zinc-500 font-medium">
                                                  No exercises added yet
                                                </div>
                                              )}

                                              {/* Clean Unboxed Add Exercise Row */}
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  setPendingExerciseOpen({ workoutId: workout.id, dayId: day.id })
                                                }}
                                                className="w-full flex items-center gap-2 py-2 px-2.5 mt-0.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/25 transition-all cursor-pointer group/add"
                                              >
                                                <Plus className="h-3.5 w-3.5 text-zinc-500 group-hover/add:text-zinc-300 transition-colors" />
                                                <span>Add exercise</span>
                                              </button>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-6 rounded-xl border border-zinc-800/70 bg-zinc-900/30 select-none">
                                <p className="text-xs text-zinc-400 font-medium">No days in this routine</p>
                              </div>
                            )}
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
                className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md select-none"
              >
                <div className="w-12 h-12 rounded-2xl border border-zinc-800/90 bg-zinc-900/80 flex items-center justify-center mb-3.5 shadow-sm text-zinc-400">
                  <Dumbbell className="h-5 w-5 text-zinc-400" strokeWidth={1.8} />
                </div>
                <h3 className="text-base font-bold text-zinc-100 mb-1 tracking-tight">No routines yet</h3>
                <p className="text-xs text-zinc-400 mb-4 max-w-xs mx-auto leading-relaxed font-medium">
                  Create your first routine to start tracking.
                </p>
                <Button
                  size="sm"
                  onClick={() => setIsAddWorkoutOpen(true)}
                  className="h-8 px-3.5 text-xs font-semibold rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/70 shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Create Routine</span>
                </Button>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Account Section */}
        <motion.section variants={itemVariants} className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-base font-extrabold text-zinc-100 tracking-tight">
              Account
            </h2>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm transition-all duration-200">
            <div
              className="flex items-center justify-between py-3 px-3.5 cursor-pointer select-none"
              onClick={() => {
                haptic("light")
                setIsAccountExpanded((prev) => !prev)
              }}
            >
              <span className="font-bold text-zinc-100 text-sm tracking-tight truncate">
                {displayUsername ? `@${displayUsername}` : user?.email || "Account Options"}
              </span>
              <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform duration-200 flex-shrink-0", isAccountExpanded && "rotate-180")} />
            </div>

            <AnimatePresence>
              {isAccountExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <div className="px-3.5 pb-3.5 pt-0 space-y-4">
                    <div className="w-full h-px bg-zinc-800/80 mb-3" />

                    {/* Recovery Email Form */}
                    <div className="space-y-2.5">
                      <div className="space-y-0.5">
                        <h3 className="font-semibold text-foreground text-sm">Recovery Email</h3>
                        <p className="text-xs text-muted-foreground">Used only for account recovery.</p>
                      </div>
                      
                      <form onSubmit={handleUpdateRecoveryEmail} className="space-y-3 pt-0.5">
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
                        
                        <div className="flex flex-row items-center gap-2">
                          <div className="relative flex-1">
                            <Input
                              id="settings-recovery-email"
                              type="email"
                              value={recoveryEmailState}
                              onChange={(e) => setRecoveryEmailState(e.target.value)}
                              placeholder="e.g. you@example.com"
                              required
                              className="h-9 rounded-xl border-zinc-700/60 bg-zinc-950/70 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 w-full pl-9"
                            />
                            <div className="absolute left-3 top-0 h-full flex items-center text-zinc-500">
                              <Mail className="h-4 w-4" />
                            </div>
                          </div>
                          <button
                            type="submit"
                            disabled={updatingEmail || recoveryEmailState === (user?.user_metadata?.recovery_email || '')}
                            className="h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:pointer-events-none px-3.5 text-xs font-semibold text-zinc-200 transition-all active:scale-[0.98] border border-zinc-700/50 flex items-center justify-center cursor-pointer flex-shrink-0"
                          >
                            {updatingEmail ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="w-full h-px bg-zinc-800/60" />

                    {/* Account Actions */}
                    <div className="space-y-2.5">
                      <div className="space-y-0.5">
                        <h3 className="font-semibold text-foreground text-sm">Quick Actions</h3>
                        <p className="text-xs text-muted-foreground">App guide and account options.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 w-full pt-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-9 px-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-200 transition-all text-xs font-medium border border-zinc-700/50 active:scale-[0.98]"
                          onClick={() => {
                            haptic("light");
                            setShowOnboarding(true);
                          }}
                        >
                          View Guide
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-9 px-3 rounded-xl bg-zinc-800/60 hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-all text-xs font-medium border border-zinc-700/50 hover:border-red-900/40 active:scale-[0.98]"
                          onClick={() => {
                            haptic("warning");
                            setIsSignOutOpen(true);
                          }}
                        >
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>
      </div>

      {/* Showcase Footer */}
      <motion.div variants={itemVariants}>
        <ShowcaseFooter />
      </motion.div>
    </motion.div>

      {/* Dialogs - Kept functionally same but ensures classes match new aesthetic if needed. existing styling indialogs is mostly generic shadcn which is fine. */}
      {/* Add Workout Dialog */}
      {/* New Routine Dialog */}
      <Dialog open={isAddWorkoutOpen} onOpenChange={setIsAddWorkoutOpen}>
        <DialogContent 
          hideCloseButton
          centerMobile
          className="w-[90%] max-w-[320px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.85)] backdrop-blur-2xl outline-none select-none mx-auto flex flex-col items-center"
        >
          <DialogHeader className="w-full flex flex-col items-center space-y-0 text-center">
            <div className="mx-auto mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-300 shadow-sm">
              <Plus className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <DialogTitle className="text-base font-bold tracking-tight text-white text-center w-full">
              New Routine
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 text-center w-full mt-1">
              Name your routine to get started.
            </DialogDescription>
          </DialogHeader>

          <div className="w-full my-4">
            <Label htmlFor="workout-name" className="sr-only">Routine Name</Label>
            <Input
              id="workout-name"
              aria-label="Routine name"
              value={newWorkoutName}
              onChange={(e) => setNewWorkoutName(e.target.value)}
              placeholder="e.g. Summer Cut, Bulking..."
              className="h-10 rounded-xl border-zinc-800 bg-zinc-900/60 px-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700/50 w-full transition-colors"
              autoFocus
            />
          </div>

          {/* Buttons Row */}
          <div className="flex flex-row justify-between gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setIsAddWorkoutOpen(false)}
              className="flex-1 h-10 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-all active:scale-[0.98] shadow-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddWorkout}
              disabled={!newWorkoutName.trim()}
              className="flex-1 h-10 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold px-3 text-xs transition-all active:scale-[0.98] disabled:opacity-25 disabled:pointer-events-none shadow-sm cursor-pointer border-none"
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
          centerMobile
          className="w-[90%] max-w-[320px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.85)] backdrop-blur-2xl outline-none select-none mx-auto flex flex-col items-center"
        >
          <DialogHeader className="w-full flex flex-col items-center space-y-0 text-center">
            <div className="mx-auto mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-300 shadow-sm">
              <Dumbbell className="h-5 w-5" strokeWidth={2} />
            </div>
            <DialogTitle className="text-base font-bold tracking-tight text-white text-center w-full">
              New Exercise
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 text-center w-full mt-1">
              Search or enter a custom exercise name.
            </DialogDescription>
          </DialogHeader>
          <div className="w-full my-4 relative">
            <Label htmlFor="exercise-name" className="sr-only">Exercise Name</Label>
            <div className="w-full">
              <Input
                id="exercise-name"
                ref={inputRef}
                aria-label="Exercise name"
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
                className="h-10 rounded-xl border-zinc-800 bg-zinc-900/60 px-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700/50 w-full transition-colors"
                autoComplete="off"
                autoFocus
              />
              <AnimatePresence>
                {showSuggestions && newExerciseName.trim().length > 0 && filteredExercises.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden mt-2"
                  >
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/95 p-1 max-h-[130px] overflow-y-auto hide-scrollbar space-y-0.5 shadow-xl">
                      {filteredExercises.map((ex, idx) => (
                        <button
                          key={ex.id || ex.name}
                          type="button"
                          className={cn(
                            "w-full px-3 py-1.5 rounded-lg text-left text-xs font-medium transition-colors cursor-pointer",
                            idx === highlightedIndex 
                              ? 'bg-zinc-800 text-white font-semibold' 
                              : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
                          )}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setNewExerciseName(ex.name);
                            setShowSuggestions(false);
                          }}
                          onClick={() => {
                            setNewExerciseName(ex.name);
                            setShowSuggestions(false);
                            inputRef.current?.focus();
                          }}
                        >
                          <span className="truncate">{ex.name}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* Buttons Row */}
          <div className="flex flex-row justify-between gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setIsAddExerciseOpen(false)}
              className="flex-1 h-10 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-all active:scale-[0.98] shadow-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddExercise}
              disabled={!newExerciseName.trim() || !selectedWorkoutId || !selectedDayId || isCreatingExercise}
              className="flex-1 h-10 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold px-3 text-xs transition-all active:scale-[0.98] disabled:opacity-25 disabled:pointer-events-none shadow-sm cursor-pointer border-none"
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
        message={"Are you sure you want to sign out?"}
      />

      <OnboardingGuide
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      <ResetConfirmationModal
        isOpen={isDeleteAllWorkoutsOpen}
        onClose={() => setIsDeleteAllWorkoutsOpen(false)}
        intent="delete"
        onConfirm={() => {
          if (pendingDeleteWorkoutId) {
            onUpdateWorkoutsAndDays(workouts.filter((w) => w.id !== pendingDeleteWorkoutId), workoutDays);
            toast({
              variant: "destructive",
              title: "Routine deleted",
              description: "Last routine removed.",
            });
            setPendingDeleteWorkoutId(null);
          }
        }}
        dayColor="#EA4335"
        message={"Are you sure you want to delete your last routine? All associated days and exercises will be removed."}
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
