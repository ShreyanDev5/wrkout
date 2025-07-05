"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import type { Workout } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CollapsibleHeaderLayout } from "@/components/layouts/collapsible-header-layout"
import { useAuth } from '@/lib/auth/auth-context'
import { ResetConfirmationModal } from '@/components/reset-confirmation-modal'
import { OnboardingGuide } from '@/components/onboarding-guide'

interface SettingsScreenProps {
  workouts: Workout[]
  onUpdateWorkouts: (workouts: Workout[]) => void
  lastSyncTime: string | null
}

export function SettingsScreen({ workouts, onUpdateWorkouts, lastSyncTime }: SettingsScreenProps) {
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

  // Reset scroll position when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
      id: `workout-${Date.now()}`,
      name: newWorkoutName,
      days: [],
    }

    onUpdateWorkouts([...workouts, newWorkout])
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

  const handleDeleteWorkout = (workoutId: string) => {
    onUpdateWorkouts(workouts.filter((w) => w.id !== workoutId))

    toast({
      title: "Workout Deleted",
      description: "The workout has been removed.",
      className: "bg-[#EA4335] border-none text-white",
    })
  }

  const handleAddDay = () => {
    if (!newDayName.trim() || !newDayId.trim() || !selectedWorkoutId) return

    const updatedWorkouts = workouts.map((workout) => {
      if (workout.id === selectedWorkoutId) {
        return {
          ...workout,
          days: [
            ...workout.days,
            {
              id: newDayId.toLowerCase(),
              name: newDayName,
              exercises: [],
            },
          ],
        }
      }
      return workout
    })

    onUpdateWorkouts(updatedWorkouts)
    setNewDayName("")
    setNewDayId("")
    setIsAddDayOpen(false)

    // Auto-expand the new day
    setExpandedDays((prev) => ({
      ...prev,
      [`${selectedWorkoutId}-${newDayId.toLowerCase()}`]: true,
    }))

    toast({
      title: "Day Added",
      description: `${newDayName} has been added to your workout.`,
      className: "bg-[#34A853] border-none text-white",
    })
  }

  const handleDeleteDay = (workoutId: string, dayId: string) => {
    const updatedWorkouts = workouts.map((workout) => {
      if (workout.id === workoutId) {
        return {
          ...workout,
          days: workout.days.filter((day) => day.id !== dayId),
        }
      }
      return workout
    })

    onUpdateWorkouts(updatedWorkouts)

    toast({
      title: "Day Deleted",
      description: "The day has been removed from your workout.",
      className: "bg-[#EA4335] border-none text-white",
    })
  }

  const handleAddExercise = () => {
    if (!newExerciseName.trim() || !selectedWorkoutId || !selectedDayId) return

    const updatedWorkouts = workouts.map((workout) => {
      if (workout.id === selectedWorkoutId) {
        return {
          ...workout,
          days: workout.days.map((day) => {
            if (day.id === selectedDayId) {
              return {
                ...day,
                exercises: [
                  ...day.exercises,
                  {
                    id: `exercise-${Date.now()}`,
                    name: newExerciseName,
                  },
                ],
              }
            }
            return day
          }),
        }
      }
      return workout
    })

    onUpdateWorkouts(updatedWorkouts)
    setNewExerciseName("")
    setIsAddExerciseOpen(false)

    toast({
      title: "Exercise Added",
      description: `${newExerciseName} has been added to your workout.`,
      className: "bg-[#34A853] border-none text-white",
    })
  }

  const handleDeleteExercise = (workoutId: string, dayId: string, exerciseId: string) => {
    const updatedWorkouts = workouts.map((workout) => {
      if (workout.id === workoutId) {
        return {
          ...workout,
          days: workout.days.map((day) => {
            if (day.id === dayId) {
              return {
                ...day,
                exercises: day.exercises.filter((exercise) => exercise.id !== exerciseId),
              }
            }
            return day
          }),
        }
      }
      return workout
    })

    onUpdateWorkouts(updatedWorkouts)

    toast({
      title: "Exercise Deleted",
      description: "The exercise has been removed from your workout.",
      className: "bg-[#EA4335] border-none text-white",
    })
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

  const header = (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#EA4335] shadow-sm">
          <Settings2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Customize your workout.</p>
        </div>
      </div>
      {lastSyncTime && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800">
            <Zap className="h-3 w-3" />
          </div>
          Last synced: {formatDate(lastSyncTime)}
        </motion.div>
      )}
    </div>
  )

  const handleSignOut = async () => {
    signOut();
  }

  const handleResetOnboarding = () => {
    if (user?.id) {
      localStorage.removeItem(`onboarding-completed-${user.id}`)
      toast({
        title: "Onboarding Reset",
        description: "The onboarding guide will show again on your next visit.",
        className: "bg-[#34A853] border-none text-white",
      })
    }
  }

  return (
    <CollapsibleHeaderLayout
      header={header}
      initialHeaderHeight={160}
      collapseThreshold={60}
    >
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={containerVariants}
        className="space-y-12"
      >
        <motion.div variants={itemVariants}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800">
                <Dumbbell className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
              </div>
              <h3 className="text-lg font-medium text-foreground truncate">
                {displayUsername && (
                  <span className="fitness-text-gradient font-bold mr-1">{displayUsername}&apos;s</span>
                )}
                Workout Routines
              </h3>
            </div>
            <Button
              onClick={() => setIsAddWorkoutOpen(true)}
              size="sm"
              className="w-full sm:w-auto rounded-md bg-[#34A853] hover:bg-[#2D9249] text-white border-none shadow-sm"
              aria-label="Add new workout"
            >
              <PlusCircle className="h-4 w-4 mr-1" aria-hidden="true" />
              Add Workout
            </Button>
          </div>

          <div className="relative">
            <ScrollArea className="h-[calc(100vh-320px)] min-h-[400px] max-h-[600px] pr-4 -mr-4">
              {workouts.length > 0 ? (
                <div className="space-y-4">
                  {workouts.map((workout) => (
                    <motion.div
                      key={workout.id}
                      variants={itemVariants}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        onClick={() => toggleWorkoutExpanded(workout.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                            <Dumbbell className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                          </div>
                          <span className="font-medium text-foreground">{workout.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteWorkout(workout.id)
                            }}
                            className="h-8 w-8 p-0 rounded-full transition-all hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-[#EA4335]"
                            aria-label={`Delete ${workout.name} workout`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <div className="h-5 w-5 flex items-center justify-center">
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
                            <div className="px-4 pb-4">
                              <div className="flex items-center justify-between mb-3 mt-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                    <Calendar className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" />
                                  </div>
                                  <h4 className="text-sm font-medium text-foreground">Workout Days</h4>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedWorkoutId(workout.id)
                                    setIsAddDayOpen(true)
                                  }}
                                  className="h-8 rounded-md border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                                  aria-label={`Add day to ${workout.name}`}
                                >
                                  <Plus className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                                  Add Day
                                </Button>
                              </div>

                              {workout.days.length > 0 ? (
                                <div className="space-y-3">
                                  {workout.days.map((day) => {
                                    const dayKey = `${workout.id}-${day.id}`
                                    const { icon, color, textColor, borderColor } = getDayIconAndColor(day.id)

                                    return (
                                      <div
                                        key={dayKey}
                                        className={`border ${borderColor} rounded-lg overflow-hidden bg-white dark:bg-zinc-900`}
                                      >
                                        <div
                                          className="flex items-center justify-between p-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                          onClick={() => toggleDayExpanded(dayKey)}
                                        >
                                          <div className="flex items-center gap-2">
                                            <div
                                              className={`flex items-center justify-center w-6 h-6 rounded-lg ${color}`}
                                            >
                                              {icon}
                                            </div>
                                            <span className={`font-medium text-foreground`}>{day.name}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteDay(workout.id, day.id)
                                              }}
                                              className="h-7 w-7 p-0 rounded-full transition-all hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-[#EA4335]"
                                              aria-label={`Delete ${day.name} day`}
                                            >
                                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                            </Button>
                                            <div className="h-5 w-5 flex items-center justify-center">
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
                                              <div className="px-3 pb-3">
                                                <div className="flex items-center justify-between mb-2 mt-2">
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
                                                      setSelectedWorkoutId(workout.id)
                                                      setSelectedDayId(day.id)
                                                      setIsAddExerciseOpen(true)
                                                    }}
                                                    className={`h-7 text-xs rounded-md border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300`}
                                                    aria-label={`Add exercise to ${day.name}`}
                                                  >
                                                    <Plus className="h-3 w-3 mr-1" aria-hidden="true" />
                                                    Add Exercise
                                                  </Button>
                                                </div>

                                                {day.exercises.length > 0 ? (
                                                  <ul className="space-y-1.5 mt-2">
                                                    {day.exercises.map((exercise) => (
                                                      <li
                                                        key={exercise.id}
                                                        className={`flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800 rounded-md`}
                                                      >
                                                        <span className={`text-sm text-foreground`}>
                                                          {exercise.name}
                                                        </span>
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          onClick={() =>
                                                            handleDeleteExercise(workout.id, day.id, exercise.id)
                                                          }
                                                          className="h-6 w-6 p-0 rounded-full transition-all hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-[#EA4335]"
                                                          aria-label={`Delete ${exercise.name} exercise`}
                                                        >
                                                          <Trash2 className="h-3 w-3" aria-hidden="true" />
                                                        </Button>
                                                      </li>
                                                    ))}
                                                  </ul>
                                                ) : (
                                                  <p
                                                    className={`text-xs text-zinc-500 dark:text-zinc-400 py-2 text-center`}
                                                  >
                                                    No exercises added yet
                                                  </p>
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
                                <div className="text-center py-6 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                  <p className="text-sm">No workout days added yet</p>
                                  <Button
                                    variant="link"
                                    onClick={() => {
                                      setSelectedWorkoutId(workout.id)
                                      setIsAddDayOpen(true)
                                    }}
                                    className="mt-2 text-[#34A853] hover:text-[#2D9249]"
                                  >
                                    Add your first day
                                  </Button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col items-center justify-center py-12 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="relative">
                    <Dumbbell className="h-12 w-12 mb-4 opacity-20" />
                    <Sparkles className="absolute top-0 right-0 h-4 w-4 text-[#FBBC04] animate-pulse" />
                  </div>
                  <p className="text-center relative">No workout routines added yet</p>
                  <Button
                    variant="link"
                    onClick={() => setIsAddWorkoutOpen(true)}
                    className="mt-2 text-[#34A853] hover:text-[#2D9249] relative"
                  >
                    Add your first workout
                  </Button>
                </motion.div>
              )}
            </ScrollArea>
          </div>
        </motion.div>
      </motion.div>

      {/* Add Workout Dialog */}
      <Dialog open={isAddWorkoutOpen} onOpenChange={setIsAddWorkoutOpen}>
        <DialogContent className="w-full max-w-sm dark:bg-background dark:border-opacity-10 rounded-lg mx-auto">
          <DialogHeader>
            <div className="flex flex-col items-center gap-2 mb-2">
              <PlusCircle className="h-5 w-5 text-[#34A853]" aria-hidden="true" />
              <DialogTitle className="line-height-readable text-center">Add New Workout</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="line-height-readable text-center mb-4 text-sm text-muted-foreground">
              Create a new workout routine. Workouts contain days and exercises.
            </p>
            <Label htmlFor="workout-name" className="block text-center mb-2">Workout Name</Label>
            <Input
              id="workout-name"
              value={newWorkoutName}
              onChange={(e) => setNewWorkoutName(e.target.value)}
              placeholder="Enter workout name"
              className="mt-2"
            />
          </div>
          <div className="flex flex-row justify-between gap-2 mt-2 w-full">
            <button
              type="button"
              onClick={() => setIsAddWorkoutOpen(false)}
              className="min-w-[140px] px-4 py-2 rounded-lg border font-semibold bg-muted hover:bg-muted/80 transition-colors focus-visible:ring outline-none dark:border-opacity-10 dark:hover:bg-secondary"
              aria-label="Cancel add workout"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddWorkout}
              className="min-w-[140px] px-4 py-2 rounded-lg border font-semibold bg-[#34A853] text-white hover:bg-[#2D9249] transition-colors focus-visible:ring outline-none dark:border-none dark:shadow-none"
              aria-label="Confirm add workout"
            >
              Add Workout
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Day Dialog */}
      <Dialog open={isAddDayOpen} onOpenChange={setIsAddDayOpen}>
        <DialogContent className="w-full max-w-sm dark:bg-background dark:border-opacity-10 rounded-lg mx-auto">
          <DialogHeader>
            <div className="flex flex-col items-center gap-2 mb-2">
              <PlusCircle className="h-5 w-5 text-[#34A853]" aria-hidden="true" />
              <DialogTitle className="line-height-readable text-center">Add Workout Day</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="line-height-readable text-center mb-2 text-sm text-muted-foreground">
              Define a day's routine (e.g., push, pull, leg, or custom).
            </p>
            <div>
              <Label htmlFor="day-name" className="block text-center mb-2">Day Name</Label>
              <Input
                id="day-name"
                value={newDayName}
                onChange={(e) => setNewDayName(e.target.value)}
                placeholder="Enter day name (e.g. Push Day)"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="day-id" className="block text-center mb-2">Day ID</Label>
              <Input
                id="day-id"
                value={newDayId}
                onChange={(e) => setNewDayId(e.target.value)}
                placeholder="Enter day ID (e.g. 'push', 'pull', 'leg')"
                className="mt-2"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 text-center">
                Use "push", "pull", or "leg" for special styling
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-between gap-2 mt-2 w-full">
            <button
              type="button"
              onClick={() => setIsAddDayOpen(false)}
              className="min-w-[140px] px-4 py-2 rounded-lg border font-semibold bg-muted hover:bg-muted/80 transition-colors focus-visible:ring outline-none dark:border-opacity-10 dark:hover:bg-secondary"
              aria-label="Cancel add day"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddDay}
              className="min-w-[140px] px-4 py-2 rounded-lg border font-semibold bg-[#34A853] text-white hover:bg-[#2D9249] transition-colors focus-visible:ring outline-none dark:border-none dark:shadow-none"
              aria-label="Confirm add day"
            >
              Add Day
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Exercise Dialog */}
      <Dialog open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
        <DialogContent className="w-full max-w-sm dark:bg-background dark:border-opacity-10 rounded-lg mx-auto">
          <DialogHeader>
            <div className="flex flex-col items-center gap-2 mb-2">
              <PlusCircle className="h-5 w-5 text-[#34A853]" aria-hidden="true" />
              <DialogTitle className="line-height-readable text-center">Add Exercise</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="line-height-readable text-center mb-4 text-sm text-muted-foreground">
              Add an exercise you'll perform in your routine.
            </p>
            <Label htmlFor="exercise-name" className="block text-center mb-2">Exercise Name</Label>
            <Input
              id="exercise-name"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              placeholder="Enter exercise name"
              className="mt-2"
            />
          </div>
          <div className="flex flex-row justify-between gap-2 mt-2 w-full">
            <button
              type="button"
              onClick={() => setIsAddExerciseOpen(false)}
              className="min-w-[140px] px-4 py-2 rounded-lg border font-semibold bg-muted hover:bg-muted/80 transition-colors focus-visible:ring outline-none dark:border-opacity-10 dark:hover:bg-secondary"
              aria-label="Cancel add exercise"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddExercise}
              className="min-w-[140px] px-4 py-2 rounded-lg border font-semibold bg-[#34A853] text-white hover:bg-[#2D9249] transition-colors focus-visible:ring outline-none dark:border-none dark:shadow-none"
              aria-label="Confirm add exercise"
            >
              Add Exercise
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col items-center gap-4 mt-8">
        <Button
          variant="outline"
          className="rounded-md border-blue-500/20 text-blue-500 hover:bg-blue-500/10 px-6 py-2 text-base font-semibold"
          onClick={() => setShowOnboarding(true)}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          View Onboarding Guide
        </Button>
        <Button
          variant="outline"
          className="rounded-md border-orange-500/20 text-orange-500 hover:bg-orange-500/10 px-6 py-2 text-base font-semibold"
          onClick={handleResetOnboarding}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Onboarding
        </Button>
        <Button
          variant="destructive"
          className="rounded-md bg-[#EA4335] hover:bg-[#c62828] text-white border-none shadow-sm px-6 py-2 text-base font-semibold"
          onClick={() => setIsSignOutOpen(true)}
        >
          Sign Out
        </Button>
      </div>
      
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
    </CollapsibleHeaderLayout>
  )
}
